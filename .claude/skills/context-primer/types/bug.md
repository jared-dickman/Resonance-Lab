o# Bug Fix Workflow

## Mindset
Reproduce, isolate, fix, verify, prevent.

## Debugging Protocol

**Step 1: Reproduce**
- Identify exact steps to trigger bug
- Determine affected environment (local/staging/production)
- Check error logs: `mcp__supabase__get_logs` for service errors
- Review console messages: `mcp__playwright__playwright_console_logs`

**Step 2: Isolate**
- Find root cause using symbolic navigation (serena-specialist)
- Check recent changes via git history
- Use `mcp__serena__find_referencing_symbols` to track dependencies
- Narrow scope to specific file/function

**Step 3: Determine test level**
- **E2E (BDD)**: User flow broken, integration issue
- **Component (Storybook)**: Visual bug, interaction issue
- **Unit (Vitest)**: Logic error, isolated function bug

Use `bdd-debugger` skill for E2E issues.

**Step 4: Write failing test FIRST**
- Captures bug reproduction
- Prevents regression
- Validates fix

**Step 5: Fix**
- Minimal change to address root cause
- Never introduce new features during bug fix
- Preserve existing behavior elsewhere

**Step 6: Verify**
- Original test now passes
- All other tests still pass
- Run full validation suite:
```bash
pnpm typecheck
pnpm exec ast-grep scan
pnpm vitest run
pnpm playwright test
```

**Step 7: Document**
- Write memory with root cause analysis
- Update test coverage if gap found
- Consider adding to `dumb-user-*` scenarios

## Tools & Specialists

**Debugging**:
- `serena-specialist` - Symbolic code navigation
- `chrome-devtools-specialist` - Browser debugging, performance
- `playwright-specialist` - E2E test reproduction

**Test fixing**:
- `bdd-debugger` - Self-healing BDD tests
- `validation-checkpoint-guardian` - AST/type/lint violations

**Analysis**:
- `supabase-specialist` - Database logs, advisors
- `vercel-specialist` - Deployment logs, build failures

## Common Patterns

**Type errors**: Check domain vs API type drift
**Query errors**: Verify TanStack Query setup (keys/options/hooks)
**Auth errors**: Check RLS policies, session handling
**Build errors**: Check imports, circular dependencies

## Continuous Learning

After fix, use `mcp__serena__write_memory`:
- Root cause
- Solution approach
- Prevention strategy

Memory name: `bug-{feature}-{date}.md`

## Success Criteria

- Bug no longer reproducible
- Test coverage improved
- No regressions introduced
- Build passes
- Memory logged