# Logging and Error Tracking Rules

## 1. Principle

- Never call `console.*` in app code (`app/` directory).
- Use `errorTracker` from `@/app/utils/error-tracker` for **errors only**.
- Use `logger` from `@/app/utils/logger` for debugging and informational logging (development only).
- **Exception**: Test infrastructure (`e2e/`, `scripts/`) may use `logger` or `console` for test runner visibility.

## 2. Error Tracking Usage

```ts
import {errorTracker} from '@/app/utils/error-tracker'

// Capture known error states
errorTracker.captureError('User not found', {
  service: 'auth',
  userId,
  companyId
})

// Capture exceptions in try/catch
try {
  await dangerousOperation()
} catch (error) {
  errorTracker.captureException(error as Error, {
    service: 'blog-posts',
    userId,
    companyId
  })
  throw error
}

// Set user context after authentication
errorTracker.setUserContext({
  id: user.id,
  email: user.email,
  companyId: user.currentCompanyId
})

// Clear context on logout
errorTracker.setUserContext(null)
```

## 3. Context & Metadata

- Always include `service` to identify the source of the error
- Add `userId` and `companyId` when available for user-specific error tracking
- Include relevant entity IDs (blogId, threadId, etc.) for debugging context
- Add custom metadata to help reproduce and fix the error

## 4. Guardrails

- Error tracker handles environment filtering, sanitization, and provider routing
- Never log secrets, tokens, or raw request bodies
- Use `captureError` for known error states, `captureException` for caught exceptions
- Error tracker is ready for Sentry/LogRocket integration without code changes

## 5. Logging Best Practices

- **For errors**: Use `errorTracker.captureError()` or `captureException()`
- **For debugging**: Use `logger.info()`, `logger.debug()`, `logger.warn()` (development only)
- **Never**: Use `console.*` outside `scripts/` directory
- **Future**: When Sentry or similarTool is added, only `app/utils/error-tracker.ts` needs changes
