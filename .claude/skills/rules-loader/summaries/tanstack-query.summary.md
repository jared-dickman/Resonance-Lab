# TanStack Query - Data Fetching

## Core Pattern
Three-file pattern: Keys, Options, Hooks. Never import TanStack directly.

## Three-File Pattern

**keys.ts:**
```ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}
```

**options.ts:**
```ts
import {queryOptions} from '@tanstack/react-query'
export const userOptions = {
  list: (filters: UserFilters) => queryOptions({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
    staleTime: 60 * 1000,  // 1 minute
  }),
}
```

**hooks.ts:**
```ts
import {useApiQuery} from '@/app/hooks/useApiQuery'
export function useUsers(filters?: UserFilters) {
  return useApiQuery(userOptions.list(filters || {}))
}
```

## Feature Co-location
```
features/users/
  keys.ts options.ts hooks.ts types.ts
```

## Component Usage
```tsx
import {useUsers} from '@/app/features/users/hooks'
const {data: users, isLoading} = useUsers({status: 'active'})
```

## staleTime Guidelines
```ts
staleTime: 30 * 1000         // 30s - frequent changes
staleTime: 5 * 60 * 1000     // 5min - moderate
staleTime: 30 * 60 * 1000    // 30min - rare changes
```

## Hierarchical Invalidation
```ts
queryClient.invalidateQueries(userKeys.all)       // Everything
queryClient.invalidateQueries(userKeys.lists())   // All lists
queryClient.invalidateQueries(userKeys.detail(id)) // Specific
```

## Anti-Patterns
- ❌ Direct imports: `import {useQuery} from '@tanstack/react-query'`
- ❌ Inline keys: `queryKey: ['users', id]`
- ❌ No staleTime (excessive refetching)

## Validation
- [ ] Keys, Options, Hooks files exist
- [ ] Hierarchical query keys
- [ ] `staleTime` configured
- [ ] Components use feature hooks

## Read Full File If
Creating new feature queries. See `tanstack-query-mutations.md` for mutations.