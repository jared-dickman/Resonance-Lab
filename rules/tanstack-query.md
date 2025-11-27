# TanStack Query - Data Fetching

**Goal**: Fetch and cache server data with type-safe patterns

**When to use**: All server data reads (users, posts, companies, etc.)

**Never use**: Direct `useQuery` imports - always use feature hooks

---

## Mandatory Three-File Pattern

Every feature MUST have:
- **keys.ts** - Query key factory
- **options.ts** - Query option objects
- **hooks.ts** - Wrapper hooks for components

---

## 1. Query Key Factory (QKF)

Hierarchical keys enable targeted cache invalidation:

```typescript
// features/users/keys.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Invalidation examples:
queryClient.invalidateQueries(userKeys.all)      // Everything
queryClient.invalidateQueries(userKeys.lists())  // All lists
queryClient.invalidateQueries(userKeys.detail(id)) // Specific item
```

---

## 2. Query Options

Define reusable query option objects using plain objects:

```typescript
// features/users/options.ts
import {fetchUser, fetchUsers} from './queries'
import {userKeys} from './keys'
import type {UserFilters} from './types'

export const userOptions = {
  all: () => ({
    queryKey: userKeys.all,
    queryFn: fetchUsers,
  }),

  list: (filters: UserFilters) => ({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
  }),

  detail: (id: string) => ({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000,  // 5 minutes
  }),
}
```

---

## Cache Time Selection

**Critical**: Wrong `staleTime` = broken UX or excessive API load

**Volatile State** (wizard, draft, active sessions)
```typescript
staleTime: 0  // Always fresh - stale data breaks UI
```

**Published Content** (blog posts, profiles)
```typescript
staleTime: 30 * 1000  // 30s-1m - balance freshness vs load
```

**Reference Data** (categories, settings)
```typescript
staleTime: 5 * 60 * 1000  // 5m+ - rarely changes
```

**Targeted Invalidation**:
```typescript
await createBlogPost(data)
queryClient.invalidateQueries({queryKey: blogKeys.lists()})
```

❌ Avoid: `staleTime: 0` everywhere (excessive requests)
❌ Avoid: Long staleTime for volatile state (broken UX)

---

## 3. Custom Hook Wrappers

❌ Forbidden: `useQuery`, `useMutation`, `useInfiniteQuery` (must use wrappers)
✅ Allowed: `useQueryClient`, `useIsFetching`, `useIsMutating` (utility hooks)

```typescript
// features/users/hooks.ts
import {useApiQuery} from '@/app/hooks/query-hooks'
import {userOptions} from './options'

export function useUsers(filters?: UserFilters) {
  return useApiQuery(userOptions.list(filters || {}))
}

export function useUser(id: string) {
  return useApiQuery(userOptions.detail(id))
}

// Component usage:
const {data: users, isLoading} = useUsers({status: 'active'})
```

---

## Feature Co-location

Organize by domain (feature ownership, easier refactoring):

```
features/users/
  keys.ts options.ts hooks.ts types.ts
```

❌ Don't organize by type (`hooks/`, `keys/`, etc)

---

## Anti-Patterns

❌ Direct TanStack imports:
```typescript
import {useQuery} from '@tanstack/react-query'

const {data} = useQuery({queryKey: ['users'], queryFn: fetchUsers})
```

❌ Inline query keys:
```typescript
const {data} = useQuery({queryKey: ['users', id], queryFn: () => fetch(...)})
```

❌ No staleTime (excessive refetching):
```typescript
queryOptions({queryKey: userKeys.all, queryFn: fetchUsers})  // Refetches constantly
```

✅ Feature hooks with keys and options:
```typescript
const {data: users} = useUsers()  // Clean, typed, cached properly
```

---

**For mutations and optimistic updates**, see `tanstack-query-mutations.md`
