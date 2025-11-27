# Database Migrations

**Stack**: Drizzle ORM + Supabase Postgres + GitHub Actions

**Goal**: Create safe, backward-compatible database changes with rollback plans.

**When to use**: Every schema change (add table, column, index, constraint)

**When NOT to use**: Never modify production database manually

---

## Key Principles

1. **Migrations run BEFORE code deployment** (GitHub Actions, not Vercel build)
2. **All schema changes via migration files** (no manual production changes)
3. **Backward compatible by default** (expand-contract for breaking changes)
4. **Down migration for every up** (rollback plan required)
5. **Test with realistic data volume** (1M+ rows if production table is large)

---

## Creating a Migration

### 1. Modify Schema Definition

```typescript
// db/drizzle/schema/users.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', {length: 255}).notNull(),
  // Add new column
  phoneNumber: varchar('phone_number', {length: 20}),
})
```

### 2. Generate Migration

```bash
pnpm db:generate
# Creates: db/drizzle/migrations/0014_add_phone_number.sql
```

### 3. Test Locally

```bash
pnpm db:migrate  # Apply to local database
pnpm typecheck   # Verify types
pnpm dev         # Test application
```

### 4. Create Down Migration

```sql
-- migrations/0014_add_phone_number.down.sql
ALTER TABLE users DROP COLUMN phone_number;
```

Test rollback:
```bash
pnpm tsx scripts/migrate-down.ts 0014_add_phone_number
pnpm db:migrate  # Reapply
```

---

## Safety Checklist

### Before Creating Migration

- [ ] Schema change documented (what and why)
- [ ] Backward compatible OR uses expand-contract
- [ ] Tested locally with realistic data
- [ ] Down migration created and tested
- [ ] Performance impact estimated

### Before Merging PR

- [ ] `pnpm db:check` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm exec ast-grep scan` passes
- [ ] Preview deployment tested
- [ ] Rollback procedure documented

### After Deployment

- [ ] Monitor for 30 minutes
- [ ] Check error rates
- [ ] Verify database performance
- [ ] Confirm new features work

---

## Common Pitfalls & Solutions

### ❌ Adding NOT NULL to Existing Column

**Problem**: Fails if existing rows have NULL

**Solution**: Three-phase migration
```sql
-- Migration 1: Add nullable column
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Migration 2: Backfill data
UPDATE users SET email = CONCAT(username, '@example.com') WHERE email IS NULL;

-- Migration 3 (separate PR): Add constraint
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

### ❌ Renaming Columns/Tables

**Problem**: Breaks deployed code immediately

**Solution**: Expand-contract (5 steps, see below)

### ❌ Long-Running Migrations Lock Tables

**Problem**: Production downtime during migration

**Solution**: Use CONCURRENTLY for indexes
```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

Batch large updates:
```sql
-- Update 1000 rows at a time
DO $$
DECLARE batch_size INT := 1000; affected INT;
BEGIN
  LOOP
    UPDATE users SET status = 'active'
    WHERE id IN (SELECT id FROM users WHERE status IS NULL LIMIT batch_size);
    GET DIAGNOSTICS affected = ROW_COUNT;
    EXIT WHEN affected = 0;
    COMMIT;
  END LOOP;
END $$;
```

### ❌ Foreign Key Constraints Lock Multiple Tables

**Problem**: Locks parent AND child tables

**Solution**: Add without validation
```sql
-- Fast: Add constraint without validating existing rows
ALTER TABLE users ADD CONSTRAINT fk_company
FOREIGN KEY (company_id) REFERENCES companies(id) NOT VALID;

-- Separate step: Validate (no lock)
ALTER TABLE users VALIDATE CONSTRAINT fk_company;
```

---

## Rollback Procedures

### Level 1: Transaction Rollback (< 1 minute)
**When**: Migration fails during execution
**How**: Automatic - Postgres transaction rolls back

### Level 2: Down Migration (5-15 minutes)
**When**: Migration succeeded but introduced bugs
**How**:
```bash
pnpm tsx scripts/migrate-down.ts 0014_migration_name
git revert HEAD  # Revert code changes
git push origin master
```

### Level 3: Point-in-Time Recovery (15-30 minutes)
**When**: Data corruption discovered hours later
**How**: Supabase dashboard → Settings → Database → Restore
```bash
supabase db restore --timestamp "2025-10-21T14:00:00Z"
```

---

## Zero-Downtime Patterns

### Expand-Contract for Breaking Changes

**Use case**: Rename column from `name` to `full_name`

**Phase 1: Expand** (add new column)
```sql
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
```

**Phase 2: Dual-write** (application code)
```typescript
await db.update(users).set({
  name: value,      // Old column
  fullName: value   // New column
})
```

**Phase 3: Backfill** (migrate old data)
```sql
UPDATE users SET full_name = name WHERE full_name IS NULL;
```

**Phase 4: Switch reads** (application code)
```typescript
const user = await db.select({fullName: users.fullName})  // Read new column only
```

**Phase 5: Contract** (drop old column)
```sql
ALTER TABLE users DROP COLUMN name;
```

### Add Column (Safe - Single Migration)

```sql
-- Nullable column with default - backward compatible
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
```

### Drop Column (Requires Expand-Contract)

**Phase 1**: Stop writing to column
**Phase 2**: Deploy code without column references
**Phase 3**: Drop column
```sql
ALTER TABLE users DROP COLUMN deprecated_field;
```

### Change Column Type (Requires Expand-Contract)

```sql
-- Phase 1: Add new column
ALTER TABLE users ADD COLUMN score_v2 DECIMAL(10,2);

-- Phase 2: Backfill
UPDATE users SET score_v2 = CAST(score AS DECIMAL(10,2));

-- Phase 3: Switch application code to score_v2

-- Phase 4: Drop old column
ALTER TABLE users DROP COLUMN score;
ALTER TABLE users RENAME COLUMN score_v2 TO score;
```

---

## Examples by Use Case

### Add New Feature Table

```typescript
// db/drizzle/schema/notifications.ts
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
```

```bash
pnpm db:generate
pnpm db:migrate
```

✅ Safe - new table doesn't break existing code

### Add Index for Performance

```sql
-- Use CONCURRENTLY to avoid locking
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_posts_published_at ON blog_posts(published_at)
WHERE status = 'published';
```

✅ Safe - CONCURRENTLY prevents table locks

### Add Unique Constraint

```sql
-- Phase 1: Fix duplicate data first
DELETE FROM users WHERE id NOT IN (
  SELECT MIN(id) FROM users GROUP BY email
);

-- Phase 2: Add constraint
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE(email);
```

⚠️ Requires data cleanup before constraint

---

## Quick Reference

```bash
# Create migration
pnpm db:generate

# Apply locally
pnpm db:migrate

# Check drift
pnpm db:check

# Rollback (manual script needed)
pnpm tsx scripts/migrate-down.ts [migration_name]

# Test migration performance
time psql $DATABASE_URL < migrations/0014_new.sql
```

**For CI/CD setup**, see `migrations-cicd.md`

**For emergency contacts**, see `migrations-cicd.md`
