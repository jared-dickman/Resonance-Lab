# Test Fixtures

**Goal**: Centralize test data for consistency across Playwright and Storybook

**When to use**: All test data (API responses, form inputs, text assertions)

**Never use**: Hardcoded strings, magic numbers, inline test data

---

## Test Data Architecture: Three-Tier Pattern

**Tier 1: Factory Builders** (Primary for test-specific data)
- Location: `app/testing/factories/`
- Purpose: On-demand test data generation with customization
- Use for: Vitest tests, BDD steps, Storybook stories, edge cases

**Tier 2: Static Fixtures** (Reusable API response shapes)
- Location: `app/testing/fixtures/**/*-fixtures.ts`
- Purpose: Shared, stable API response structures
- Use for: MSW handlers, complex stable data

**Tier 3: Inline Mocks** (Deprecated)
- ❌ Don't use: Will cause ast-grep violations
- ✅ Use factory builders instead

---

## Factory Builders: Primary Test Data Pattern

**Location:** `app/testing/factories/`

**Philosophy:**
Test data should be:
- Generated on-demand (not static)
- Customizable (fluent builder API)
- Type-safe (TypeScript enforced)
- DRY (single source of truth)

### When to Use Factory Builders

**Always use for:**
- ✅ Vitest unit/integration test mocks
- ✅ BDD/Cucumber step definitions
- ✅ Storybook story data variants
- ✅ Test-specific edge cases (deleted users, expired subscriptions)
- ✅ Dynamic test data (loops, parameterized tests)

**Example:**
```typescript
import { buildUser, buildCompany } from '@/app/testing/factories'

// Basic usage
const user = buildUser().build()

// Customization
const admin = buildUser()
  .withEmail('admin@example.com')
  .asSuperAdmin()
  .build()

// Edge cases
const deletedUser = buildUser().deleted().build()
const oldAccount = buildUser().createdAt(new Date('2020-01-01')).build()

// Multiple items
const users = Array.from({ length: 5 }, (_, i) =>
  buildUser()
    .withEmail(`user${i}@example.com`)
    .build()
)
```

### Builder API Reference

**Common methods (all builders):**
- `.withId(id: string)` - Set ID
- `.createdAt(date: Date)` - Set creation date
- `.updatedAt(date: Date)` - Set update date
- `.deleted(date?: Date)` - Mark as soft deleted
- `.build()` - Generate final object

**User builder:**
- `.withEmail(email: string)`
- `.withName(name: string)`
- `.withImage(url: string)`
- `.asSuperAdmin(value = true)`

**Company builder:**
- `.withName(name: string)`

**BlogPost builder:**
- `.withTitle(title: string)`
- `.asPillar()` / `.asCluster()`
- `.forCompany(companyId: string)`
- `.published(date?: Date)`
- `.archived()`

**Keyword builder:**
- `.withKeyword(keyword: string)`
- `.withVolume(volume: number)`
- `.withDifficulty(score: number)`

**SubscriptionPlan builder:**
- `.withSlug(slug: 'basic' | 'pro' | 'max')`
- `.withMonthlyPrice(price: number)`
- `.active()` / `.inactive()`

**CompanyDetail builder:**
- `.forCompany(companyId: string)`
- `.withWebsite(url: string)`
- `.withProductDescription(description: string)`

**Thread builder:**
- `.withTitle(title: string)`
- `.createdAt(date: Date)`
- `.updatedAt(date: Date)`

**Message builder:**
- `.asUser()` / `.asAssistant()`
- `.withContent(content: string)`
- `.createdAt(date: Date)`

**UserCompany builder:**
- `.forUser(userId: string)`
- `.forCompany(companyId: string)`
- `.asMember()` / `.asAdmin()` / `.asOwner()`
- `.asDefault(value = true)`
- `.deleted(date?: Date)`

### Gotchas & Pitfalls

**Common mistakes:**

❌ **Forgetting `.build()`:**
```typescript
const user = buildUser().withEmail('test@example.com')
// Returns: UserBuilder instance
// Expected: User object
```

✅ **Correct:**
```typescript
const user = buildUser().withEmail('test@example.com').build()
```

---

❌ **Reusing builder instances:**
```typescript
const builder = buildUser()
const user1 = builder.build()
const user2 = builder.withName('Different').build()
// user1 and user2 might share state!
```

