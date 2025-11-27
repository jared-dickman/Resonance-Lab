# Context Dump - Auth Flow Investigation

**Context limit reached at 80% capacity**
**Task:** Investigating authentication flow issues in BDD tests

---

## What We Know

**Authentication structure:**
- NextAuth configured in `src/app/api/auth/[...nextauth]/route.ts:15-89`
- Session validation uses middleware at `src/middleware.ts:12-34`
- Role checks missing from protected routes (found pattern in 8 files)

**Error observed:**
```
TypeError: Cannot read property 'role' of undefined
  at src/app/api/admin/route.ts:23
```

**Test failures:**
- E2E auth tests fail in CI but pass locally
- Fixture data uses `companyId: 1` but tests expect `companyId: "test-company-1"`
- MSW intercepts conflict with Playwright intercepts at `tests/e2e/flows/auth.flow.ts:45-67`

**File structures discovered:**
- Auth fixtures: `tests/fixtures/auth/*.ts`
- BDD step definitions: `tests/e2e/step-definitions/auth-steps.ts:1-234`
- Playwright config: `playwright.config.ts:89-112` (MSW enabled flag)

**Dependencies verified:**
- NextAuth v4.22.1 installed
- @tanstack/react-query v5.8.4 handles session queries
- MSW v2.0.11 active in test environment

## Unresolved Questions

**Type mismatches:**
- Why does VercelRequest extend NextRequest differently in production vs dev?
- Where is the type definition for `session.user.role`?

**Fixture discrepancies:**
- Should companyId be string or number across fixtures?
- Are there other fixture type mismatches we haven't discovered?

**CI vs local behavior:**
- What environment variable differs between CI and local?
- Does CI use different Node version? (not checked yet)

**Middleware execution order:**
- Does NextAuth middleware run before or after custom middleware?
- Could this affect session availability in API routes?

## Context Artifacts

**Files read:**
- `src/app/api/auth/[...nextauth]/route.ts:1-145`
- `src/middleware.ts:1-89`
- `tests/fixtures/auth/users.ts:1-67`
- `tests/e2e/features/auth/login.feature:1-34`
- `playwright.config.ts:1-156`

**Error logs:**
```
[playwright] TypeError: Cannot read property 'role' of undefined
[playwright]   at src/app/api/admin/route.ts:23:18
[playwright]   at processTicksAndRejections (node:internal/process/task_queues:95:5)
```

**Commands run:**
```bash
pnpm test:e2e:auth  # Failed: 3/8 tests
pnpm typecheck      # Passed: no type errors
grep -r "companyId" tests/fixtures/  # Found 23 mismatches
```

**Related rules:**
- `llm/rules/testing-playwright.md` - BDD and auth setup patterns
- `llm/rules/testing-fixtures.md` - Type-safe fixture requirements
- `llm/rules/nextjs.md` - Middleware execution order

**Not yet explored:**
- Environment variable comparison (CI vs local)
- Node version differences
- NextAuth session serialization format
- Alternative auth flow paths (OAuth, credentials)