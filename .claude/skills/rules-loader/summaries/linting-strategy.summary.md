# Linting Strategy

## Core Pattern
Two-tier linting: ESLint for general quality, ast-grep for project-specific architecture and security.

## ESLint
**Config:** `eslint.config.mjs`

**Enforces:**
- No console statements (except tests/scripts)
- Import/export patterns and module boundaries
- TypeScript best practices
- Unused variables

## ast-grep
**Config:** `rules/*.yml`

**Enforces:**
- Project-specific architecture
- Structural patterns (AST-based)
- Multi-tenant security patterns
- Framework conventions (Next.js, React)
- Custom utility enforcement

## Exclusions
**Both skip:** `node_modules/`, `.next/`, `out/`, `dist/`

**ast-grep also skips:**
- `scripts/` - infrastructure uses console.log
- `*.stories.tsx` - Storybook conventions differ
- `*.test.tsx`, `*.spec.tsx` - test conventions differ
- `app/components/ui/` - shadcn/ui uses different patterns

## ast-grep Rule Template
```yaml
id: rule-name
message: What's wrong and why
severity: error  # or warning
language: tsx    # or ts
rule:
  pattern: $PATTERN
note: "Reference llm/rules/ documentation"
ignores:
  - "path/to/exclude/**"
```

## When to Use Which

**ESLint for:**
- General JS/TS patterns
- Import/export/module boundaries
- Rules that exist in ESLint ecosystem

**ast-grep for:**
- Project-specific architecture
- Structural patterns (requires AST understanding)
- Multi-tenant security patterns
- Framework conventions
- Custom utility enforcement

## Anti-Patterns
- ❌ Duplicating between ESLint and ast-grep
- ❌ Fighting framework conventions
- ❌ Overly strict rules requiring constant overrides
- ❌ Adding rules without documentation

## Validation
- [ ] New rules documented in `llm/rules/`
- [ ] Not duplicating between ESLint and ast-grep
- [ ] Appropriate exclusions configured
- [ ] Rules align with framework conventions

## Read Full File If
File is concise. Reference when adding new linting rules.