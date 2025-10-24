---
name: API Generator
description: Generates complete feature implementation matching blog-posts architecture - domain, service, repository, transformers, DTOs, hooks, actions, MSW
auto_trigger: true
keywords:
  [api, endpoint, feature, domain, service, repository, hook, rest, backend, create endpoint]
---

# API Generator

**Canonical Reference**: `app/features/blog-posts/` (complete working example)

**Generates 18 files**:

```
app/features/{domain}/
├── domain/{domain}.ts
├── repository/{domain}-repository.interface.ts
├── repository/drizzle-{domain}.repository.ts
├── transformers/{domain}.transformer.ts
├── transformers/{domain}-view.transformer.ts
├── dto/{domain}-request.schema.ts
├── dto/{domain}-response.schema.ts
├── constants/{domain}.constants.ts
├── service.ts
├── queries.ts
├── options.ts
├── keys.ts
└── hooks.ts

app/api/{resource}/route.ts
app/actions/{domain}/index.ts
app/testing/fixtures/{domain}/{domain}-fixtures.ts
app/testing/msw/handlers/{domain}.handlers.ts
app/config/apiRoutes.ts (update)
```

## Workflow

1. Read `app/features/blog-posts/` structure completely
2. Apply naming transformations (see table below)
3. Generate all files with exact pattern match
4. Validate: `pnpm typecheck && pnpm exec ast-grep scan`

## Naming Transformations

| Concept         | Pattern                                                  | Example (keywords)                           |
| --------------- | -------------------------------------------------------- | -------------------------------------------- |
| Domain folder   | `{domain}` plural, kebab-case                            | `keywords`                                   |
| API path        | `/{domain}` plural, kebab-case                           | `/keywords`                                  |
| Entity type     | `{Domain}Entity` singular, PascalCase                    | `KeywordEntity`                              |
| Service name    | `{Domain}Service` singular, PascalCase                   | `KeywordService`                             |
| Service methods | Generic: `list`, `getById`, `create`, `update`, `delete` | `list()` NOT `listKeywords()`                |
| Response key    | `{pluralDomain}` matches domain                          | `{ keywords: [...] }` NOT `{ items: [...] }` |
| Query keys      | `{domain}Keys` with `companyId` BEFORE `list/detail`     | `keywordKeys.list(companyId)`                |
| Actions path    | `app/actions/{domain}/index.ts`                          | `app/actions/keywords/index.ts`              |

## Key Patterns

| File         | Pattern                                                                | Canonical Reference                               |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------------------- |
| `keys.ts`    | `companyId` BEFORE `list/detail`                                       | `app/features/blog-posts/keys.ts`                 |
| `options.ts` | Import actions from `app/actions/{domain}/index.ts`                    | `app/features/blog-posts/options.ts`              |
| `hooks.ts`   | `useCurrentCompany()` checks companyId                                 | `app/features/blog-posts/hooks.ts`                |
| `service.ts` | Generic methods: `list`, `getById`, `create`, `update`, `delete`       | `app/features/blog-posts/service.ts`              |
| Transformers | Entity→Response, Response→View (two files)                             | `app/features/blog-posts/transformers/`           |
| Route        | `validateQueryParams`, `authenticateApiRequest`, `validateCompanyData` | `app/api/blog-posts/route.ts`                     |
| Actions      | Must be `index.ts` in `{domain}/` folder, uses `requireAuth`           | `app/actions/blog-posts/index.ts`                 |
| Fixtures     | TestIds object + mock data using `TEST_IDS`/`TEST_DATES`               | `app/testing/fixtures/blog-posts/`                |
| MSW          | Mock list/detail endpoints, filter by companyId                        | `app/testing/msw/handlers/blog-posts.handlers.ts` |

---

## SECURITY PATTERNS (MANDATORY)

**Validated**: 2025-10 audit - all production routes compliant

### Authentication: Two Patterns

**Pattern 1: No company validation** - Use `requireAuthForRoute()` for user-scoped resources (analytics, webhooks)

```typescript
const authResult = await requireAuthForRoute();
if (!authResult.success) return authResult.response;
const { userId, session } = authResult;
```

**Pattern 2: Company validation** - Use `authenticateApiRequest(companyId)` for multi-tenant resources (billing, subscriptions)

```typescript
const authResult = await authenticateApiRequest(companyId);
if (!authResult.success) return authResult.response;
const { userId, companyId } = authResult;
```

**Why**: Pattern 2 automatically validates `validateCompanyAccess()` preventing cross-tenant data leaks.

### Super Admin Audit (MANDATORY)

```typescript
if (session.isSuperAdmin) {
  await eventTracker.trackEvent('super_admin_accessed', {
    resource: 'resource-name',
    userId,
    requestId,
  });
}
```

**Why**: Compliance requirement for privileged access tracking.

### Input Validation (MANDATORY)

```typescript
const schema = z.object({...})
const validation = schema.safeParse(input)
if (!validation.success) {
  return NextResponse.json({error: 'Validation failed', details: validation.error.format()}, {status: 400})
}
```

**Why**: Prevent injection attacks, ensure type safety.

### Security Checklist

Every route MUST have:

- ✅ Auth: `requireAuthForRoute()` OR `authenticateApiRequest()`
- ✅ Validation: Zod schemas for query + body
- ✅ Tracing: `generateRequestId()`
- ✅ Error handling: `handleApiError()` with context
- ✅ Status codes: 401 (auth), 404 (access denied), 400 (validation), 500 (error)

**Reference**: `app/api/billing/subscription/route.ts`, `app/api/analytics/route.ts`

---

## Repository Factory Update

**File**: `app/core/repository/repository-factory.ts`

Add:

```typescript
// Import
import {Drizzle{Domain}Repository} from '@/app/features/{domain}/repository/drizzle-{domain}.repository'

// Property
private {domain}Repository: {Domain}Repository | null = null

// Getter
get{Domain}Repository(): {Domain}Repository {
  if (!this.{domain}Repository) {
    this.{domain}Repository = new Drizzle{Domain}Repository(getDbConnection())
  }
  return this.{domain}Repository
}

// Reset
this.{domain}Repository = null
```
