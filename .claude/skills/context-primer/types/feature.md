# Feature Development Workflow

## Mindset
Full-stack, type-safe, tested. Think in layers.

## Feature Architecture (MANDATORY)

**Domain layer**: Types, schemas, transformers
**Service layer**: Business logic, validation
**Repository layer**: Data access, queries
**Hooks layer**: React Query integration
**Actions layer**: Server actions with enforcement
**MSW layer**: Mock API responses

Reference: `app/features/blog-posts/` for canonical structure

## Agent Workflow

**Phase 1: Scaffolding**
- Invoke `api-generator` skill for full feature structure
- Never manually create directories/files

**Phase 2: Database**
- Delegate to `supabase-specialist` for migrations
- Always include RLS policies
- Run advisors after migration

**Phase 3: Query Setup**
- Invoke `tanstack-query-enforcer` for query architecture
- Keys, options, hooks, queries ALL required

**Phase 4: Test Data**
- Invoke `fixture-forge` for factories/fixtures
- Type-safe, reusable across Vitest/Storybook/Playwright

**Phase 5: Testing**
- Unit: Service/domain logic (Vitest)
- Integration: Actions with DB (Vitest)
- Component: UI states (Storybook)
- E2E: Critical user flows (Playwright BDD)

Use `gherkin-generator` + `bdd-implementation-generator` for E2E.

**Phase 6: Validation**
```bash
pnpm typecheck
pnpm exec ast-grep scan
pnpm vitest run
```

## Type Safety Checklist

- [ ] Zod schemas for ALL DTOs
- [ ] Domain types separate from API types
- [ ] Transformers between layers
- [ ] Zero `any` types

## Critical Rules

**Security**: ALL actions require enforcement checks
**Imports**: Strict layer boundaries (domain imports at top)
**Queries**: Must have keys, options, hooks, queries files

See loaded rule summaries for enforcement patterns.

## Success Criteria

- Build succeeds
- Full feature stack implemented
- All tests passing (unit/integration/E2E)
- Type-safe end-to-end
- No ast-grep violations
- Validated with screenshots