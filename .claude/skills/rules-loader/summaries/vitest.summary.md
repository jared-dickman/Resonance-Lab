# Vitest Integration Testing

## Core Principles
Zero `as any`. No magic strings. DRY everything. Self-documenting test names.

## Testing Utils
```ts
import {
  createMockSession, mockAuth,           // Auth
  expectPermissionError,                  // Errors
  freezeTime, daysAgo,                    // Time
  buildBlogPost, buildUser,               // Factories
  createTestCompany,                      // Setup
  runInTransaction,                       // Database
  cleanupAllRegisteredCompanies,          // Cleanup
} from '@/app/testing/utils'
```
Full API: `app/testing/README.md`

## Type-Safe Auth
```ts
// ✅ Type-safe
mockAuth(vi.mocked(auth), createMockSession({
  userId: FixtureIds.user,
  currentCompanyId: company.id,
}))

// ❌ Never
vi.mocked(auth).mockResolvedValue({ user: { id: 'test' } } as any)
```

## Factory Builders & Assertions
```ts
// Factories
const post = buildBlogPost().asPillar().published().build()

// Clean assertions
await expectPermissionError(() => action(), 'limit')
```

## Time Testing
```ts
beforeEach(() => freezeTime(new Date('2025-01-15')))
afterEach(() => restoreTime())

const yesterday = daysAgo(1)
const { start, end } = getCurrentBillingPeriod()
```

## Standard Pattern
```ts
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
`FixtureIds.user/company`, `PLANS.basic.slug`, `BlogPostTypeEnum.CLUSTER`, `BlogPostStatusEnum.IDEA`, `SUBSCRIPTION_STATUS[0]`, `USAGE_EVENT_TYPE[0]`, `RESOURCE_TYPE[0]`

## Anti-Patterns
- ❌ `as any` for mocks, magic strings, manual objects vs builders, verbose try/catch

## Validation
- [ ] `createMockSession` for auth, factory builders, constants (FixtureIds/PLANS/enums), zero `as any`, cleanup in afterEach

## Read Full File If
Setting up integration tests or using testing utilities.
