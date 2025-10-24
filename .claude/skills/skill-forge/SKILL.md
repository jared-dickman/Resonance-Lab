---
name: skill-forge
description: Auto-invoked when user wants to create, design, or optimize Claude Code skills. Generates project-aligned skills with validation and best practices.
auto_trigger: true
keywords: [skill, create skill, new skill, skill development]
---

# Skill Forge

Generate high-impact Claude Code skills following project conventions and constitution.

## Constitution Principles

**All skills must embody:**

**Self-documenting clarity** - Explicit names, focused steps, minimal prose
**Do One Thing** - Single responsibility, clear scope
**DRY** - Reference existing docs (llm/rules/, llm/templates/), never duplicate
**Fail fast** - Include validation steps, clear error handling
**Scalability** - Maintainable patterns over quick hacks

**Writing style:**
- Minimal markdown (emphasis only, no numbered lists in bodies)
- Show don't tell (examples > explanations)
- Scannable structure (headers, bullets, code blocks)
- Clear anti-patterns alongside correct usage

**Best-in-class example:** `.claude/skills/fixture-forge/SKILL.md` - Study this first

## Skill Locations

- **Personal**: `~/.claude/skills/` (individual workflows)
- **Project**: `.claude/skills/` (team-shared, version-controlled)
- **Plugin**: Bundled, marketplace-ready

## Workflow

### 1. Gather Requirements

Ask user:
- **Trigger context** - When should this auto-invoke? (be specific)
- **Scope** - Personal, project, or plugin?
- **Tool access** - All tools or restricted set?

### 2. Read Constitution & Relevant Rules

**CRITICAL**: Before creating any skill, understand project standards:

**Required reading:**
- `llm/rules/index.md` - Identify 4-8 relevant rules for skill domain
- `llm/rules/code-standards.md` - Core principles (always relevant)
- `llm/rules/writing-rules.md` - How to structure documentation

**Reading strategy:**
- Start with index to identify relevant rules
- Read ONLY rules that apply to skill's domain
- Never read all rules (reduces output quality)

**Example:** For database skill, read: `db.md`, `migrations.md`, `code-standards.md`

### 3. Create Structure

**File**: `{skill-name}/SKILL.md`

```yaml
---
name: skill-name
description: Specific trigger + what it does (critical for auto-discovery)
auto_trigger: true/false  # Set true only if should auto-invoke
keywords: [relevant, trigger, words]
tools: [tool1, tool2]  # Optional: restrict to specific tools
---

# Skill Name

**Mode**: Brief description of skill's role

## Core Principles (if complex skill)

Apply constitution principles relevant to this skill's domain

## Workflow

### Step Name
Action items with clear outcomes

```bash
# Validation commands
pnpm typecheck
pnpm exec ast-grep scan
```

### Next Step
More actions

## Anti-Patterns (if applicable)

❌ **Bad:** What NOT to do
✅ **Good:** Correct approach

## References

- `llm/rules/specific-rule.md` - What it covers (NEVER duplicate content)
- `llm/templates/example.md` - Template to follow
```

**Description requirements:**
- Specific trigger context: "when user wants to create BDD tests" (NOT "helps with testing")
- Domain context: "for Next.js", "with Playwright", "following blog-posts architecture"
- Action-oriented: Start with verbs ("Generate", "Validate", "Monitor")
- Concise: Under 100 chars when possible

**Structure requirements:**
- Minimal markdown (emphasis only)
- No numbered lists in body (use headers or bullets)
- Examples over explanations
- Scannable with headers and code blocks

### 4. Add Supporting Files (Optional)

- `{skill-name}/templates/` - Example files
- `{skill-name}/scripts/` - Automation
- `{skill-name}/config.json` - Settings

### 5. Validate Structure & Quality

```bash
# Verify file structure
ls -R .claude/skills/{skill-name}/

# Check YAML frontmatter
head -n 10 .claude/skills/{skill-name}/SKILL.md

# Verify no duplication of existing docs
grep -r "llm/rules" .claude/skills/{skill-name}/SKILL.md
grep -r "llm/templates" .claude/skills/{skill-name}/SKILL.md
```

**Quality checklist:**
- ✅ Description under 100 chars with specific trigger
- ✅ References docs, doesn't duplicate them
- ✅ Includes validation steps
- ✅ Uses minimal markdown (emphasis only)
- ✅ Shows anti-patterns where relevant
- ✅ Single responsibility (does one thing well)
- ✅ Scannable structure with clear headers

