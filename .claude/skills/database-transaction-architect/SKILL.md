---
name: database-transaction-architect
description: Prevents data corruption by enforcing transaction boundaries, catching race conditions, and fixing partial rollback bugs
auto_trigger: true
keywords: [transaction, db.transaction, getDbConnection, race condition, validation outside, try-catch, partial rollback, atomicity, company, subscription, billing, quota, provision, multi-table, repository, service, authenticateApiRequest, validateCompanyAccess, requireAuthForRoute, requireAuth, TOCTOU, time-of-check-time-of-use]
paths:
  - app/features/**/service.ts
  - app/features/**/repository/*.ts
  - app/api/**/route.ts
  - app/actions/**/*.ts
---

# Database Transaction Architect

Last line of defense against data corruption. Auto-fixes transaction violations in service/repository/API layers.

## Workflow

### Scan Modified Files

Check git status, identify database operations, detect multi-table patterns.

### Auto-Fix Violations

**Fix 1: Move Validation Inside Transaction** ⭐ CRITICAL

Validation OUTSIDE transaction = TOCTOU vulnerability
Data can change between check and transaction start

```ts
// BEFORE - Race condition (TOCTOU bug)
const authResult = await authenticateApiRequest(companyId)
if (!authResult.success) return authResult.response

await db.transaction(async (tx) => {
  await tx.update(table).set(data)
})

// AFTER - Fixed with SELECT FOR UPDATE
await db.transaction(async (tx) => {
  const [resource] = await tx
    .select()
    .from(userCompanies)
    .where(eq(userCompanies.userId, userId))
    .for('update')  // ← CRITICAL: Lock the row

  if (!resource) throw new Error('Not found')

  await tx.update(table).set(data)
})
```

**Why FOR UPDATE is required:**
- UPDATE locks rows, but only AFTER it finds them
- SELECT without FOR UPDATE doesn't lock
- DELETE can commit before UPDATE runs
- Result: Silent failure (0 rows affected)

**Common validation functions that MUST move inside:**
- `authenticateApiRequest()`
- `validateCompanyAccess()`
- `requireAuthForRoute()`
- `requireAuth()`
- Any `if` check based on external query

**Fix 2: Remove Try-Catch Inside Transaction**
```ts
// BEFORE - Partial rollback
await db.transaction(async (tx) => {
  await tx.insert(companies).values(data)
  try {
    await tx.insert(details).values(details)
  } catch (e) { errorTracker.captureException(e) }
})

// AFTER - Full rollback
await db.transaction(async (tx) => {
  await tx.insert(companies).values(data)
  await tx.insert(details).values(details)
})
```

**Fix 3: Add Transaction Parameter**
```ts
// BEFORE - Broken context
async function createSub(companyId: string) {
  const db = getDbConnection()
  await db.insert(subscriptions).values({companyId})
}

// AFTER - Transaction-aware with error handling
async function createSub(companyId: string, tx?: DbTransaction) {
  const db = tx ?? getDbConnection()
  await db.insert(subscriptions).values({companyId})
}

// SERVICE LAYER - Must wrap with withServiceErrorHandling
export async function createSub(companyId: string, tx?: DbTransaction): Promise<Subscription> {
  return withServiceErrorHandling(
    async () => {
      const db = tx ?? getDbConnection()
      return db.insert(subscriptions).values({companyId}).returning()
    },
    {
      service: 'subscriptions',
      companyId,
    }
  )
}
```

**CRITICAL: Service Layer (`app/features/*/service.ts`)**
- All exported async functions MUST use `withServiceErrorHandling` wrapper
- Transaction parameter (`tx?: DbTransaction`) must be preserved
- Wrapper goes outside, transaction logic inside

**Fix 4: Move External Calls Outside**
```ts
// BEFORE - Lock holding
await db.transaction(async (tx) => {
  await tx.insert(orders).values(data)
  await stripe.charges.create({amount})
})

// AFTER - Isolated
const order = await db.transaction(async (tx) => {
  return await tx.insert(orders).values(data).returning()
})
await stripe.charges.create({amount})
```

### Validate Fixes

Run `pnpm exec ast-grep scan` and `pnpm typecheck` - must pass before completing.

## Auto-Trigger Rules

**Always invoke when:**
- Multiple `db.insert()` or `db.update()` in same function
- Words: create, provision, billing, quota, subscription, company, authenticateApiRequest, validateCompanyAccess, requireAuthForRoute, requireAuth, TOCTOU, time-of-check-time-of-use, race condition
- File paths: `app/features/**/service.ts`, `app/features/**/repository/*`
- Git diff shows: `subscriptions`, `companies`, `users` tables

**Critical operations:**
- Company + subscription creation
- Quota enforcement + resource creation
- Payment + order creation
- User + permissions provisioning

## References

- `llm/rules/db.md:69-114` - Transaction requirements
- `app/features/companies/service.ts:58-94` - Current violations
- `llm/rules/linting-strategy.md` - ast-grep rule format