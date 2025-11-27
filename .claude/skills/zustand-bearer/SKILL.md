---
name: zustand-bearer
description: Create production-ready Zustand stores with LogRocket tracking, TypeScript safety, and middleware patterns
auto_trigger: false
keywords: [zustand, store, state management, create store, middleware]
---

# Zustand Bearer

Creates type-safe Zustand stores following project patterns with automatic LogRocket integration.

## Workflow

### Gather Requirements
Ask user:
- Store name and purpose
- State shape (primitives, objects, arrays)
- Actions needed (setters, computed values, async operations)
- Middleware requirements (persist, devtools, immer)

### Create Store File
Location: `app/stores/{feature}-store.ts`

Pattern:
```typescript
import {create} from 'zustand'
import {logRocketMiddleware} from '@/app/utils/zustand-logrocket-middleware'

interface ExampleState {
  count: number
  user: User | null
  increment: () => void
  setUser: (user: User) => void
  reset: () => void
}

const initialState = {
  count: 0,
  user: null,
}

export const useExampleStore = create<ExampleState>()(
  logRocketMiddleware(
    (set, get) => ({
      ...initialState,
      increment: () => set((state) => ({count: state.count + 1})),
      setUser: (user) => set({user}),
      reset: () => set(initialState),
    }),
    'ExampleStore'
  )
)
```

### Add Persist Middleware (if needed)
```typescript
import {persist} from 'zustand/middleware'

export const useExampleStore = create<ExampleState>()(
  logRocketMiddleware(
    persist(
      (set, get) => ({...}),
      {name: 'example-storage'}
    ),
    'ExampleStore'
  )
)
```

### Create Selectors (for large stores)
```typescript
export const selectCount = (state: ExampleState) => state.count
export const selectUser = (state: ExampleState) => state.user

// Usage: const count = useExampleStore(selectCount)
```

### Validate
- TypeScript compiles without errors
- Store exports match naming convention
- LogRocket middleware applied correctly
- No direct mutations (use set/get only)

## Anti-Patterns

❌ Mutating state directly
```typescript
increment: () => { state.count++ }
```

✅ Use set function
```typescript
increment: () => set((state) => ({count: state.count + 1}))
```

❌ Async without error handling
```typescript
fetchUser: async () => {
  const user = await api.getUser()
  set({user})
}
```

✅ Handle errors properly
```typescript
fetchUser: async () => {
  try {
    const user = await api.getUser()
    set({user, error: null})
  } catch (error) {
    errorTracker.captureException(error, {service: 'user-store'})
    set({error: error.message})
  }
}
```

## References

- `app/utils/zustand-logrocket-middleware.ts` - LogRocket integration
- `app/utils/zustand-logrocket-middleware.example.ts` - Usage patterns
