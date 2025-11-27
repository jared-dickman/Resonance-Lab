# Type Mappings: DB → DTO

Complete reference for Drizzle → Zod type transformations.

## Primitive Types

### Text/String

**DB**:
```typescript
name: text('name')
```

**Transformer**:
```typescript
name: record.name
```

**DTO**:
```typescript
name: z.string()
```

### Integer

**DB**:
```typescript
wordCount: integer('word_count')
```

**Transformer**:
```typescript
wordCount: record.wordCount ?? null
```

**DTO**:
```typescript
wordCount: z.number().nullable()
```

**Additional validation**:
- `.int()` - enforce integer
- `.nonnegative()` - >= 0
- `.positive()` - > 0

### Boolean

**DB**:
```typescript
cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false)
```

**Transformer**:
```typescript
cancelAtPeriodEnd: record.cancelAtPeriodEnd
```

**DTO**:
```typescript
cancelAtPeriodEnd: z.boolean()
```

## Special Types

### UUID

**DB**:
```typescript
id: uuid('id').primaryKey().defaultRandom()
```

**Transformer**:
```typescript
id: record.id
```

**DTO**:
```typescript
id: z.uuid()
```

**Note**: Drizzle returns UUID as string, Zod validates format

### Timestamp → ISO String

**DB**:
```typescript
createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
```

**Transformer**:
```typescript
createdAt: record.createdAt ? record.createdAt.toISOString() : new Date().toISOString()
```

**DTO**:
```typescript
createdAt: z.string()
```

**Alternative (stricter)**:
```typescript
createdAt: z.string().datetime()
```

### Timestamp (Nullable)

**DB**:
```typescript
deletedAt: timestamp('deleted_at', { withTimezone: true })
```

**Transformer**:
```typescript
deletedAt: record.deletedAt ? record.deletedAt.toISOString() : null
```

**DTO**:
```typescript
deletedAt: z.string().nullable()
```

## Complex Types

### JSONB → Structured Schema

**DB**:
```typescript
draftData: jsonb('partial_draft_data')
```

**Transformer (WRONG)**:
```typescript
draftData: record.draftData as any  // ❌ Unsafe
```

**Transformer (RIGHT)**:
```typescript
draftData: partialDraftDataSchema.parse(record.draftData)  // ✅ Validated
```

**DTO**:
```typescript
partialDraftData: z.object({
  pillar: partialPillarDraftSchema.optional(),
  clusters: partialClusterDraftSchema.optional(),
}).optional()
```

### JSONB → Generic Record

**DB**:
```typescript
metadata: jsonb('metadata')
```

**Transformer**:
```typescript
metadata: record.metadata as Record<string, unknown>
```

**DTO**:
```typescript
metadata: z.record(z.string(), z.unknown()).optional()
```

### Array (Text)

**DB**:
```typescript
commonUserQuestions: text('common_user_questions').array().default(sql`ARRAY[]::text[]`)
```

**Transformer**:
```typescript
commonUserQuestions: record.commonUserQuestions ?? []
```

**DTO**:
```typescript
commonUserQuestions: z.array(z.string())
```

**Note**: DB defaults to empty array, transformer preserves, DTO validates

## Enums

### PgEnum → Zod Enum

**Constants**:
```typescript
export const BLOG_POST_STATUSES = ['idea', 'draft', 'published'] as const
```

**DB**:
```typescript
export const blogStatusEnum = pgEnum('blog_status', BLOG_POST_STATUSES)
// ...
status: blogStatusEnum('status').default('idea')
```

**Transformer**:
```typescript
status: record.status as BlogPostStatus
```

**DTO**:
```typescript
export const blogPostStatusSchema = z.enum(BLOG_POST_STATUSES)
// ...
status: blogPostStatusSchema
```

**Pattern**: Share constant array between DB and DTO, cast in transformer

## Nullability Rules

### DB Nullable (default)

**DB**:
```typescript
topic: text('topic')  // No .notNull() = nullable
```

**DTO**:
```typescript
topic: z.string().nullable()
```

### DB Non-Nullable

**DB**:
```typescript
title: text('title').notNull()
```

**DTO**:
```typescript
title: z.string()
```

### DB Non-Nullable with Default

**DB**:
```typescript
status: blogStatusEnum('status').default('idea')
```

**DTO**:
```typescript
status: blogPostStatusSchema  // Required in responses
```

**Note**: DB default applies on INSERT, DTO validates response always includes it

### Optional vs Nullable

**`.optional()`**: Field can be omitted from object
```typescript
{ }  // Valid if field is optional()
```

**`.nullable()`**: Field must exist but can be null
```typescript
{ field: null }  // Valid if field is nullable()
{ }  // Invalid - field required
```

**Common mistake**: Using `.optional()` when DB column is nullable but always returned

## Type Matrix Quick Reference

| DB Type | Transformer | DTO Zod Schema |
|---------|-------------|----------------|
| `text()` | `record.field` | `z.string()` |
| `text().nullable()` | `record.field ?? null` | `z.string().nullable()` |
| `integer()` | `record.field ?? null` | `z.number().nullable()` |
| `integer().notNull()` | `record.field` | `z.number()` |
| `boolean()` | `record.field` | `z.boolean()` |
| `uuid()` | `record.field` | `z.uuid()` |
| `timestamp()` | `record.field ? record.field.toISOString() : null` | `z.string().nullable()` |
| `timestamp().notNull()` | `record.field.toISOString()` | `z.string()` |
| `jsonb()` | `schema.parse(record.field)` | `z.object({...})` |
| `text().array()` | `record.field ?? []` | `z.array(z.string())` |
| `pgEnum()` | `record.field as EnumType` | `z.enum(CONSTANTS)` |