# Research/Exploration Workflow

## Mindset
Understand before changing. Document findings.

## Exploration Techniques

**Step 1: Start symbolic**
- ALWAYS use `mcp__serena__get_symbols_overview` first
- Never read entire files blindly
- Progressive disclosure: overview → specific symbols

**Step 2: Navigate by relationships**
- Use `mcp__serena__find_symbol` with `depth=1` for structure
- Use `mcp__serena__find_referencing_symbols` for usage
- Build mental model incrementally

**Step 3: Pattern search when needed**
- Use `mcp__serena__search_for_pattern` for unknowns
- ast-grep for structural patterns
- Grep only when symbolic tools insufficient

**Step 4: Delegate when scope grows**

If research requires >3 file reads, MUST delegate:
```
Task tool with subagent_type: "Explore"
```

Exploration agent has specialized tools for codebase discovery.

## Investigation Workflow

**Hypothesis-driven**:
1. Form hypothesis about how code works
2. Test hypothesis with targeted reads
3. Confirm or refine hypothesis
4. Document findings

**Question-driven**:
- "Where is X handled?" → `find_symbol`
- "What calls Y?" → `find_referencing_symbols`
- "How does Z work?" → `get_symbols_overview` + selective body reads

## Documentation Expectations

**Create memory file**:
```bash
mcp__serena__write_memory
```

Memory name: `research-{topic}-{date}.md`

**Include**:
- Research question
- Key findings
- Code references (file:line)
- Architecture insights
- Next steps or open questions

**Max 100 lines** unless explicitly requested otherwise.

## When to Escalate

**Continue researching if**:
- Clear path to answer
- Scope well-defined
- Making progress

**Escalate to user if**:
- Ambiguous requirements
- Multiple valid approaches
- Need domain expertise
- Stuck after reasonable effort

## Tools & Specialists

**Symbolic exploration**:
- `serena-specialist` - All code navigation

**Broad searches**:
- `Explore` subagent - Multi-file investigation

**Documentation**:
- `mcp__serena__write_memory` - Capture findings
- `mcp__serena__read_memory` - Check existing docs

**External research**:
- `WebSearch` - Latest docs/APIs
- `WebFetch` - Specific documentation pages

## Anti-Patterns

❌ Reading full files without overview first
❌ Text search before symbolic navigation
❌ Changing code during research phase
❌ Skipping documentation step

✅ Symbolic tools first
✅ Progressive disclosure
✅ Document before implementing
✅ Ask user when uncertain

## Success Criteria

- Question answered
- Findings documented
- No premature code changes
- Memory created for future reference
- Clear next steps identified