✅ **Correct:**
```typescript
const user1 = buildUser().build()
const user2 = buildUser().withName('Different').build()
```

---

❌ **Over-customizing:**
```typescript
const user = buildUser()
  .withId('user-123')
  .withEmail('test@example.com')
  .withName('Test User')
  .withImage(null)
  .createdAt(new Date())
  .updatedAt(new Date())
  .deleted(null)
  .build()
// Only customize what matters to the test!
```

✅ **Correct:**
```typescript
const user = buildUser()
  .withEmail('test@example.com')
  .build()
// Builders provide sensible defaults
```

---

❌ **Not calling `.build()` in MSW handlers:**
```typescript
http.get('/api/users', () => {
  return HttpResponse.json(buildUser()) // Builder instance!
})
```

✅ **Correct:**
```typescript
http.get('/api/users', () => {
  return HttpResponse.json(buildUser().build())
})
```

---

❌ **Building in global scope:**
```typescript
const GLOBAL_USER = buildUser().build()

test('test 1', () => {
  GLOBAL_USER.email = 'changed@example.com' // Mutation!
})

test('test 2', () => {
  expect(GLOBAL_USER.email).toBe('test@example.com') // Fails!
})
```

✅ **Correct:**
```typescript
test('test 1', () => {
  const user = buildUser().build()
  user.email = 'changed@example.com'
})

test('test 2', () => {
  const user = buildUser().build()
  expect(user.email).toBe('test@example.com') // Passes!
})
```

---

### FixtureIds: Stable Test Data

**Location:** `app/testing/fixtures/constants.ts`

**Structure:**
```typescript
export const FixtureIds = {
  company: 'uuid',
  user: 'uuid',
  blogPosts: { pillar: 'uuid', cluster1: 'uuid' },
  plans: { basic: 'uuid', pro: 'uuid' },
} as const
```

**Adding new IDs:** Add to relevant section, use unique UUID, reference in factory: `.withId(FixtureIds.X)`

---

### Factory vs Object Literal Decision

**Use Factories:**
- Test data (Vitest, BDD, Storybook)
- Need customization or edge cases
- Dynamic/parameterized data

**Use Object Literals:**
- Text constants only (`MessageText`, `BlogText`)
- Simple config (`TestIds`, `TestDates`)
- Wrapper objects composing factory items

---

### Troubleshooting

**Forgot `.build()`:**
```typescript
const user = buildUser().withEmail('...')  // ❌ Returns builder
const user = buildUser().withEmail('...').build()  // ✅
```

**Wrong path:**
```typescript
from '@/app/testing/fixtures/fixture-ids'  // ❌
from '@/app/testing/fixtures/constants'  // ✅
```

**Type error:**
```typescript
buildUser().build() as const satisfies Type  // ❌ Remove 'as const'
buildUser().build() satisfies Type  // ✅
```

---

### BDD-Specific Patterns

**Step definitions with builders:**
```typescript
import { Given, When, Then } from '@cucumber/cucumber'
import { buildUser, buildCompany } from '@/app/testing/factories'

Given('I am logged in as {string}', async function(email: string) {
  const user = buildUser().withEmail(email).build()
  await this.intercepts.interceptAuthSession(() => ({ body: { user } }))
})

Given('the company has {int} blog posts', async function(count: number) {
  const posts = Array.from({ length: count }, () =>
    buildBlogPost().build()
  )
  await this.intercepts.interceptBlogPosts(() => ({ body: { posts } }))
})
```

**Intercept factories with overrides:**
```typescript
export const createCommonIntercepts = (page: Page) => {
  async function interceptCommonAPIs(overrides = {}) {
    await interceptAuthSession(() => ({
      body: {
        user: buildUser()
          .withEmail(overrides.userEmail ?? 'test@example.com')
          .asSuperAdmin(overrides.isSuperAdmin ?? false)
          .build()
      }
    }))
  }

  return { interceptCommonAPIs }
}
```

### Storybook Patterns

**Handler with overrides:**
```typescript
import { buildUser } from '@/app/testing/factories'

const buildUserHandler = (overrides = {}) =>
  http.get(apiRoutes.authSession, () =>
    HttpResponse.json(
      buildUser()
        .withEmail(overrides.email ?? 'test@example.com')
        .withName(overrides.name)
        .withImage(overrides.image)
        .build()
    )
  )

export const Default: Story = {
  parameters: {
    msw: { handlers: [buildUserHandler()] }
  }
}

export const LongName: Story = {
  parameters: {
    msw: {
      handlers: [
        buildUserHandler({ name: 'Very Long Name That Tests Truncation' })
      ]
    }
  }
}
```

