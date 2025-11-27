---
name: skill-prophet
description: Detects repetitive patterns (2-3x) and suggests skills. Verifies with roadmap-keeper. Proactively detects repetitive patterns and suggests new skills. Triggers liberally to maximize automation opportunities.
auto_trigger: true
keywords: [pattern, repeated, automate, manual, workflow, repetitive, again, similar, like before, same as]
---

# Skill Prophet

Detect repetition → Check existing → Verify roadmap → Suggest automation

## Detection

**Trigger on 2-3+ occurrences:**
- Same task repeated
- Tool sequences reused
- Manual workflows

**Check overlap:**
```bash
grep "description:" .claude/skills/*/SKILL.md
```

**Verify with roadmap-keeper before suggesting**

## Suggest

**Inline (High confidence - 3+ occurrences):**
```
💡 [Pattern] detected 3x. Suggest: `skill-name`
Idea: $(tsx scripts/generate-filename.ts ideas/skill "[name]")
Create now?
```

**Brief (Medium - 2x):**
```
💡 [Pattern] detected. Saved: $(tsx scripts/generate-filename.ts ideas/skill "[name]")
```

**Silent (Low - 1x complex):**
Generate filename: `tsx scripts/generate-filename.ts ideas/skill "[skill-name]"`

## Idea File

**CRITICAL - Reader Context:**
The reader is a world-class engineer with COMPLETE app context. They know the codebase perfectly.
- NO code duplication or examples that already exist. only pointers.
- NO explaining basic context they already know
- EXTREME conciseness - surgical precision only
- High-impact information ONLY

```markdown
# [Skill Name]

**Pattern:** [What repeats]
**Evidence:** [Occurrences with context]
**Overlap:** [Check existing skills]
**Value:** [Time saved]

## Workflow
- Detects: [triggers]
- Generates: [output]
- Validates: [checks]

## Implementation
- Tools: [required]
- References: llm/rules/[relevant].md
- Complexity: Low/Medium/High
```

**Generate path:** `tsx scripts/generate-filename.ts ideas/skill "[skill-name]"`

## Approval

**If user approves:** Invoke skill-forge, creates short focused world class skill, then invoke roadmap-keeper

**If user rejects:** Archive idea

## Examples

- Type fixes 3x → type-fixer
- API creation 2x → endpoint-generator
- Screenshot + console 2x → ui-validator
- Validation loop 3x → validation-suite

## References

- `.claude/skills/skill-forge/SKILL.md` - Creation
- `.claude/skills/roadmap-keeper/SKILL.md` - Tracking