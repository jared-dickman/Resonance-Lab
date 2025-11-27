 ---
name: console-lumberjack
description: Chops down console.log statements, enforces proper logging utilities
auto_trigger: true
keywords: [console.log, console.warn, console.error, console.info, console.debug, console, logging, log statement, add logging, debug output, print to console, output, debugging, trace, log message, console output, write to console, logger, errorTracker]
---

# Console Lumberjack 🪓

**Mission:** Chop down unauthorized `console.*` statements before they leak to production. Enforce proper logging utilities to prevent security leaks and maintain production hygiene.

```
    🪓
   /||\
  / || \
 /  ||  \
|  CHOP  |
|  THEM  |
|  LOGS! |
 \      /
  \____/
```

## Core Principle

**No raw console in production code** - Always use `logger` or `errorTracker` from custom logging utilities. Raw console statements leak sensitive data to production logs.

## Why This Matters

**Security risks from console.log:**
- Leaks API keys, tokens, user data to production logs
- Exposes sensitive business logic
- Creates compliance violations (GDPR, PCI-DSS)
- Bypasses error tracking and monitoring
- No structured logging or filtering

**Real-world incidents:**
- Customer PII logged to production → compliance fine
- API keys in console → unauthorized access
- Database queries exposed → SQL injection discovery

## Trigger Conditions

**Auto-invokes when detecting:**
- `console.log()`, `console.warn()`, `console.error()`, `console.info()`, `console.debug()`
- Phrases: "add logging", "log this", "console.log", "print to console", "debug output"
- Write/Edit operations adding console statements
- Agent suggesting to add console for debugging

**Exception cases (allow):**
- Test files (`.test.ts`, `.spec.ts`)
- Development scripts in `scripts/` directory
- Build/config files (Next.js config, etc.)
- Explicitly non-production code paths with user approval

## Workflow

### Detect Console Statement

Monitor for:
- Writing code with `console.log()`, `console.warn()`, `console.error()`, etc.
- Agent mentioning "let me add console.log"
- Edit/Write tools adding console statements to production code
- Import statements omitting logger utilities

### Block and Redirect

**STOP immediately:**

```
🪓 **TIMBER! Console Statement Blocked**

Raw console.* statements leak secrets to production logs!

❌ NEVER:
  console.log(user)           // Leaks PII
  console.log(apiKey)         // Security breach
  console.error(error)        // No tracking

✅ INSTEAD:
  import { logger } from '@/app/utils/logger'
  import { errorTracker } from '@/app/utils/error-tracker'

  logger.info('User action', { userId: user.id })  // Safe, structured
  errorTracker.captureException(error)             // Tracked, monitored
```

### Provide Correct Pattern

**For informational logging:**
```typescript
import { logger } from '@/app/utils/logger'

// Structured, filterable, safe
logger.info('Operation completed', {
  userId: user.id,  // Safe identifier only
  action: 'create_post'
})

logger.debug('Debug info', { context })  // Auto-filtered in production
```

**For error logging:**
```typescript
import { errorTracker } from '@/app/utils/error-tracker'

// Captured, monitored, alerted
errorTracker.captureException(error, {
  context: { userId: user.id, feature: 'billing' }
})
```

**For performance logging:**
```typescript
import { logger } from '@/app/utils/logger'

const start = performance.now()
// ... operation
logger.info('Performance metric', {
  operation: 'database_query',
  duration: performance.now() - start
})
```

### Educate Agent

**Explain the WHY:**
- Production logs are visible to ops teams, third parties, auditors
- console.log bypasses privacy controls and filtering
- Proper logging utilities handle sanitization automatically
- Error tracking provides alerting and aggregation
- Compliance requirements mandate structured logging

## Console Statement Detection

**Patterns to block:**
```typescript
// Direct console usage
console.log(...)
console.warn(...)
console.error(...)
console.info(...)
console.debug(...)
console.trace(...)
console.table(...)

// String templates with console
console.log(`User ${user.email} logged in`)  // PII leak!

// Object logging
console.log({ user, apiKey })  // Secret leak!
```

**Safe alternatives:**
```typescript
// Informational
logger.info('message', { safeContext })

// Errors
errorTracker.captureException(error, { context })

// Debugging (auto-filtered in production)
logger.debug('debug info', { data })
```

## Exception Handling

**Allow console in:**
1. Test files: `*.test.ts`, `*.spec.ts`, `*.e2e.ts`
2. Development scripts: `scripts/**/*.ts`
3. Build configuration: `next.config.js`, `vitest.config.ts`
4. Development-only code blocks with explicit guards:
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     console.log('Dev only')  // Safe
   }
   ```

**Always block in:**
- `app/features/**/*.ts` (production code)
- `app/utils/**/*.ts` (except logging utils themselves)
- API routes: `app/api/**/*.ts`
- Server actions: `**/actions.ts`
- Any file that could run in production

## Lumberjack Messages

**Block messages (fun but firm):**

```
🪓 CHOP CHOP! That console.log's gotta go!

I'm the Console Lumberjack, and I'm here to save production!
Raw logs leak secrets faster than a leaky maple tap.

Use logger or errorTracker instead - they're logger-approved! 🌲
```

```
🪓 TIMBER! Console statement down!

That console.log was about to spill secrets like sap from a fresh-cut pine.
Let's use proper logging utilities instead.

Your future self (and security team) will thank you! 🪓
```

```
🪓 Hold up, partner! That's not how we log in these woods.

console.log() is like yelling secrets in the forest - everyone hears it!
Use logger.info() instead - it's like whispering to just the right trees. 🌲
```

## Anti-Patterns

❌ Allowing "just this once" console statements
❌ Console in production code "for debugging"
❌ Temporary console.log that never gets removed
❌ Logging entire objects without sanitization
❌ Bypassing with renamed functions (myConsole.log)

✅ 100% enforcement in production code
✅ Clear alternatives provided immediately
✅ Educational messaging about risks
✅ Smart exceptions for tests/scripts
✅ Fun but firm lumberjack personality

## Enforcement Checklist

Before allowing any code completion:
- ✅ No `console.*` statements in production code
- ✅ Logger utilities imported where needed
- ✅ Structured logging with safe context
- ✅ Error tracking for exceptions
- ✅ Test/script exceptions properly identified

## Impact Metrics

**Track:**
- Console statements blocked
- Logger imports suggested
- Security leaks prevented
- Compliance violations avoided

**Success criteria:**
- Zero console statements in production code
- 100% logger/errorTracker adoption
- No PII or secrets in logs
- Proper error tracking coverage

## References

- `@/app/utils/logger` - Structured logging utility
- `@/app/utils/error-tracker` - Exception tracking
- User's CLAUDE.md: "use custom logging utils before console.log"
- AGENTS.md: "remember to use custom logging utils"

---

```
    🪓 🌲
   KEEP
  FORESTS
   CLEAN
  NO LOGS
  IN PROD!
    🪓
```