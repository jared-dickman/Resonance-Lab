# Database Layer Rules

## 1. Scope

- Standardize how Drizzle ORM models, connections, and repositories are authored.
- Ensure every database contract is mirrored in Zod schemas that back our OpenAPI definitions.
- Keep database access predictable, observable, and safe for serverless runtimes.

## 2. Connection Management

- `db/drizzle/connection.ts` is the only entry point. Import `getDbConnection()` instead of instantiating `drizzle()`
  directly.
- Environment variables: prefer `POSTGRES_URL`; fall back to `DATABASE_URL`. Throw immediately if neither is present.
- The singleton connection handles pooling. Never shadow it with feature-specific pools.

```ts
import {getDbConnection} from '@/db/drizzle/connection'

const db = getDbConnection()
```

**Serverless-specific configuration:**

Application runs on Vercel (AWS Lambda). See `db/drizzle/connection.ts` for pooler configuration. Key requirements: `max: 1`, `prepare: false`, server-side `statement_timeout` to override Supabase 30s default.
Supabase pooler (port 6543) handles pooling externally. Each Lambda needs exactly 1 connection.

## 3. Schema Authoring

- Define tables in `db/drizzle/schema/**`; co-locate enums and relations beside table definitions.
- Export inferred types (`InferModel<typeof users>`) and domain-friendly aliases (e.g., `type DrizzleUser`).
- Use `pgTable` helpers over raw SQL. Name columns with snake_case to match Postgres convention.
- Introduce migrations via `pnpm drizzle-kit generate`; never edit generated SQL manually.

## 4. Repository Pattern

- Concrete repositories live under `app/features/**/repository/drizzle-*.repository.ts`.
- Interfaces (`*.interface.ts`) expose domain-level methods; services consume interfaces, not Drizzle primitives.
- Instantiate repositories exclusively through `app/core/repository/repository-factory.ts`; add new getters alongside
  existing ones.
- Map Drizzle records to domain entities in a dedicated private method (`toDomain`) before returning results.
- Use null coalescing operator (`??`) to handle nullable fields when mapping to domain entities.

```ts
class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: DbConnection) {}

  private toDomain(record: DrizzleUser): UserEntity {
    return {
      id: record.id,
      email: record.email,
      name: record.name ?? null,
      role: record.role as UserRole,
      companyId: record.companyId ?? null,
      createdAt: record.createdAt ? record.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: record.updatedAt ? record.updatedAt.toISOString() : new Date().toISOString(),
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = await this.db.query.users.findFirst({ where: eq(users.id, id) })
    return record ? this.toDomain(record) : null
  }
}
```

## 5. Query Guidelines

- Always compose predicates with Drizzle helpers (`eq`, `and`, `isNull`). Do not interpolate strings.
- Scope selects to required columns via `db.select({ ... })`; avoid `select().from(users)` unless all fields are needed.
- Soft deletes: filter with `isNull(table.deletedAt)` instead of deleting rows outright.
- Prefer transactions (`db.transaction`) for multi-step writes; propagate the transaction client down into repository
  methods when needed.

## 6. Transaction Usage

Use transactions to prevent race conditions and ensure atomicity. Most operations do not need them.

**Require transactions when:**

- Multiple writes must succeed or fail together (atomicity requirement)
- Read-modify-write operations where concurrent requests could violate business rules
- Financial or quota operations where partial completion causes data corruption

**Skip transactions for:**

- Single INSERT/UPDATE operations (already atomic at database level)
- Read-only queries (nothing to rollback)
- Eventually consistent operations (side effects can retry independently)
- Operations containing external API calls (network timeouts lock database rows)

**Critical rule: All operations in a transaction MUST use the same transaction context.**

If any operation creates its own database connection instead of using the transaction parameter, it will NOT participate in the rollback. This defeats the entire purpose of the transaction.

**Making functions transaction-aware:**

```ts
// Add optional transaction parameter, default to connection if not provided
async function operation(data: Data, tx?: DbTransaction) {
  const db = tx ?? getDbConnection()
  await db.insert(table).values(data)
}
```

When calling transaction-aware functions inside a transaction, always pass `tx`:

```ts
await db.transaction(async (tx) => {
  await operation(data, tx)  // ✓ Correct
  await operation(data)      // ✗ Wrong - creates separate connection
})
```

**Transaction type:** Export `DbTransaction` type from connection file for consistent typing.

**Locking:** Use `.for('update')` on queries inside transactions when reads must prevent concurrent modifications.

**Keep transactions short:** Database operations only. Move external calls outside transaction boundaries.

## 6.1 TOCTOU Vulnerabilities (Critical)

**Time-Of-Check-Time-Of-Use:** Data validated OUTSIDE transaction can change BEFORE transaction executes.

**Anti-Pattern Detection:**

❌ **Validation before transaction:**
```typescript
const exists = await db.select().from(table).where(eq(table.id, id))
if (!exists) throw new Error('Not found')

await db.transaction(async (tx) => {
  await tx.update(table).set(data)  // ← May affect 0 rows!
})
```

✅ **Validation inside transaction with FOR UPDATE:**
```typescript
await db.transaction(async (tx) => {
  const [resource] = await tx
    .select()
    .from(table)
    .where(eq(table.id, id))
    .for('update')  // ← Prevents concurrent DELETE

  if (!resource) throw new Error('Not found')

  await tx.update(table).set(data)
})
```

**Validation functions that cause TOCTOU:**
- `authenticateApiRequest()` - validates company access
- `validateCompanyAccess()` - checks userCompanies table
- `requireAuthForRoute()` - validates session context
- Any query result used for conditional logic

**Rule:** If validation query result determines whether transaction proceeds, validation MUST be inside transaction with SELECT FOR UPDATE.

## 7. Zod + OpenAPI Alignment

- Every repository response type must have a Zod schema under `app/features/**/dto`; reuse these schemas in API routes
  and OpenAPI specs.
- Generate OpenAPI contracts from the shared Zod objects—do not duplicate typing in YAML.
- When columns change, update schema, Zod DTOs, and regenerate OpenAPI (`pnpm openapi:generate`) in the same change.
- Document pagination, soft-delete flags, and enums explicitly in the OpenAPI description and examples.

## 8. Error Handling & Observability

- Wrap repository calls in domain services; catch Drizzle errors and rethrow typed domain errors (`RepositoryError`,
  `NotFoundError`).
- Log connection or migration failures once during startup; avoid console noise inside hot paths.
- For retries, rely on service-level policies (e.g., TanStack Query) rather than re-querying in repositories.

## 9. Testing & Fixtures

- Seed integration tests via fixtures located in `app/testing/fixtures/**`; never inline literals in tests.
- Use in-memory transactions or disposable schemas when running Vitest; clean up with `rollback` hooks.
- Mock repositories via interfaces for unit tests; use MSW + fixtures to validate API-level behavior.
- Use proper types (`Partial<DbConnection>`), type guards, or refactor to maintain type safety. Especially in DB/Drizzle testing contexts

## 10. Anti-Patterns

- ❌ Creating ad-hoc Drizzle instances inside React components or server actions.
- ❌ Returning raw Drizzle rows to API handlers without mapping or validation.
- ❌ Diverging column names between schema, DTOs, and OpenAPI examples.

## 11. References

- `db/drizzle/schema/*` – source of truth for table definitions.
- `app/core/repository/repository-factory.ts` – central repository registry.
- `specs/014-treads/contracts/threads-api.openapi.yaml` – example of database-backed OpenAPI contract.
- Drizzle documentation: https://orm.drizzle.team/docs
