# Edge Cases: Nullable, Optional, Defaults

Handle complex nullability scenarios and default values.

## Nullable vs Optional

### Database Perspective

**Nullable** (default in Drizzle):
```typescript
topic: text('topic')  // Can be NULL in DB
```

**Non-Nullable**:
```typescript
title: text('title').notNull()  // Cannot be NULL
```

**With Default**:
```typescript
status: blogStatusEnum('status').default('idea')  // NULL on INSERT → 'idea'
```

### DTO Perspective

**`.nullable()`**: Field exists but value can be null
```typescript
topic: z.string().nullable()

// Valid responses:
{ topic: "SEO Strategy" }
{ topic: null }

// Invalid:
{ }  // Missing field
```

**`.optional()`**: Field can be omitted entirely
```typescript
metadata: z.record(z.string(), z.unknown()).optional()

// Valid responses:
{ metadata: { key: "value" } }
{ }  // Field omitted

// Invalid:
{ metadata: null }  // Present but null (unless combined with .nullable())
```

**`.nullable().optional()`**: Field can be omitted OR null
```typescript
summary: z.string().nullable().optional()

// All valid:
{ summary: "Content summary" }
{ summary: null }
{ }  // Omitted
```

## Common Scenarios

### Scenario 1: DB Nullable, Always Returned

**DB**:
```typescript
topic: text('topic')  // Nullable
```

**Repository SELECT always returns field**:
```sql
SELECT * FROM blog_posts  -- Returns all columns including NULL
```

**Transformer**:
```typescript
topic: record.topic ?? null  // Explicit null for missing values
```

**DTO**:
```typescript
topic: z.string().nullable()  // ✅ Right - field always present, can be null
```

**NOT**:
```typescript
topic: z.string().optional()  // ❌ Wrong - field never omitted
```

### Scenario 2: DB Non-Nullable with Default

**DB**:
```typescript
status: blogStatusEnum('status').default('idea')
```

**On INSERT**: If omitted, DB sets to 'idea'
**On SELECT**: Always returns a value

**DTO**:
```typescript
status: blogPostStatusSchema  // ✅ Right - required, never null
```

**NOT**:
```typescript
status: blogPostStatusSchema.optional()  // ❌ Wrong - always present
```

### Scenario 3: Audit Fields (Always Present)

**DB**:
```typescript
createdAt: timestamp('created_at').notNull().defaultNow()
updatedAt: timestamp('updated_at').notNull().defaultNow()
deletedAt: timestamp('deleted_at')  // Nullable for soft delete
```

**DTO**:
```typescript
createdAt: z.string()  // Required - DB defaults on INSERT
updatedAt: z.string()  // Required - DB defaults on INSERT
deletedAt: z.string().nullable()  // Nullable - only set when soft deleted
```

### Scenario 4: Conditional Fields (Partial Responses)

**Some endpoints return subset of fields**:

**Full DTO**:
```typescript
const blogPostSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  finalBlog: z.string().nullable(),  // Large field
})
```

**List DTO** (excludes large fields):
```typescript
const blogPostListItemSchema = blogPostSchema.omit({
  finalBlog: true,  // Omitted for performance
})
```

**Pattern**: Use `.omit()` or `.pick()` to create variants, not `.optional()`

### Scenario 5: JSONB with Partial Structure

**DB**:
```typescript
draftData: jsonb('partial_draft_data')  // Nullable, structure varies by phase
```

**DTO (Pillar Wizard)**:
```typescript
partialDraftData: z.object({
  pillar: partialPillarDraftSchema.optional(),  // ✅ Right - may not exist yet
  clusters: partialClusterDraftSchema.optional(),  // ✅ Right - may not exist yet
}).optional()  // ✅ Right - entire object can be null
```

**Reasoning**: Field can be null (not yet generated) OR present with partial structure

## Default Value Handling

### DB Defaults Don't Require DTO Defaults

**DB**:
```typescript
commonUserQuestions: text('common_user_questions').array().default(sql`ARRAY[]::text[]`)
```

**DTO**:
```typescript
commonUserQuestions: z.array(z.string())  // No .default([]) needed
```

**Why**: DTO validates response from DB, DB guarantees array exists

### Transformer Provides Defaults

