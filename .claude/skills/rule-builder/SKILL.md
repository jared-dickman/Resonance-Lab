---
name: rule-builder
description: Auto-invoked when creating ast-grep or ESLint rules only. Analyzes requirements, selects optimal tool (ast-grep vs ESLint), and generates rules with comprehensive test cases.
auto_trigger: true
keywords: [ast-grep, eslint, rule, linting, validation, code quality, pattern matching]
---

# Rule Builder

**Mode**: Intelligent rule creation that selects the right tool and generates comprehensive tests

## Tool Selection Decision Tree

### Use ast-grep when:
- ✅ Simple structural pattern matching (function calls, imports, exports)
- ✅ Finding code patterns across files
- ✅ Syntax-aware search and replace
- ✅ Single pattern or basic `any`/`all` combinations

### Use ESLint when:
- ✅ JSX attribute validation (data-testid, className, href)
- ✅ Complex conditional logic or state tracking
- ✅ File path exclusions (e.g., skip .stories. files)
- ✅ Multi-node relationship analysis
- ✅ Security rules requiring deep validation

**Critical check**: Review `scripts/test-ast-grep-rules.ts:996-1007` for current ESLint rules list

## Workflow

### 1. Understand the Rule Intent

Ask user:
- **Problem**: What code pattern are you preventing/enforcing?
- **Why**: What's the risk/benefit? (security, maintainability, consistency)
- **Scope**: Which files should this apply to? Any exclusions?

### 2. Select Tool Type

**Decision matrix:**

| Rule Type | Tool | Reason |
|-----------|------|--------|
| JSX attributes with literal strings | ESLint | ast-grep struggles with JSX attribute values |
| Import/export patterns | ast-grep | Simple structural matching |
| Function call patterns | ast-grep | Unless complex logic needed |
| Path-based exclusions | ESLint | Better file context handling |
| Security validation (secrets, SQL injection) | ESLint | Requires complex string analysis |
| Template literals with expressions | ESLint | Needs expression evaluation |

**Examples from codebase:**
- `no-magic-testids`: ESLint (JSX attribute + path exclusion)
- `bdd-no-expect-in-steps`: ast-grep (simple pattern matching)
- `stories-use-fixtures`: ast-grep (structural pattern)
- `no-exposed-secrets`: ESLint (complex string validation)

### 3. Create Test Cases FIRST

**Before writing the rule**, create comprehensive test cases:

**Required minimum:**
- 3-5 `shouldCatch` cases (variations of the violation)
- 3-5 `shouldPass` cases (valid alternatives + edge cases)

**Test case quality checklist:**
- ✅ Includes real-world patterns from codebase
- ✅ Tests edge cases (empty values, nested structures)
- ✅ Validates path exclusions work (e.g., .stories. files)
- ✅ Shows both incorrect and correct approaches

### 4. Implement Rule

#### For ast-grep rules (rules/{rule-id}.yml):

```yaml
id: rule-id
message: Clear, actionable error message
severity: error
language: typescript
rule:
  any:  # or 'all', 'pattern', etc.
    - pattern: $PATTERN_HERE
    - pattern: await $PATTERN_HERE
note: |
  Explanation with examples.

  ✅ GOOD:
    {good example with imports}

  ❌ BAD:
    {bad example showing violation}

  {actionable fix instruction}
files:
  - "path/to/**/*.ts"
```

**Pattern syntax:**
- `$VAR` = single node wildcard
- `$$$ARGS` = multi-node wildcard (0+ items)
- `$METHOD` = metavariable (can be constrained)

#### For ESLint rules (scripts/eslint-plugin-blogzilla.mjs):

```javascript
'rule-id': {
  meta: {
    type: 'problem',
    docs: {
      description: 'Clear description',
      category: 'Best Practices',
      recommended: true
    },
    messages: {
      messageId: 'Actionable error message with fix suggestion'
    },
    schema: []
  },
  create(context) {
    const filename = context.getFilename();

    // Path exclusions
    if (filename.includes('.stories.')) {
      return {};
    }

    return {
      JSXAttribute(node) {
        // Implementation
      },
      CallExpression(node) {
        // Implementation
      }
    };
  }
}
```

