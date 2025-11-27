# Loading States Pattern - Summary

**Core Principle:** Every async data operation must handle three states: Loading, Error, Success.

## UI Components

**Spinners:**
- Full page: `<Spinner className="size-8" />` (centered)
- Inline: `<Spinner className="size-4" />` (buttons, actions)
- Animated: `<Loader2 className="animate-spin" />` from lucide-react

**Skeleton:**
- `<Skeleton className="h-X w-Y" />` for cards and complex layouts
- Example: `app/components/billing/BillingPage.tsx:26-35`

## TanStack Query Pattern

**Queries:**
```typescript
const { data, isLoading, error } = useBlogs()
if (isLoading) return <Spinner data-testid="blogs-loading" />
if (error) return <ErrorMessage error={error} data-testid="blogs-error" />
return <BlogList blogs={data} />
```

**Mutations:**
```typescript
const mutation = useBlogify()
<Button disabled={mutation.isPending}>
  {mutation.isPending ? <Spinner /> : 'Generate'}
</Button>
```

**Pagination:**
- Use `isFetchingNextPage` for "Load More" buttons
- Gold standard: `app/components/message/MessageList.tsx:195-200`

## Test IDs

- `{feature}-loading` - Container with loading state
- `{feature}-spinner` - Spinner component
- `{feature}-skeleton` - Skeleton placeholder
- `{feature}-error` - Error message container

## Critical Anti-Patterns

❌ **Manual useState for loading** - Use feature hooks instead (loses caching)
❌ **Missing error state with isLoading** - ast-grep rule `query-must-handle-error` enforces
❌ **Direct useQuery imports** - Use feature hooks from `app/features/*/hooks.ts`

## When to Read Full File

- Implementing new async features
- Adding error boundaries
- Creating skeleton loading states
- Debugging loading state bugs
