# Database Layer

## Core Pattern
Drizzle ORM with repository pattern, connection singleton, and Zod/OpenAPI alignment.

## Connection & Repository Structure
```ts
import {getDbConnection} from '@/db/drizzle/connection'
const db = getDbConnection()  // Only entry point, handles pooling (max: 10)
```
- Use `POSTGRES_URL` or `DATABASE_URL`, throw if neither present
- Repositories: `app/features/**/repository/drizzle-*.repository.ts`
- Interfaces: `*.interface.ts` expose domain methods
- Factory: `app/core/repository/repository-factory.ts` (only instantiation point)

## Implementation Pattern
```ts
class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: DbConnection) {}

  private toDomain(record: DrizzleUser): UserEntity {
    return {
      id: record.id,
      name: record.name ?? null,
      createdAt: record.createdAt?.toISOString() ?? new Date().toISOString(),
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = await this.db.query.users.findFirst({ where: eq(users.id, id) })
    return record ? this.toDomain(record) : null
  }
}
```

## Query Best Practices
- Use Drizzle helpers (`eq`, `and`, `isNull`) - never interpolate strings
- Scope selects: `db.select({ id, email })` not `select().from(users)`
- Soft deletes: `isNull(table.deletedAt)`

## Transactions
**Required:** Multiple writes, read-modify-write races, financial/quota ops
**Skip:** Single operations (atomic), reads, ops with external API calls

```ts
async function operation(data: Data, tx?: DbTransaction) {
  const db = tx ?? getDbConnection()
  await db.insert(table).values(data)
}

await db.transaction(async (tx) => {
  await operation(data, tx)  // ✅ Pass tx context
  await operation(data)      // ❌ Separate connection breaks rollback
})
```

## TOCTOU Prevention (CRITICAL)

Validation OUTSIDE transaction = race condition

**Pattern:** Validation query → conditional check → transaction
**Risk:** Data changes between check and transaction
**Fix:** Move validation inside transaction with SELECT FOR UPDATE

**Common TOCTOU functions:**
- authenticateApiRequest
- validateCompanyAccess
- requireAuthForRoute

**When to read full file:** Any multi-step database operation with conditional logic

## Zod/OpenAPI Integration
- Repository responses have Zod schemas in `app/features/**/dto`
- Generate OpenAPI from shared Zod
- On schema changes: update DTOs, run `pnpm openapi:generate`

## Anti-Patterns
- ❌ Ad-hoc `drizzle()` instances, raw Drizzle rows returned, diverging schema/DTO/OpenAPI names, API calls in transactions

## Validation
- [ ] `getDbConnection()` for all access, factory-instantiated repos, `toDomain()` mapping, `tx` passed to nested ops, Zod schemas exist

## Read Full File If
Working on transactions, repository creation, or schema/OpenAPI alignment.