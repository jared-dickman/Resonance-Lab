---
name: production-fixture-guard
description: Prevents test fixtures from leaking to production by enforcing environment guards in API routes
auto_trigger: true
keywords: [production, fixture, guard, test, leak, environment, mock, testing, api route, endpoint, prod build, deploy, release, staging, mock data, test data, production safety, environment check, NODE_ENV, production code]
---

# Production Fixture Guard

**Trigger**: API routes importing from `app/testing/fixtures/` without environment guards

**Pattern**: Stripe/Vercel/GitHub - fail fast in production with clear errors

## Detection

Scan API routes for dangerous imports:

```bash
rg "from '@/app/testing/fixtures" app/api --type typescript
```

**Red flags**:
- Direct fixture imports in production code
- Missing `process.env.NODE_ENV !== 'production'` guards
- Test data accessible in production builds

## Guard Pattern

**✅ Correct** (safe for production):
```typescript
// app/api/some-endpoint/route.ts
export async function GET() {
  if (process.env.NODE_ENV !== 'production') {
    const {mockData} = await import('@/app/testing/fixtures/...')
    return NextResponse.json({data: mockData})
  }

  throw new Error(
    'Database integration required. Mock data not available in production. ' +
    'Implement fetchData() at app/api/some-endpoint/route.ts'
  )
}
```

**❌ Wrong** (test data leaks):
```typescript
import {mockData} from '@/app/testing/fixtures/...'  // ❌ Always imported!

export async function GET() {
  return NextResponse.json({data: mockData})  // ❌ Production serves test data
}
```

## Workflow

### Scan for Violations
Delegate to Explore agent:
```
Find all API routes importing from app/testing/fixtures/ without environment guards
```

### Analyze Each Route
For each violation:
- Extract import statement
- Locate fixture usage
- Determine guard injection point

### Inject Guards
Pattern:
```typescript
if (process.env.NODE_ENV !== 'production') {
  // Dynamic import here
  const {fixture} = await import('@/app/testing/fixtures/...')
  // Use fixture
}

// Production: Clear error
throw new Error('[Component] requires database integration. Implement [method]() at [file path]')
```

### Validate
- Production build must not include fixture imports
- Dev mode must work with fixtures
- Error messages must be actionable

## Meta-Agent Architecture

**Scan Agent** (Explore):
- Find API routes with fixture imports
- Identify missing guards
- Report violations

**Fix Agent** (general-purpose):
- Convert static imports to dynamic
- Inject environment guards
- Add production error messages

**Validate Agent** (general-purpose):
- Build production bundle
- Check for fixture leaks
- Verify dev mode works

## References

- Session evidence: `app/api/pillar-generation/sessions/[sessionId]/route.ts:56-68`
- Pattern: Fail fast > Silent failures
- See: Stripe API error handling (404 over 403 for enumeration)

## Success Criteria

- Zero fixture imports in production builds
- Clear error messages for missing implementations
- Dev mode continues working with mock data