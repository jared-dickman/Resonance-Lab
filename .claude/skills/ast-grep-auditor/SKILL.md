---
name: ast-grep-auditor
description: World-class ast-grep expert. Audits rules for pattern precision, security. Auto-fixes violations. Recommends ESLint for JSX.
auto_trigger: true
keywords: [audit, ast-grep, rule, validation, pattern, security]
---

# ast-grep Auditor

Expert system for ast-grep rule quality. Ensures pattern precision, security coverage, test rigor.

## Auto-Invoke

Modified/created `rules/*.yml` or keywords: "audit rules", "validate ast-grep", "check patterns"

## Expert Knowledge

See `examples/` for complete pattern demonstrations:
- **`pattern-validation.yml`** - Rule structure template and YAML schema
- **`meta-variable-patterns.ts`** - Meta-variable usage, naming rules, and edge cases
- **`atomic-rules-patterns.yml`** - Pattern, kind, regex, constraints mastery
- **`relational-rules-patterns.yml`** - has, inside, follows, precedes, stopBy semantics
- **`test-quality-patterns.ts`** - Test case quality requirements (3+3 minimum)
- **`security-coverage-patterns.yml`** - Defense-in-depth validation strategies

### Language Field Specifications

**CRITICAL: Use canonical lowercase language identifiers**

**Correct usage:**
- ✅ `language: typescript` or `language: ts` - Both are valid aliases for TypeScript
- ✅ `language: tsx` - Valid for TSX files, or when pattern requires JSX syntax

**Invalid usage:**
- ❌ `language: TypeScript` - Capitalized (use lowercase)
- ❌ Non-existent aliases

**Why `typescript` not `tsx` for most rules:**
- `sgconfig.yml` defines: `ts: ['**/*.ts', '**/*.tsx']`
- `language: typescript` scans BOTH .ts and .tsx files
- Only use `language: tsx` when pattern explicitly requires JSX syntax

**When to use `language: tsx`:**
- Patterns matching JSX tags: `<$TAG $$$PROPS>`
- JSX attributes: `className={$EXPR}`
- Component structure: `export function Component() { return <div /> }`

**When to use `language: typescript`:**
- Function declarations, imports, type annotations
- Object/array patterns, method calls
- ANY pattern that works in both .ts and .tsx files
- Comment matching, string literals, variable declarations

### Pattern Parsing Pitfalls

**Three failure categories:**

