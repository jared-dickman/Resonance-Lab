# Next.js 15 Rules

## Core Pattern
Server/client separation with external server actions. No inline server actions. No `*Client` file suffixes.

## Server Actions (Always External)
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

**Structure:** `actions/auth/login.ts`, `actions/user/update-profile.ts`, `actions/messages/send-message.ts`

## File Naming
Named after export: `IdeasPage.tsx`, `DashboardPage.tsx` - NO `*Client` suffixes

```tsx
// app/components/ideas/IdeasPage.tsx
"use client"
export function IdeasPage() { ... }

// app/ideas/page.tsx
import {IdeasPage} from '@/app/components/ideas/IdeasPage'
export default function page() { return <ProtectedRoute><IdeasPage /></ProtectedRoute> }
```

## Data Fetching

**Server components for initial:**
```tsx
async function page() {
  const userData = await getUserData()
  return <ProtectedRoute><DashboardPage initialData={userData} /></ProtectedRoute>
}
```

**Client for interactivity:**
```tsx
"use client"
export function DashboardPage({ initialData }: Props) {
  const { data } = useUser(initialData.id, { initialData })
  return <div>{/* content */}</div>
}
```

## API Routes
**Structure:** `app/api/auth/[...nextauth]/route.ts`, `app/api/user/[id]/route.ts`, `app/api/messages/route.ts`

```tsx
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ data: result })
}
```

**Constants:** Use `apiRoutes` from `app/config/apiRoutes.ts` - never hardcode `/api/...` paths

## Anti-Patterns
- ❌ Inline server actions, `*Client.tsx` suffixes, hardcoded `/api/...` paths, missing `"use server"`/`"use client"` directives

## Validation
- [ ] Server actions in `actions/`, no `*Client` suffixes, `apiRoutes` constants used, proper directives

## Read Full File If
File is concise. Reference for Next.js patterns and organization.