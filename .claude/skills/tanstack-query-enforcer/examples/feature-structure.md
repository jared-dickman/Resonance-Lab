# Complete Feature Module Structure

Based on `app/features/blog-posts/` gold standard.

## Required Files

```
app/features/{domain}/
├── dto/
│   ├── {domain}-request.schema.ts   # Zod schemas for inputs
│   └── {domain}-response.schema.ts  # Zod schemas for outputs
├── keys.ts                            # Query key factory
├── options.ts                         # Query/mutation definitions
├── hooks.ts                           # Wrapper hooks (useApiQuery/useApiMutation)
├── queries.ts                         # Fetch functions (apiClient)
└── transformers/                      # Optional: View models
```

## Validation Checklist

- [ ] keys.ts defines key factory with hierarchy pattern (all/lists/list/details/detail)
- [ ] options.ts exports {domain}Options object and {domain}Mutations
- [ ] hooks.ts uses useApiQuery/useApiMutation wrappers (never direct TanStack hooks)
- [ ] hooks.ts includes proper invalidation keys in mutations
- [ ] queries.ts uses apiClient.get/post with typed responses
- [ ] No direct useQuery/useMutation calls in components (verified by ast-grep)

## Example Implementation

See:
- `app/features/blog-posts/` - Complete implementation
- `keys-example.ts` - Key factory pattern
- `options-example.ts` - Options pattern
- `hooks-example.ts` - Hooks pattern
- `queries-example.ts` - Queries pattern