# Component Architecture

## Primitives (Radix + Tailwind + CVA)

```tsx
import {Button} from '@/app/components/ui/button'
import {Form, FormField} from '@/app/components/ui/form'
```

Never install alternative UI libraries.

## Function Keyword & Structure

```tsx
'use client'

// Module-level pure utilities
function filterBlogs(blogs: BlogPost[], query: string) {
  return blogs.filter(b => b.title.includes(query))
}

export function BlogPage() {
  const {data} = useBlogPosts()  // 1. Hooks
  const filtered = filterBlogs(data, query)  // 2. Computed
  const onDelete = useCallback(async (id) => await deleteBlog(id), [])  // 3. Handlers
  return <div>{renderContent()}</div>  // 4. JSX
  function renderContent() { return <div>{filtered.map(renderPost)}</div> }  // 5. Helpers
}
```

**Exports**: `export function FeaturePage()` | `export async function ServerComponent()`

❌ `const Component = () => {}`

## Icons

```tsx
import {Icon, Icons} from '@/app/components/icons';
<Icon name={Icons.Home} />

import {Plus} from 'lucide-react';
<Button><Plus className="size-4" />Create</Button>
```

**Button icon spacing**: Never add manual margins (`mr-*`, `ml-*`) to icons inside buttons. The Button component provides automatic `gap-2` spacing.

❌ `<Button><Icon className="mr-2 size-4" />Text</Button>`
✅ `<Button><Icon className="size-4" />Text</Button>`

## Tooltips

```tsx
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/app/components/ui/tooltip'

<TooltipProvider>
  <Tooltip delayDuration={1000}>
    <TooltipTrigger asChild><Button>Hover me</Button></TooltipTrigger>
    <TooltipContent><p>Helpful explanation</p></TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Delay**: Set `delayDuration` on `<Tooltip>` component (not TooltipProvider). Default is 700ms.

## Forms

```tsx
import {useForm} from 'react-hook-form'
import {Form, FormField, FormControl} from '@/app/components/ui/form'

const form = useForm({defaultValues: {email: ''}});
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="email"
      render={({field}) => <FormControl><Input {...field} /></FormControl>} />
  </form>
</Form>
```

## Context Providers
Page state only, not global or component state. 

```tsx
const PageNameContext = createContext<State | null>(null)

export function PageNameProvider({children}: Props) {
  const [selected, setSelected] = useState<string[]>([])
  return <PageNameContext.Provider value={{selected, setSelected}}>{children}</PageNameContext.Provider>
}

export function useSelection() {
  const ctx = useContext(PageNameContext)
  if (!ctx) throw new Error('useSelection requires PageNameProvider')
  return ctx
}
```

## Performance

```tsx
// Memo
export const List = memo(function List({items}: Props) {
  return <div>{items.map(renderItem)}</div>
})

// Lazy
const Modal = lazy(() => import('./Modal').then(m => ({default: m.Modal})));
<Suspense fallback={<Spinner />}><Modal /></Suspense>

// Memoize values/callbacks
const filtered = useMemo(() => items.filter(i => i.published), [items])
const onClick = useCallback(() => save(), [save])
```

## Styling

```tsx
import {cn} from '@/app/utils/cn';
<div className={cn('rounded-lg p-4', isError && 'bg-destructive', className)} />
```

❌ `className={\`...\`}`

## Feature Integration

```tsx
import {useCompanies, useCreateCompany} from '@/app/features/companies/hooks'

const {data: companies} = useCompanies()
const createCompany = useCreateCompany()
```

❌ Direct TanStack or API calls

## Server Actions

```tsx
'use client'
import {addUser} from '@/app/actions/user-management/add-user'

async function handleSubmit(email: string) {
  await addUser(email, companyId, 'member')
}
```

## Testing

```tsx
<Button data-testid="create-button">Create</Button>
<div data-testid="blog-list">{posts.map(renderPost)}</div>
```

## State Management

- **Local**: `useState`
- **Forms**: React Hook Form- **Specific Page**: React Context
- **Global UI**: Zustand (`app/stores/`)
- **Server**: TanStack Query via feature hooks
- **Session**: `useSession`

## Anti-Patterns

❌ Arrow: `const C = () => {}`
❌ Alt UI: `@mui`, Chakra
❌ Inline styles/CSS modules
❌ Direct: `useQuery`, `fetch`
❌ Template: `className={\`\`}`
❌ Suffix: `*Client.tsx`

✅ Function, feature hooks, Radix, cn
