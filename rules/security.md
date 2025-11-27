# Security Rules

## 1. Scope

Multi-tenant company-based access control with role-based permissions and defense-in-depth validation.

## 2. Authentication

- Use `await auth()` from `@/app/api/auth/config` for session.
- Trust only `session.user.id`, `session.isSuperAdmin`, `session.currentCompanyId`.
- Never trust client headers (`x-user-role`, `x-is-super-admin`).

```ts
import {auth} from '@/app/api/auth/config'

const session = await auth()
const userId = session?.user?.id
const companyId = session?.currentCompanyId
```

## 3. Permission Model

- `user_companies` table: roles are `member`, `admin`, `owner`.
- `users.is_super_admin`: global access, MUST be audit logged.
- Always call `validateCompanyAccess(userId, companyId)` before operations.

```ts
import {validateCompanyAccess} from '@/app/utils/permissions'

const hasAccess = await validateCompanyAccess(userId, companyId)
if (!hasAccess) {
  return NextResponse.json({error: 'Not found'}, {status: 404})
}
```

## 4. API Route Patterns

**Use centralized auth utilities from `app/utils/api-auth.ts`:**

**Basic auth (no company):** `requireAuthForRoute()` → returns `{userId, session}` or error response
**Company-scoped auth:** `authenticateApiRequest(companyId?)` → validates access, returns `{userId, companyId}` or error response
**Paranoid validation:** `validateCompanyData(data, companyId, context)` → prevents data leaks across companies

**Examples:** See `app/api/threads/route.ts`, `app/api/blog-posts/route.ts`, `app/api/users/route.ts`

## 5. Service Layer

- All methods accept `userId` AND `companyId`.
- Validate access even if API already checked.
- Verify fetched `entity.companyId === requestedCompanyId`.

```ts
async function getData(userId: string, companyId: string): Promise<Entity[]> {
  const hasAccess = await validateCompanyAccess(userId, companyId)
  if (!hasAccess) throw new Error('Access denied')

  const data = await repository.findAll(companyId)

  if (data.some(item => item.companyId !== companyId)) {
    throw new Error('Company mismatch')
  }

  return data
}
```

## 6. Status Codes

- 401: Unauthenticated
- 404: Not found OR unauthorized (never 403)
- 400: Validation error
- 500: Internal error

Never return 403—reveals resource existence.

## 7. Input Validation

**Use centralized validation utilities from `app/utils/api-validation.ts`:**

**Query params:** `validateQueryParams(request, schema)`
**Request body:** `validateRequestBody(request, schema)`
**Route params:** `validateParams(params, schema)`

All return `{success: true, data}` or `{success: false, response}` - return the response on failure

**Complex validation errors:** Use `buildProblemDetailFromZod()` from `app/features/user/validation/problem-detail.ts`

## 8. Logging & Tracking

- Track super admin access: `eventTracker.trackEvent('super_admin_accessed', {resource, companyId})`
- Capture data leaks: `errorTracker.captureError('Data leak detected', {service, companyId})`
- Track access denials: `eventTracker.trackEvent('access_denied', {resource, userId, companyId})`
- Never log passwords, tokens, or PII.

## 9. Anti-Patterns

```ts
// ❌ Never trust headers
request.headers.get('x-is-super-admin')

// ❌ Never skip validation
async function getData(companyId: string) {
  return repository.findAll(companyId)  // Missing userId check!
}

// ❌ Never return 403
if (!hasAccess) {
  return NextResponse.json({error: 'Forbidden'}, {status: 403})
}

// ❌ Never bypass TypeScript
const user = data as any

// ❌ Never use raw SQL
db.execute(`SELECT * FROM posts WHERE company_id = '${companyId}'`)
```

## 10. References

**Auth & Permissions:**
- `app/api/auth/config.ts` – Session config
- `app/utils/api-auth.ts` – Route auth utilities
- `app/utils/permissions.ts` – Permission utilities
- `app/features/user/validation/actor-context.ts` – Actor resolution

**Validation & Errors:**
- `app/utils/api-validation.ts` – Request validation
- `app/utils/api-errors.ts` – Error handling
- `app/utils/api-response.ts` – Response utilities
- `app/features/user/validation/problem-detail.ts` – RFC 7807 errors

**Schema:**
- `db/drizzle/schema/user-companies.schema.ts` – Multi-tenancy schema