**DB allows NULL but business logic wants empty array**:

**DB**:
```typescript
keywords: text('keywords').array()  // Nullable
```

**Transformer**:
```typescript
keywords: record.keywords ?? []  // Default to empty array
```

**DTO**:
```typescript
keywords: z.array(z.string())  // Required array (never null after transform)
```

### When to Use `.default()` in DTO

**Rarely needed in response schemas** (API validates DB output)

**Common in request schemas** (API validates user input):

```typescript
// Request schema
export const createBlogPostRequestSchema = z.object({
  type: blogPostTypeSchema.default('cluster'),  // ✅ Good - user can omit
  status: blogPostStatusSchema.default('idea'),
})
```

## Complex Nullability Patterns

### Pattern 1: Tri-State Field

**DB**:
```typescript
publishDate: timestamp('publish_date')  // NULL = not scheduled, value = scheduled date
```

**States**:
- `null` - Draft, not scheduled
- `future date` - Scheduled for publication
- `past date` - Published

**DTO**:
```typescript
publishDate: z.string().nullable()
```

**Transformer**:
```typescript
publishDate: record.publishDate ? record.publishDate.toISOString() : null
```

### Pattern 2: Related Fields with Shared Nullability

**DB**:
```typescript
parentId: uuid('parent_id')  // Nullable - pillar has no parent
companyId: uuid('company_id').notNull()
```

**Foreign Key**:
```typescript
foreignKey({
  columns: [table.parentId, table.companyId],
  foreignColumns: [table.id, table.companyId],
}).onDelete('set null')
```

**DTO**:
```typescript
parentId: z.uuid().nullable()  // Null for top-level posts
companyId: z.uuid()  // Always required
```

**Business Logic**: If parent deleted, `parentId` → `null` (orphaned post)

### Pattern 3: Nullable with Validation

**DB allows NULL but non-null values must meet criteria**:

**DTO**:
```typescript
wordCount: z.number().int().nonnegative().nullable()
```

**Meaning**: Can be `null` (not calculated yet), OR non-negative integer

**Invalid**:
```json
{ "wordCount": -100 }  // ❌ Fails .nonnegative()
{ "wordCount": 3.14 }  // ❌ Fails .int()
{ "wordCount": null }  // ✅ Valid
{ "wordCount": 500 }  // ✅ Valid
```

## Validation Decision Tree

**Is field nullable in DB?**
- YES → Use `.nullable()` in DTO
- NO → Continue

**Does DB have default value?**
- YES → Field required in DTO (always present in response)
- NO → Continue

**Does transformer provide default?**
- YES → Field required in DTO
- NO → Continue

**Can field be omitted from response?**
- YES → Use `.optional()` in DTO
- NO → Field required in DTO

## Common Mistakes

### Mistake 1: Using `.optional()` for Nullable DB Fields

**Wrong**:
```typescript
// DB: topic: text('topic') -- nullable
topic: z.string().optional()  // ❌ Field always returned, not optional
```

**Right**:
```typescript
topic: z.string().nullable()  // ✅ Field present but can be null
```

### Mistake 2: Requiring Non-Nullable Fields Without Defaults

**Wrong**:
```typescript
// DB: createdAt: timestamp('created_at') -- no default!
createdAt: z.string()  // ❌ Will fail if INSERT omits field
```

**Right**:
```typescript
// DB: createdAt: timestamp('created_at').notNull().defaultNow()
createdAt: z.string()  // ✅ Safe - DB provides default
```

### Mistake 3: Ignoring Transformer Defaults

**DB**:
```typescript
tags: text('tags').array()  // Nullable
```

**Transformer**:
```typescript
tags: record.tags ?? []  // Provides default
```

**Wrong DTO**:
```typescript
tags: z.array(z.string()).nullable()  // ❌ Transformer guarantees array
```

**Right DTO**:
```typescript
tags: z.array(z.string())  // ✅ Matches transformer output
```

## Testing Edge Cases

**Null value**:
```typescript
const result = schema.parse({ field: null })
```

**Omitted field**:
```typescript
const result = schema.parse({})  // Will fail if not .optional()
```

**Invalid type**:
```typescript
const result = schema.parse({ field: 123 })  // Will fail if expecting string
```