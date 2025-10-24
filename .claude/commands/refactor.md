---
description: Refactor code following project patterns and best practices
---

$ARGUMENTS

Refactor following project rules:

**TanStack Query:**

- Never import useQuery/useMutation directly in components
- Use feature hooks from `app/features/*/hooks.ts`
- Transform API → View layer with transformers

**Components:**

- Use function declarations, not arrow functions
- Extract shared logic to hooks
- Use cn() for className composition

**Animation:**

- Use constants from `lib/constants/animation.constants.ts`
- Follow timing hierarchy (0.2s → 1.5s)

**TypeScript:**

- Never use `as any`
- Validate with Zod schemas
- Prefer type inference

Run linting checks after refactoring.
