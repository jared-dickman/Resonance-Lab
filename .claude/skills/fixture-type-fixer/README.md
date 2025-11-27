# Fixture Type Fixer - Quick Start

Auto-fix type annotation violations in fixture files.

## Usage

The skill auto-invokes when:
- Creating/editing files in `app/testing/fixtures/`
- Running `ast-grep scan` shows violations
- User requests "fix fixture types"

## Manual Invocation

```bash
# 1. Detect violations
pnpm exec ast-grep scan --filter="fixture-requires-satisfies"

# 2. Auto-fix
pnpm exec ast-grep --pattern 'export const $NAME: $TYPE = $VALUE' \
  --rewrite 'export const $NAME = $VALUE satisfies $TYPE' \
  --lang typescript \
  --update-all

# 3. Validate
pnpm typecheck
```

## Example

**Before:**
```typescript
export const mockBlogResponse: BlogResponse = {
  id: 'blog-1',
  title: 'Test Blog',
  status: 'draft'
}
```

**After:**
```typescript
export const mockBlogResponse = {
  id: 'blog-1',
  title: 'Test Blog',
  status: 'draft'
g} as const satisfies BlogResponse
```

**Why:** Preserves literal types (`'draft'` vs `string`) for better type safety.

## Integration

Works seamlessly with:
- **fixture-forge** - Creates fixtures with correct syntax
- **pre-commit hooks** - Catches violations before commit
- **CI/CD** - Fails build on violations

## See Also

- [SKILL.md](./SKILL.md) - Full skill documentation
- [fixture-forge](../fixture-forge/SKILL.md) - Fixture creation
- [rules/fixture-requires-satisfies.yml](../../rules/fixture-requires-satisfies.yml) - AST-grep rule