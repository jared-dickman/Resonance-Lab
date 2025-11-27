---
name: validation-checkpoint-guardian
description: Receives validation failures (ast-grep, typecheck, lint), determines domain context, loads rules, delegates fixes to specialists, captures edge cases for continuous learning
auto_trigger: false
keywords: [validation, ast-grep, typecheck, lint, quality gate, checkpoint, build failure, test failures, compilation errors, type errors, linting errors, build errors, CI failures, pre-commit failures, validation errors, code quality, error delegation, fix errors, auto-fix, domain context, rules loading, edge cases, continuous learning, ast-grep scan, pnpm typecheck, eslint, error categorization, specialist delegation, ast-grep-auditor, serena-specialist, api-generator, fixture-forge, testing violations, migration drift, test suite, production validation]
---

# Validation Checkpoint Guardian

**Mode**: Quality gate enforcer - receives validation failures, delegates all fixes to specialists

**Zero direct fixes** - All error resolution MUST delegate to appropriate specialists. This skill orchestrates, never implements.

## Trigger Conditions

Programmatically spawned by hook when validation fails. Receives:
- Full error output from failed command(s)
- List of modified files
- Distinction between NEW errors vs pre-existing
- Optional: Domain context (feature area affected)

## Workflow

### Determine Domain Context

**If domain not provided**, ask user to select:
- `feature_api` - API routes, TanStack Query, mutations
- `testing_e2e` - Playwright BDD tests
- `testing_unit` - Vitest unit tests
- `testing_component` - Storybook component tests
- `component_ui` - React components, styling
- `migration_db` - Database migrations
- `refactor` - Code restructuring
- `security` - Auth, permissions, data isolation
- `analytics` - Tracking, metrics

**After domain selected:** Invoke `rules-loader` skill

### Categorize and Delegate Errors

**CRITICAL:** Only process NEW errors. Ignore pre-existing violations.

**MANDATORY DELEGATION PROTOCOL:**

All subagent delegations MUST follow analysis-first pattern:

```bash
Task(
  subagent_type="<specialist>",
  model="<haiku|sonnet>",
  prompt="""
  STEP 1: Prime context
  Use /prime <domain> to load relevant rules and patterns.

  STEP 2: Complete analysis
  - Review ALL error output thoroughly
  - Identify root cause vs symptoms
  - Consider architectural implications
  - Think through side effects and dependencies

  STEP 3: Solution design
  - Design the fix before writing code
  - Consider alternatives and trade-offs
  - Verify approach against loaded rules
  - Plan validation strategy

  STEP 4: Implementation
  Only after steps 1-3, implement the fix.

  Task: {error_details}
  Domain: {domain_context}
  """
)
```

**Delegation Matrix:**

**ast-grep violations** → `Skill("ast-grep-auditor")`
- No /prime needed (rule-specific skill)

**TypeScript errors:**
- Simple (missing imports, unused vars, type annotations) → Direct fix
- Complex (refactoring, cross-file changes) → `Task(subagent_type="serena-specialist")` with /prime refactor

**ESLint errors** → Should be auto-fixed by hook. If persisting, escalate to user.

**Domain-specific (always read skills directory for latest):**
- `feature_api` → `api-generator` with /prime api, `tanstack-query-enforcer` with /prime api
- `testing_e2e` → `bdd-implementation-generator` with /prime testing, `gherkin-generator` with /prime testing
- `testing_unit` → `dumb-user-unit` with /prime testing
- `testing_component` → `dumb-user-storybook` with /prime testing
- Fixtures → `fixture-forge` with /prime testing

### Track Progress

Use TodoWrite for each error group. Mark completed only when validation passes.

### Validate Resolution

```bash
pnpm exec ast-grep scan && pnpm typecheck && pnpm lint --max-warnings=0
```

**If failing on retry:**
- Read `Learnings.md` for similar patterns
- Apply learned fixes before re-delegating
- Max 3 iterations then escalate to user

**If passing:** Append new learnings to `Learnings.md` and exit

### Continuous Learning

**When subagents fail on first try**, append to `Learnings.md`:

Format (2-3 lines max):
```
## {Error Pattern}
{Resolution approach}. Example: `{short code snippet if needed}`
```

**Before re-delegating**, read `Learnings.md` to inform next delegation prompt.

## Anti-Patterns

❌ Fixing errors directly
❌ Skipping delegation
❌ Processing pre-existing errors
❌ Manual ast-grep fixes
❌ Skipping domain context
❌ Not capturing learnings

✅ 100% delegation
✅ Domain-specific rules loading
✅ Progress tracking
✅ Iterative fix-and-verify
✅ Continuous learning

## Success Criteria

- ✅ Domain context determined, rules loaded
- ✅ All NEW errors delegated (zero direct fixes)
- ✅ All validation commands pass
- ✅ Edge cases captured in Learnings.md

## References

- `llm/rules/code-standards.md`
- `llm/rules/linting-strategy.md`
- `.claude/skills/ast-grep-auditor/SKILL.md`
- `.claude/skills/rules-loader/SKILL.md`
- `.claude/skills/commit-maestro/SKILL.md`
- `.claude/skills/mcp-delegation-guardian/SKILL.md`
- `Learnings.md` - Edge cases and retry patterns