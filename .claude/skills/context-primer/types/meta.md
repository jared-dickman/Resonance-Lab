# Meta Workflow: Agents/Skills/Commands

## Mindset
Follow established patterns. DRY. Validate thoroughly.

## Agent Creation

**Use `subagent-forge` skill ALWAYS**

Never manually create agents. Skill enforces:
- R&D principles (Reduce context, Delegate tasks)
- Tool lockdown
- Proper frontmatter
- Clear delegation boundaries

**Agent template**: `.claude/templates/agent-template.md`

**Critical requirements**:
- Explicit tool list (never wildcard `*`)
- Zero-context design (stateless)
- Clear trigger keywords
- Haiku model for efficiency

Reference: `AGENT_CRITICAL_SYNTHESIS.md` for patterns

## Skill Creation

**Use `skill-forge` skill ALWAYS**

Never manually create skills. Skill enforces:
- Constitution principles (DRY, Single responsibility, Fail fast)
- Proper frontmatter
- Clear workflow steps
- Validation requirements

**Before creating**:
- Check `.claude/skills/` for overlap
- Invoke `rules-loader` to understand project patterns
- Never duplicate rule/template content

**Skill structure**:
```markdown
---
name: skill-name
description: <100 chars
auto_trigger: true/false
keywords: [specific, trigger, words]
---

# Skill Name

## Workflow

### Step Name
Actions with validation

## References
- Link to docs, never duplicate
```

## Slash Command Creation

**Use `slash-forge` skill**

Commands are prompts that expand when invoked.

**Location**: `.claude/commands/{name}.md` or `~/.claude/commands/{name}.md`

**Frontmatter required**:
```markdown
---
description: <100 chars what command does
---
```

**Keep focused**:
- Single purpose
- Executive format
- Reference existing docs (no duplication)

## Workflow Optimization

**R&D Framework**:
- **Reduce**: Minimize context bloat
- **Delegate**: Specialized subagents over monoliths

**Tool choice**:
- Read/Write/Edit for files (never cat/sed/awk)
- Grep for search (never bash grep)
- Task tool for multi-step work
- MCP delegation to specialists

**Context preservation**:
- Main agent stays lean
- Subagents handle heavy lifting
- Progressive disclosure
- Deterministic outputs

## Validation Requirements

**After creating agent/skill/command**:
```bash
pnpm exec ast-grep scan
pnpm typecheck
```

**Test the workflow**:
- Invoke manually
- Verify expected behavior
- Check output format
- Validate tool usage

**Update ROADMAP**:
Invoke `roadmap-keeper` skill to sync documentation.

## Tools & References

**Creation**:
- `subagent-forge` - Agent generation
- `skill-forge` - Skill generation
- `slash-forge` - Command generation

**Validation**:
- `ast-grep-auditor` - Pattern auditing
- `skill-drift-detector` - Example validation

**Documentation**:
- `roadmap-keeper` - Sync skill roadmap
- `.claude/templates/` - Templates
- `AGENT_CRITICAL_SYNTHESIS.md` - Agent patterns

## Claude Code Best Practices

**Prompting**:
- Explicit tool calls (never guess parameters)
- Parallel tool calls when independent
- Sequential when dependencies exist

**Agent design**:
- Haiku for simple/fast tasks
- Sonnet for complex reasoning
- Tool restrictions for security

**Delegation triggers**:
- >3 file reads → Explore subagent
- Multi-step complex tasks → Specialized subagent
- MCP operations → MCP specialist subagent

## Success Criteria

- Agent/skill/command follows established patterns
- No duplication of existing content
- Validation passes
- Roadmap updated
- Works as expected