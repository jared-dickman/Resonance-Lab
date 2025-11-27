---
name: slash-forge
description: Creates slash commands for workflows and prompts
auto_trigger: false
keywords: [slash, command, prompt, template, workflow]
---

# Slash Forge

**Create → Test → Document**

## Input Required

- **Command name:** `/[name]`
- **Purpose:** What it does
- **Prompt/Script:** Expansion content
- **Type:** prompt | script

## Workflow

### 1. Create Command File

**For prompt expansion:**
```markdown
[Detailed prompt with context]

Can include:
- Instructions
- Templates
- Context references
```

**Filename:** `.claude/commands/[name].md`

### 2. Test Command

```bash
# Verify file is detected
# Use command in conversation: /[name]
```

### 3. Document

Add to `.claude/commands/README.md` (create if needed):
```markdown
### /[name]
**Purpose:** [What it does]
**Usage:** `/[name]`
**Example:** [When to use]
```

## Quality Checks

- ✅ Command name is clear/memorable
- ✅ Prompt is focused and actionable
- ✅ No duplication with existing commands
- ✅ Tested in conversation
- ✅ Documented

## Examples

**Terminal workflow:**
```markdown
# /test-feature
Run tests for specific feature directory:
pnpm test -- [path]
```

**Prompt expansion:**
```markdown
# /review
Review the current changes for:
- Code quality
- Test coverage
- Security issues
- Performance concerns
```

## References

- `.claude/commands/`
- Claude Code slash command docs
