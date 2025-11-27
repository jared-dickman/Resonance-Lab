---
name: Dumb User BDD
description: Generates missing E2E edge case scenarios for BDD features. Identifies gaps in error handling, auth, race conditions, and network failures not covered by existing tests. NOT for storybook or vitest!
auto_trigger: true
keywords: [bdd, e2e, edge case, sad path, error scenario, race condition, auth failure, playwright, pw, cucumber, gherkin]
---

# Dumb User BDD

**Auto-triggers when:** Creating/updating `.feature` files in `e2e/features/`

**Generates:** `.dumb.feature` file parallel to main tests

**Scope:** E2E flows only - never unit logic or UI component states

---

## Workflow

### 1. Analyze Existing Feature

**Read current scenarios:**
- Extract covered behaviors (happy + sad paths)
- Identify existing error scenarios (`@error`, `@loading`, `@auth`, `@access`)
- List API endpoints involved (from step definitions/intercepts)

**Check intercepts:**
```typescript
// What mocks exist in e2e/intercepts/{domain}.intercepts.ts?
mockFailing{Domain}API     // ✅ covered
mockSlow{Domain}API        // ✅ covered
mockUnauthorizedError      // ❓ exists but unused
mockStaleDataConflict      // ❌ missing entirely
```

### 2. Identify Missing Edge Cases

**Categories to consider:**

**Network resilience** (if not covered):
- Timeout recovery (slow API + user retry)
- Partial failure (multi-step flow, one API fails)
- Malformed response (API returns unexpected shape)

**Auth/Permission** (if not covered):
- Session expiry mid-flow
- Permission boundary (admin vs user)
- Token refresh failure

**Race conditions** (rarely covered):
- Concurrent modification (optimistic locking)
- Stale data conflicts (409 responses)
- Double-submit prevention

**Partial states** (often missing):
- Form abandonment (navigate away warnings)
- Multi-step flow interruption
- Browser refresh during async operation

**Atomic provisioning** (ref: companies/service.ts):
- Required dependency missing (e.g., plan selection required)
- Dependency validation failure (invalid plan ID)
- Transaction rollback on partial failure

**Critical:** Only add scenarios for gaps not covered by existing tests.

### 3. Generate Scenario Template

**Use `{domain}.dumb.feature.ts` file** (create separate file):

```gherkin
  @{domain} @race
  Scenario: {Resource} modified by concurrent user
    Given I have {resource} open for editing
    And another user modifies the same {resource}
    When I attempt to save my changes
    Then I see "Resource was updated" conflict error
    And I can choose to overwrite or refresh

  @{domain} @partial
  Scenario: Form data preserved after navigation
    Given I have partially filled the {form}
    When I navigate away from the page
    Then I see confirmation dialog
    And my draft is preserved if I cancel
```

**Tag conventions:**
- `@race` - concurrency/stale data
- `@partial` - incomplete states/flows
- `@timeout` - network recovery beyond basic `@loading`
- `@auth` - session/permission failures

### 4. Implement Step Definitions

**Reuse existing patterns:**
```typescript
// e2e/steps/{domain}/{feature}.steps.ts
Given('another user modifies the same {resource}', async (page: Page) => {
  await create{Domain}Page(page).intercepts.mockStaleDataConflict()
})
```

**Add missing intercepts only if needed:**
```typescript
// e2e/intercepts/{domain}.intercepts.ts
mockStaleDataConflict: async () => {
  await intercept<E2EApiErrorResponse>(page, `api/${apiRoutes.{domain}}`, {
    status: 409,
    body: { error: 'Resource was modified by another user' },
  })
}
```

### 5. Validation Checklist

- [ ] No duplication of existing scenarios (check tags: `@error`, `@loading`)
- [ ] E2E behaviors only (not unit validation or UI states)
- [ ] Scenarios use existing POMs/locators/flows where possible
- [ ] New intercepts added only for genuinely missing API mocks
- [ ] All scenarios pass: `pnpm test:bdd --tags "@{domain}"`

---

## Decision Matrix: Should This Be a BDD Scenario?

| Edge Case | BDD? | Rationale |
|-----------|------|-----------|
| API 500 error | ❌ | Already covered with `@error` scenarios |
| API slow (3s delay) | ❌ | Already covered with `@loading` scenarios |
| Session expires mid-flow | ✅ | If not covered, add as `@auth` scenario |
| Concurrent edit conflict | ✅ | Rarely covered, critical for data integrity |
| Form validation (null input) | ❌ | Unit test concern, not E2E |
| Loading spinner state | ❌ | Storybook component test |
| Double-click submit | ✅ | If debouncing critical, add as `@race` |
| Browser refresh preserves draft | ✅ | If local storage used, add as `@partial` |

---

## Anti-Patterns

❌ **Recreating existing error scenarios:**
```gherkin
# NO - billing.feature already has @error scenario
Scenario: Billing API fails
  Given the billing API will fail
```

❌ **Unit test concerns in BDD:**
```gherkin
# NO - This is unit logic, not E2E flow
Scenario: Null input rejected
  When I submit null data
  Then I see validation error
```

❌ **Component UI states:**
```gherkin
# NO - This is Storybook territory
Scenario: Empty state shows placeholder
  Given no data exists
  Then I see empty state illustration
```

✅ **Genuine E2E gaps:**
```gherkin
# YES - Concurrency not covered in main scenarios
@billing @race
Scenario: Plan upgrade conflicts with concurrent downgrade
  Given I initiate plan upgrade
  And admin simultaneously downgrades my plan
  When upgrade completes
  Then I see conflict resolution UI
  And final plan state is deterministic
```

---

## References

- `llm/rules/testing-playwright.md` - BDD 7-layer architecture
- `.claude/skills/bdd-implementation-generator/SKILL.md` - Pattern enforcement
- `e2e/features/**/*.feature` - Existing coverage to avoid duplication