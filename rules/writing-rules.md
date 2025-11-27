# Rules Writing Guide

Rules are optimized for LLM agents. Follow these principles:

1. **Clear and Direct**: No ambiguity, minimal words, maximum clarity
2. **Show Don't Tell**: One good example beats paragraphs of explanation
3. **Use Cases Over Theory**: Explain WHEN to apply, not just WHAT to do
4. **Generic Yet Actionable**: Balance universal principles with specific examples
5. **Scannable Structure**: Headers, bullets, code blocks for rapid scanning
6. **Anti-Patterns**: Show what NOT to do alongside correct patterns

**Template**:
- State goal/intent in header
- Minimal code example showing correct usage
- Brief use cases (when to apply)
- Contrasting anti-pattern with correct pattern

The best rules are short, clear, and impossible to misinterpret.

## Maintenance
Update rules when patterns change. Document in both `llm/rules/` and rule files.
**New rule files must be added to `index.md`:**
Match existing category and description format.
