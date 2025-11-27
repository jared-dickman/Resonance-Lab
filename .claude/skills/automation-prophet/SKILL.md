---
name: automation-prophet
description: Detects patterns (2-3x), suggests best automation type (skill/rule/slash) with context
auto_trigger: true
keywords: [pattern, repeated, automate, manual, workflow, repetitive, again, similar, like before, same as, third time, another, doing, create, generate, fix, update, add, test, run, check, validate, implement, setup, configure, install, build, deploy]
---

# Automation Prophet

**Detect → Gather Context → Decide → Suggest**

## Detection (AGGRESSIVE - Auto-trigger liberally)

**Triggers on ANY repetition signal:**
- Same task repeated (even 2x)
- Similar tool sequences
- Manual workflows
- Code quality patterns
- "Again", "another", "like before"
- Creating similar files/components
- Running same commands
- Fixing similar issues

**Philosophy:** Suggest often, let user decide. Better to over-suggest than miss automation opportunities.

## Context Gathering (CRITICAL)

**Pattern Evidence:**
```bash
# Capture for each occurrence:
# - User request (exact wording)
# - Tools used (sequence + params)
# - Files touched
# - Pain points mentioned
```

**Existing Automations:**
```bash
grep "description:" .claude/skills/*/SKILL.md
ls -1 rules/*.yml
ls -1 .claude/commands/*.md
```

**Project Context:**
```bash
cat llm/rules/index.md
git log --oneline -20
```

## Decision Matrix

### ast-grep rule
- ✅ Code structure/quality issue
- ✅ Linting/validation
- ✅ AST-expressible pattern
- ✅ CI enforcement needed

### slash command
- ✅ Terminal workflow
- ✅ Text expansion/template
- ✅ Prompt augmentation
- ✅ User-initiated only

### skill
- ✅ Multi-step workflow
- ✅ Tool orchestration
- ✅ Validation/error handling
- ✅ Autonomous execution

## Suggestion Format

**High confidence (3+ occurrences):**
```
🔮 Pattern detected 3x: [Name]

Evidence:
1. [Date] - [Request] → [Tools]
2. [Date] - [Request] → [Tools]
3. [Date] - [Request] → [Tools]

Type: rule | slash | skill
Why: [Decision rationale]
Overlap: [Similar automations]
Time saved: ~[X] min/use

Create? y/n
```

**Medium (2x):**
```
💡 Pattern detected 2x: [Name]
Saved: $(tsx scripts/generate-filename.ts ideas/[skill|slash|rule] "[name]")
```

## Approval Flow

**If approved:**
- rule → invoke rule-forge
- slash → invoke slash-forge
- skill → invoke skill-forge
- Then invoke roadmap-keeper

**Low (1x complex):**
Generate path: `tsx scripts/generate-filename.ts ideas/[skill|slash|rule] "[name]"`

**If rejected:**
Archive path: `tsx scripts/generate-filename.ts ideas/rejected "[name]"`

## Idea File Template

**CRITICAL - Reader Context:**
The reader is a world-class engineer with COMPLETE app context. They know the codebase perfectly.
- NO code duplication or examples that already exist - only pointers
- NO explaining basic context they already know
- EXTREME conciseness - surgical precision only
- High-impact information ONLY

```markdown
# [Name]

**Type:** rule | slash | skill
**Confidence:** High | Medium | Low

## Evidence
1. [Date] - [Request] → Tools: [...] | Files: [...] | Time: ~X min
2. [Date] - [Request] → Tools: [...] | Files: [...] | Time: ~X min

## Context
- **Existing:** [Similar automations found]
- **Project patterns:** [From llm/rules/]
- **Style:** [Architecture notes]

## Decision
**Why [Type]:**
- [Reason from matrix]

**Ruled out [Other] because:**
- [Reason]

## Implementation
[Type-specific template]

## Value
- Time saved: X min/use
- Error reduction: High/Medium/Low
- Consistency: High/Medium/Low
```

## Examples

**Code quality (3x) → rule:**
```
Pattern: Direct process.env access
→ ast-grep rule with CI enforcement
```

**Terminal (2x) → slash:**
```
Pattern: "Run feature tests"
→ Slash command expansion
```

**Complex (3x) → skill:**
```
Pattern: BDD test creation
→ Multi-step autonomous skill
```

## References

- `.claude/skills/skill-forge/SKILL.md`
- `.claude/skills/rule-forge/SKILL.md`
- `.claude/skills/slash-forge/SKILL.md`
- `.claude/skills/roadmap-keeper/SKILL.md`
- `rules/README.md`