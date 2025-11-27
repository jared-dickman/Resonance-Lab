# Migration CI/CD Setup

## Core Pattern
Automate migration deployment via GitHub Actions. Run migrations BEFORE code deployment, not in Vercel build.

## Current State
**Have:** Drizzle ORM, migration files, Supabase Postgres
**Missing:** Automated runs, CI validation, rollback scripts, preview databases

## Phase 1: Immediate Safety

**Scripts:**
```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:check": "drizzle-kit check"
}
```

**GitHub Actions flow:**
1. validate: `drizzle-kit check`, typecheck, lint, ast-grep scan
2. migrate: Run `drizzle-kit migrate` with `POSTGRES_URL_NON_POOLING`
3. deploy: Deploy to Vercel after migrations succeed

**Verification script:**
```ts
// scripts/verify-migration.ts
// Checks __drizzle_migrations table for latest migration hash
```

## Emergency Procedures

**Database restore (Supabase):**
```bash
supabase db restore --timestamp "2025-10-21T14:00:00Z"
```

**Manual rollback:**
```bash
pnpm tsx scripts/migrate-down.ts 0014_migration_name
```

## Required GitHub Secrets
```
POSTGRES_URL_NON_POOLING  # Direct connection
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SUPABASE_ACCESS_TOKEN     # For branching (optional)
SUPABASE_PROJECT_ID       # For branching (optional)
```

## Phase 2: Enhanced Safety
- Supabase branching for preview databases
- Automated backups before migration
- PR preview deployments with isolated databases

## Phase 3: Production Excellence
- Weekly drift detection (cron job)
- Migration performance testing with production-scale data
- Slack notifications on failures

## Key Principles
- Migrations run in GitHub Actions, not Vercel build
- Schema drift detection via `drizzle-kit check`
- Point-in-time recovery available via Supabase
- Down migrations for rollback capability

## Anti-Patterns
- ❌ Running migrations in Vercel build
- ❌ Missing drift detection
- ❌ No verification step after migration
- ❌ Missing rollback scripts

## Validation
- [ ] GitHub Actions configured with migrate job before deploy
- [ ] `POSTGRES_URL_NON_POOLING` secret configured
- [ ] Verification script exists
- [ ] Rollback script tested locally

## Read Full File If
Setting up CI/CD for first time, configuring GitHub Actions, or implementing preview databases. See `migrations.md` for daily workflow.