# TanStack Query - Mutations & Updates

**Goal**: Update server data with optimistic UI and proper cache invalidation

**When to use**: Creating, updating, or deleting data; infinite scroll

**Never use**: Direct `useMutation` - always use `useApiMutation` wrapper

---

## Mutations

### Basic Mutation Pattern

```typescript
// features/users/hooks.ts
import {useApiMutation} from '@/app/hooks/query-hooks'
import {userKeys} from './keys'
import {createUser, updateUser, deleteUser} from './queries'
import type {User, CreateUserData, UpdateUserData} from './types'

export function useCreateUser() {
  return useApiMutation({
    mutationFn: createUser,
    invalidateKeys: [userKeys.all],  // Refetch all user queries
  })
}

export function useUpdateUser() {
  return useApiMutation({
    mutationFn: ({id, data}: {id: string; data: UpdateUserData}) =>
      updateUser(id, data),
    invalidateKeys: [userKeys.all],
  })
}

export function useDeleteUser() {
  return useApiMutation({
    mutationFn: deleteUser,
    invalidateKeys: [userKeys.all],
  })
}
```

### useApiMutation Wrapper

```typescript
// app/hooks/query-hooks.ts
import {useMutation, type UseMutationResult, type UseMutationOptions, type QueryKey} from '@tanstack/react-query'
import {queryClient} from '@/app/providers/QueryClient'

type MutationFn<TData, TVariables> = (variables: TVariables) => Promise<TData>

interface UseApiMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn' | 'onSuccess'> {
  // Required array of QueryKey prefixes that need invalidation upon success
  invalidationKeys: QueryKey[]
  // Optional additional onSuccess handler (will be called after invalidation)
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void | Promise<void>
}

export function useApiMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: MutationFn<TData, TVariables>,
  options: UseApiMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { invalidationKeys, onSuccess: userOnSuccess, ...mutationOptions } = options

  return useMutation({
    mutationFn,
    ...mutationOptions,
    onSuccess: async (data, variables, context) => {
      // Invalidate affected queries and trigger immediate refetch
      await Promise.all(invalidationKeys.map(key =>
        queryClient.invalidateQueries({
          queryKey: key,
          refetchType: 'all'
        })
      ))

      // Then call user's onSuccess handler if provided
      if (userOnSuccess) {
        await userOnSuccess(data, variables, context)
      }
    },
  })
}
```

### Component Usage

```typescript
'use client'
import {useCreateUser, useUsers} from '@/app/features/users/hooks'

export function UserManagement() {
  const {data: users} = useUsers()
  const createUser = useCreateUser()

  async function handleCreate(email: string) {
    await createUser.mutateAsync({email, role: 'member'})
    // Users list automatically refetches due to invalidateKeys
  }

  return (
    <div>
      {users?.map(renderUser)}
      <Button onClick={() => handleCreate('new@user.com')}>Create</Button>
    </div>
  )
}
```

---

## Optimistic Updates

For instant UI feedback before server response:

```typescript
// features/users/hooks.ts
export function useUpdateUserOptimistic() {
  const queryClient = useQueryClient()

  return useApiMutation({
    mutationFn: ({id, data}: {id: string; data: UpdateUserData}) =>
      updateUser(id, data),

    onMutate: async ({id, data}) => {
      // 1. Cancel outgoing queries to prevent race conditions
      await queryClient.cancelQueries({queryKey: userKeys.detail(id)})

      // 2. Snapshot previous value for rollback
      const previousUser = queryClient.getQueryData(userKeys.detail(id))

      // 3. Optimistically update cache
      queryClient.setQueryData(userKeys.detail(id), (old: User | undefined) =>
        old ? {...old, ...data} : undefined
      )

      // 4. Return context for rollback
      return {previousUser}
    },

    onError: (error, {id}, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(id), context.previousUser)
      }
    },

    onSettled: (data, error, {id}) => {
      // Always refetch after mutation to sync with server
      queryClient.invalidateQueries({queryKey: userKeys.detail(id)})
    },
  })
}
```

### Optimistic Create Example