### 6. Test Auto-Discovery

Create new conversation and test trigger phrases from description and keywords.

## Skill Patterns

**Workflow automation** - Repeated multi-step processes (migrations, deployments)
**Code generation** - Scaffolds following conventions (features, components, tests)
**Quality gates** - Pre-commit, pre-deploy validation (linting, testing, security)
**Security controls** - Restricted tool access for sensitive operations
**Monitoring** - Watch external systems (CI/CD, GitHub checks, deployments)

## Constitution Adherence

**Every generated skill must:**

**Self-document** - Clear workflow steps, explicit validation commands
**Do one thing** - Single, well-defined responsibility
**Reference, don't repeat** - Point to llm/rules and llm/templates
**Fail fast** - Include validation at each critical step
**Scale well** - Maintainable patterns that grow with project

**Writing quality:**
- Show examples over explanations
- Use scannable structure (headers, bullets, code blocks)
- Include anti-patterns to prevent common mistakes
- Keep prose minimal, let structure communicate

## World-Class Skill Patterns

### Executive Summary First

**Start with value, not instructions:**
- Core mandate: What it does + why it matters (single paragraph)
- Quality standards: ❌ Unacceptable vs ✅ World-class (with examples)
- Why: Executives scan summaries first

### Research Industry Standards

**Before writing domain-specific skills:**
- Web search: "{domain} best practices 2025"
- Extract authoritative patterns (Playwright docs, React conventions, major company standards)
- Document with citations
- Why: Credibility + current standards

### Precision Over Prose

**Remove filler:**
- No "helps you", "you should", "carefully"
- Bullet points > paragraphs
- Algorithms > explanations
- Visual flow (↓ arrows, ✅ marks)
- Why: Scannable, actionable

### Self-Documenting Names

**Everything should explain itself:**
- `billing-plan-card-save-button` = domain-component-element-purpose
- `bdd-no-hardcoded-selectors` = context-type-target
- Why: Reduces cognitive load, enables grep

### Validation Checklists

**Pre/post structure with metrics:**
- [ ] Requirements before action
- [ ] Commands after action
- [ ] 100% compliance metrics
- Why: Measurable, executable

### Pattern Documentation

**For complex domains (lists, arrays, states):**
- Pattern name + preference (Preferred, Use Sparingly)
- "Use when" decision criteria
- ⚠️ Warnings for edge cases
- Why: Decision-making aid

### Quality Metrics

**End with measurable success:**
- Concrete numbers: {N} of {Total}
- Percentage compliance: 100%
- Letter grades: A+
- Why: Objective completion standard

### Philosophy Statement

**Closing that crystallizes value:**
- Core belief about domain
- Memorable closing line
- Why: Elevates procedure to principle

---

## Best-in-Class Example

**Study:** `.claude/skills/fixture-forge/SKILL.md`

**Why it's exemplary:**

**Executive summary first** - Core Principles section states value upfront (contextual intelligence, type safety, traceability)

**Contextual intelligence** - Parses Gherkin, plain text, user stories to understand intent. Shows 3 concrete examples of input → extraction

**Human-to-technical translation** - Maps "payment flow for $50 subscription" → API endpoint + fixture schema

**Minimal data principle** - Explicitly states "one request/response pair per endpoint"

**Programmatic traceability** - JSDoc tracks usage across Vitest/Storybook/Playwright with bash scripts to verify

**Anti-patterns shown** - ❌ Bad patterns with ✅ Good alternatives (no numbered lists, just visual contrast)

**Validation checklists** - Executable bash commands at each step (grep, pnpm test, tsx)

**Self-documenting** - Template shows exact file structure with inline comments explaining each section

**References rules** - Points to `llm/rules/testing-*.md` without duplicating content

**Fun personality** - "Steve McTestFace" examples show creativity within enterprise standards

**Scannable structure** - Headers, code blocks, bullets. No prose walls.

**Use this as reference when creating new skills** - it embodies all constitution principles.

---

## References

- [Claude Code Skills Docs](https://docs.claude.com/en/docs/claude-code/skills)
- `llm/rules/index.md` - Project constitution and standards
- `llm/rules/writing-rules.md` - Documentation style guide
- `.claude/skills/fixture-forge/SKILL.md` - Best-in-class example (study this first)
- Existing skills in `.claude/skills/` - Pattern examples