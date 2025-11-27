# Vitest Integration Testing

## Utilities Import

```typescript
import {
  createMockSession, mockAuth,           // Auth
  expectPermissionError,                  // Errors
  freezeTime, daysAgo,                    // Time
  buildBlogPost, buildUser,               // Factories
} from '@/app/testing/utils'
```

Full API: `app/testing/README.md`

## Type-Safe Auth

```typescript
// ✅ Type-safe
mockAuth(vi.mocked(auth), createMockSession({
  userId: FixtureIds.user,
  currentCompanyId: company.id,
}))

// ❌ Never do this
vi.mocked(auth).mockResolvedValue({ user: { id: 'test' } } as any)
```

## Factory Builders

```typescript
// ✅ Fluent builders
const post = buildBlogPost()
  .asPillar()
  .published()
  .build()

// ❌ Manual objects
const post = { id: '123', title: 'test', /* ...15 fields */ }
```

## Clean Assertions

```typescript
// ✅ Clean
await expectPermissionError(() => action(), 'limit')

// ❌ Verbose
try {
  await action()
  throw new Error('Expected to throw')
} catch (error) { /* ... */ }
```

## Time Testing

```typescript
beforeEach(() => freezeTime(new Date('2025-01-15')))
afterEach(() => restoreTime())

const yesterday = daysAgo(1)
const { start, end } = getCurrentBillingPeriod()
```

## Standard Pattern

```typescript
describe('Feature', () => {
  beforeAll(async () => await seedPlans())
  afterEach(async () => {
    await cleanupAllRegisteredCompanies()
    vi.clearAllMocks()
  })

  it('should do something', async () => {
    await runInTransaction(async () => {
      const { company } = await createTestCompany({ planSlug: PLANS.basic.slug })
      mockAuth(vi.mocked(auth), createMockSession({
        userId: FixtureIds.user,
        currentCompanyId: company.id,
      }))

      // Test logic
    })
  })
})
```

## Constants

Use these, never literal strings:
- `FixtureIds.user`, `FixtureIds.company`
- `PLANS.basic.slug`, `PLANS.max.slug`
- `BlogPostTypeEnum.CLUSTER`, `BlogPostStatusEnum.IDEA`
- `SUBSCRIPTION_STATUS[0]`, `USAGE_EVENT_TYPE[0]`, `RESOURCE_TYPE[0]`

## Database Testing

**Pattern:** Testcontainers + Sequential

### Configuration

```typescript
// vitest.config.ts
test: {
  fileParallelism: false, // Shared DB = sequential
  testTimeout: 60000,     // Container startup
}
```

### Per-File Mocks (Required)

Setup imports cache modules. Global mocks fail.

```typescript
// Top of test file
vi.mock('@/db/drizzle/connection', () => ({
  getDbConnection: vi.fn(() => testDb),
}))
```

**Source:** Vitest docs - "Vitest will not mock modules imported in setup files (cached)"

### Runtime Guard

```typescript
export function getDbConnection() {
  if (process.env.VITEST === 'true') {
    throw new Error('Use testDb instead!')
  }
  return drizzle(pool)
}
```

### Optimizations
- Snapshot restore: 10-100x faster
- DB branching: Per-file isolation
- Transaction rollback: Fast cleanup

## Dynamic Imports (API Route Testing)

**CRITICAL LIMITATION:** Vite/Vitest cannot resolve `@/` aliases in dynamic imports with variables.

```typescript
// ❌ FAILS - Alias in dynamic import
const routePath = '@/app/api/users/route'
return await import(routePath)
// Error: Cannot find package '@/app/api/users/route'

// ✅ WORKS - Relative path in dynamic import
return await import('../../../api/users/route')
```

**Why:** Vite requires static analysis at build time. Dynamic imports with string variables cannot resolve aliases.

**Refactoring Risk:** Relative paths break when directory structure changes. When moving test files:
1. Update relative import paths in `loadRoute()` functions
2. Consider using `import.meta.glob()` for stable paths if moving many tests

**Sources:**
- Vite GitHub Issue #10460: "Aliases don't work with dynamic imports that contain variables due to Rollup limitations"
- Vitest docs: "Replace aliased imports with relative paths in vi.mock and dynamic imports"

**Pattern for API route tests:**
```typescript
// app/testing/integration/api/users-route.test.ts
async function loadRoute() {
  vi.resetModules()
  process.env.SKIP_ENV_VALIDATION = 'true'
  // Relative path - fragile but required for Vite
  return await import('../../../api/users/route')
}
```
