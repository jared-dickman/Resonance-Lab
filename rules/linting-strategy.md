# Linting Strategy

Two-tier linting: ESLint for general quality, ast-grep for project-specific architecture and security.

## ESLint
*General code quality and module boundaries*

Config: `eslint.config.mjs`

Enforces:
- No console statements (except tests/scripts)
- Import/export patterns and module boundaries
- TypeScript best practices
- Unused variables

## ast-grep
*Project-specific architectural patterns and security*

Config: `rules/*.yml`

## Exclusions

Both skip: `node_modules/`, `.next/`, `out/`, `dist/`

ast-grep also skips:
- `scripts/` - Infrastructure uses console.log
- `*.stories.tsx` - Storybook conventions differ
- `*.test.tsx`, `*.spec.tsx` - Test conventions differ
- `app/components/ui/` - shadcn/ui uses different patterns

## Adding Rules

Use ESLint for:
- General JS/TS patterns
- Import/export/module boundaries
- Rules that exist in ESLint ecosystem

Use ast-grep for:
- Project-specific architecture
- Structural patterns (requires AST understanding)
- Multi-tenant security patterns
- Framework conventions (Next.js, React)
- Custom utility enforcement

ast-grep template:
```yaml
id: rule-name
message: What's wrong and why
severity: error  # or warning
language: tsx    # or typescript (both valid, project uses 'typescript' for .ts files)
rule:
  pattern: $PATTERN
note: "Reference llm/rules/ documentation"
files:
  - "app/**/*.ts"
  - "app/**/*.tsx"
ignores:
  - "path/to/exclude/**"
```

Avoid:
- Duplicating between ESLint and ast-grep
- Fighting framework conventions
- Overly strict rules requiring constant overrides
- Adding rules without documentation
