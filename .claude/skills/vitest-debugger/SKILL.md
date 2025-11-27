---
name: vitest-debugger
description: Auto-fixes failing Vitest tests - Docker, mocks, async, connections. Self-healing with failure learning.
auto_trigger: true
keywords: [vitest, test fail, docker, mock, timeout, connection, flaky]
---

# Vitest Debugger

Auto-diagnose and fix failing unit tests. Learns from failures to prevent recurrence.

---

## Workflow

### Diagnose

**Quick detection:**
```bash
vitest --reporter=hanging-process --bail=1
```

**Categorize:**
- Docker → `docker info` fails
- Mock pollution → Passes alone, fails in suite
- Async hang → Timeout with fake timers
- Connection leak → "too many clients"
- Flaky → Intermittent (run 3x to confirm)

### Fix by Pattern

**Docker not running:**
```bash
open -a Docker && sleep 5 && docker ps
```

**Mock isolation:**
```ts
afterEach(() => vi.restoreAllMocks())
```

**Per-file mocks required (Vitest limitation):**
When setup files import your module, it's cached before test files run. Per-file mocks must be declared at test file top:
```ts
// Top of test file - not global
vi.mock('@/db/drizzle/connection', () => ({
  getDbConnection: vi.fn(() => testDb),
}))
```
This is NOT a workaround—it's the Best Practice.

**Async timers:**
```ts
await vi.runAllTimersAsync()  // Not vi.runAllTimers()
```

**Connection cleanup:**
```ts
afterAll(async () => {
  await testClient?.end()
  await container?.stop()
}, 30000)
```

**Flaky detection:**
```bash
pnpm exec tsx scripts/detect-flakes.ts
```

**Dynamic import alias resolution:**
```ts
// ❌ FAILS - Vite can't resolve @/ in dynamic import
const routePath = '@/app/api/users/route'
return await import(routePath)

// ✅ WORKS - Use relative path
return await import('../../../api/users/route')
```
**Why:** Vite requires static analysis at build time. Aliases in dynamic imports with variables cannot be resolved. This is a Rollup limitation, not a bug. **Refactoring risk:** Relative paths break when directory structure changes - update imports when moving test files.

### Learn & Prevent

**Capture failure:**
- Log error pattern to `.test-failures.json`
- Track: file, error type, fix applied, timestamp

**Update prevention:**
- Add missing `afterEach` cleanup
- Flag tests needing edge cases: Invoke `dumb-user-unit` skill via subagent
- Update `vitest.setup.ts` if systemic

**Self-heal triggers:**
- 3 failures same pattern → Auto-apply known fix
- New error type → Research + document in skill examples

**Industry-validated approach:**
Our pattern (Testcontainers + `fileParallelism: false` + per-file mocks) matches Industry standards from Vercel and Neon.

---

## Quick Fixes

| Error | Fix |
|-------|-----|
| Docker not running | `open -a Docker` |
| Mock pollution | Add `vi.restoreAllMocks()` |
| Per-file mock failing | Declare `vi.mock()` at test file top (not global) |
| Async timeout | `await vi.runAllTimersAsync()` |
| Connection leak | Add cleanup in `afterAll` |
| Snapshot drift | `vitest -u` (watch mode: press `u`) |
| Slow tests (schema rebuild) | Consider snapshot restoration (10-100x faster) |
| Cannot find package '@/app/api/...' | Replace `@/` alias with relative path in dynamic `import()` |

---

## Integration

**Generate missing edge cases:** Invoke `dumb-user-unit` skill via Task subagent after fixing
**Track flaky tests:** Run `scripts/detect-flakes.ts` weekly
**Learn patterns:** Append fixes to `.test-failures.json` for ML

---

## References

**Codebase:**
- `vitest.setup.ts` - Global Docker/DB setup
- `scripts/detect-flakes.ts` - Flaky test tracker
- `.claude/skills/dumb-user-unit/` - Edge case generator

**Industry validation:**
Testcontainers, snapshot restore, per-file mocks aligned with Industry Leading Standards
Snapshot restoration 10-100x faster than schema recreation
Database branching per test file
Per-file mocks required for cached modules