**Invalid patterns** - Meta-variables are identifiers, fail in non-identifier contexts
- ❌ `$LEFT $OP $RIGHT` (three consecutive identifiers)
- ❌ `obj = { $KIND foo() {} }` (meta-var can't replace keywords like `get`/`set`)
- ✅ Use `kind` + `regex` atomic rules instead

**Incomplete patterns** - Missing context prevents parsing
- ❌ `"a": 123` in JSON (missing `{}`)
- ✅ Use pattern objects: `pattern: { context: '{"a": 123}', selector: pair }`

**Ambiguous patterns** - Syntax parses multiple ways
- `a: 123` → object property OR labeled statement
- ✅ Use pattern objects with explicit `selector`

**Pattern strictness levels:**
- `cst` → All nodes must match exactly (strictest)
- `smart` (default) → Pattern nodes match, unnamed target nodes skipped
- `ast` → Only named AST nodes matched
- `relaxed` → Named nodes matched, comments ignored
- `signature` → Only node kinds matched, text ignored (loosest)

### Meta-Variable Detection Rules

**Meta-variables trigger only when:**
- Sole content of AST node
- Within single named node (not spanning multiple)

**Naming rules:**
- `$VAR` → uppercase letters, underscore, digits only
- `$_VAR` → underscore prefix = not captured, can reuse with different values
- `$VAR` reused → must match identical content each time
- `$$VAR` → double dollar captures unnamed tree-sitter nodes
- `$$$ARGS` → matches zero or more nodes (multi-node wildcard)

**Working examples:**
- ✅ `$A`, `$A.$B`, `$A.method($B)`

**Failing examples:**
- ❌ `obj.on$EVENT` (partial string)
- ❌ `"Hello $WORLD"` (inside string_content)
- ❌ `$jq` (lowercase not permitted)
- ❌ `use$HOOK`, `io_uring_$FUNC` (prefix/suffix mixing)

### Atomic Rules Mastery

**Pattern** - Primary choice for structural matching
- Must be valid, parsable code
- Use object form with `context`/`selector` for ambiguity
- Cannot be arbitrary text

**Kind** - AST node type matching
- Use when pattern creates ambiguity or invalid syntax
- Supports ESQuery selectors (v0.39.1+):
  - `>` → direct child (e.g., `call_expression > identifier`)
  - `+` → next sibling
  - `~` → following sibling
  - (space) → descendant
- Optimizes performance (kind-based filtering before regex)
- ⚠️ Cannot change pattern parsing behavior

**Regex** - Text-based matching
- ⚠️ ALWAYS combine with `kind` or `pattern` for performance
- Rust regex format
- Cannot leverage AST optimization alone

**Constraints** - Filter captured meta-variables
- Only single `$VAR`, not multi `$$$ARGS`
- Applied after initial match (filter phase)
- Can use full rule objects: `kind`, `pattern`, `regex`, `all`, `any`, etc.
- Key name excludes `$` prefix (e.g., `VAR:` not `$VAR:`)
- ⚠️ **Cannot be used within `not` rules**

**nthChild** - Position-based matching
- Matches nodes by position among siblings (1-based index)
- Supports CSS-style formulas: `2n+1`, `3`, etc.
- Object form: `position`, `reverse`, `ofRule`
- Only counts named nodes, not unnamed nodes

**Critical mistake:** Using `kind` + `pattern` at same level matches nothing (AND logic). Use pattern objects instead.

### Relational Rules Semantics

**Semantic pattern:** Target relates TO surrounding node
- Primary rule = target node
- Relational sub-rule = surrounding context

**has** - Target contains child matching sub-rule
**inside** - Target within node matching sub-rule
**follows** - Target appears after node matching sub-rule
**precedes** - Target appears before node matching sub-rule

**stopBy parameter:**
- Default `'neighbor'` → one level only
- `'end'` → searches to root/leaf/first/last sibling
- Custom rule object → stops at matching node (inclusive)

**field parameter:** Targets structural role (key vs value in pairs)

### Composite Rules Logic

**all** - AND logic, every sub-rule must match
**any** - OR logic, at least one sub-rule matches
**not** - Negation, node must NOT match sub-rule

**Order matters:** Meta-variable capture in first rule affects subsequent rules

### CST vs AST Reality

ast-grep uses **Concrete Syntax Trees**, not Abstract Syntax Trees
- Preserves operators (`+`, `,`), punctuation, trivia
- More precise for real-world code searching
- Named nodes (have `kind`) vs unnamed nodes (literals/operators)
- Significant nodes (named OR have field) vs trivial nodes

**Critical:** Even significant nodes miss semantics (modifiers like `get`, `static`, `async` may be trivial)

## Validation Checks

### Pattern Precision

**False positives:**
- Wrong atomic rule choice (`kind` when `pattern` works, vice versa)
- Path scoping too broad (`paths.include` missing)
- Missing `not` exclusions for legitimate patterns
- Ambiguous pattern defaulting to wrong parse

**False negatives:**
- Pattern too specific (missing syntax variations)
- `stopBy: 'neighbor'` when deeper search needed
- Missing edge cases (nested, multi-line)
- Incomplete context in pattern object

**Auto-fix:**
- Add missing `not` exclusions
- Convert invalid patterns to `kind` + `regex`
- Add pattern objects for ambiguous code
- Suggest `stopBy: 'end'` when neighbor insufficient

### Tool Selection Matrix

**Migrate to ESLint when:**
- ❌ JSX attribute parsing with text `pattern:` (high false positive risk)
- ❌ General JS/TS patterns with existing ESLint rules
- ❌ Module boundary enforcement (ESLint optimized)
- ❌ Simple identifier/naming conventions

**Keep ast-grep when:**
- ✅ Project-specific architecture patterns
- ✅ Structural code transformations
- ✅ Multi-tenant security enforcement (company isolation)
- ✅ Framework-specific conventions (Next.js routes, React hooks)
- ✅ Complex relational matching (`inside`, `has`, `follows`)

**Red flag:** Rule targets JSX but uses `pattern:` not `kind:` → IMMEDIATE ESLint migration

### Security Coverage (API/Security Rules)

**Input validation layers:**
- Request body (`request.json()`) → `validateRequestBody()`
- Query params (`searchParams.get()`) → `validateQueryParams()`
- Route params (`params`) → `validateParams()`
- Headers (`request.headers.get()`) → schema validation
- Type checks (`typeof`) → Zod schemas only
- Property checks (`'prop' in obj`) → Zod schemas only

**Defense-in-depth verification:**
- Multiple rules catching same attack vector
- Entry points require validation (API routes, actions)
- Helpers/utilities allowed to violate (not entry points)

**Output validation strategy:**
- Complex data → schema required
- Simple (`{success: true}`, `{error: "..."}`) → exempt
- Error codes (4xx, 5xx) → exempt

### Test Quality Requirements

**Project convention: Minimum 3 `shouldCatch` + 3 `shouldPass` test cases**

**Project test terminology (in scripts/test-ast-grep-rules.ts):**
- `shouldCatch:` - Code samples that SHOULD trigger the rule
- `shouldPass:` - Code samples that should NOT trigger the rule

**Note:** This project uses a custom test runner, not the official `ast-grep test` command. The official ast-grep terminology is `invalid`/`valid`, but our test suite uses `shouldCatch`/`shouldPass`.

**shouldCatch test cases must include:**
- Obvious violation (straightforward case)
- Edge case (nested, multi-line, unusual syntax)
- Real-world pattern from codebase

**shouldPass test cases must include:**
- Recommended pattern (what to use instead)
- Legitimate exclusion (test files, stories, utilities)
- Similar but valid code (environment checks, helpers)

**Auto-fix:**
- Generate missing test cases from pattern structure
- Add edge cases (nested, template literals, async/await variations)
- Include real violations found in production scan

### Production Validation

**CRITICAL: Test suite is MANDATORY - not optional!**

**Execute in this order:**
```bash
# 1. Project script (wraps ast-grep test)
pnpm test:ast-grep-rules

# 2. Direct ast-grep commands (if needed)
ast-grep test                    # Run all tests with snapshots
ast-grep test --skip-snapshot-tests  # Validate without snapshots
ast-grep test --update-all       # Update all snapshots
ast-grep test --interactive      # Interactive snapshot updates

# 3. Full codebase scan
pnpm exec ast-grep scan
```

**❌ NEVER claim a rule works without running test suite!**
- Manual `pnpm exec sg scan` is NOT sufficient
- Test suite (`pnpm test:ast-grep-rules`) is the ONLY source of truth
- If test suite fails, rule is BROKEN regardless of manual tests

**Filter to scope:**
- Only count violations in `paths.include` targets
- Ignore violations in `paths.exclude` or outside scope
- Utilities/helpers violating = OK if entry points protected

**Metrics:**
- Files in scope (entry points only)
- Violations in scope
- Compliance rate: (clean files / total files in scope) * 100

**Auto-fix production violations:**
- Apply rule's recommended pattern
- Generate imports if needed
- Re-run validation to confirm fix
- **ALWAYS re-run test suite after fixes**

## Auto-Fix Strategy

### Apply Automatically

**YAML structure:**
- Missing `message`, `note`, `severity`
- Invalid field names or structure

**Pattern issues:**
- Convert `$LEFT $OP $RIGHT` to `kind` + `regex`
- Add pattern objects for incomplete code
- Fix meta-variable naming (`$jq` → `$JQ`)

**Test coverage:**
- Generate 3+3 test cases minimum
- Add edge cases from pattern analysis

**Tool migration:**
- Recommend ESLint for JSX attribute rules
- Provide migration guide

### Suggest (Require Approval)

**Pattern precision:**
- Add `stopBy: 'end'` when neighbor insufficient
- Complex relational rule refactoring
- Breaking changes to existing patterns

**Security coverage:**
- New rules for coverage gaps
- Defense-in-depth enhancements

**Path scoping:**
- Narrow `paths.include` to reduce false positives
- Add `paths.exclude` for legitimate exceptions

## Report Template

```markdown
# [Category] Audit: ✅ PASS | ❌ FAIL | ⚠️ NEEDS_WORK

**Rules:** X/Y passing
**Pattern Precision:** [Analysis + false pos/neg]
**Tool Choice:** ast-grep appropriate | ⚠️ Migrate to ESLint: [list]
**Security:** [Coverage gaps] | Complete
**Tests:** X shouldCatch, Y shouldPass [gaps]
**Production:** X violations in Y files (Z% compliance)

**Auto-Fixes Applied:**
- [Applied fixes]

**Recommendations:**
- **Immediate:** [Blockers]
- **Future:** [Enhancements]

**Verdict:** [Reasoning with specific pattern issues]
```

## References

- `llm/rules/linting-strategy.md` - ast-grep vs ESLint philosophy
- `llm/rules/security.md` - Multi-tenant patterns, auth/authz
- `llm/rules/code-standards.md` - DRY, single responsibility
- `scripts/test-ast-grep-rules.ts` - Test suite structure
- `sgconfig.yml` - Global configuration