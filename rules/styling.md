# Styling Standards

## 1. Design System

### Primitive Library

- `app/components/ui/**` defines the shared building blocks. Each file wraps a Radix primitive (Button, Card, etc.) with Tailwind 4 utilities and `class-variance-authority` variants, exposing semantic `data-slot` hooks
  for downstream styling.
- `lib/cn.ts` exports `cn`, the required helper for composing class names across every primitive.

```tsx
import {Button} from '@/app/components/ui/button';

<Button variant="secondary" size="sm">Save</Button>
```

### Layout Shell

- Shell components in `app/components/layout/**` (`AppShellLayout`, `AppShellHeader`, `AppShellNavbar`, `PageHeader`)
  compose the primitives to deliver navigation, headers, and page chrome.
- Icons live in `app/components/icons/**` and are injected into navigation/layout components.
- Feature surfaces (`app/components/pages/**`, `app/components/message/**`, `app/components/threads/**`) wire data into
  the primitives—no alternative component library is introduced.

## 2. Styling Approach

- Tailwind CSS 4 (via `@import "tailwindcss"` in `app/globals.css`) powers all styling. There is no bespoke Tailwind
  config file; theme customization happens through tokens inside `globals.css`.
- `cn` combines consumer classes safely (`clsx` + `tailwind-merge`). Every primitive forwards `className` through `cn`
  so overrides keep Tailwind order intact.
- `class-variance-authority` (`cva`) defines variant matrices such as `buttonVariants`, `alertVariants`, and
  `fieldVariants`, keeping stateful styling declarative.
- Attribute-driven selectors (`data-slot`, `data-state`, `aria-invalid`) are baked into utility strings to target
  sub-elements and states without extra CSS.

✅ Use `cn` for conditional styles:

```tsx
<div className={cn('flex flex-col gap-4', className)}>{children}</div>
```

❌ Avoid template string branching

```tsx
<div className={`rounded-lg ${isUser ? 'bg-primary' : 'bg-muted'}`}>{body}</div>
```

## 3. Component Patterns

- `data-slot` attributes standardize composition. For example, `CardHeader` expects `data-slot="card-header"`, and
  `Field`/`Form` components key off the same attributes to apply nested spacing rules (`has-[>svg]`, `@container/*`
  selectors).
- Forms rely on `app/components/ui/form.tsx`: `FormField` bridges React Hook Form controllers while `FormControl`,
  `FormLabel`, and `FormMessage` synchronize aria attributes and error styling.
- Complex inputs (InputGroup, ButtonGroup, Field) use `cva` orientation variants (`horizontal`, `vertical`,
  `responsive`) instead of ad-hoc layout code, keeping focus, disabled, and invalid states consistent.
- `app/components/ui/sidebar.tsx` packages responsive sidebar behavior (cookie persistence, mobile sheet, collapsible
  icon rail) so layout files only compose exported pieces (`SidebarProvider`, `SidebarInset`, `SidebarTrigger`).

✅ Compose a full form field with shared parts:

```tsx
<FormItem className="grid gap-2">
  <FormLabel>Email</FormLabel>
  <FormControl><Input/></FormControl>
</FormItem>
```

### Button Variants

**First Principle:** Visual hierarchy guides users to high-value actions while maintaining UI clarity.

**Primary (filled)** — Reserve for actions that commit state changes: mutations, server actions, form submissions. The filled background signals consequence and importance. Users should scan any screen and immediately identify what action moves them forward.

**Secondary (bordered, default)** — Use for navigation, filtering, UI controls, and exploratory actions. The transparent background keeps focus on content while maintaining clear interactive affordances. Border color shifts on hover/active reinforce interactivity without visual weight.

**Destructive** — Deletion, removal, irreversible operations. Red signaling prevents accidental data loss.

**Ghost/Link** — Low-emphasis actions like "Cancel" or tertiary navigation. Minimal visual weight.

**Synonyms for familiarity:**
- `default` = `primary` (both filled accent)
- `outline` = `secondary` (both bordered transparent)

**Anti-pattern:** Never override variants with inline `className` color utilities. Use the variant system to maintain consistent visual language across the application. See `HomePage.tsx` and `BillingPage.tsx` for reference implementations.

**Cursor behavior:** All buttons automatically have `cursor-pointer` on interactive states and `cursor-not-allowed` when disabled.

**Icon spacing:** Buttons provide automatic `gap-2` spacing between children. Never add manual margins (`mr-*`, `ml-*`) to icons inside buttons.

