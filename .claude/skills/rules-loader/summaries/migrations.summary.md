# Database Migrations

## Core Pattern
Drizzle ORM + Supabase Postgres + GitHub Actions. Safe, backward-compatible changes with rollback plans.

## Key Principles
1. Migrations run BEFORE code deployment (GitHub Actions, not Vercel)
2. All schema changes via migration files (no manual production changes)
3. Backward compatible by default (expand-contract for breaking changes)
4. Down migration for every up (rollback plan required)
5. Test with realistic data volume (1M+ rows if production table is large)

## Creating a Migration
```bash
# 1. Modify schema: db/drizzle/schema/users.ts
pnpm db:generate  # 2. Creates: db/drizzle/migrations/0014_*.sql
pnpm db:migrate && pnpm typecheck && pnpm dev  # 3. Test locally
# 4. Create down migration: migrations/0014_*.down.sql
pnpm tsx scripts/migrate-down.ts 0014_* && pnpm db:migrate  # 5. Test rollback
```

## Safety Checklist
- [ ] Backward compatible OR expand-contract, down migration tested, realistic data tested, performance impact estimated
- [ ] `pnpm db:check`, `pnpm typecheck`, `pnpm exec ast-grep scan` pass, preview deployment tested

## Common Patterns

**Adding NOT NULL:**
```sql
-- Migration 1: Add nullable, Migration 2: Backfill, Migration 3: Add constraint
ALTER TABLE users ADD COLUMN email VARCHAR(255);
UPDATE users SET email = CONCAT(username, '@example.com') WHERE email IS NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

**Long-running ops:**
```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);  -- No lock
ALTER TABLE users ADD CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES companies(id) NOT VALID;
ALTER TABLE users VALIDATE CONSTRAINT fk_company;  -- Validate separately
```

## Expand-Contract (Breaking Changes)
Rename `name` → `full_name`: 1. Add new column, 2. Dual-write both, 3. Backfill, 4. Switch reads, 5. Drop old

## Rollback
**Level 1 (< 1min):** Transaction rollback (automatic)
**Level 2 (5-15min):** Down migration + code revert
**Level 3 (15-30min):** Point-in-time recovery via Supabase

## Commands
```bash
pnpm db:generate  # Create migration
pnpm db:migrate   # Apply locally
pnpm db:check     # Check drift
pnpm tsx scripts/migrate-down.ts [name]  # Rollback
```

## Anti-Patterns
- ❌ Manual production changes, NOT NULL without backfill, rename without expand-contract, missing CONCURRENTLY, missing down migrations

## Validation
- [ ] Migration + down migration created, tested with realistic data, backward compatible/expand-contract, performance considered, rollback documented

## Read Full File If
Complex migrations, expand-contract patterns, rollback procedures. See `migrations-cicd.md` for CI/CD.