```typescript
export function useCreateBlogOptimistic() {
  const queryClient = useQueryClient()

  return useApiMutation({
    mutationFn: (data: CreateBlogData) => createBlog(data),

    onMutate: async (data) => {
      await queryClient.cancelQueries({queryKey: blogKeys.all})

      const previousBlogs = queryClient.getQueryData(blogKeys.all)

      // Add optimistic blog with temporary ID
      const optimisticBlog = {
        id: `temp-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData(blogKeys.all, (old: Blog[] | undefined) =>
        old ? [optimisticBlog, ...old] : [optimisticBlog]
      )

      return {previousBlogs}
    },

    onError: (error, data, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(blogKeys.all, context.previousBlogs)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({queryKey: blogKeys.all})
    },
  })
}
```

### Optimistic Delete Example

```typescript
export function useDeleteBlogOptimistic() {
  const queryClient = useQueryClient()

  return useApiMutation({
    mutationFn: (id: string) => deleteBlog(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({queryKey: blogKeys.all})

      const previousBlogs = queryClient.getQueryData(blogKeys.all)

      // Remove from cache immediately
      queryClient.setQueryData(blogKeys.all, (old: Blog[] | undefined) =>
        old ? old.filter(blog => blog.id !== id) : []
      )

      return {previousBlogs}
    },

    onError: (error, id, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(blogKeys.all, context.previousBlogs)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({queryKey: blogKeys.all})
    },
  })
}
```

---

## Infinite Queries

For pagination and infinite scroll:

### Query Setup

```typescript
// features/messages/keys.ts
export const messageKeys = {
  all: ['messages'] as const,
  conversations: () => [...messageKeys.all, 'conversation'] as const,
  conversation: (id: string) => [...messageKeys.conversations(), id] as const,
}

// features/messages/options.ts
export const messageOptions = {
  infiniteList: (conversationId: string) => infiniteQueryOptions({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: ({pageParam}) =>
      fetchMessages(conversationId, {cursor: pageParam}),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  }),
}

// features/messages/hooks.ts
export function useInfiniteMessages(conversationId: string) {
  return useInfiniteQuery(messageOptions.infiniteList(conversationId))
}
```

### Component Usage

```typescript
'use client'
import {useInfiniteMessages} from '@/app/features/messages/hooks'

export function MessageList({conversationId}: {conversationId: string}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMessages(conversationId)

  const messages = data?.pages.flatMap(page => page.messages) ?? []

  return (
    <div>
      {messages.map(renderMessage)}
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  )
}
```

### Infinite Scroll with Intersection Observer

```typescript
'use client'
import {useInfiniteMessages} from '@/app/features/messages/hooks'
import {useEffect, useRef} from 'react'

export function InfiniteMessageList({conversationId}: {conversationId: string}) {
  const {data, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteMessages(conversationId)
  const observerRef = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {threshold: 0.5}
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => observerRef.current?.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const messages = data?.pages.flatMap(page => page.messages) ?? []

  return (
    <div>
      {messages.map(renderMessage)}
      {hasNextPage && <div ref={loadMoreRef} className="h-10" />}
      {isFetchingNextPage && <Spinner />}
    </div>
  )
}
```

---

## Examples by Use Case

### Create with Optimistic UI

```typescript
// Component
const createBlog = useCreateBlogOptimistic()

async function handleCreate() {
  await createBlog.mutateAsync({
    title: 'New Blog',
    content: 'Draft content',
  })
  // UI updates immediately, rolls back if error
}
```

### Update with Optimistic UI

```typescript
// Component
const updateUser = useUpdateUserOptimistic()

async function handleUpdate(userId: string) {
  await updateUser.mutateAsync({
    id: userId,
    data: {name: 'Updated Name'},
  })
  // UI shows change immediately
}
```

### Delete with Optimistic UI

```typescript
// Component
const deleteBlog = useDeleteBlogOptimistic()

async function handleDelete(blogId: string) {
  await deleteBlog.mutateAsync(blogId)
  // Blog disappears immediately from list
}
```

### Infinite Scroll Messages

```typescript
// Component
const {data, fetchNextPage, hasNextPage} = useInfiniteMessages(chatId)
const messages = data?.pages.flatMap(p => p.messages) ?? []

return (
  <>
    {messages.map(renderMessage)}
    {hasNextPage && <Button onClick={() => fetchNextPage()}>Load More</Button>}
  </>
)
```

---

## Anti-Patterns

❌ Direct useMutation:
```typescript
import {useMutation} from '@tanstack/react-query'
const mutation = useMutation({mutationFn: createUser})
```

❌ Manual invalidation in component:
```typescript
const mutation = useMutation({mutationFn: createUser})
await mutation.mutateAsync(data)
queryClient.invalidateQueries(userKeys.all)  // Repetitive
```

❌ Forgetting rollback in optimistic updates:
```typescript
onMutate: async () => {
  queryClient.setQueryData(key, newData)
  // Missing: return context for rollback
}
```

✅ useApiMutation with invalidateKeys:
```typescript
const createUser = useCreateUser()  // Auto-invalidates
await createUser.mutateAsync(data)
```

✅ Optimistic with rollback:
```typescript
onMutate: async (data) => {
  const previous = queryClient.getQueryData(key)
  queryClient.setQueryData(key, optimisticData)
  return {previous}  // For rollback
},
onError: (error, data, context) => {
  queryClient.setQueryData(key, context.previous)
}
```

---

**For data fetching**, see `tanstack-query.md`
