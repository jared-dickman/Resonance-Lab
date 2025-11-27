# Vercel Deployment Rules

## Scope

Serverless deployment on AWS Lambda via Vercel. Enforces ephemeral execution constraints and external connection pooling.

**Project Config:** `prj_JCX4QEI1OgKJhBJk7Xhoj6Mi8n3u` (team: `team_7hbuqWGxsg5gFnFcYPrqNtRb`)

## Lambda Constraints

**Ephemeral execution:** No persistent state between invocations. Cold starts ~50-200ms.

**Database:** ALWAYS use `POSTGRES_URL` (Supabase pooler port 6543) with `max: 1` connection. NEVER use `POSTGRES_URL_NON_POOLING` or `max > 1` in production - exhausts pool. See @db/drizzle/connection.ts

**No global state:** Lambda dies after request. No in-memory caching, no `idle_timeout` configs.

## Build Protection

`vercel:protect` blocks deploy on validation failures. Self-healing via ast-grep autofixes. See @scripts/vercel-checks.sh

## Performance

**Limits:** 2MB bundle max, <100ms query target
**Optimization:** Dynamic imports for heavy deps, indexed queries, minimal middleware
**Monitoring:** Track cold starts/timeouts → trigger bundle analysis (`pnpm analyze`)

## Continuous Learning

**Pattern detection:**
- Monitor Vercel logs for timeout failures → reduce function complexity
- Track cold start duration → identify heavy dependencies for dynamic imports
- Database slow query logs → add missing indexes

**Auto-optimization triggers:**
- Bundle size warnings → trigger code-splitting analysis
- Connection pool exhaustion → verify `max: 1` pattern compliance
- Repeated cold starts → bundle analysis via `pnpm analyze`

## Critical Anti-Patterns

❌ `max > 1` in postgres config
❌ Non-pooling DB URL in production
❌ Top-level async operations
❌ Skipping build validation

## References

@vercel.json @db/drizzle/connection.ts @scripts/vercel-checks.sh
