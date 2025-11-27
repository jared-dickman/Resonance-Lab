# Styling Standards

## Core Pattern
Tailwind CSS 4 + Radix UI + CVA. Tokens in `globals.css`. Use `cn()` for conditional classes.

## Design System
```tsx
import {Button} from '@/app/components/ui/button'
import {cn} from '@/app/utils/cn'

<Button variant="secondary" size="sm">Save</Button>
```

**Primitives:** `app/components/ui/**` (Radix + Tailwind + CVA)
**Tokens:** `app/globals.css` (OKLCH tokens via `@theme inline`)

## Conditional Classes
```tsx
// ✅ Use cn()
<div className={cn('flex flex-col gap-4', isError && 'bg-destructive', className)} />

// ❌ No template strings
<div className={`rounded-lg ${isUser ? 'bg-primary' : 'bg-muted'}`} />
```

## Semantic Tokens
```tsx
// ✅ Semantic
<p className="text-destructive bg-card shadow-xs" />

// ❌ Raw palette
<p className="text-red-500 bg-white shadow-sm" />
```

## Design Tokens
```css
/* globals.css */
:root {
  --primary: oklch(0.15 0 0);
  --primary-foreground: oklch(0.98 0 0);
  --radius: 0.5rem;
}
```

**Available tokens:** `bg-primary`, `text-muted-foreground`, `rounded-xl`, `bg-destructive/10`, `shadow-xs`

## Component Patterns
```tsx
// Forms
<FormItem className="grid gap-2">
  <FormLabel>Email</FormLabel>
  <FormControl><Input/></FormControl>
</FormItem>

// Layout
<div className="container max-w-7xl mx-auto grid gap-6 p-6">
  <ThreadList/>
</div>
```

## Rules
1. Pull UI from `app/components/ui/**`
2. Wrap conditional logic in `cn(...)`
3. Use semantic tokens, not raw colors
4. Add tokens only in `globals.css`
5. No `.module.css` or inline styles

## Anti-Patterns
- ❌ Hardcoded palette: `text-red-500`
- ❌ Template strings instead of `cn()`
- ❌ Module CSS or inline styles

## Validation
- [ ] Using `cn()` for conditional classes
- [ ] Semantic tokens instead of raw colors
- [ ] Importing from `app/components/ui/**`

## Read Full File If
Working on design system or complex layouts.