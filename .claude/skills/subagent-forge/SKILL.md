---
name: subagent-forge
description: Generate Claude Code sub-agents with proper isolation, tool lockdown, and delegation patterns (project)
auto_trigger: false
keywords: [create agent, build agent, new agent, generate agent, agent for, subagent]
---

# Sub-Agent Forge

Generate production-ready agents using Input-Workflow-Output pattern.

## Workflow

### Interview Requirements

Ask:
- What specific task?
- What inputs required?
- What output expected?
- Trigger keywords?

### Validate Single Responsibility

One agent = one job. If scope > 1, split agents.

### Generate Frontmatter

```yaml
---
name: agent-name
description: Use for 'keyword1', 'keyword2'. When prompting: pass {param1}, {param2}. No prior context.
tools: []
model: sonnet
---
```

### Generate System Prompt Using Input-Workflow-Output Pattern

```markdown
# Agent Name

{One sentence purpose}

⚠️ **Zero context.** Only receives what primary agent passes.

## INPUT

- `param`: {description}

## WORKFLOW

**Step 1: {Action}**

ACTION REQUIRED: Invoke Task tool
- subagent_type: "{specialist}"
- prompt: "{instruction}"

Wait. Verify {condition}.

**Step 2: {Action}**

{Processing or delegation}

## TOOLS

Task tool only. Invoke on "ACTION REQUIRED". Never Bash, Read, Write, Grep, Glob.

## OUTPUT

```
Primary agent, inform user:

{Status}: {summary}
   {detail}

Next: {action}
```

Max {N} lines. Pointers only.
```

**Pattern:**
- INPUT: What comes in
- WORKFLOW: Step-by-step with ACTION REQUIRED triggers
- TOOLS: Minimal, explicit
- OUTPUT: Executive format to primary agent

### Validate Output

```bash
# Agent file exists
ls .claude/agents/agent-name.md

# Description has trigger keywords
grep -i "if they say" .claude/agents/agent-name.md

# Tools properly restricted
grep "tools:" .claude/agents/agent-name.md

# Report format addresses primary agent
grep "primary agent" .claude/agents/agent-name.md
```

### Create Agent File

Save to `.claude/agents/agent-name.md` with generated content.

## Architecture Principles

**Context Isolation**
- Sub-agents have ZERO prior context
- Primary agent must pass all required info
- Don't assume user intent or history

**Tool Lockdown**
- Empty `tools: []` = delegate everything via Task
- Explicit list = minimal, specific tools only
- NEVER use `tools: ["*"]` (security risk)

**Report Flow**
```
User → Primary Agent → Sub-Agent
                      ↓
        Primary Agent ← Report
        ↓
        User ← Summary
```

Sub-agent reports TO primary agent, primary agent reports TO user.

## Anti-Patterns

❌ Generic descriptions ("helps with tasks")
❌ Direct MCP tool calls (bypass delegation)
❌ Delegating to "general-purpose" with instructions to use another agent
❌ Multiple responsibilities
❌ Report addresses user directly
❌ Forgetting context isolation notes

✅ Specific trigger keywords
✅ Delegate to NAMED specialist subagents (serena-specialist, playwright-specialist, etc.)
✅ Single, focused purpose
✅ Report addresses primary agent
✅ Explicit "no prior context" warnings

## Validation Checklist

- [ ] Name is kebab-case, descriptive
- [ ] Description has trigger keywords
- [ ] Description explains HOW to prompt agent
- [ ] tools array is empty OR explicit minimal list
- [ ] System prompt warns about context isolation
- [ ] Task delegation for all MCP calls
- [ ] Report format addresses primary agent
- [ ] Single responsibility
- [ ] Color specified

## References

- Context engineering: `/agent_transcript.md` - R&D patterns
- Sub-agent patterns: `/another_:agent_transcript.md` - Architecture
- Never duplicate content from references