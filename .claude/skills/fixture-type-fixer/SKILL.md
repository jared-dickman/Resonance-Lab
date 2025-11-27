t---
name: Fixture Type Fixer
description: Auto-invoked when fixture files are created or edited in any test env (Vitest, Storybook, Playwright).
auto_trigger: true
keywords: [fixture, fixture, satisfies, fixture violation, fixture fix, test data, mock, api-mock, mock data, fakes, fake api data]
---

# Fixture Type Fixer

**Mode**: Automated type safety enforcer - Converts `: Type` to `satisfies Type` in fixture files

## Core Principles

**Preserve literal types** - `satisfies` maintains `'active'` vs widened `string`
**Compile-time safety** - Catch schema drift at build time
**Always export fixtures** - No internal `const`, prevents duplication
**Zero false positives** - Only fix actual fixture exports
**Fail fast** - Validate before committing

## When This Triggers

Auto-invokes when:
- Creating new fixture files in `app/testing/fixtures/`
- Editing existing `*-fixtures.ts` or `*-fixture.ts` files
- Running `ast-grep scan` shows fixture violations
- User explicitly requests fixture type fixes

## Workflow

### Detect Violations

**Scan for fixture type issues:**
```bash
pnpm exec ast-grep scan --filter="fixture-requires-satisfies"
```

**What it finds:**
- `export const mockResponse: Type = {...}` ❌ (wrong annotation)
- `const fixture: RequestType = {...}` ❌ (not exported)
- Violations in `app/testing/fixtures/**/*-fixtures.ts`
- Violations in `app/testing/fixtures/**/*-fixture.ts`

**Note:** All fixtures must be exported. No internal `const` declarations.

**Review violations:**
- Count total violations found
- Identify affected files
- Determine if auto-fixable (most are)

### Apply Automatic Fixes

**Fix type annotations with ast-grep:**
```bash
# Fix exported consts with Response/Request/Input types
pnpm exec ast-grep --pattern 'export const $NAME: $TYPE = $VALUE' \
  --rewrite 'export const $NAME = $VALUE satisfies $TYPE' \
  --lang typescript \
  --update-all
```

**What gets fixed:**
```typescript
// BEFORE
export const mockBlogResponse: BlogResponse = {
  id: 'blog-1',
  title: 'Test Blog'
}

// AFTER
export const mockBlogResponse = {
  id: 'blog-1',
  title: 'Test Blog'
} as const satisfies BlogResponse
```

**Scoped to fixture files only:**
- Only runs on `app/testing/fixtures/**/*`
- Skips non-fixture code
- Preserves formatting and comments

### Validate Changes

**Run TypeScript compilation:**
```bash
pnpm typecheck
```

**Expected outcome:**
- ✅ All fixtures compile successfully
- ✅ No new type errors introduced
- ✅ Literal types preserved (`'active'` not widened to `string`)

**If validation fails:**
- Review the specific type error
- Check if Zod schema and fixture mismatch
- Fix schema or fixture data, not the `satisfies` syntax
- Re-run validation

### Verify Violations Resolved

**Re-scan after fixes:**
```bash
pnpm exec ast-grep scan --filter="fixture-requires-satisfies"
```

**Success criteria:**
- Zero fixture violations in `app/testing/fixtures/`
- All exports use `satisfies Type` syntax
- TypeScript compiles without errors

**If violations remain:**
- Some may be in non-fixture files (acceptable)
- Check `app/fixtures/` vs `app/testing/fixtures/` paths
- Focus only on files in fixture directories

### Report Changes

**Summarize fixes applied:**
```
✅ Fixture Type Safety Enforced

Fixed files:
- app/testing/fixtures/billing/billing-fixtures.ts (4 violations)
- app/testing/fixtures/blog-posts/blog-post-fixtures.ts (2 violations)

Changes:
- Converted ': Type' → 'satisfies Type' (6 total)
- Preserved literal types for type safety
- All fixtures compile successfully

Validation: ✅ pnpm typecheck passed
Violations: 0 remaining in fixture directories
```

## Example

See `example.ts` for complete correct real-world fixture pattern following codebase conventions.

## Non-Fixture Files

**Intentionally skipped:**
- `app/api/**/*.ts` - API route handlers (not fixtures)
- `app/features/**/*.ts` - Feature code (not fixtures)
- `scripts/**/*.ts` - Build scripts (not fixtures)

**Only fixture directories:**
- `app/testing/fixtures/**/*-fixtures.ts` ✅
- `app/testing/fixtures/**/*-fixture.ts` ✅

**Why:** The rule intentionally scopes to fixture files only. Other files may have valid reasons for `: Type` annotations.

## Integration with Fixture Forge

**Fixture Forge creates fixtures** → **Fixture Type Fixer validates them**

**Workflow integration:**
1. Fixture Forge generates new fixture file
2. Fixture Type Fixer auto-invokes to scan
3. If violations found, applies fixes automatically
4. Validates with typecheck
5. Reports completion

**Manual usage:**
```bash
# Run fixture type fixer standalone
pnpm exec ast-grep scan --filter="fixture-requires-satisfies"

# Auto-fix all violations
pnpm exec ast-grep --pattern 'export const $NAME: $TYPE = $VALUE' \
  --rewrite 'export const $NAME = $VALUE satisfies $TYPE' \
  --update-all

# Validate fixes
pnpm typecheck
```

## Anti-Patterns

❌ **Fixing non-fixture files:**
```typescript
// Don't fix API routes or feature code
// Only fixture files in app/testing/fixtures/
```

❌ **Ignoring validation failures:**
```bash
# Always run typecheck after fixes
pnpm typecheck  # Must pass!
```

❌ **Manual find-replace:**
```bash
# Don't use sed or manual edits
# Use ast-grep for AST-aware transformations
```

✅ **Correct approach:**
- Export all fixtures
- Use ast-grep for structural fixes
- Always validate with typecheck
- Report changes clearly

## References

- `example.ts` - Canonical fixture pattern
- `rules/fixture-requires-satisfies.yml` - AST-grep rule definition
- `.claude/skills/fixture-forge/SKILL.md` - Fixture creation workflow