---

### Cross-Framework Usage

**MSW:**
```typescript
http.get('/api/users/:id', ({ params }) =>
  HttpResponse.json(buildUser().withId(params.id).build())
)
```

**Vitest:**
```typescript
const user = buildUser().withEmail('test@example.com').build()
expect(result).toMatchObject(user)
```

**BDD:**
```typescript
Given('logged in as {string}', async function(email) {
  const user = buildUser().withEmail(email).build()
  await this.intercepts.auth(() => ({ body: { user } }))
})
```

**Storybook:**
```typescript
export const Admin: StoryObj = {
  args: { user: buildUser().asSuperAdmin().build() }
}
```

---

## Core Principle

All test data MUST come from centralized fixture files.

✅ **DO**: `expect(page.getByText(MessageText.output)).toBeVisible()`

❌ **DON'T**: `expect(page.getByText('Hello, world!')).toBeVisible()`

---

## Fixture Organization

```
app/testing/fixtures/
  {feature}/
    {feature}-fixtures.ts  # One file per API endpoint
  index.ts                 # Re-exports
```

**Examples**:
```
fixtures/
  messages/
    message-fixtures.ts    # /api/webhook endpoint
  users/
    user-fixtures.ts       # /api/users endpoint
  blogs/
    blog-fixtures.ts       # /api/blog-posts endpoint
  index.ts
```

---

## Fixture File Pattern

Each fixture file:
1. One file per API endpoint
2. ONE request/response pair
3. Text constants for assertions
4. Factory builders with stable IDs
5. JSDoc describing endpoint

### Factory-Based Pattern (Preferred)

```typescript
import type {WebhookMessageRequest, WebhookMessageResponse} from '@/app/features/messages/options'
import { buildMessage } from '@/app/testing/factories'
import { FixtureIds } from '@/app/testing/fixtures/constants'

/**
 * Webhook Message Fixtures - /api/webhook
 *
 * Single request/response pair for full API shape.
 * Text constants for type-safe assertions.
 */

export const MessageText = {
  query: 'What is the current price of AAPL?',
  output: 'Apple Inc. (AAPL) is currently trading at $173.50.',
} as const

export const mockMessageRequest = buildMessage()
  .withId(FixtureIds.messages.message1)
  .withQuery(MessageText.query)
  .build() satisfies WebhookMessageRequest

export const mockMessageResponse = buildMessage()
  .withId(FixtureIds.messages.message1)
  .withOutput(MessageText.output)
  .build() satisfies WebhookMessageResponse
```

### Object Literal Pattern (Text Constants Only)

Use object literals ONLY for simple text constants:

```typescript
export const MessageText = {
  query: 'What is the current price of AAPL?',
  output: 'Apple Inc. (AAPL) is currently trading at $173.50.',
} as const
```

**Key Differences:**
- **Factory-built fixtures**: Use `satisfies Type` (NOT `as const satisfies`)
- **Text constants**: Use `as const` (no satisfies needed)
- **Stable IDs**: Always use `.withId(FixtureIds.X)` for consistent test data

---

## Example

```typescript
// fixtures/blogs/blog-fixtures.ts
import type {CreateBlogRequest, BlogPostListResponse} from '@/app/features/blogs/types'
import { buildBlogPost } from '@/app/testing/factories'
import { FixtureIds } from '@/app/testing/fixtures/constants'

export const BlogText = {
  title: 'How to Test React Apps',
  content: 'Testing is essential for quality software.',
} as const

export const mockCreateBlogRequest = buildBlogPost()
  .withTitle(BlogText.title)
  .withContent(BlogText.content)
  .build() satisfies CreateBlogRequest

export const mockBlogResponse = buildBlogPost()
  .withId(FixtureIds.blogPosts.cluster1)
  .withTitle(BlogText.title)
  .withContent(BlogText.content)
  .build() satisfies BlogPostListResponse['blogs'][0]
```

---

## Rules

