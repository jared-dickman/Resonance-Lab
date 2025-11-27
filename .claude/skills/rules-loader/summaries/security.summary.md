# Security Rules

## Core Pattern
Multi-tenant company-based access control. Always validate, log super admin access, verify data isolation.

## Authentication
```ts
import {auth} from '@/app/api/auth/config'
const session = await auth()
const userId = session?.user?.id
const companyId = session?.currentCompanyId
```

**Trust only:** `session.user.id`, `session.isSuperAdmin`, `session.currentCompanyId`
**Never trust:** Client headers (`x-user-role`, `x-is-super-admin`)

## Permission Validation
```ts
import {validateCompanyAccess} from '@/app/utils/permissions'
const hasAccess = await validateCompanyAccess(userId, companyId)
if (!hasAccess) {
  return NextResponse.json({error: 'Not found'}, {status: 404})
}
```

## API Route Pattern
```ts
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const companyId = searchParams.get('companyId') ?? session.currentCompanyId
  if (!companyId) return NextResponse.json({error: 'Not found'}, {status: 404})

  const hasAccess = await validateCompanyAccess(session.user.id, companyId)
  if (!hasAccess) return NextResponse.json({error: 'Not found'}, {status: 404})

  if (session.isSuperAdmin) {
    await eventTracker.trackEvent('super_admin_accessed', {resource: 'api', companyId})
  }

  const data = await service.getData(session.user.id, companyId)

  // Verify data isolation
  if (data.some(item => item.companyId !== companyId)) {
    errorTracker.captureError('Data leak detected', {service: 'api', companyId})
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }

  return NextResponse.json({data})
}
```

## Service Layer Defense
```ts
async function getData(userId: string, companyId: string) {
  const hasAccess = await validateCompanyAccess(userId, companyId)
  if (!hasAccess) throw new Error('Access denied')

  const data = await repository.findAll(companyId)
  if (data.some(item => item.companyId !== companyId)) throw new Error('Company mismatch')

  return data
}
```

## Status Codes
- 401: Unauthenticated
- 404: Not found OR unauthorized (never 403 - reveals existence)
- 400: Validation error
- 500: Internal error

## Anti-Patterns
- ❌ Trusting headers, skipping validation, returning 403, using `as any`, raw SQL interpolation

## Validation
- [ ] Using `await auth()` for session
- [ ] Calling `validateCompanyAccess()` before operations
- [ ] Verifying `entity.companyId === requestedCompanyId`
- [ ] Logging super admin access
- [ ] Returning 404 for unauthorized (not 403)

## Read Full File If
Working on multi-tenant features or API security.