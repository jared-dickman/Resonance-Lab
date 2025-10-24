---
description: Create a new Next.js API route with Zod validation
---

$ARGUMENTS

Create API route in `frontend/app/api/[endpoint]/route.ts`:

1. Import Zod schemas from feature DTOs
2. Validate request body with `.parse()` or `.safeParse()`
3. Handle errors with try/catch
4. Return `Response.json()` with appropriate status
5. Add route to `apiRoutes.ts` (no /api prefix)
6. Export GET/POST/PUT/DELETE handlers as needed

Follow require-zod-validation rule - all POST/PUT must validate.