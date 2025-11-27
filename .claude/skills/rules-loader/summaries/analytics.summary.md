# Event Tracking

## Core Pattern
Server-side and client-side event tracking with automatic enrichment. Server actions use `event-tracker.server.ts`, client components use `event-tracker.client.ts`.

## Key Requirements
- Server actions/API routes: `import {eventTracker} from '@/app/utils/event-tracker.server'`
- Client components: `import {clientEventTracker} from '@/app/utils/event-tracker.client'`
- Event naming: snake_case past tense with entity (`blog_post_created`, `user_signed_in`)
- Client events routed to `/api/analytics` for server-side enrichment

## Code Examples

**Server:**
```ts
await eventTracker.trackEvent('blog_post_created', { blogPostId: post.id })
```

**Client:**
```ts
await clientEventTracker.trackEvent('company_switched', { newCompanyId: id })
clientEventTracker.identifyUser({ id, email, companyId })
```

## Auto-Enriched Properties
Never manually pass these - added automatically:
- Server: `userId`, `companyId`, `sessionId`, `isSuperAdmin`, `timestamp`, `environment`, `appVersion`
- Browser: `userAgent`, `locale`, `platform`, `timezone`, `screenResolution`, `viewport`

## Anti-Patterns
- ❌ `clientEventTracker.trackEvent('update', { userId: '123' })` (missing entity, manual userId)
- ✅ `clientEventTracker.trackEvent('blog_post_updated', { blogPostId: '123' })`
- ❌ Passing PII: passwords, tokens, full emails
- ✅ Only IDs, counts, status values

## Validation
- [ ] Using correct tracker for environment (server vs client)
- [ ] Event names are snake_case past tense with entity
- [ ] Not manually passing auto-enriched properties
- [ ] No PII in event properties

## Read Full File If
File is already complete at 36 lines. Reference for any event tracking work.