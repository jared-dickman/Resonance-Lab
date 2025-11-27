# Chore/Refactoring Workflow

## Mindset
Safe, incremental, tested. Never break working code.

## Refactoring Safety Protocol

**Step 1: Tests FIRST**
```bash
pnpm vitest run
pnpm playwright test
```

ALL tests MUST pass before refactoring. If failing, fix first.

**Step 2: Plan changes**
- Use `serena-specialist` for symbol analysis
- Find all references: `mcp__serena__find_referencing_symbols`
- Estimate blast radius
- Break into small incremental steps

**Step 3: Use correct tools**

**Bulk renames**:
```bash
pnpm exec ast-grep --pattern '$OLD' --rewrite '$NEW' --update-all
```

**Symbol refactoring**:
- `mcp__serena__rename_symbol` - Codebase-wide renames
- `mcp__serena__replace_symbol_body` - Function/class rewrites
- `mcp__serena__insert_after_symbol` - Add new methods/functions

**Pattern migrations**:
- ast-grep for structural changes
- Never use sed/awk/text replacement

**Step 4: Incremental execution**
- One change at a time
- Run tests after EACH change
- Commit incrementally

**Step 5: Validation after each step**
```bash
pnpm typecheck
pnpm exec ast-grep scan
pnpm vitest run
```

If any fail: Revert, adjust, retry.

## Dependency Updates

**Minor/patch updates**:
```bash
pnpm update --latest
pnpm vitest run
```

**Major updates**:
- Read CHANGELOG first
- Check breaking changes
- Update incrementally (one package at a time)
- Run full test suite after each

Never downgrade packages!

## Code Cleanup Standards

**Remove dead code**:
- Use `serena-specialist` to find unused symbols
- Verify zero references before deletion
- Check git history for context

**Clean imports**:
- Follow `llm/rules/imports.md` strictly
- Domain imports at top
- Group by layer (domain/service/repo/hooks/actions)

**Extract duplicated logic**:
- DRY principle
- Create shared utilities
- Update all call sites
- Add tests for new utility

## PR Creation & Monitoring

**After refactoring**:
1. Invoke `commit-maestro` skill for clean commits
2. Use `pr-creator` skill for PR description
3. Push and create PR
4. Invoke `github-checks-watcher` to monitor CI

**If CI fails**:
- Use `validation-checkpoint-guardian` for auto-fix
- Never bypass failures

## Tools & Specialists

**Symbolic refactoring**:
- `serena-specialist` - All symbolic operations

**Pattern migrations**:
- ast-grep - Structural code transformations

**Validation**:
- `ast-grep-auditor` - Pattern validation
- `validation-checkpoint-guardian` - Failure analysis

**PR workflow**:
- `commit-maestro` - Commit orchestration
- `pr-creator` - PR descriptions
- `github-checks-watcher` - CI monitoring

## Success Criteria

- All tests passing (before AND after)
- Build succeeds
- No regressions
- Code cleaner/simpler
- PR approved with green CI