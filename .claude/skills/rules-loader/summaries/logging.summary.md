# Logging and Error Tracking

## Core Pattern
Use `errorTracker` for all app errors. Never use `console.*` or deprecated `logger.*` methods.

## Error Tracker Usage
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

## Required Context
- `service`: Identify error source
- `userId` and `companyId`: User-specific tracking (when available)
- Entity IDs: blogId, threadId, etc. for debugging
- Custom metadata: Help reproduce and fix

## Key Principles
- Never `console.*` in `app/` directory
- Do not use `logger.info()`, `logger.debug()`, `logger.warn()` (deprecated)
- Exception: Test infrastructure (`e2e/`, `scripts/`) may use logger/console
- Never log secrets, tokens, or raw request bodies
- Error tracker handles environment filtering and sanitization

## Migration
- **Deprecated:** `logger.info()`, `logger.debug()`, `logger.warn()` - remove these
- **Replace:** `logger.error()` → `errorTracker.captureError()` or `captureException()`
- **Future:** Sentry integration only requires changing `app/utils/error-tracker.ts`

## Anti-Patterns
- ❌ `console.log()` in app code
- ❌ `logger.info()`, `logger.debug()`, `logger.warn()`
- ❌ Logging secrets or tokens
- ❌ Missing `service` in context

## Validation
- [ ] Using `errorTracker` for all errors
- [ ] No `console.*` calls in `app/` directory
- [ ] Including `service` in all error contexts
- [ ] Setting user context after auth
- [ ] No secrets in error metadata

## Read Full File If
File is concise. Reference for error tracking patterns.