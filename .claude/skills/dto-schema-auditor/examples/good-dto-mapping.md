# Good DTO Mapping Example: blog-posts

**Gold standard** for DTO↔DB schema alignment.

## File Structure

**DB Schema**: `db/drizzle/schema/blog-posts.schema.ts`
**DTO Response**: `app/features/blog-posts/dto/blog-post-response.schema.ts`
**Transformer**: `app/features/blog-posts/repository/drizzle-blog-post.repository.ts`

## What Makes This Good

### Consistent Naming
**DB (snake_case)**:
- `created_at`, `updated_at`, `deleted_at`
- `company_id`, `parent_id`
- `primary_keyword`, `target_audience`

**DTO (camelCase)**:
- `createdAt`, `updatedAt`, `deletedAt`
- `companyId`, `parentId`
- `primaryKeyword`, `targetAudience`

**Pattern**: Systematic snake→camel transformation in `toDomain()`

### Complete Field Coverage
Every DB column appears in DTO (no drift):
- All audit fields (`createdAt`, `updatedAt`, `deletedAt`)
- All business fields
- All relationship fields (`parentId`, `companyId`)

### Type Safety
**DB → Transformer → DTO alignment**:

DB: `createdAt: timestamp('created_at')`
Transformer: `createdAt: record.createdAt ? record.createdAt.toISOString() : new Date().toISOString()`
DTO: `createdAt: z.string()`

DB: `commonUserQuestions: text('common_user_questions').array()`
Transformer: `commonUserQuestions: record.commonUserQuestions ?? []`
DTO: `commonUserQuestions: z.array(z.string())`

### Proper Nullability
**Nullable fields handled consistently**:

DB: `topic: text('topic')` (nullable by default)
Transformer: `topic: record.topic ?? null`
DTO: `topic: z.string().nullable()`

DB: `publishDate: timestamp('publish_date')`
Transformer: `publishDate: record.publishDate ? record.publishDate.toISOString() : null`
DTO: `publishDate: z.string().nullable()`

### Shared Enums
**Single source of truth for enums**:

Constants: `BLOG_POST_TYPES`, `BLOG_POST_STATUSES` in `constants/`
DB: `blogTypeEnum = pgEnum('blog_type', BLOG_POST_TYPES)`
DTO: `blogPostTypeSchema = z.enum(BLOG_POST_TYPES)`

**Why**: DB and API validation use identical enum values

### Clean Transformer
**No unsafe casts**:
- No `as any`
- No `as unknown`
- Explicit null coalescing with `??`
- Clear Date→string transformations

### Array Handling
**Consistent default behavior**:

DB: `.array().default(sql\`ARRAY[]::text[]\`)`
Transformer: `record.commonUserQuestions ?? []`
DTO: `z.array(z.string())`

**Pattern**: DB defaults to empty array, transformer preserves, DTO validates array type

## Key Patterns to Replicate

**Date Transformation**:
`record.{field} ? record.{field}.toISOString() : null`

**Nullable with Default**:
`record.{field} ?? null`

**Array with Default**:
`record.{field} ?? []`

**Non-Nullable with Fallback**:
`record.{field} ? record.{field}.toISOString() : new Date().toISOString()`

## Validation Checklist

- ✅ All DB columns mapped to DTO fields
- ✅ Consistent naming conventions (snake→camel)
- ✅ Type transformations explicit (Date→string)
- ✅ Nullability aligned (DB nullable → DTO `.nullable()`)
- ✅ Enums shared between layers
- ✅ Arrays have default values
- ✅ No unsafe type casts
- ✅ Audit fields included