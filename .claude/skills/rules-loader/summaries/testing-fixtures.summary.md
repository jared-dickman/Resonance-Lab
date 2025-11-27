# Test Fixtures

## Core Pattern
Factory-based fixtures with stable IDs. Centralized test data with type safety. One file per endpoint.

## Three-Tier Architecture

**Tier 1: Factory Builders** (Primary)
- Location: `app/testing/factories/`
- Use for: Vitest tests, BDD steps, Storybook stories, test-specific data
- Pattern: `buildUser().withId(FixtureIds.users.user1).build() satisfies UserResponse`

**Tier 2: Static Fixtures** (Shared data)
- Location: `app/testing/fixtures/**/*-fixtures.ts`
- Use for: MSW handlers, stable API response shapes
- Built from factories with stable IDs

**Tier 3: Inline Mocks** (Deprecated)
- ❌ Don't use - causes ast-grep violations

## Fixture File Pattern (Factory-Based)

```ts
import { buildMessage } from '@/app/testing/factories'
import { FixtureIds } from '@/app/testing/fixtures/constants'

export const MessageText = {
  query: 'What is AAPL?',
  output: 'Apple Inc. is trading at $173.50',
} as const  // Text constants: 'as const' only

export const mockMessageRequest = buildMessage()
  .withId(FixtureIds.messages.message1)  // Always use stable IDs
  .withQuery(MessageText.query)
  .build() satisfies MessageRequest  // Factory fixtures: 'satisfies' NOT 'as const satisfies'
```

## Type Safety Rules

**Factory-built fixtures:**
```ts
buildUser().withId(FixtureIds.users.user1).build() satisfies UserResponse  // ✅
buildUser().build() as const satisfies UserResponse  // ❌ Remove 'as const'
```

**Text constants:**
```ts
export const MessageText = { query: 'test' } as const  // ✅ No satisfies
```

**Composite objects:**
```ts
export const mockTeam = { users: [mockUser1, mockUser2] } as const  // ✅
```

## Granular Named Exports (Mandatory)

Extract array items → factory builders with stable IDs:

```ts
export const mockPlanBasic = buildSubscriptionPlan()
  .withId(FixtureIds.plans.basic)
  .withSlug('basic')
  .build() satisfies Plan

export const mockPlanPro = buildSubscriptionPlan()
  .withId(FixtureIds.plans.pro)
  .withSlug('pro')
  .build() satisfies Plan

export const mockPlansResponse = { plans: [mockPlanBasic, mockPlanPro] } as const
```

## Critical Rules

1. Factory builders with `.withId(FixtureIds.X)` for stable IDs
2. Factory fixtures use `satisfies Type` (NOT `as const satisfies`)
3. Text constants use `as const` (no satisfies)
4. One fixture file per endpoint
5. Granular named exports (no inline objects)
6. Never hardcode strings in tests

## Available Builders

buildUser, buildCompany, buildBlogPost, buildKeyword, buildSubscriptionPlan, buildCompanyDetail, buildThread, buildMessage, buildUserCompany

## FixtureIds Location

`app/testing/fixtures/constants.ts` - Add new IDs here with unique UUIDs.

## Factory vs Literal

**Factories:** Test data, customization, dynamic data
**Literals:** Text constants, config objects, wrappers

## Common Errors

- Forgot `.build()` - Returns builder not object
- Wrong path: `fixture-ids` → use `constants`
- Type error: Remove `as const` from factory `.build()`

## Read Full File If

Creating/updating test fixtures or need factory builder API reference.
