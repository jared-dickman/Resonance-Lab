# Component Architecture

## Core Pattern
Function components with Radix UI primitives, Tailwind, and CVA. Never install alternative UI libraries.

## Component Structure
```tsx
'use client'

export function BlogPage() {
  const {data} = useBlogPosts()  // 1. Hooks
  const filtered = filterBlogs(data, query)  // 2. Computed
  const onDelete = useCallback(async (id) => await deleteBlog(id), [])  // 3. Handlers
  return <div>{renderContent()}</div>  // 4. JSX
  function renderContent() { return <div>{filtered.map(renderPost)}</div> }  // 5. Helpers
}
```

## UI & Icons
```tsx
import {Button} from '@/app/components/ui/button'
import {Form, FormField} from '@/app/components/ui/form'
import {Icon, Icons} from '@/app/components/icons'
<Icon name={Icons.Home} />

import {Plus} from 'lucide-react'
<Button><Plus className="size-4" />Create</Button>
```

## Forms
```tsx
import {useForm} from 'react-hook-form'
const form = useForm({defaultValues: {email: ''}})
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="email"
      render={({field}) => <FormControl><Input {...field} /></FormControl>} />
  </form>
</Form>
```

## Context (Page State Only)
```tsx
const PageNameContext = createContext<State | null>(null)
export function useSelection() {
  const ctx = useContext(PageNameContext)
  if (!ctx) throw new Error('useSelection requires PageNameProvider')
  return ctx
}
```

## Performance
```tsx
export const List = memo(function List({items}: Props) { /* ... */ })
const Modal = lazy(() => import('./Modal').then(m => ({default: m.Modal})))
const filtered = useMemo(() => items.filter(i => i.published), [items])
const onClick = useCallback(() => save(), [save])
```

## Styling & Features
```tsx
import {cn} from '@/app/utils/cn'
<div className={cn('rounded-lg p-4', isError && 'bg-destructive', className)} />

import {useCompanies, useCreateCompany} from '@/app/features/companies/hooks'
const {data: companies} = useCompanies()
```

## State Management
- Local: `useState`, Forms: React Hook Form, Page-specific: React Context
- Global UI: Zustand (`app/stores/`), Server: TanStack Query via feature hooks, Session: `useSession`

## Anti-Patterns
- ❌ Arrow function components (`const C = () => {}`), alternative UI libs (@mui), inline styles/CSS modules, direct `useQuery`/`fetch`, template literals for className, `*Client.tsx` suffix

## Validation
- [ ] Function keyword, `@/app/components/ui/*` imports, feature hooks (not direct TanStack), `cn()` for classes, `data-testid` on testable elements

## Read Full File If
Working on component architecture, forms, or performance optimization.