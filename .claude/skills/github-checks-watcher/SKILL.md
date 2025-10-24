---
name: GitHub Checks Watcher
description: Monitors GitHub checks after commits, celebrates successes, auto-fixes simple failures, escalates complex issues
auto_trigger: false
keywords: [git, github, checks, ci, commit, push, workflow]
---

# GitHub Checks Watcher

**Mode**: Post-Commit Monitor - Watches GitHub checks and responds to results

---

## Workflow

### 1. After Push Detection

After a successful `git push`, automatically activate this skill to monitor checks.

### 2. Initial Check Status

```bash
gh pr checks
```

If no PR exists for the current branch, check workflow runs:

```bash
gh run list --branch $(git branch --show-current) --limit 1
```

### 3. Monitor Until Complete

Poll every 15-30 seconds until all checks complete:

```bash
gh run watch
```

### 4. Success Path - Celebrate! 🎉

When all checks pass:

```
✨ All checks passed! 🎉
   ✓ Build successful
   ✓ Tests passed
   ✓ Linting clean

   Great work! 🚀
```

### 5. Failure Path - Analyze & Fix

#### Step A: Get Failure Details

```bash
gh run view --log-failed
```

#### Step B: Categorize Failure

**Simple Failures (Auto-fix):**

- Linting errors (ESLint, AST-grep)
- Type errors (TypeScript)
- Formatting issues
- Missing imports
- Simple test failures with clear fixes

**Complex Failures (Escalate):**

- Multiple failing test suites
- Build configuration issues
- Dependency conflicts
- Infrastructure/deployment failures
- Security vulnerabilities

#### Step C: Auto-Fix Simple Issues

For simple failures:

1. Read the error logs
2. Identify the exact issue
3. Apply the fix using appropriate tools
4. Run local validation:
   ```bash
   pnpm typecheck          # For TS errors
   pnpm lint               # For lint errors
   pnpm lint:ast           # For AST-grep violations
   pnpm test               # For test failures
   ```
5. Commit and push the fix:
   ```bash
   git add .
   git commit -m "fix: resolve [issue type] from CI checks"
   git push
   ```
6. Resume monitoring (back to Step 2)

#### Step D: Escalate Complex Issues

For complex failures:

```
⚠️ Complex issue detected in GitHub checks:

Check: [Check Name]
Status: Failed
Issue: [Brief description]

Logs:
[Relevant log excerpt]

This requires your attention. Would you like me to:
1. Show full logs
2. Investigate further
3. Wait for your guidance
```

### 6. Timeout Handling

If checks run longer than 15 minutes:

```
⏱️ Checks still running after 15 minutes.
   Current status: [status summary]

   Continue monitoring? (y/n)
```

---

## Implementation Notes

**Check Polling:**

- Use `gh run watch` for automatic polling
- Fallback to manual polling every 20 seconds if watch fails
- Maximum monitoring time: 15 minutes (configurable)

**Error Classification:**
Simple patterns to auto-fix:

- `TS[0-9]+:` → TypeScript errors
- `ESLint:` → Linting errors
- `Expected.*to.*but got` → Test assertion failures (if single test)
- `Cannot find module` → Import errors
- `ast-grep` violations → AST pattern issues

Complex patterns to escalate:

- Multiple test suite failures
- `ELIFECYCLE` → Build/script failures
- `MODULE_NOT_FOUND` for dependencies → Dependency issues
- `Vercel` errors → Deployment issues
- Multiple violation types in single run

**Celebration Format:**
Use enthusiastic but professional tone with emojis to acknowledge success.

**Fix Commit Messages:**
Follow conventional commits:

- `fix: resolve typescript errors from CI`
- `fix: correct linting violations from checks`
- `fix: update imports after CI failure`

---

## Usage

This skill should be invoked:

1. Manually via post-push hook (user must trigger)
2. Manually via `/skill github-checks-watcher` to check current status
3. After fixing an issue to resume monitoring

**IMPORTANT:**

- Only ONE instance should run at a time
- Check if already monitoring before starting
- User triggers manually to avoid multiple watchers

The skill completes when:

- All checks pass (success)
- Complex issue escalated (user intervention needed)
- User requests to stop monitoring

## Prevention of Multiple Instances

Before starting:

1. Check if monitoring is already active
2. If active, notify user and exit
3. Only one watcher per push allowed
