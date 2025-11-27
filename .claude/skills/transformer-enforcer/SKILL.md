---
name: transformer-enforcer
description: Detects and fixes API routes that bypass response transformers, preventing internal field leakage
auto_trigger: false
keywords: [transformer, bypass, API response, security, validation, createValidatedResponse]
---

# Transformer Enforcer

Prevents internal domain field leakage by ensuring all API responses pass through transformer whitelists before returning to clients.

## Trigger

Use when:
- Creating new API routes
- Reviewing routes for security gaps
- After repository changes that affect response structure
- Before production deployment

## Workflow

### Scan API Routes

Find all route handlers:

```bash
rg --files app/api/ | rg "route\.ts$"
```

### Detect Bypass Patterns

**Critical violation:** Raw entity returned without transformer

```ts
// ❌ BYPASS - Exposes all entity fields (id, deletedAt, metadata)
const session = await repository.getSession(id, companyId)
return createValidatedResponse({session}, schema)

// ✅ CORRECT - Transformer whitelist applied
const session = await repository.getSession(id, companyId)
return createValidatedResponse(toGetSessionResponse(session), schema)
```

**Detection logic:**

For each route file:
1. Find `createValidatedResponse()` calls
2. Check first argument - if it's a raw object with service entity, flag it
3. Verify transformer function was called on the entity
4. If missing, locate appropriate transformer from `app/features/*/transformers/`

### Analyze Each Route

Read route file with context around response:

```bash
rg -A 10 "createValidatedResponse" app/api/path/to/route.ts
```

**Check for:**
- Repository fetch followed by direct object spread
- Missing transformer import
- Nested objects with raw entities (e.g., `{session: updatedSession}`)

### Generate Fix Plan

**For each violation:**

Identify transformer needed:
- GET endpoints → `toGet*Response(entity)`
- POST endpoints → `toCreate*Response(entity)`
- PATCH/PUT → Use base transformer `to*Response(entity)`
- Nested entities → Transform each before wrapping

**Example fix:**

```ts
// Before
import {createValidatedResponse} from '@/app/utils/api-response'
const session = await service.getSession(id, companyId)
return createValidatedResponse({session}, getSessionResponseSchema)

// After
import {createValidatedResponse} from '@/app/utils/api-response'
import {toGetSessionResponse} from '@/app/features/*/transformers/session.transformer'
const session = await service.getSession(id, companyId)
return createValidatedResponse(toGetSessionResponse(session), getSessionResponseSchema)
```

### Apply Fixes

**For each violation:**

Add transformer import:
```ts
import {toTransformer} from '@/app/features/domain/transformers/entity.transformer'
```

Wrap entity in transformer call:
```ts
// Single entity
return createValidatedResponse(toTransformer(entity), schema)

// Object with entity
return createValidatedResponse({...other, entity: toTransformer(entity)}, schema)
```

### Validate

```bash
pnpm typecheck
pnpm exec ast-grep scan
```

## Detection Examples

**Pattern 1: Direct entity in wrapper object**

```ts
// ❌ Violation
const session = await repository.get(id, companyId)
return createValidatedResponse({session}, schema)

// ✅ Fix
return createValidatedResponse(toGetSessionResponse(session), schema)
```

**Pattern 2: Nested raw entity**

```ts
// ❌ Violation
return createValidatedResponse({
  success: true,
  sessionId,
  session: updatedSession  // Raw entity
}, schema)

// ✅ Fix
return createValidatedResponse({
  success: true,
  sessionId,
  session: toSessionResponse(updatedSession)
}, schema)
```

**Pattern 3: Array of entities**

```ts
// ❌ Violation
const posts = await repository.findAll(companyId)
return createValidatedResponse({posts}, schema)

// ✅ Fix
return createValidatedResponse({
  posts: posts.map(toPostResponse)
}, schema)
```

## Finding Transformers

**Naming convention:**

```
app/features/{domain}/transformers/{entity}.transformer.ts
```

**Exports:**
- `to{Entity}Response(entity)` - Base transformer
- `toGet{Entity}Response(entity)` - GET endpoint wrapper
- `toCreate{Entity}Response(entity)` - POST endpoint wrapper

**If transformer missing:**

Create following pattern:

```ts
export function toEntityResponse(entity: Entity): EntityResponse {
  return {
    id: entity.id,
    companyId: entity.companyId,
    userId: entity.userId,
    // Only whitelisted fields
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}

export function toGetEntityResponse(entity: Entity): GetEntityResponse {
  return {entity: toEntityResponse(entity)}
}
```

## Why This Matters

**Transformer whitelists prevent:**
- Internal field leakage (`deletedAt`, `internalId`, `metadata`)
- Database schema changes exposing new fields automatically
- Cross-tenant data in audit fields
- Implementation details in response structure

**Defense-in-depth layers:**
1. `validateCompanyData()` - Prevents cross-tenant data leak from repository bugs
2. `createValidatedResponse()` - Validates response matches schema
3. **Transformers** - Whitelist only intended fields for client

Skipping transformers bypasses layer 3.

## References

**Security patterns:** `llm/rules/security.md` - Defense-in-depth API validation
**Database mapping:** `llm/rules/db.md` - Repository toDomain pattern
**Validation utilities:** `app/utils/api-response.ts` (createValidatedResponse)