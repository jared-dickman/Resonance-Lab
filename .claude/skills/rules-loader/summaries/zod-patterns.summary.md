# Zod Patterns Summary

## Common Schema Patterns

**API Request Body:**
```typescript
z.object({
  email: z.email(),
  name: z.string().min(1),
  companyId: z.uuid(),
})
```

**Query Parameters:**
```typescript
z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
```

**Discriminated Union:**
```typescript
z.discriminatedUnion('type', [
  z.object({ type: z.literal('click'), elementId: z.string() }),
  z.object({ type: z.literal('submit'), formData: z.record(z.string()) }),
])
```

**Transforms:**
```typescript
z.string().transform(str => str.split(',').map(s => s.trim()))
```

**Custom Validation:**
```typescript
z.string().refine(
  (val) => val.length >= 8 && /[A-Z]/.test(val),
  { message: 'Error message' }
)
```

 ## Schema Strictness

**Strict (API security - reject unknown keys):**
```typescript
z.object({
  email: z.string(),
  password: z.string(),
}).strict() // Rejects { email, password, maliciousKey }
```

**Loose (allow additional keys):**
```typescript
z.object({
  required: z.string(),
  optional: z.string().optional(),
}).loose() // Allows { required, optional, extraKey }
// Note: .passthrough() is deprecated, use .loose() instead
```

**When to use:**
- `.strict()`: API request validation (security-critical)
- `.loose()`: Internal validation where extra fields are acceptable
- Default (no modifier): Strips unknown keys silently

## Error Handling

**SafeParse (client-side):**
```typescript
const result = schema.safeParse(data)
if (!result.success) return { errors: result.error.issues }
```

**API Routes (use helper):**
```typescript
const result = await validateRequestBody(request, schema)
if (!result.success) return result.response
```

## When to Read Full File

- Building complex discriminated unions
- Need transformation examples
- Custom refine patterns required
