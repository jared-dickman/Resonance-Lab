# Migration CI/CD Setup

**Goal**: Automate migration deployment and validation

**When to use**: One-time team setup, onboarding new projects

**When NOT to use**: Daily migration creation (see `migrations.md`)

---

## Current State

### What We Have ✅
- Drizzle ORM with TypeScript schema
- Migration files in `/db/drizzle/migrations/`
- Supabase Postgres with automatic backups
- Schema types auto-generated

### What's Missing ❌
- No automated migration runs
- No CI validation for schema drift
- No rollback scripts
- No preview databases for PRs

---

## Implementation Phases

### Phase 1: Immediate Safety (This Week)

#### 1. Add Migration Scripts

```json
// package.json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:check": "drizzle-kit check",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

#### 2. GitHub Actions Pre-Deployment

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [master]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm drizzle-kit check  # Schema drift detection
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm exec ast-grep scan

  migrate:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install

      - name: Run migrations
        env:
          POSTGRES_URL_NON_POOLING: ${{ secrets.POSTGRES_URL_NON_POOLING }}
        run: pnpm drizzle-kit migrate

      - name: Verify migration applied
        env:
          POSTGRES_URL_NON_POOLING: ${{ secrets.POSTGRES_URL_NON_POOLING }}
        run: pnpm tsx scripts/verify-migration.ts

  deploy:
    needs: migrate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### 3. Migration Verification Script

```typescript
// scripts/verify-migration.ts
import {getDbConnection} from '@/db/drizzle/connection'
import {sql} from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

const db = getDbConnection()

const journalPath = path.join(__dirname, '../db/drizzle/migrations/meta/_journal.json')
const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
const latestMigration = journal.entries[journal.entries.length - 1]

const result = await db.execute(sql`
  SELECT * FROM __drizzle_migrations
  WHERE hash = ${latestMigration.tag}
`)

if (result.rows.length === 0) {
  console.error(`❌ Migration ${latestMigration.tag} not applied!`)
  process.exit(1)
}

console.log(`✅ Migration ${latestMigration.tag} verified`)
process.exit(0)
```

---

### Phase 2: Enhanced Safety (This Month)

#### 1. Supabase Branching for PRs

```yaml
# .github/workflows/preview-deployment.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1

      - name: Create preview branch
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
        run: |
          supabase link --project-ref $SUPABASE_PROJECT_ID
          supabase db push

      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--preview'
        env:
          DATABASE_URL: ${{ steps.supabase.outputs.db_url }}
```

#### 2. Automated Backups Before Migration

```yaml
# In deploy-production.yml, before migrate job
- name: Create backup point
  run: |
    BACKUP_NAME="pre-migration-$(date +%Y%m%d-%H%M%S)"
    # Supabase automatic PITR backups
    echo "Backup point: $BACKUP_NAME" >> $GITHUB_STEP_SUMMARY
```

---

### Phase 3: Production Excellence (This Quarter)

#### 1. Drift Detection Monitoring

```yaml
# .github/workflows/drift-detection.yml
name: Weekly Schema Drift Check

on:
  schedule:
    - cron: '0 0 * * 1'  # Every Monday

jobs:
  check-drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm drizzle-kit check

      - name: Notify on drift
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "⚠️ Schema drift detected!"
            }
```

#### 2. Migration Performance Testing

Create test database with production-scale data:

```bash
# scripts/test-migration-performance.sh

# Clone production schema
pg_dump --schema-only $PROD_DB > schema.sql

# Create test database
createdb migration_test
psql migration_test < schema.sql

# Generate 1M test rows
psql migration_test -c "
  INSERT INTO users
  SELECT
    generate_series(1, 1000000),
    'user' || generate_series(1, 1000000),
    NOW()
"

# Test migration
time psql migration_test < migrations/0014_new_migration.sql

# Validate: Should complete in < 5 minutes for non-blocking ops
```

---

## Emergency Procedures

### Database Restore

**Via Supabase Dashboard**:
1. Navigate to Settings → Database
2. Click "Point-in-time recovery"
3. Select timestamp before migration
4. Confirm restore

**Via CLI**:
```bash
supabase db restore --timestamp "2025-10-21T14:00:00Z"
```

### Manual Rollback

```bash
# Create rollback script
# scripts/migrate-down.ts
import {getDbConnection} from '@/db/drizzle/connection'
import {sql} from 'drizzle-orm'
import * as fs from 'fs'

const migrationName = process.argv[2]
const downSql = fs.readFileSync(`db/drizzle/migrations/${migrationName}.down.sql`, 'utf-8')

const db = getDbConnection()
await db.execute(sql.raw(downSql))
console.log(`✅ Rolled back ${migrationName}`)
```

Usage:
```bash
pnpm tsx scripts/migrate-down.ts 0014_add_phone_number
```

---

## Secrets Configuration

### GitHub Secrets

Required secrets in repository settings:

```
POSTGRES_URL_NON_POOLING  # Supabase direct connection
VERCEL_TOKEN              # Vercel deployment token
VERCEL_ORG_ID             # Vercel organization ID
VERCEL_PROJECT_ID         # Vercel project ID
SUPABASE_ACCESS_TOKEN     # For branching (optional)
SUPABASE_PROJECT_ID       # For branching (optional)
```

### Local Environment

```bash
# .env.local
POSTGRES_URL_NON_POOLING="postgresql://..."
```

---

## Tools & Stack

**Current**:
- **Drizzle Kit**: Migration generation, schema management
- **Supabase**: Postgres hosting, automatic backups
- **GitHub Actions**: CI/CD automation
- **Vercel**: Application hosting

**Future Considerations**:
- **pgroll**: Zero-downtime migration orchestration
- **Atlas**: Advanced schema-as-code and drift detection

---

## Resources

**Documentation**:
- Drizzle migrations: https://orm.drizzle.team/docs/migrations
- Supabase branching: https://supabase.com/docs/guides/deployment/branching
- Zero-downtime patterns: https://planetscale.com/blog/backward-compatible-databases-changes

**Internal Runbooks**:
- Migration rollback: `/docs/runbooks/migration-rollback.md`
- Database restore: `/docs/runbooks/database-restore.md`
- Schema drift resolution: `/docs/runbooks/schema-drift.md`

---

## Emergency Contacts

**Production Issues**:
- On-call engineer: [Slack channel]
- Database admin: [Contact info]
- Supabase support: support@supabase.io

---

**For daily migration workflow**, see `migrations.md`
