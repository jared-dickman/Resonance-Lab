# Naming Conventions

Enforce consistent casing across DB, transformers, and DTOs.

## Case Styles

### Database (snake_case)
**PostgreSQL standard**: Lowercase with underscores

```typescript
created_at
updated_at
company_id
primary_keyword
target_audience
```

**Why**: SQL convention, case-insensitive, avoids quoting

### DTO (camelCase)
**JavaScript standard**: Lowercase first letter, uppercase word boundaries

```typescript
createdAt
updatedAt
companyId
primaryKeyword
targetAudience
```

**Why**: JSON API convention, JavaScript idiomatic

### Enums (SCREAMING_SNAKE_CASE)
**Shared constant**: Uppercase with underscores

```typescript
BLOG_POST_TYPES
BLOG_POST_STATUSES
SUBSCRIPTION_STATUS
```

**Why**: Distinguishes constants, shared between DB and DTO

## Transformation Patterns

### Systematic Snake → Camel

**DB Column**:
```typescript
primaryKeyword: text('primary_keyword')
```

**Transformer Field**:
```typescript
primaryKeyword: record.primaryKeyword
```

**DTO Field**:
```typescript
primaryKeyword: z.string().nullable()
```

**Pattern**: `primary_keyword` (DB) → `primaryKeyword` (Drizzle infer) → `primaryKeyword` (DTO)

### Drizzle Auto-Conversion

Drizzle ORM automatically converts:
- DB column `created_at` → TypeScript property `createdAt`
- DB column `company_id` → TypeScript property `companyId`

**Transformer accesses via camelCase**:
```typescript
createdAt: record.createdAt.toISOString()
companyId: record.companyId
```

## Common Violations

### Anti-Pattern 1: snake_case in DTO

**Found in**: `app/features/billing/dto/subscription-response.schema.ts`

**Wrong**:
```typescript
const subscriptionSchema = z.object({
  id: z.uuid(),
  company_id: z.uuid(),  // ❌ snake_case
  plan: planSchema,
  current_period_start: z.string(),  // ❌ snake_case
  current_period_end: z.string(),  // ❌ snake_case
  cancel_at_period_end: z.boolean(),  // ❌ snake_case
  created_at: z.string(),  // ❌ snake_case
  updated_at: z.string(),  // ❌ snake_case
})
```

**Right**:
```typescript
const subscriptionSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),  // ✅ camelCase
  plan: planSchema,
  currentPeriodStart: z.string(),  // ✅ camelCase
  currentPeriodEnd: z.string(),  // ✅ camelCase
  cancelAtPeriodEnd: z.boolean(),  // ✅ camelCase
  createdAt: z.string(),  // ✅ camelCase
  updatedAt: z.string(),  // ✅ camelCase
})
```

**Impact**: API consumers see inconsistent casing, breaks JavaScript conventions

### Anti-Pattern 2: Inconsistent Abbreviations

**Wrong**:
```typescript
compId: z.uuid()  // Abbreviated
companyName: z.string()  // Full word
```

**Right**:
```typescript
companyId: z.uuid()  // Consistent
companyName: z.string()
```

### Anti-Pattern 3: Hybrid Column Names

**Pillar-generation issue**:

DB column: `partial_draft_data`
Repo field: `draftData` (abbreviated)
DTO field: `partialDraftData` (full name)

**Problem**: Inconsistent shortening confuses developers

**Fix**: Choose one approach
- Full: `partialDraftData` everywhere
- Short: `draftData` everywhere (rename DB column)

## Validation Rules

### Rule 1: DB Columns Must Be snake_case
```regex
^[a-z][a-z0-9_]*$
```

Examples:
- ✅ `created_at`
- ✅ `company_id`
- ✅ `primary_search_intent`
- ❌ `createdAt` (camelCase)
- ❌ `CompanyID` (PascalCase)

### Rule 2: DTO Fields Must Be camelCase
```regex
^[a-z][a-zA-Z0-9]*$
```

Examples:
- ✅ `createdAt`
- ✅ `companyId`
- ✅ `primarySearchIntent`
- ❌ `created_at` (snake_case)
- ❌ `CreatedAt` (PascalCase)

### Rule 3: Enums/Constants Must Be SCREAMING_SNAKE_CASE
```regex
^[A-Z][A-Z0-9_]*$
```

Examples:
- ✅ `BLOG_POST_TYPES`
- ✅ `SUBSCRIPTION_STATUS`
- ❌ `blogPostTypes` (camelCase)
- ❌ `Blog_Post_Types` (mixed)

## Automated Detection

### Check 1: Extract DTO Field Names
```typescript
// Parse DTO schema file
const fieldNames = extractFieldsFromZodSchema(dtoFile)

// Validate casing
fieldNames.forEach(field => {
  if (!/^[a-z][a-zA-Z0-9]*$/.test(field)) {
    reportError(`Field '${field}' violates camelCase convention`)
  }
})
```

### Check 2: Cross-Reference with DB Columns
```typescript
// Map DTO field to expected DB column
const expectedDbColumn = camelToSnake(dtoField)

// Verify DB schema has matching column
if (!dbColumns.includes(expectedDbColumn)) {
  reportWarning(`DTO field '${dtoField}' has no matching DB column '${expectedDbColumn}'`)
}
```

### Check 3: Transformer Consistency
```typescript
// Extract transformer field assignments
const transformerFields = parseTransformer(repoFile)

// Verify matches DTO fields
dtoFields.forEach(field => {
  if (!transformerFields.includes(field)) {
    reportError(`DTO field '${field}' missing in transformer`)
  }
})
```

## Common Transformations

| DB Column (snake_case) | DTO Field (camelCase) |
|------------------------|----------------------|
| `id` | `id` (unchanged) |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `deleted_at` | `deletedAt` |
| `company_id` | `companyId` |
| `parent_id` | `parentId` |
| `primary_keyword` | `primaryKeyword` |
| `target_audience` | `targetAudience` |
| `primary_search_intent` | `primarySearchIntent` |
| `common_user_questions` | `commonUserQuestions` |
| `supporting_long_tail_keywords` | `supportingLongTailKeywords` |
| `word_count` | `wordCount` |
| `publish_date` | `publishDate` |
| `final_blog` | `finalBlog` |

## Best Practices

**Use Drizzle inference**: Let TypeScript infer camelCase from DB schema
```typescript
export type DrizzleBlogPost = typeof blogPosts.$inferSelect
// Automatically converts snake_case → camelCase
```

**Consistent transformer**: Match DTO field names exactly
```typescript
// DTO defines: createdAt: z.string()
// Transformer must use: createdAt: record.createdAt.toISOString()
```

**No custom mapping**: Avoid manual field name transformations
```typescript
// ❌ Bad: Custom mapping
createdDate: record.createdAt.toISOString()

// ✅ Good: Direct mapping
createdAt: record.createdAt.toISOString()
```