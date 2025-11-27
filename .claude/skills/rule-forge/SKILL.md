---
name: rule-forge
description: Creates ast-grep rules with validation and CI integration
auto_trigger: false
keywords: [ast-grep, rule, linting, code quality, validation, enforce]
---

# Rule Forge

**Create → Validate → Test → Document**

## Input Required

- **Pattern:** Code structure to enforce/prohibit
- **Evidence:** Examples of violations
- **Message:** User-facing error message
- **Severity:** error | warning | hint

## Workflow

### 1. Create Rule File

```yaml
id: [kebab-case-id]
language: TypeScript  # or tsx for JSX-specific patterns
rule:
  pattern: [AST pattern with metavariables]
  # Optional: constraints, utils, etc.
fix: [Optional auto-fix pattern]
message: [Clear, actionable message]
severity: error  # or warning, hint
note: [Additional context with markdown support]
files:  # Top-level glob patterns for inclusion
  - "app/**/*.ts"
  - "app/**/*.tsx"
ignores:  # Top-level glob patterns for exclusion
  - "app/testing/**"
  - "**/*.test.ts"
  - "**/*.stories.tsx"
```

**Filename:** `rules/[id].yml`

**Important:**
- Paths are relative to project root (sgconfig.yml directory)
- DO NOT use `./` prefix in glob patterns
- `files` and `ignores` are top-level arrays (not nested)

### 2. Validate Pattern

```bash
# Test against provided examples
pnpm exec ast-grep --pattern '[pattern]' --lang typescript [test-file]
```

### 3. Add Test Cases

Update `scripts/test-ast-grep-rules.ts`:
```typescript
{
  rule: '[rule-id]',
  valid: ['// Code that should pass'],
  invalid: ['// Code that should fail']
}
```

### 4. Run Tests (MANDATORY - BLOCKER)

**CRITICAL: Test suite MUST pass before proceeding!**

```bash
pnpm test:ast-grep-rules
```

**If this fails:**
- Rule is BROKEN
- Do NOT proceed to documentation
- Do NOT claim rule works
- Fix the rule and re-run until it passes

**Manual testing is NOT sufficient:**
- `pnpm exec sg scan` alone is NOT validation
- Test suite is the ONLY source of truth
- All test cases must pass (shouldCatch + shouldPass)

### 5. Document (Only After Tests Pass)

Add to `rules/README.md`:
```markdown
### [rule-id]
**Why:** [Rationale]
**Examples:** See `rules/[id].yml`
```

## Pattern Syntax

**Meta-variables:**
- `$VAR` - Single node wildcard (identifier, expression)
- `$_VAR` - Not captured, can reuse with different values
- `$$VAR` - Double dollar for unnamed tree-sitter nodes
- `$$$ARGS` - Multi-node wildcard (0+ arguments, statements)

**Pattern objects:**
```yaml
pattern:
  context: '{"a": 123}'
  selector: pair
  strictness: smart  # cst|smart|ast|relaxed|signature
```

**Multi-line patterns:**
```yaml
pattern: |
  function $NAME() {
    $$$BODY
  }
```

**Match AST structure, not formatting** - whitespace and comments are ignored by default

## Advanced Fields

**Constraints** - Filter meta-variables:
```yaml
constraints:
  VAR:  # Key name without $ prefix
    regex: "^[a-z]"
    # Can use kind, pattern, regex, all, any
```

**Transform** - Manipulate captures during replacement:
```yaml
transform:
  VAR:
    replace:
      source: "foo"
      replace: "bar"
```

**Utils** - Reusable local rules:
```yaml
utils:
  is-test-file:
    pattern: describe($$$)
```

**Rewriters** - Complex transformations:
```yaml
rewriters:
  - id: modernize
    rule:
      pattern: var $VAR = $VAL
    fix: const $VAR = $VAL
```

**Labels** - Custom code highlighting:
```yaml
labels:
  VAR:
    message: "This variable name"
```

**Metadata** - External tooling data:
```yaml
metadata:
  category: security
  cwe: "CWE-89"
```

**URL** - Documentation link:
```yaml
url: https://example.com/docs/rule-name
```

## Quality Checks

**MANDATORY (Blockers):**
- ✅ `pnpm test:ast-grep-rules` PASSES (not optional!)
- ✅ Pattern tested with valid/invalid cases in test suite
- ✅ No false positives in codebase scan

**Required:**
- ✅ Message is actionable
- ✅ Fix provided (if possible)
- ✅ Documented in README

**Validation order:**
1. Add test cases to `scripts/test-ast-grep-rules.ts`
2. Run `pnpm test:ast-grep-rules` - MUST PASS
3. Run `pnpm exec ast-grep scan` - Check for false positives
4. Only then proceed to documentation

## References

- `rules/README.md`
- `scripts/test-ast-grep-rules.ts`
- https://ast-grep.github.io/
