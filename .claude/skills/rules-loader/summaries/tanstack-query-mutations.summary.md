# TanStack Query - Mutations & Updates

## Core Pattern
Use `useApiMutation` wrapper with auto-invalidation. Optimistic updates for instant UI feedback.

## Basic Mutations
```ts
// features/users/hooks.ts
export function useCreateUser() {
  return useApiMutation({
    mutationFn: createUser,
    invalidateKeys: [userKeys.all],  // Auto-refetch
  })
}
```

## Component Usage
```tsx
const createUser = useCreateUser()
await createUser.mutateAsync({email, role: 'member'})
// Lists auto-refetch via invalidateKeys
```

## Optimistic Updates
```ts
export function useUpdateUserOptimistic() {
  return useApiMutation({
    mutationFn: updateUser,
    onMutate: async ({id, data}) => {
      await queryClient.cancelQueries({queryKey: userKeys.detail(id)})
      const previousUser = queryClient.getQueryData(userKeys.detail(id))
      queryClient.setQueryData(userKeys.detail(id), (old) => ({...old, ...data}))
      return {previousUser}  // For rollback
    },
    onError: (error, {id}, context) => {
      queryClient.setQueryData(userKeys.detail(id), context.previousUser)
    },
    onSettled: (data, error, {id}) => {
      queryClient.invalidateQueries({queryKey: userKeys.detail(id)})
    },
  })
}
```

## Infinite Queries
```ts
// options.ts
export const messageOptions = {
  infiniteList: (conversationId: string) => infiniteQueryOptions({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: ({pageParam}) => fetchMessages(conversationId, {cursor: pageParam}),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  }),
}

// Component
const {data, fetchNextPage, hasNextPage} = useInfiniteMessages(conversationId)
const messages = data?.pages.flatMap(page => page.messages) ?? []
```

## Optimistic Patterns
**Create:** Add temporary ID, prepend to list
**Update:** Merge changes into cached object
**Delete:** Filter out from cached list
**Always:** Cancel queries, snapshot previous, rollback on error

## Anti-Patterns
- ❌ Direct `useMutation` import
- ❌ Manual `queryClient.invalidateQueries` in components
- ❌ No rollback in optimistic updates

## Validation
- [ ] Using `useApiMutation` wrapper
- [ ] `invalidateKeys` configured
- [ ] Optimistic updates return context for rollback
- [ ] `onError` restores previous state

## Read Full File If
Implementing mutations, optimistic UI, or infinite scroll.