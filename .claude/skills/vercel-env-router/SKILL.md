---
name: vercel-env-router
description: Auto-invoked for Vercel env issues. Routes Preview→dev, Production→prod using proper Next.js server-side patterns.
auto_trigger: true
keywords: [vercel, preview, production, API_BASE_URL, NEXT_PUBLIC, backend routing]
---

# Vercel Environment Router

**Core Rule:** Server-side = `process.env.API_BASE_URL`. Client-side = `NEXT_PUBLIC_*`.

## The Gotcha (Official Next.js Docs)

> "NEXT_PUBLIC_ variables will be frozen with the value evaluated at build time"

**Translation:** `NEXT_PUBLIC_*` is baked into JS bundle at build. Useless for runtime server-side routing.

## Pattern

```typescript
// Server-side API routes (Vercel docs pattern)
const API_URL = process.env.API_BASE_URL || 'http://localhost:8080';
```

## Config

```bash
vercel env add API_BASE_URL preview   # → https://dev.srv1015344.hstgr.cloud
vercel env add API_BASE_URL production # → https://srv1015344.hstgr.cloud
```

## Verify

```bash
vercel env ls  # check scopes
# Redeploy required after changes
```

## Anti-Patterns

❌ `NEXT_PUBLIC_*` in server code
❌ Hardcoded backend URLs
❌ Same URL for preview/production

## Official Docs

- https://vercel.com/docs/projects/environment-variables
- https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
