---
name: Commit Master
description: Ensures perfect commits by running all validations, splitting large commits, and using human-friendly conventional commit messages
auto_trigger: false
keywords: [commit, git, validation, conventional commits, husky]
---

# Commit Master

**Mode**: Pre-Commit Validator - Ensures production-ready commits that pass all checks

---

## Validation Checklist (Pre-Commit)

All checks must pass before committing:

### 1. Schema & Migration Integrity

```bash
pnpm db:verify
```

Required if: `db/drizzle/schema/` files changed

### 2. TypeScript Type Checking

```bash
pnpm typecheck
```

Required if: `.ts` or `.tsx` files changed

### 3. ESLint Auto-fix & Validation

```bash
pnpm exec eslint --fix --max-warnings=0 [staged files]
```

Auto-fixes issues and fails on unfixable errors

### 4. AST-Grep Structural Linting

```bash
pnpm exec ast-grep scan
```

Enforces 16 security and architecture rules

### 5. AST-Grep Rules Test

```bash
pnpm test:ast-grep-rules
```

Ensures all 16 lint rules are working correctly

### 6. BDD Smoke Tests

```bash
pnpm test:bdd:smoke
```

Required if: `e2e/`, `app/components/`, or `app/lib/` changed

### 7. OpenAPI Validation

```bash
pnpm openapi:validate
```

Required if: OpenAPI/Swagger files changed

### 8. Security Pattern Checks

- No TODO/FIXME/XXX/HACK/TEMP in staged code
- No hardcoded secrets (API keys, tokens, passwords)
- No console.log in production code (use logger instead)
- No .env files
- No unresolved merge conflicts
- No files > 5MB
- No direct commits to master/main

---

## Commit Splitting Strategy

**When to split:**

- More than 5 files changed
- Multiple unrelated features/fixes
- Mix of refactor + new features
- Different types (feat, fix, chore, etc.)

**How to split:**

1. Group related files by purpose:
   - Same feature/component
   - Same type of change
   - Dependent changes
2. Create logical commits that tell a story
3. Each commit should be independently reviewable

**Example split:**

```
Before: 12 files changed
- 3 new components
- 2 bug fixes
- 4 type updates
- 3 test files

After: 3 commits
1. feat: add user profile components (4 files)
2. fix: resolve auth token expiry issues (3 files)
3. chore: update types and add tests (5 files)
```

---

## Commit Message Format

**Structure:**

```
type(scope): brief summary

Optional body explaining what and why
```

**Types:**

- `feat` - new feature for users
- `fix` - bug fix for users
- `docs` - documentation changes
- `style` - formatting, missing semicolons, etc
- `refactor` - code restructuring without changing behavior
- `perf` - performance improvements
- `test` - adding or updating tests
- `chore` - tooling, dependencies, config
- `build` - build system changes
- `ci` - CI/CD pipeline changes

**Scope (optional but recommended):**

- Component/feature name: `auth`, `blog`, `ui`
- System area: `api`, `db`, `security`

**Human-Friendly Messages:**

❌ **Bad:**

```
fix: fixed the bug
feat: implemented feature
chore: updates
```

✅ **Good:**

```
fix(auth): handle expired tokens gracefully
feat(blog): add markdown preview to editor
chore(deps): update react-query to v5
```

**Examples:**

```
feat(profile): let users upload custom avatars
fix(search): prevent crash when query is empty
perf(blog): lazy load images in post list
refactor(hooks): simplify data fetching logic
test(auth): cover edge cases in token validation
docs(api): add examples to endpoint descriptions
```

**Tone:**

- Sound human, like talking to a friend
- Be specific but concise
- Focus on user impact, not implementation details
- No jargon unless necessary

---

## Workflow

### Step 1: Analyze Staged Changes

```bash
git status
git diff --cached --name-only
```

Determine:

- Number of files
- Types of changes
- Whether to split commit

### Step 2: Run All Validations

Execute checks in order:

1. Migration integrity (if needed)
2. TypeScript typecheck
3. ESLint auto-fix
4. AST-grep scan
5. AST-grep rules test
6. BDD smoke tests (if needed)
7. OpenAPI validation (if needed)
8. Security pattern checks

**If any check fails:**

- For auto-fixable issues (ESLint): Fix and re-stage
- For simple issues: Fix immediately and re-stage
- For complex issues: Report to user with details

### Step 3: Split Commits (If Needed)

If > 5 files or mixed types:

1. Group files logically
2. Unstage all: `git reset`
3. Stage and commit each group separately
4. Return to Step 2 for each commit

### Step 4: Craft Commit Message

1. Determine type (feat/fix/chore/etc)
2. Identify scope
3. Write human-friendly summary
4. Add body if change needs explanation

**IMPORTANT:**

- NEVER add Claude co-author attribution
- NEVER add "Generated with Claude Code" footer
- Keep it natural and human

### Step 5: Create Commit

```bash
git commit -m "type(scope): human message"
```

### Step 6: Verify Commit

```bash
git log -1 --oneline
```

Ensure message follows format and sounds human.

---

## Special Cases

**Merge Commits:**

- Skip validation
- Auto-accept merge commit messages

**Revert Commits:**

- Skip validation
- Use format: `revert: undo feature X`

**Hot Fixes:**

- Still run all validations
- Use `fix` type with HIGH priority scope: `fix(critical): ...`

**Large Refactors:**

- Split into smallest possible commits
- Each commit should still pass all tests
- Use `refactor` type consistently

---

## Error Handling

**Migration Drift:**

```
Fix: Run `pnpm drizzle-kit generate`
```

**TypeScript Errors:**

- Fix type issues
- Never use `as any`
- Re-run typecheck

**ESLint Errors:**

- Auto-fix will handle most
- For unfixable: review and fix manually
- Re-run lint

**AST-Grep Violations:**

- Check violation type
- Fix according to rule
- Re-run scan

**Test Failures:**

- Debug failed tests
- Fix root cause
- Re-run tests

**Blocked Patterns:**

- Remove TODO/FIXME or document properly
- Move secrets to env vars
- Replace console.log with logger
- Fix merge conflicts

---

## Success Criteria

Commit is ready when:

- ✅ All validations pass
- ✅ Commit is atomic (single purpose)
- ✅ Message is conventional format
- ✅ Message sounds human and friendly
- ✅ No Claude attribution
- ✅ Can be easily reviewed
- ✅ Will pass CI/CD checks

---

## Usage Notes

**This skill should:**

- Run before every commit
- Split large commits automatically
- Provide clear error messages
- Fix auto-fixable issues
- Ask for help on complex issues

**This skill should NOT:**

- Commit without all validations passing
- Create commits larger than 10 files
- Use technical/robotic language
- Include AI attribution
- Skip any validation checks
- Commit to master/main directly
