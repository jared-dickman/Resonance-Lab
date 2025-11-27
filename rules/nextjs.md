# Next.js 15 Rules

## Route Protection

**ALL page routes MUST use `<ProtectedRoute>` wrapper** (except `/login` and `/auth/error`). Unprotected routes are a critical security vulnerability.

```tsx
export default async function page() {
  return <ProtectedRoute><YourPage /></ProtectedRoute>
}
```

## Server/Client Separation

### NO Inline Server Actions

Keep server actions in separate files under `actions/`:

```tsx
// actions/logout.ts
"use server"
export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}

// components/LogoutButton.tsx
"use client"
import {logoutAction} from "@/actions/logout"
export function LogoutButton() {
  return <form action={logoutAction}><button>Sign Out</button></form>
}
```

## File Organization

### Naming Conventions

**Components:**
- Files named after their export: `IdeasPage.tsx`, `DashboardPage.tsx`
- NO `*Client` suffixes - `"use client"` directive is sufficient

```tsx
// app/components/ideas/IdeasPage.tsx
"use client"

export function IdeasPage() { ... }

// app/ideas/page.tsx
import {IdeasPage} from '@/app/components/ideas/IdeasPage'
import {ProtectedRoute} from 'app/components/ProtectedRoute'

export default function page() { return <ProtectedRoute><IdeasPage /></ProtectedRoute> }
```

### Server Actions

Keep all server actions in the `actions/` directory:

```
actions/
  auth/
    login.ts
    logout.ts
    register.ts
  user/
    update-profile.ts
    delete-account.ts
  messages/
    send-message.ts
    delete-message.ts
```


## Data Fetching Patterns

### Server Components for Initial Data

```tsx
// app/dashboard/page.tsx
import {DashboardPage} from '@/app/components/dashboard/DashboardPage'

async function page() {
  const userData = await getUserData()
  return <ProtectedRoute><DashboardPage initialData={userData} /></ProtectedRoute>
}
```

### Client Components for Interactivity

```tsx
// app/components/dashboard/DashboardPage.tsx
"use client"
export function DashboardPage({ initialData }: Props) {
  const { data } = useUser(initialData.id, { initialData })
  return <div>{/* content */}</div>
}
```


## Route Handlers

### API Route Structure

Organize API routes by feature:

```
app/api/
  auth/
    [...nextauth]/
      route.ts
  user/
    profile/
      route.ts
    [id]/
      route.ts
  messages/
    route.ts
    [id]/
      route.ts
```

### Route Handler Patterns

**Auth:** Use `requireAuthForRoute()` or `authenticateApiRequest()` from `app/utils/api-auth.ts`
**Validation:** Use `validateQueryParams()`, `validateRequestBody()`, `validateParams()` from `app/utils/api-validation.ts`
**Errors:** Use `handleApiError()` from `app/utils/api-errors.ts` or RFC 7807 `buildProblemDetailFromZod()` for validation
**Response:** Use `createValidatedResponse()` from `app/utils/api-response.ts` for type-safe responses

**Examples:** `app/api/blog-posts/route.ts`, `app/api/users/route.ts`, `app/api/threads/route.ts`

### API Route Constants

Always use constants `apiRoutes` from `app/config/apiRoutes.ts` - never hardcode `/api/...` paths.
