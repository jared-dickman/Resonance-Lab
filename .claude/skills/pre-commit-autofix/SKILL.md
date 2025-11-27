---
name: pre-commit-autofix
description: Auto-fix validation errors when pre-commit fails (ast-grep, TS, ESLint) then retry commit
auto_trigger: true
keywords: [ast-grep violations, pre-commit failed, validation failed, typecheck failed, lint failed, staged files, commit blocked, hook failed]
---

# Pre-Commit Autofix

Auto-spawns when validation errors block commits. Fixes violations via focused meta-agents, coordinates with commit-maestro for seamless retry.

## Auto-Trigger Detection

**Spawns automatically on:**
- "ast-grep violations found"
- "typecheck failed"
- "lint-staged checks failed"
- "pre-commit hook failed"
- Error output containing file paths + validation errors

**Context gathered:**
- Error type (ast-grep | TypeScript | ESLint)
- Failed file list
- Specific violation messages

## Workflow

**Coordinate with commit-maestro**

```
Skill: commit-maestro
```

Tell maestro: "Pre-commit failed, attempting auto-fix"
- Maestro stashes current commit message
- Provides retry context after fixes

**Delegate to focused meta-agents**

Launch validation-checkpoint-guardian via Task (NOT direct Skill call for context preservation):

```
Task:
  subagent_type: general-purpose
  model: haiku  # Fast for validation fixes
  description: Fix validation errors
  prompt: |
    You are validation-checkpoint-guardian. Pre-commit hook blocked commit.

    Error output:
    {full error text}

    Modified files:
    {file list}

    Fix NEW violations only (ignore pre-existing). Use:
    - ast-grep-auditor for pattern violations
    - serena-specialist for complex TypeScript refactors
    - Direct fixes for simple issues

    After fixes, return summary for commit-maestro retry.
```

**Retry commit via maestro**

After guardian completes:
- Maestro re-stages fixed files
- Retries commit with preserved message
- Max 2 total attempts

**Escalate if blocked**

After 2 failures:
```
❌ Auto-fix exhausted (2 attempts)

Remaining issues:
{violation summary}

Action required: Manual review
```

Exit gracefully, don't loop.

## Hook Integration

**Programmatic pre-commit hook** (`.husky/_/pre-commit-autofix.sh`):

```bash
#!/usr/bin/env bash
# Auto-fix validation errors via Claude Code skill

set -e

ERROR_OUTPUT="$1"
ATTEMPT_COUNT="${2:-1}"
MAX_ATTEMPTS=2

if [ "$ATTEMPT_COUNT" -gt "$MAX_ATTEMPTS" ]; then
  echo "❌ Auto-fix failed after $MAX_ATTEMPTS attempts"
  exit 1
fi

echo "🔧 Attempt $ATTEMPT_COUNT: Auto-fixing validation errors..."

# Invoke Claude Code skill (spawns automatically based on error keywords)
claude-code << EOF
The pre-commit hook failed with validation errors.

Error output:
$ERROR_OUTPUT

Please fix the violations and retry the commit.
EOF

# Increment attempt counter for next iteration
export ATTEMPT_COUNT=$((ATTEMPT_COUNT + 1))
```

**Modify `.husky/pre-commit`** (step 7):

```bash
# 7. Run ast-grep with auto-fix on failure
if [ -n "$STAGED_CODE_FILES" ]; then
  echo "🔍 Running ast-grep scan on staged files..."

  ERROR_OUTPUT=$(echo "$STAGED_CODE_FILES" | xargs pnpm exec sg scan 2>&1 || true)

  if echo "$ERROR_OUTPUT" | grep -q "error\["; then
    # Trigger auto-fix via Claude Code skill
    source .husky/_/pre-commit-autofix.sh "$ERROR_OUTPUT"

    # Re-run validation
    if ! echo "$STAGED_CODE_FILES" | xargs pnpm exec sg scan; then
      echo "❌ Violations remain after auto-fix"
      exit 1
    fi

    echo "✅ Auto-fix successful, proceeding with commit"
  fi
fi
```

## Meta-Agent Coordination

**Task delegation pattern:**

```typescript
// pre-commit-autofix spawns →
Task({
  subagent_type: "general-purpose",
  model: "haiku",  // Fast validation fixes
  description: "Fix pre-commit validation errors",
  prompt: `
    Act as validation-checkpoint-guardian.

    Context: Pre-commit hook blocked commit
    Error type: ${errorType}
    Files: ${fileList}
    Violations: ${violations}

    Coordinate with:
    - ast-grep-auditor: Pattern violations
    - serena-specialist: Complex TypeScript issues
    - commit-maestro: Commit retry orchestration

    Fix only NEW violations. Return concise summary.
  `
})
```

**Why Task over direct Skill:**
- Preserves main agent context
- Focused subagent for validation domain
- Parallel execution potential
- Clear delegation boundary

## Anti-Patterns

❌ Infinite retry loops
❌ Fixing pre-existing violations
❌ Blocking commits forever
❌ Direct Skill() calls (breaks context)

✅ Max 2 attempts then escalate
✅ NEW violations only
✅ Clear failure messaging
✅ Task() for meta-agent delegation

## Installation

**1. Create hook script:**
```bash
mkdir -p .husky/_
touch .husky/_/pre-commit-autofix.sh
chmod +x .husky/_/pre-commit-autofix.sh
```

**2. Add script content** (see Hook Integration above)

**3. Modify `.husky/pre-commit`** (step 7)

**4. Test:**
```bash
# Introduce ast-grep violation
echo "const x = something as any" >> test.ts
git add test.ts
git commit -m "test autofix"
# Should auto-fix and succeed
```

## References

- `.husky/pre-commit` - Validation pipeline
- `.claude/skills/validation-checkpoint-guardian/SKILL.md` - Fix orchestration
- `.claude/skills/commit-maestro/SKILL.md` - Commit retry coordination
- `llm/rules/linting-strategy.md` - Validation philosophy