---
name: api-security-auditor
description: Audits API routes for missing validateCompanyData() and createValidatedResponse() security layers
auto_trigger: false
keywords: [api security, audit routes, validate company, schema validation, multi-tenant]
---

# API Security Auditor

Detects missing defense-in-depth validation layers in API routes that could lead to cross-tenant data leaks or schema bypass vulnerabilities.

## Trigger

Use when:
- Creating new API routes
- Reviewing existing routes for security gaps
- After repository changes that affect data fetching
- Before production deployment

## Workflow

### Scan API Routes

Find all route handlers:

```bash
pnpm exec glob "app/api/**/route.ts"
```

### Analyze Each Route

For each route file, detect:

**Missing Layer 1 - Paranoid Company Validation:**
- Repository fetch (`repository.get*`, `repository.find*`, `repository.update*`)
- NOT followed by `validateCompanyData(result, companyId, {...})`
- Risk: Cross-tenant data leak from repository bugs, SQL injection, ORM failures

**Missing Layer 2 - Schema Response Validation:**
- Success response path
- Uses `NextResponse.json({...})` instead of `createValidatedResponse({...}, schema)`
- Risk: Unvalidated data structure bypass, type safety violations

**Pattern Detection:**

```typescript
// ❌ CRITICAL: Missing both validation layers
const session = await repository.getSession(id, companyId)
return NextResponse.json({session})

// ❌ HIGH: Has company check but no schema validation
const session = await repository.getSession(id, companyId)
const err = validateCompanyData(session, companyId, {...})
if (err) return err
return NextResponse.json({session})  // Missing schema validation

// ✅ SECURE: Both validation layers present
const session = await repository.getSession(id, companyId)
const err = validateCompanyData(session, companyId, {...})
if (err) return err
return createValidatedResponse({session}, sessionSchema)
```

### Generate Report

Output format:

```
API Security Audit Report
========================

CRITICAL VIOLATIONS (2):

  app/api/pillar-generation/sessions/[sessionId]/route.ts
  - Line 87-90: Missing validateCompanyData() after repository.getSession()
  - Line 395-403: Missing createValidatedResponse() in PATCH handler

  Risk: Cross-tenant data leak + schema bypass

  Fix:
    After line 86, add:
      const err = validateCompanyData(session, authResult.companyId, {
        route: 'GET /api/pillar-generation/sessions/:id',
        service: 'pillar-sessions',
        requestId,
        userId: authResult.userId
      })
      if (err) return err

    Replace line 395 with:
      return createValidatedResponse({...}, responseSchema)

HIGH RISK VIOLATIONS (1):

  app/api/wizard/route.ts
  - Line 98: Has validateCompanyData() but missing createValidatedResponse()

  Risk: Schema bypass vulnerability

  Fix:
    Replace line 98:
      return createValidatedResponse({session}, createWizardSessionResponseSchema, 201)

SUMMARY:
- Total routes scanned: 8
- Routes with violations: 2
- Critical (missing both layers): 2
- High (missing schema validation): 1
- Clean: 5
```

### Analysis Steps

**For each route handler:**

1. **Find repository calls** (Grep pattern: `repository\.(get|find|update|create)`):
   ```bash
   rg "await.*repository\.(get|find|update)" app/api/
   ```

2. **Check for validateCompanyData()** within 10 lines after fetch:
   - Read file with context around repository call
   - Verify `validateCompanyData(fetchedData, companyId, {...})` exists
   - Ensure error check: `if (err) return err`

3. **Find success response paths** (Grep pattern: `return.*NextResponse\.json|return.*createValidatedResponse`):
   ```bash
   rg "return (NextResponse\.json|createValidatedResponse)" app/api/
   ```

4. **Verify schema validation**:
   - Check if using `createValidatedResponse()` with schema
   - Flag direct `NextResponse.json()` bypassing validation

### Detection Implementation

**Use Read tool to analyze control flow:**

```typescript
// Read route file
const content = await Read(routePath)

// Parse for patterns
const hasRepositoryCall = /await.*repository\.(get|find|update)/.test(content)
const hasValidateCompany = /validateCompanyData\(/.test(content)
const hasCreateValidated = /createValidatedResponse\(/.test(content)
const hasDirectJson = /return NextResponse\.json\(/.test(content)

// Risk assessment
if (hasRepositoryCall && !hasValidateCompany) {
  violations.push({
    type: 'CRITICAL',
    issue: 'Missing validateCompanyData() after repository fetch',
    risk: 'Cross-tenant data leak'
  })
}

if (hasDirectJson && !hasCreateValidated) {
  violations.push({
    type: 'HIGH',
    issue: 'Using NextResponse.json() instead of createValidatedResponse()',
    risk: 'Schema bypass vulnerability'
  })
}
```

## References

**Security patterns:** `llm/rules/security.md` - Defense-in-depth API validation
**ast-grep rule:** `rules/api-require-paranoid-company-validation.yml` - Automated detection
**Utilities:** `app/utils/api-auth.ts` (validateCompanyData), `app/utils/api-response.ts` (createValidatedResponse)

## Integration

**Run as pre-commit check:**
```bash
pnpm exec ast-grep scan  # Catches structural violations
claude "Run api-security-auditor skill"  # Deeper analysis
```

**CI/CD integration:**
- Add to GitHub Actions pre-merge checks
- Block PRs with CRITICAL violations
- Warn on HIGH violations

## Limitations

**Does NOT detect:**
- Complex control flow (nested conditions, async callbacks)
- Validation in helper functions
- Custom validation patterns outside standard utilities

**Use ast-grep for:**
- Simple structural patterns
- Pre-commit automation

**Use this skill for:**
- Comprehensive manual audits
- Understanding context and control flow
- PR reviews requiring human judgment