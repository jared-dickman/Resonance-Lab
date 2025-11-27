# Zod Validation Patterns

## Common Patterns

### API Request Body
```typescript
const bodySchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  url: z.url().optional(),
  companyId: z.uuid(),
})
```

### Query Parameters
```typescript
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  filter: z.string().optional(),
})
```

### Discriminated Union
```typescript
const eventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('click'), elementId: z.string() }),
  z.object({ type: z.literal('submit'), formData: z.record(z.string()) }),
])
```

### Transform & Refine
```typescript
// Comma-separated to array
const tagsSchema = z.string().transform(str => str.split(',').map(s => s.trim()))

// Custom validation
const passwordSchema = z.string().refine(
  (val) => val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val),
  { message: 'Password must be 8+ chars with uppercase and number' }
)
```

## Error Handling

### SafeParse (Recommended)
```typescript
const result = schema.safeParse(data)
if (!result.success) {
  // Handle validation errors
  return { errors: result.error.issues }
}
// Use result.data (type-safe)
```

### Try-Catch (API Routes)
```typescript
import { validateRequestBody } from '@/app/utils/api-validation'

const result = await validateRequestBody(request, schema)
if (!result.success) return result.response
// Use result.data
```

## References

- Zod docs: https://zod.dev
- Validation helpers: `app/utils/api-validation.ts`