❌ `<Button><Icon className="mr-2 size-4" />Text</Button>`
✅ `<Button><Icon className="size-4" />Text</Button>`

## 4. Tokens & Variables

- `app/globals.css` defines OKLCH design tokens for background, surfaces (`--card`, `--sidebar`), brand (`--primary`,
  `--primary-foreground`), status (`--destructive`, `--success`, `--warning`, `--info`), and radii (`--radius`,
  `--radius-lg`, `--radius-xl`).
- `@theme inline` maps those custom properties onto Tailwind token names (`--color-primary`, `--radius-md`,
  `--color-sidebar-primary`), enabling semantic utilities like `bg-primary`, `text-muted-foreground`, `rounded-xl`.
- Dark mode is handled through `@custom-variant dark`, letting components target `.dark` context using Tailwind’s
  variant syntax.
- Spacing and typography largely rely on Tailwind defaults; targeted helpers such as `--spacing(8)` (calendar cell
  sizing) and container queries (`@container/card-header`, `@md/field-group`) ship inside the primitives that need them.

```css
:root { --primary: oklch(0.15 0 0); --primary-foreground: oklch(0.98 0 0); --radius: 0.5rem; }
```

## 5. Layout Conventions

- `app/layout.tsx` wraps authenticated routes with `SidebarProvider`, `SidebarInset`, and `AppShellHeader`, creating a
  `flex flex-col h-screen` canvas with collapsible navigation.
- `AppShellLayout` mirrors the same pattern for granular composition: header slot (`border-b bg-card`), navigation
  widths (`w-60` vs `w-20`), optional aside (`w-[300px]`), and scroll management.
- Page-level components (`HomePage.tsx`, `ThreadsPage.tsx`) adopt Tailwind’s `container` plus explicit width caps (
  `max-w-6xl`, `max-w-7xl`), balanced gaps (`gap-6`), and consistent padding (`p-4`, `p-6`), ensuring uniform rhythm
  across screens.
- Responsiveness leans on Tailwind breakpoints (`md:grid-cols-3`, `max-sm:hidden`) combined with component-defined
  selectors (`group-data-[collapsible=icon]`, `@md/field-group`), so layouts collapse predictably without bespoke media
  queries.

```tsx
<div className="container max-w-7xl mx-auto grid gap-6 p-6"><ThreadList/></div>
```

## 6. Animations

**`slide-in-spring`** — Modals, toasts, sheets, dropdowns (organic spring entrance)
**`magnetic-pull`** — Primary buttons, CTAs (cursor attraction)
**`burst`** — Button clicks, success confirmations (impact feedback)
**`pulse-subtle`** — Loading states, pending actions (attention without distraction)
**`stagger-fade-in`** — List items, cards (sequential reveals, use sparingly)

## 7. Anti-Patterns

- ❌ Hardcoded Tailwind palette utilities remain in feature code—`text-red-500`. Replace them with semantic tokens (e.g.,
  `text-destructive`, `bg-destructive/10`) defined in `globals.css`.
- ❌ Template-string class branching that sidestep `cn`/`cva`, leading to inconsistent merging and harder refactors.
- ❌ Do not introduce module-based styling; stick with Tailwind utilities and tokens.

✅ Follow the tokenized status pattern already used in `app/components/ui/form.tsx`:

```tsx
<p className="text-destructive text-sm">{body}</p>
```

## 7. Rules

1. Pull UI atoms from `app/components/ui/**`; extend via `className`, `cva` variants, or `data-slot` selectors instead
   of creating new primitives.
2. Wrap all conditional class logic in `cn(...)` (`lib/cn.ts`) to keep Tailwind mergers stable.
3. Use semantic utility tokens (`bg-card`, `text-muted-foreground`, `text-destructive`, `bg-primary/10`, `shadow-xs`)
   rather than raw palette classes.
4. Add or adjust design tokens only inside `app/globals.css`, keeping the `@theme inline` mappings up to date.
5. Compose authenticated pages within the established shell (`SidebarProvider`, `SidebarInset`, `AppShellLayout`,
   `AppShellHeader`) to preserve navigation behavior.
6. Structure page bodies with `container` width caps, consistent padding/gaps, and responsive patterns mirrored from
   `HomePage.tsx`/`ThreadsPage.tsx`.
7. Build forms and composite inputs with the shared helpers (`Form`, `Field`, `InputGroup`, `ButtonGroup`) so aria
   wiring and state styling stay aligned.
8. Do not add new `.module.css` files or inline style hacks; rely on Tailwind utilities, design tokens, and component
   variants for visual changes.
