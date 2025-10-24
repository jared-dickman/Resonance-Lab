---
name: BDD Fix
description: Auto-triggered when BDD tests fail. Analyzes traces, diagnoses root cause, fixes fixtures/POMs, validates with 10-run zero-flake verification.
auto_trigger: true
keywords:
  [bdd failing, test broken, flaky test, trace analysis, playwright failure, cucumber failed]
---

# BDD Fix

**Mode**: Test Self-Healing Specialist

## Core Mandate

Autonomously repair failing BDD tests via trace analysis. Fix must pass 10 consecutive runs with zero flakes.

**Why this matters:** Flaky tests erode trust. 9/10 pass rate is worse than no test.

## Failure Classification

**Selector Changed** → `locator not found`

- Fix: Update `{Domain}TestIds` in fixtures
- Why: Component TestId was refactored

**Timing Issue** → `timeout exceeded`

- Fix: Add `isLoadingGone()` to assertions
- Why: Race condition, missing wait for async

**Assertion Failed** → `toContainText failed`

- Fix: Update `{Domain}Text` in fixtures
- Why: UI copy changed

**API Changed** → `unexpected response shape`

- Fix: Update MSW handler + fixture mock data
- Why: API contract evolved

## Workflow

1. **Analyze trace** - Identify exact failure step and error type
2. **Classify** - Match to one of 4 failure types above
3. **Fix surgically** - Single file, minimal change
4. **Validate** - Run 10 times, must pass all
5. **Commit** - Only after 10/10 validation

## Example Fixes

**TestId changed:**

```typescript
// app/testing/fixtures/billing/billing-fixtures.ts
export const BillingTestIds = {
  saveButton: 'billing-save-btn', // was 'save-button'
};
```

**Missing loading handler:**

```typescript
// Step definition - add isLoadingGone() before assertion
Then('I see results', async page => {
  await createPage(page).assertions.isLoadingGone();
  await createPage(page).assertions.hasResults();
});
```

**Text changed:**

```typescript
// app/testing/fixtures/billing/billing-fixtures.ts
export const BillingText = {
  saveSuccess: 'Changes saved', // was 'Success'
};
```

## Validation

**10-run zero-flake test:**

```bash
for i in {1..10}; do
  pnpm test:bdd -- --tags "@{tag}"
  if [ $? -ne 0 ]; then echo "❌ FAILED run $i"; exit 1; fi
done
echo "✅ 10/10 passed"
```

## Anti-Patterns

❌ Guessing fixes without reading trace
❌ Accepting < 10/10 pass rate
❌ Hardcoding values instead of fixtures

✅ Trace-driven diagnosis
✅ 10/10 validation before commit
✅ Fixture-first approach

## Output Format

```markdown
## Fix Summary

**Scenario:** {name}
**Type:** {failure-type}
**Fix:** Updated {file}:{line}

## Validation

✅ 10/10 runs passed - zero flakes
✅ Committed: {hash}
```

## References

- `llm/rules/testing-playwright.md` - BDD architecture
- `llm/rules/testing-fixtures.md` - Fixture patterns
