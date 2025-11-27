---
name: context-primer
description: Loads work-type guidance (feature/bug/chore/research/meta). Returns workflow patterns and tool recommendations.
auto_trigger: false
keywords: [prime, context, workflow, feature, bug, chore, research, meta]
---

# Context Primer

Loads type-specific workflow guidance to complement domain rules from rules-loader.

## INPUT

- `task_description`: What the primary agent is building/fixing (required)
- `domain`: Feature area if known (e.g., billing, auth, testing) (optional)

## WORKFLOW

**Step 1: Detect work type**

Parse task_description for signals:

**bug**: "fix", "bug", "broken", "error", "failing", "crash"
**feature**: "add", "new", "implement", "create", "build"
**chore**: "refactor", "cleanup", "update", "migrate", "upgrade"
**research**: "investigate", "explore", "understand", "analyze"
**meta**: "agent", "workflow", "skill", "slash", "claude", ".claude/"

If ambiguous: Stop and ask "What type of change? (feature/bug/chore/research/meta)"

**Step 2: Load type-specific guidance**

Read SINGLE file from `types/{type}.md`:
- `types/feature.md` - Full-stack development workflow
- `types/bug.md` - Debugging protocols
- `types/chore.md` - Refactoring safety patterns
- `types/research.md` - Exploration techniques
- `types/meta.md` - Agent/skill/workflow creation

**Step 3: Output**

Output exactly:
{verbatim content from types/{type}.md}

Deterministic: Same input = same output.