1. **One fixture file per endpoint** (not per test)
2. **One request/response pair** (minimal, focused)
3. **PascalCase for Text constants** (e.g., `MessageText`, not `MESSAGE_TEXT`)
4. **Factory builders with stable IDs** - Always use `.withId(FixtureIds.X)` pattern
5. **Type safety with `satisfies Type`** for factory-built fixtures (NOT `as const satisfies`)
6. **Use `as const` only** for Text constants (not for fixtures)
7. **Granular named exports** for array items (extract and compose, don't inline)
8. **Never hardcode** in test files
9. **No duplicate fixtures** for same endpoint
10. **High-value only** - driven by user intent

---

## Granular Named Exports (DRY Pattern)

For responses with arrays, extract items as named exports for maximum reuse:

✅ **Preferred - Factory-based with stable IDs:**
```typescript
import { buildSubscriptionPlan } from '@/app/testing/factories'
import { FixtureIds } from '@/app/testing/fixtures/constants'

export const mockPlanBasic = buildSubscriptionPlan()
  .withId(FixtureIds.plans.basic)
  .withSlug('basic')
  .withMonthlyPrice(9.99)
  .build() satisfies Plan

export const mockPlanPro = buildSubscriptionPlan()
  .withId(FixtureIds.plans.pro)
  .withSlug('pro')
  .withMonthlyPrice(29.99)
  .build() satisfies Plan

export const mockAvailablePlansResponse = {
  plans: [mockPlanBasic, mockPlanPro],
} as const
```

❌ **Avoid - Inline objects:**
```typescript
export const mockAvailablePlansResponse = {
  plans: [
    { id: '1', name: 'Basic', price: 9.99 },  // Inline, not reusable
    { id: '2', name: 'Pro', price: 29.99 },
  ]
}
```

**Benefits:**
- Each object reusable independently in MSW/BDD/Storybook
- Simulates real data connections (compose larger fixtures from smaller)
- Easy to test edge cases (swap single item in array)
- Clear naming shows purpose

**Reference:** `.serena/memories/fixture-forge-user-preferences.md`

---

## Benefits

1. **Type Safety** - TypeScript catches fixture/type mismatches
2. **Consistency** - Same data in Playwright and Storybook
3. **Refactoring** - Change once, updates all tests
4. **Readability** - Clear constants vs magic strings
5. **Maintainability** - Centralized test data

---

## Anti-Patterns

❌ **UPPER_SNAKE_CASE for Text constants:**
```typescript
export const MESSAGE_TEXT = { ... }  // Use MessageText instead
export const USER_TEXT = { ... }     // Use UserText instead
```

❌ **Type annotations instead of satisfies:**
```typescript
export const mockResponse: BlogResponse = buildBlogPost().build()  // Use 'satisfies BlogResponse'
```

❌ **Missing type validation:**
```typescript
export const mockResponse = buildBlogPost().build()  // Missing 'satisfies Type'
```

❌ **Using `as const satisfies` with factory builders:**
```typescript
export const mockResponse = buildBlogPost().build() as const satisfies BlogResponse  // Remove 'as const'
```

❌ **Missing stable IDs:**
```typescript
export const mockUser = buildUser().build() satisfies UserResponse  // Missing .withId(FixtureIds.user)
```

❌ **Hardcoded strings:**
```typescript
await expect(page.getByText('Hello, world!')).toBeVisible()
```

❌ **Multiple fixtures for same endpoint:**
```typescript
// Too many - keep it minimal
export const mockSuccessResponse = {...}
export const mockDemoResponse = {...}
export const mockErrorResponse = {...}
```

❌ **Inline test data:**
```typescript
const message = 'Test message'
await sendMessage(message)
```

❌ **Inline objects in arrays:**
```typescript
export const mockResponse = {
  items: [{ id: '1', name: 'Test' }]  // Extract to named export
}
```

✅ **Correct patterns:**
```typescript
// PascalCase Text constants
export const MessageText = { output: 'Hello' } as const

// Factory-built fixtures with stable IDs
export const mockRequest = buildMessage()
  .withId(FixtureIds.messages.message1)
  .withQuery(MessageText.query)
  .build() satisfies MessageRequest

// Granular named exports with factory builders
export const mockItem1 = buildItem()
  .withId(FixtureIds.items.item1)
  .withName('Test')
  .build() satisfies Item

export const mockResponse = {
  items: [mockItem1]
} as const
```

