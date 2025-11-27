# Event Tracking Rules

## Server vs Client

**Server actions/API routes**: Use `event-tracker.server.ts`
```ts
import {eventTracker} from '@/app/utils/event-tracker.server'
await eventTracker.trackEvent('blog_post_created', { blogPostId: post.id })
```

**Client components**: Use `event-tracker.client.ts`
```ts
import {clientEventTracker} from '@/app/utils/event-tracker.client'
// Track events - auto-enriched via /api/analytics
await clientEventTracker.trackEvent('company_switched', { newCompanyId: id })
// Identify users (SessionTracker handles automatically)
clientEventTracker.identifyUser({ id, email, companyId })
```

All client events are sent to `/api/analytics` for server-side auto-enrichment.

## Naming

- **snake_case past tense**: `blog_post_created`, `user_signed_in`
- **Include entity**: `blog_post_updated` not `updated`

## Auto-Enriched

Never manually pass these - they're added automatically:
- **Server-side**: `userId`, `companyId`, `sessionId`, `isSuperAdmin`, `timestamp`, `environment`, `appVersion`
- **Browser info**: `userAgent`, `locale`, `platform`, `timezone`, `screenResolution`, `viewport`

## Security

No PII: passwords, tokens, full emails. Only IDs, counts, status.
