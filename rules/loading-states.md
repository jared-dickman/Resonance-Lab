# Loading States Pattern

**Always show loading and error states for async data.**

## Three-State Pattern

Every async data operation must handle:
- **Loading** - Initial fetch (show full-page spinner or skeleton)
- **Error** - Failed fetch (show error message with retry)
- **Success** - Render data

## UI Components

**Full Page Loading**
- `<Spinner className="size-8" />` - Centered in container
- Reference: `app/components/blog-posts/BlogManagementPage.tsx:71-72`

**Inline Loading**
- `<Spinner className="size-4" />` - In buttons or actions
- Reference: `app/components/ideas/IdeasPage.tsx:317-322`

**Skeleton Loading**
- `<Skeleton className="h-X w-Y" />` - For cards and complex layouts
- Reference: `app/components/billing/BillingPage.tsx:26-35`

**Animated Spinners**
- `animate-spin` from Tailwind for icon spinners
- `<Loader2 className="animate-spin" />` from lucide-react

## TanStack Query Hooks

**Query States**
```typescript
const { data, isLoading, error } = useBlogs()

if (isLoading) return <Spinner data-testid="blogs-loading" />
if (error) return <ErrorMessage error={error} data-testid="blogs-error" />
return <BlogList blogs={data} />
```

**Mutation States**
```typescript
const mutation = useBlogify()

<Button disabled={mutation.isPending}>
  {mutation.isPending ? <Spinner /> : 'Generate'}
</Button>
```

**Pagination Loading**
- Gold standard: `app/components/message/MessageList.tsx:195-200`
- Use `isFetchingNextPage` for "Load More" buttons

## Test IDs

**Naming Convention**
- `{feature}-loading` - Container with loading state
- `{feature}-spinner` - Spinner component itself
- `{feature}-skeleton` - Skeleton placeholder
- `{feature}-error` - Error message container

## Anti-Patterns

❌ Manual `useState` for loading (see `app/components/user-management/ViewUsersModal.tsx`)
- Use feature hooks instead
- Lost caching benefits, duplicate logic

❌ Missing error state with isLoading
- ast-grep rule `query-must-handle-error` enforces this
- Always destructure `error` when using `isLoading`

❌ Direct `useQuery` imports
- Use feature hooks from `app/features/*/hooks.ts`
- Rule: `no-direct-tanstack.yml`

## Gold Standard Examples

**Full-Page Loading**
- `app/components/blog-posts/BlogManagementPage.tsx:71-72`
- `app/components/threads/ThreadList.tsx:15-22`
- `app/components/keywords/KeywordsPage.tsx:440-443`

**Mutation Loading**
- `app/components/ideas/IdeasPage.tsx:317-322` (button states)
- `app/components/message/MessageList.tsx:128-135` (inline)

**Skeleton Loading**
- `app/components/billing/BillingPage.tsx:26-35` (cards)
- `app/components/billing/CurrentPlanCard.tsx:19-37` (dedicated helper)

## Error Handling

**Component-Level**
```typescript
if (error) {
  return (
    <div data-testid="feature-error">
      <AlertCircle className="size-6" />
      <p>{error.message}</p>
    </div>
  )
}
```

**Error Boundaries**
- Global: `app/layout.tsx`
- Component: `app/components/errors/ErrorBoundary.tsx`
- Use for graceful degradation in feature cards
