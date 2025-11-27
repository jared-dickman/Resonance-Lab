---
name: deep-research
description: Parallel web research → synthesis → principle extraction for optimization tasks
auto_trigger: false
keywords: [research, deep dive, investigate, optimize, best practices]
---

# Deep Research

Execute systematic research workflow: parallel searches → pattern analysis → actionable principles.

## Workflow

### Parallel Research Phase
Launch 3-4 targeted web search agents in parallel simultaneously covering:
- Core concept/technology best practices
- Industry-specific optimization strategies
- Real-world implementation patterns
- Edge cases and anti-patterns

**Example:**
```
For "prompt engineering":
- "[Tech] prompt engineering best practices 2025"
- "[Domain] optimization strategies [year]"
- "[Use case] implementation patterns"
```

### Synthesis Phase
Extract from search results:
- Core principles (what consistently appears across sources)
- Competing perspectives (where sources disagree)
- Measurable criteria (how to validate quality)
- Anti-patterns (what to avoid)

**Organize into:**
- Strengths to leverage
- Weaknesses to avoid
- Opportunities to exploit
- Constraints to respect

### Principle Extraction Phase
Distill findings into:
- Guiding principles (5-7 max, high-impact only)
- Quality benchmarks (good vs bad examples)
- Validation criteria (how to measure success)
- Transferable patterns (reusable across contexts)

### Documentation Phase
Output to `.claude/output/docs/[YY-MM-DD]-[short-topic]-research.md`:
- Research sources with key findings
- Extracted principles framework
- Quality examples
- Next steps for application

## Validation

**Quality checks:**
- Are principles actionable? (not just theoretical)
- Do examples show clear contrast? (good vs bad)
- Is context transferable? (works beyond single use case)
- Are sources current? (Last 6 months)

## Examples

**Trigger:**
```
Research best practices for Claude 4.5 structured output generation
```

**Output:**
- 3 parallel searches (Claude docs, prompt engineering, structured data)
- Synthesis of XML tags, prefilled formats, constraint handling
- Principles: clarity, specificity, validation, examples
- Documentation ready for implementation

## References

- Web search for current best practices
- Parallel execution for speed
- Synthesis over summarization (find patterns, not just facts)