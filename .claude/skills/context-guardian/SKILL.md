---
name: context-guardian
description: Agent self-invokes at 80% context capacity for graceful handoffs with knowledge dumps
auto_trigger: false
---

# Context Guardian

**Mode**: Protocol for agents to orchestrate clean handoffs before context compaction.

## Core Principles

**Describe problems, not solutions** - Dump discovered facts, open questions, and artifacts
**Prevent information loss** - Hand off before context compaction warning
**Enable fresh perspective** - Successor agent starts with clean context window
**Stay focused** - Wrap up current investigation, avoid starting new work

## When Agents Should Self-Invoke

**Agents monitoring system warnings see:**
```
<system_warning>Token usage: X/200000; Y remaining</system_warning>
```

**Self-invoke this skill when:** `Y remaining < 40000` (80% capacity reached)

**Agent discipline required:**
- Check token warnings throughout long investigations
- Recognize when approaching threshold
- Proactively invoke context-guardian skill
- Follow handoff protocol before context compaction

## Detection Threshold

**Trigger at 80% of token budget** - Prevents context compaction while leaving room for handoff

Current session shows: `<budget:token_budget>200000</budget:token_budget>`
Warning appears in system: `Token usage: X/200000; Y remaining`

**Calculation**: Trigger when `Y remaining < 40000` (20% of 200000)

## Handoff Protocol

### 1. Recognize Context Limit

When token usage reaches threshold:
- **Stop** starting new investigations
- **Complete** current atomic task only if < 5% budget needed
- **Prepare** for immediate handoff otherwise

### 2. Dump Knowledge (Not Solutions)

Output **ONLY** what has been discovered:

```markdown
## What We Know

[Factual discoveries from investigation:]
- File locations and structures discovered
- Error messages encountered (exact text)
- Code patterns observed
- Dependency relationships found
- Test results and failures
- Configuration values verified

## Unresolved Questions

[Open items requiring further investigation:]
- Areas not yet explored
- Ambiguities in requirements
- Missing information
- Contradictory findings

## Context Artifacts

[References for successor agent:]
- File paths: `path/to/file.ts:123-456`
- Relevant rule files: `llm/rules/specific.md`
- Error logs: exact messages with timestamps
- Commands run: with outputs
- Screenshots taken: file paths
```

### 3. Anti-Patterns

❌ **Bad:** "Next, implement the authentication flow by..."
✅ **Good:** "Authentication flow requires session validation (see auth.ts:45-89). Current implementation missing role checks."

❌ **Bad:** "The fix is to add a new middleware"
✅ **Good:** "Middleware chain breaks at request.ts:234 - type mismatch between VercelRequest and NextRequest"

❌ **Bad:** Continuing with new file reads after threshold
✅ **Good:** "Reached context limit. See dump below for handoff."

### 4. Prepare Handoff File

**Generate filename:**
```bash
tsx scripts/generate-dump-filename.ts "your task context"
# Output: 10-24-25-your-task-context.md
```

**Save to:** `output/dump/[mm-dd-yy]-[context].md`

Structure handoff as focused brief:
- Under 200 lines when possible
- Reference files with line numbers
- Include only critical context
- No solution proposals

**See example:** `.claude/skills/context-guardian/examples/dump-example.md`

### 5. Validate Dump Quality

**Before completing handoff:**
```bash
tsx scripts/validate-dump.ts output/dump/*.md
```

**Validator checks:**
- Required sections present
- No solution keywords (describes problems only)
- File path references included
- Reasonable length (< 200 lines recommended)
- Referenced files exist

### 6. Signal Completion

Inform user:

"**Context limit reached (80% capacity).** Investigation findings dumped to `output/dump/[mm-dd-yy]-[context].md`. Validation passed. Recommend starting fresh agent to continue with clean context window."

## Workflow

**Agent self-invokes when threshold detected:**

Stop current work immediately
Generate dump filename using script
Create knowledge dump using template above
Save to `output/dump/` directory
Validate dump quality
Inform user of handoff readiness
**Do not** propose solutions or next steps
**Do not** start new investigations

**User can then:**
- Review dump for completeness
- Start new conversation
- Provide dump.md to successor agent
- Continue with fresh context window

## Validation

Check handoff quality:
- ✅ Focuses on facts, not solutions
- ✅ Includes specific file paths with line numbers
- ✅ Contains exact error messages
- ✅ Lists unresolved questions clearly
- ✅ Under 200 lines
- ✅ No prescriptive "next steps"

## References

- `llm/rules/code-standards.md` - Self-documenting clarity
- `llm/rules/writing-rules.md` - Minimal prose, scannable structure