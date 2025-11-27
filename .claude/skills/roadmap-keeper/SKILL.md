---
name: roadmap-keeper
description: Maintains skills roadmap by detecting new/modified/removed skills and updating documentation automatically
auto_trigger: true
keywords: [roadmap, skills, documentation, skill list, update roadmap]
---

# Roadmap Keeper

**Mode**: Skills Documentation Manager - Keeps roadmap in sync with actual skills

## Core Principles

**Automatic detection** - Scans `.claude/skills/` for changes
**Accurate inventory** - Reflects actual skill files, not stale docs
**Rich context** - Extracts descriptions, triggers, keywords from frontmatter
**Update timestamp** - Tracks last update date
**Suggest new skills** - Identifies common task patterns

## Workflow

### Detect Changes

**Scan skills directory:**
```bash
# List all skill directories
ls -d .claude/skills/*/ | xargs -n1 basename

# Read each SKILL.md frontmatter
head -n 10 .claude/skills/*/SKILL.md
```

**Compare with roadmap:**
- New skills not in roadmap
- Removed skills still in roadmap
- Modified descriptions/triggers/keywords
- Changed auto_trigger settings

### Extract Skill Metadata

**From each SKILL.md frontmatter:**
```yaml
name: skill-name
description: What it does
auto_trigger: true/false
keywords: [list, of, triggers]
```

**Parse and collect:**
- Skill name
- Description (for roadmap summary)
- Auto-trigger status
- Keywords (for mapping)
- Category inference (from description/name)

### Update Roadmap Sections

**Active Skills section:**
- List all discovered skills
- Group by category (inferred from description)
- Include status and trigger type

**Skill Categories:**
- Automation (scaffolding, generation)
- Testing (fixtures, BDD, validation)
- Quality Gates (linting, validation, checks)
- Workflow (commits, PRs, CI monitoring)
- Infrastructure (context, memory, skills)

**Usage Patterns:**
- Common pipelines using multiple skills
- Task → Skill mappings

**Common Task Mapping:**
- Extract from skill descriptions
- Map user intents to skills

### Update Timestamp

**Set last updated date:**
```markdown
**Last updated:** YYYY-MM-DD
```

Use current date when roadmap is modified.

### Suggest Future Skills

**Identify patterns:**
- Read recent commit messages for common tasks
- Check for TODO/FIXME with repeated patterns
- Look for manual workflows that could be automated

**Save ideas to:**
Idea directories:
- `.claude/output/ideas/skills/[dd-mm-yy]-[skill-name].md` - Skill ideas
- `.claude/output/ideas/slash/[dd-mm-yy]-[command-name].md` - Slash command ideas
- `.claude/output/ideas/rules/[dd-mm-yy]-[rule-name].md` - Rule ideas

**CRITICAL - Reader Context:**
The reader is a world-class engineer with COMPLETE app context. They know the codebase perfectly.
- NO code duplication or examples that already exist - only pointers
- NO explaining basic context they already know
- EXTREME conciseness - surgical precision only
- High-impact information ONLY

**Template:**
```markdown
# [Skill Name] Idea

**Detected pattern:** [What repetitive task was observed]

**Frequency:** [How often this pattern appears]

- Step 1
- Step 2
- Step 3

**Proposed automation:**
- What the skill would do
- What it would generate/validate
- When it would trigger

**Value:**
- Time saved: [estimate]
- Error reduction: [potential]
- Consistency improvement: [benefit]

**References:**
- Similar existing skill: [if any]
- Relevant rules: `llm/rules/[file].md`
```

**Also update roadmap's Future Skills section** with brief entry

### Validate Roadmap

**Before saving:**
- All active skills have entries
- No removed skills in active list
- Categories make sense
- Timestamps updated
- Markdown formatting correct
- Links to skill files valid

### Save and Report

**Update file:**
`.claude/skills/ROADMAP.md`

**Report to user:**
```markdown
## Roadmap Updated

**Changes detected:**
- Added: [new-skill-1], [new-skill-2]
- Modified: [updated-skill] (description changed)
- Removed: [old-skill]

**Stats:**
- Total skills: N
- Auto-trigger: X
- Manual-trigger: Y

**Categories:**
- Automation: A
- Testing: B
- Quality Gates: C
- Workflow: D

Updated: YYYY-MM-DD
```

---

## Trigger Scenarios

**Auto-invoke when:**
- User creates new skill (via skill-forge)
- User modifies existing skill SKILL.md
- User asks to "update roadmap"
- User asks "what skills do we have"
- User asks "list skills"

**Manual invoke:**
- `/skill roadmap-keeper`
- Periodic maintenance (monthly)

---

## Skill Categorization Logic

**Automation:**
- Keywords: generate, create, scaffold, automate
- Description mentions: "generates", "creates", "scaffolds"

**Testing:**
- Keywords: test, fixture, BDD, spec, assertion
- Description mentions: "test", "fixture", "scenario", "validation"

**Quality Gates:**
- Keywords: validate, check, lint, enforce, scan
- Description mentions: "validates", "enforces", "checks"

**Workflow:**
- Keywords: commit, pr, ci, push, merge
- Description mentions: "monitors", "watches", "commit", "PR"

**Infrastructure:**
- Keywords: context, memory, skill, config
- Description mentions: "manages", "maintains", "organizes"

---

## Example Output

```markdown
## Roadmap Updated ✅

**Changes:**
- ✨ Added: roadmap-keeper (auto-trigger, infrastructure)
- 📝 Modified: skill-forge (updated description)

**Current inventory:**
- Total skills: 13
- Auto-trigger: 8
- Manual-trigger: 5

**Categories:**
- Automation: 5 skills
- Testing: 4 skills
- Quality Gates: 3 skills
- Workflow: 2 skills
- Infrastructure: 2 skills

**Last updated:** 2025-10-25

Roadmap saved: `.claude/skills/ROADMAP.md`
```

---

## Anti-Patterns

❌ **Stale roadmap:**
- Shows removed skills
- Missing new skills
- Old descriptions

❌ **Manual-only:**
- Requires user to update manually
- Gets out of sync quickly

❌ **No categorization:**
- Flat list of skills
- Hard to find relevant skill

❌ **Missing metadata:**
- No trigger info
- No keywords
- No descriptions

✅ **Auto-maintained:**
- Detects changes automatically
- Updates on skill creation/modification
- Always accurate
- Rich metadata

---

## Validation Checklist

Before completing:
- [ ] All `.claude/skills/*/SKILL.md` files scanned
- [ ] Roadmap has all active skills
- [ ] No removed skills in roadmap
- [ ] Categories assigned correctly
- [ ] Timestamp updated
- [ ] Task mapping table updated
- [ ] Future skills section reviewed
- [ ] Markdown formatting valid
- [ ] Report generated for user

---

## References

- `.claude/skills/ROADMAP.md` - The roadmap file to maintain
- `.claude/skills/*/SKILL.md` - All skill definitions
- `llm/rules/writing-rules.md` - Documentation standards
