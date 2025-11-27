# Code Standards

## 1. Core Principles

- **Self-documenting code**: Explicit names, focused functions
- **Do One Thing**: Functions have single responsibility
- **DRY**: Eliminate repetition via abstraction
- **Type safety**: Always find correct types for layer
- **Fail fast**: Validate early, throw clear errors, use typed structure
- **Async loading**: Must always have delightful UX

### Strict Null Checks

## 3. Function Standards

### Naming

```ts
// ✅ GOOD: Explicit intent
function validateBlogPost(post: BlogPost): ValidationResult {}
function createSubscription(companyId: string, planId: string): Subscription {}
function calculateUsageRemaining(usage: number, limit: number): number {}
```

### Single Responsibility
```ts
// ✅ GOOD: Orchestration with single responsibility
async function handleUserSignup(email: string, password: string): Promise<User> {
  const user = await createUser(email, password)
  await postSignupActions(user)
  return user
}

async function postSignupActions(user: User): Promise<void> {
  await Promise.all([
    sendWelcomeEmail(user),
    createDefaultCompany(user),
    trackSignupEvent(user),
    initializeBillingAccount(user),
  ])
}
```

### Early Returns

```ts
// ✅ GOOD: Early returns
function isEligibleForTrial(user: User, company: Company): boolean {
  if (!user.email) return false
  if (company.subscription.isEligible) return true
  return true
}
```

## 4. Prohibited Patterns

### TODO/FIXME in Committed Code

### Console Logging
only use error-tracker and logger

### No Magic Numbers/Strings
#### Always Constants

## 5. Error Handling

### Service Layer Functions

**ALL service layer functions in `app/features/*/service.ts` MUST use `withServiceErrorHandling`:**

```ts
// ✅ GOOD: Service layer with standardized error handling
import {withServiceErrorHandling} from '@/app/utils/service-error-handler'

export async function createBlogPost(input: CreatePostInput): Promise<BlogPost> {
  return withServiceErrorHandling(
    async () => {
      // implementation
      const repository = repositoryFactory.getBlogPostRepository()
      return repository.create(input)
    },
    {
      service: 'blog-posts',
      companyId: input.companyId,
    }
  )
}

// ✅ GOOD: Transaction-aware service function
export async function addUserToCompany(
  input: AddUserInput,
  tx?: DbTransaction
): Promise<Result> {
  return withServiceErrorHandling(
    async () => {
      const db = tx ?? getDbConnection()
      // implementation preserves transaction context
    },
    {
      service: 'user-companies',
      companyId: input.companyId,
    }
  )
}

// ❌ BAD: Manual error handling in service layer
export async function createBlogPost(input: CreatePostInput): Promise<BlogPost> {
  try {
    const repository = repositoryFactory.getBlogPostRepository()
    return repository.create(input)
  } catch (error) {
    errorTracker.captureException(error as Error, {service: 'blog-posts'})
    throw error
  }
}
```

**Enforced by:** `rules/service-functions-must-use-error-handler.yml`

### Internal Error Boundaries

For domain-specific errors within service functions, preserve internal try-catch:

```ts
export async function processWebhook(data: WebhookData): Promise<void> {
  return withServiceErrorHandling(
    async () => {
      // ✅ GOOD: Internal boundary for specific error handling
      try {
        const result = await externalAPI.call(data)
        return result
      } catch (error) {
        if (error instanceof RateLimitError) {
          // Handle rate limit specifically
          await retryWithBackoff(data)
        }
        throw error // Let wrapper handle tracking
      }
    },
    {
      service: 'webhooks',
      webhookId: data.id,
    }
  )
}
```

### Typed Errors

```ts
// ✅ GOOD: Specific error classes
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

throw new ValidationError('Invalid email format', 'email', input.email)
```

## 6. Comments

### Minimal Comments

```ts
// ❌ BAD: Obvious comments
// Loop through items
for (const item of items) {}

// ✅ GOOD: No comment needed
for (const item of items) {}

// ✅ GOOD: Explain WHY for complex logic
// Use exponential backoff to avoid overwhelming API during rate limit recovery
await retry(operation, {
  maxAttempts: 5,
  backoff: (attempt) => Math.pow(2, attempt) * 1000,
})
```

### When to Comment

- **Complex business logic**: Why this algorithm/approach
- **Non-obvious constraints**: External API limits, edge cases
- **Temporary workarounds**: Link to issue for proper fix
- **Performance trade-offs**: Why O(n²) is acceptable here


## 8. File Naming

```
// Components: PascalCase
UserSettings.tsx
ProfilePage.tsx

// Utilities: kebab-case
never in @/lib always in @/app/utils
date-formatter.ts

// Hooks: camelCase starting with 'use'
useBlogPosts.ts

// Types: kebab-case with .types.ts
billing.types.ts

// Tests: match source with .test or .spec
ProfilePage.test.tsx
date-formatter.spec.ts
```
