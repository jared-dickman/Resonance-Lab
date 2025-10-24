---
description: Scaffold a complete feature with TanStack Query following BlogzillaV5 pattern
---

$ARGUMENTS

Create a complete feature module in `frontend/app/features/[feature-name]/` with:

1. **keys.ts** - Hierarchical query key factory
2. **queries.ts** - Raw API calls via apiClient
3. **options.ts** - Query/mutation configuration
4. **hooks.ts** - Feature hooks (useApiQuery/useApiMutation wrappers)
5. **dto/*.schema.ts** - Zod request/response schemas
6. **transformers/*.transformer.ts** - API → View transformations

Update:
- `frontend/app/config/apiRoutes.ts` - Add route (no /api prefix)
- Run `npx ast-grep scan` to verify compliance

Follow TANSTACK-IMPLEMENTATION.md and ensure zero violations.
