# Code Standards

## Core Principles
- Self-documenting code: explicit names, focused functions
- Single responsibility: functions do one thing
- DRY: eliminate repetition via abstraction
- Type safety: always find correct types for layer
- Fail fast: validate early, throw clear errors
- Strict null checks enabled

## Function Standards

**Naming:**
```ts
function validateBlogPost(post: BlogPost): ValidationResult {}
function createSubscription(companyId: string, planId: string): Subscription {}
```

**Single Responsibility with orchestration:**
```ts
async function handleUserSignup(email: string, password: string): Promise<User> {
  const user = await createUser(email, password)
  await postSignupActions(user)  // Separate concerns
  return user
}
```

**Early returns:**
```ts
if (!user.email) return false
if (company.subscription.isEligible) return true
return true
```

## Error Handling

**Service Layer (MANDATORY):**
ALL functions in `app/features/*/service.ts` MUST use `withServiceErrorHandling`:

**Internal error boundaries:** Preserve internal try-catch for domain-specific error handling, but let wrapper handle tracking.

**Typed errors:**
```ts
class ValidationError extends Error {
  constructor(message: string, public field: string, public value: unknown) {
    super(message)
    this.name = 'ValidationError'
  }
}
```

## File Naming
- Components: PascalCase (`UserSettings.tsx`)
- Utilities: kebab-case in `@/app/utils` (never `@/lib`) (`date-formatter.ts`)
- Hooks: camelCase with `use` prefix (`useBlogPosts.ts`)
- Types: kebab-case with `.types.ts` (`billing.types.ts`)
- Tests: match source with `.test` or `.spec` (`ProfilePage.test.tsx`)

## Anti-Patterns
- ❌ Task markers (TO DO/FIX ME) in committed code
- ❌ `console.log()` - use `logger` or `errorTracker`
- ❌ Magic numbers/strings - use named constants
- ❌ Obvious comments - code should be self-documenting
- ❌ Manual try-catch in service layer - use wrapper

## Comments - When to Use
- Complex business logic: why this algorithm/approach
- Non-obvious constraints: external API limits, edge cases
- Temporary workarounds: link to issue for proper fix
- Performance trade-offs: why O(n²) is acceptable

## Validation
- [ ] Functions have explicit names describing intent
- [ ] Each function has single responsibility
- [ ] Service layer uses `withServiceErrorHandling` wrapper
- [ ] No magic numbers or strings
- [ ] Files in `@/app/utils`, not `@/lib`
- [ ] No task markers or console.log in committed code

## Read Full File If
Reference for any code quality questions.