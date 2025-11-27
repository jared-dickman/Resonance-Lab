---
name: dumb-user-unit
description: Generates missing edge-case scenarios for Vitest unit tests. Identifies gaps in error handling, null/undefined cases, boundary conditions, and type violations not covered by existing tests. NOT for E2E (BDD) or Storybook! (project)
auto_trigger: true
keywords: [vitest, unit test, edge case, null, undefined, boundary, validation, error handling]
---

# Dumb User Unit Test Generator

**Auto-triggers when:** Creating/updating `.test.ts` files in `app/`

**Generates:** Missing edge-case tests (appends to existing `describe` blocks)

**Scope:** Unit logic only - never E2E flows or UI component states

---

## Workflow

### 1. Analyze Existing Tests

**Read current coverage:**
- Extract tested behaviors (happy paths + error cases)
- Identify covered edge cases (null, boundary, validation)
- List missing categories from priority order

**Priority categories:**
1. **Null/Undefined** - Optional params, nullable types, array operations
2. **Boundary** - Empty collections, zero, negative, max values
3. **Type Violations** - Invalid enums, constraint violations
4. **Error Propagation** - Dependency failures, rollback verification
5. **Transaction Rollback** - Multi-entity creation failures (ref: companies/service.ts)
6. **Race Conditions** - Concurrent access (if relevant)

### 2. Analyze Function Signature

**Extract edge cases from types:**
```ts
function updatePost(
  postId: string,
  data: {
    title?: string          // → test undefined, empty, whitespace
    status?: BlogPostStatus // → test invalid enum
    content?: string | null // → test null vs undefined
  }
): Promise<BlogPost>       // → test error cases
```

**Check implementation for business logic:**
```ts
if (status === PUBLISHED && !content) {
  throw new ValidationError(...)  // → test publishing without content
}

if (type === PILLAR && clusterId) {
  throw new ValidationError(...)  // → test constraint violation
}
```

### 3. Generate Only Missing Tests

#### Create new file next to existing tests [domain].dumb.test.ts

**Decision framework:**
- Already tested? → Skip
- Real production risk? → Include
- Obvious from happy path? → Skip
- Dumb user could trigger? → Include

**Output format:**
```ts
describe('updateBlogPost', () => {
  // Existing happy path tests...

  describe('Null/Undefined Handling', () => {
    it('should handle undefined optional fields', async () => {
      // See examples/null-undefined-pattern.ts
    })
  })

  describe('Boundary Conditions', () => {
    it('should reject empty title string', async () => {
      // See examples/boundary-conditions-pattern.ts
    })
  })

  describe('Type Violations', () => {
    it('should reject invalid status enum', async () => {
      // See examples/constraint-violations-pattern.ts
    })
  })

  describe('Error Propagation', () => {
    it('should rollback transaction on database error', async () => {
      // See examples/error-propagation-pattern.ts
    })
  })

  describe('Transaction Rollback', () => {
    it('should rollback primary entity when dependent entity fails', async () => {
      // See examples/transaction-rollback-pattern.ts (ref: companies/service.ts:43-95)
    })

    it('should validate dependencies before transaction', async () => {
      // See examples/dependency-validation-pattern.ts
    })
  })
})
```

---

## Code Standards

**Use factories, never manual objects:**
```ts
✅ const user = buildUser().withEmail(null).build()
❌ const user = { id: '123', email: null, /* ...missing fields */ }
```

**Use constants, never magic strings:**
```ts
✅ expect(post.status).toBe(BlogPostStatusEnum.PUBLISHED)
❌ expect(post.status).toBe('published')
```

**Use error test utils:**
```ts
✅ await expectPermissionError(() => action(), 'limit')
❌ try { await action(); expect.fail() } catch { /* ... */ }
```

**Zero `as any`:**
```ts
✅ const session = createMockSession({ userId: FixtureIds.user })
❌ const session = { user: { id: 'test' } } as any
```

---

## Decision Matrix: Should This Be a Unit Test?

| Edge Case | Unit Test? | Rationale |
|-----------|------------|-----------|
| Null parameter handling | ✅ | Prevents runtime errors |
| Empty array input | ✅ | Boundary condition |
| Invalid enum value | ✅ | Type safety validation |
| API 500 error | ❌ | E2E concern (use BDD) |
| Loading spinner state | ❌ | UI state (use Storybook) |
| Transaction rollback | ✅ | Critical data integrity |
| Double-submit prevention | ❌ | E2E flow (use BDD) |
| Business rule violation | ✅ | Core logic validation |

---

## Anti-Patterns

❌ **Testing implementation details:**
```ts
// NO - tests internals, not behavior
it('should call validateTitle internally', () => {
  const spy = vi.spyOn(validator, 'validateTitle')
  updatePost(postId, data)
  expect(spy).toHaveBeenCalled()
})
```

❌ **Duplicate happy path:**
```ts
// NO - already covered
it('should create post with valid data', () => { /* ... */ })
```

❌ **Testing library code:**
```ts
// NO - testing Zod, not our code
it('should validate with Zod schema', () => {
  expect(schema.parse('test')).toBe('test')
})
```

---

## Validation Checklist

- [ ] No duplication of existing tests
- [ ] Function signatures analyzed for optionals/nullables
- [ ] Implementation reviewed for business logic edge cases
- [ ] Real production risks identified (not theoretical)
- [ ] Using factory builders and constants
- [ ] Using error test utilities
- [ ] Zero `as any` casts
- [ ] Tests focused on behavior, not implementation
- [ ] Passes `pnpm exec ast-grep scan`

---

## References

- `examples/` - Real codebase patterns for each edge case category
- `llm/rules/vitest.md` - Testing conventions and utilities
- `app/testing/utils/` - Factory builders and error assertions