### 5. Update Test Suite

**Add test case to `scripts/test-ast-grep-rules.ts`:**

1. Add to `TEST_CASES` array with your shouldCatch/shouldPass cases
2. **If ESLint**: Add rule name to `eslintRules` array (line ~996)

### 6. Validate

```bash
# Run test suite
pnpm test:ast-grep-rules

# Manual validation on codebase
pnpm exec ast-grep scan  # for ast-grep rules
pnpm lint                # for ESLint rules
```

**Validation checklist:**
- ✅ All test cases pass
- ✅ Rule catches violations in test suite
- ✅ No false positives on valid code
- ✅ Error messages are clear and actionable
- ✅ Documentation includes good/bad examples

## Anti-Patterns

❌ **Bad: Choosing tool without analysis**
```
User: "Create a rule for X"
Assistant: *immediately creates ast-grep rule without considering JSX/paths*
```

✅ **Good: Systematic tool selection**
```
User: "Create a rule for X"
Assistant: "I need to understand the pattern first:
1. Does it involve JSX attributes? → ESLint
2. Does it need path exclusions? → ESLint
3. Is it simple structural matching? → ast-grep
4. Let me check existing similar rules..."
```

❌ **Bad: Minimal test cases**
```yaml
shouldCatch: [{ file: 'test.ts', code: 'simple example' }]
shouldPass: [{ file: 'good.ts', code: 'simple example' }]
```

✅ **Good: Comprehensive test coverage**
```yaml
shouldCatch: [
  { file: 'basic.ts', code: 'basic violation' },
  { file: 'nested.ts', code: 'nested structure violation' },
  { file: 'edge-case.ts', code: 'edge case violation' },
  { file: 'real-world.tsx', code: 'real pattern from codebase' }
]
shouldPass: [
  { file: 'correct.ts', code: 'correct pattern' },
  { file: 'excluded.stories.tsx', code: 'excluded path' },
  { file: 'edge-ok.ts', code: 'edge case that should pass' }
]
```

❌ **Bad: Vague error messages**
```yaml
message: "Don't do this"
```

✅ **Good: Actionable error messages**
```yaml
message: "Step definitions must use POM assertions, not direct expect() calls"
note: |
  Add the missing assertion to the POM, then use it in the step.
  See e2e/pages/base-page.pom.ts for pattern.
```

## Quality Standards

**World-class rule must have:**

✅ **Clear intent**: Error message explains what and why
✅ **Examples**: Good/bad patterns in `note` section
✅ **Comprehensive tests**: 8-10 total test cases minimum
✅ **Real-world patterns**: Test cases from actual codebase
✅ **Actionable fix**: Note explains how to resolve
✅ **Correct tool**: ast-grep for structure, ESLint for complexity
✅ **Edge case coverage**: Tests boundary conditions

## Common Patterns

### BDD/Testing Rules
- **Pattern**: Enforce test best practices (fixtures, locators, assertions)
- **Tool**: Usually ast-grep (structural patterns)
- **Files**: `e2e/**/*.ts`, `**/*.test.ts`

### Security Rules
- **Pattern**: Prevent vulnerabilities (SQL injection, exposed secrets)
- **Tool**: ESLint (complex validation logic)
- **Severity**: Always `error`

### Architecture Rules
- **Pattern**: Enforce patterns (no direct TanStack, use fixtures)
- **Tool**: ast-grep (import/usage patterns)
- **Files**: Often exclude stories/tests

### Style Consistency
- **Pattern**: Naming, structure (function components, no backup files)
- **Tool**: ast-grep for structure, ESLint for complex naming
- **Severity**: `error` (we enforce consistency)

## References

- `scripts/test-ast-grep-rules.ts` - Test suite structure and existing rules
- `scripts/eslint-plugin-blogzilla.mjs` - ESLint rule implementations
- `rules/*.yml` - ast-grep rule examples
- [ast-grep docs](https://ast-grep.github.io/) - Pattern syntax reference
- [ESLint custom rules](https://eslint.org/docs/latest/extend/custom-rules) - ESLint API