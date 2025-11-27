---
name: tanstack-query-enforcer
description: Ensures features have complete TanStack Query architecture (keys/options/hooks/queries)
auto_trigger: false
keywords: [tanstack, query, feature, module, cache, invalidation]
tools: [Read, Write, Edit, Glob, Grep, Bash, mcp__serena__find_symbol]
---

# TanStack Query Enforcer

**Mode**: Architecture validator - ensures features follow complete TanStack Query pattern

## Workflow

### Audit Feature Module

Verify feature has required files:
- `keys.ts` - Query key factory
- `options.ts` - Query/mutation definitions
- `hooks.ts` - Wrapper hooks with useApiQuery/useApiMutation
- `queries.ts` - Fetch functions using apiClient

**Example structure:** See `examples/feature-structure.md`

### Validate Each File

**keys.ts** - Must define query key hierarchy
```typescript
export const featureKeys = {
  all: ['features'] as const,
  lists: (companyId: string) => [...featureKeys.all, companyId, 'list'] as const,
  details: (companyId: string) => [...featureKeys.all, companyId, 'detail'] as const,
}
```

**options.ts** - Must define queryOptions and mutations object
- See `examples/options-example.ts`

**hooks.ts** - Must wrap with useApiQuery/useApiMutation, handle company context
- See `examples/hooks-example.ts`

**queries.ts** - Must use apiClient.get/post with typed responses
- See `examples/queries-example.ts`

### Check Feature Keys

Verify query keys defined in `app/features/{feature}/keys.ts`
- Pattern: `examples/keys-example.ts`

### Run Validation

```bash
pnpm exec ast-grep scan  # Check no-direct-tanstack rule
pnpm typecheck
```

## Anti-Patterns

❌ Direct useQuery in components
❌ Query keys defined in hooks file
❌ Missing mutation invalidation keys
❌ Fetch functions without apiClient

✅ Complete keys/options/hooks/queries structure
✅ Query keys defined in feature's keys.ts
✅ Wrapper hooks with proper invalidation

## References

- `llm/rules/tanstack-query.md` - Complete pattern documentation
- `llm/rules/tanstack-query-mutations.md` - Mutation patterns
- `app/features/blog-posts/` - Gold standard implementation