a# DTO Schema Auditor: Detailed Workflow

Step-by-step implementation guide for running the auditor.

## Pre-Audit: Discovery Phase

### Step 1: Identify Features to Audit

**Scan for all DTO response schemas**:
```bash
find app/features -name "*-response.schema.ts" -type f
```

**Extract feature names**:
```
app/features/blog-posts/dto/blog-post-response.schema.ts ’ blog-posts
app/features/billing/dto/subscription-response.schema.ts ’ billing
app/features/pillar-generation/dto/pillar-wizard-session-response.schema.ts ’ pillar-generation
```

**Map feature ’ DB table**:
- `blog-posts` ’ `blog_posts`
- `billing` ’ `subscriptions`, `subscription_plans`, `plan_limits`
- `pillar-generation` ’ `pillar_generation_sessions`

### Step 2: Locate Corresponding Files

For each feature, find:

**DB Schema**:
```
db/drizzle/schema/{table}.schema.ts
```

**DTO Response Schema**:
```
app/features/{feature}/dto/{name}-response.schema.ts
```

**Repository/Transformer**:
```
app/features/{feature}/repository/*.repository.ts
```

**Pattern**: Repository contains `toDomain()` method transforming DB ’ DTO

## Audit Phase: Schema Analysis

### Step 3: Extract DB Schema Metadata

Read `db/drizzle/schema/{table}.schema.ts`:

**Extract columns**:
```typescript
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  topic: text('topic'),  // Nullable
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

**Build column map**:
```typescript
{
  id: {
    type: 'uuid',
    nullable: false,
    hasDefault: true,
    columnName: 'id',
    propertyName: 'id'
  },
  title: {
    type: 'text',
    nullable: false,
    hasDefault: false,
    columnName: 'title',
    propertyName: 'title'
  },
  topic: {
    type: 'text',
    nullable: true,
    hasDefault: false,
    columnName: 'topic',
    propertyName: 'topic'
  },
  createdAt: {
    type: 'timestamp',
    nullable: false,
    hasDefault: true,
    columnName: 'created_at',
    propertyName: 'createdAt'
  }
}
```

**Note**: Drizzle converts `created_at` ’ `createdAt` automatically

### Step 4: Extract DTO Schema Metadata

Read `app/features/{feature}/dto/*-response.schema.ts`:

**Parse Zod schemas**:
```typescript
const blogPostSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  topic: z.string().nullable(),
  createdAt: z.string(),
}).strict()
```

**Build field map**:
```typescript
{
  id: {
    zodType: 'uuid',
    nullable: false,
    optional: false
  },
  title: {
    zodType: 'string',
    nullable: false,
    optional: false
  },
  topic: {
    zodType: 'string',
    nullable: true,
    optional: false
  },
  createdAt: {
    zodType: 'string',
    nullable: false,
    optional: false
  }
}
```

### Step 5: Cross-Reference DB ” DTO

**Field coverage check**:
```typescript
const dbFields = Object.keys(dbColumnMap)  // ['id', 'title', 'topic', 'createdAt', ...]
const dtoFields = Object.keys(dtoFieldMap)  // ['id', 'title', 'topic', 'createdAt', ...]

const missingInDTO = dbFields.filter(f => !dtoFields.includes(f))
const phantomInDTO = dtoFields.filter(f => !dbFields.includes(f))
```

**Type alignment check**:
```typescript
dtoFields.forEach(field => {
  const dbCol = dbColumnMap[field]
  const dtoField = dtoFieldMap[field]

  validateTypeMapping(dbCol, dtoField)
})
```

**Nullability alignment check**:
```typescript
function validateNullability(dbCol, dtoField) {
  if (dbCol.nullable && !dtoField.nullable && !dtoField.optional) {
    reportError(`Field '${field}' nullable in DB but required in DTO`)
  }

  if (!dbCol.nullable && dtoField.nullable) {
    reportWarning(`Field '${field}' non-nullable in DB but nullable in DTO`)
  }
}
```

### Step 6: Validate Type Mappings

Use type mapping matrix (`validation/type-mappings.md`):

```typescript
const expectedMappings = {
  uuid: 'uuid',
  text: 'string',
  integer: 'number',
  boolean: 'boolean',
  timestamp: 'string',  // via .toISOString()
  jsonb: 'object',
  'text[]': 'array'
}

function validateTypeMapping(dbCol, dtoField) {
  const expected = expectedMappings[dbCol.type]

  if (dtoField.zodType !== expected) {
    reportError(`Type mismatch: DB '${dbCol.type}' ’ DTO '${dtoField.zodType}' (expected '${expected}')`)
  }
}
```

### Step 7: Audit Transformer

Read `app/features/{feature}/repository/*.repository.ts`:

**Find `toDomain()` method**:
```typescript
function toDomain(record: DrizzleBlogPost): BlogPostEntity {
  return {
    id: record.id,
    title: record.title,
    topic: record.topic ?? null,
    createdAt: record.createdAt.toISOString(),
    // ...
  }
}
```

**Validate each field**:
```typescript
transformerFields.forEach(field => {
  const dbCol = dbColumnMap[field]
  const transformation = extractTransformation(transformerCode, field)

  validateTransformation(dbCol, transformation)
})
```

**Check for unsafe patterns**:
```typescript
const unsafePatterns = [
  /as any/g,
  /as unknown/g,
  // Hardcoded dates
  /'20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z'/g
]

unsafePatterns.forEach(pattern => {
  if (pattern.test(transformerCode)) {
    reportWarning(`Unsafe pattern found: ${pattern}`)
  }
})
```

### Step 8: Detect Dual-Column Bugs

**Pattern**: Two columns representing same concept

**Detection strategy**:
1. Extract column names from DB schema
2. Compute similarity scores (Levenshtein distance, semantic similarity)
3. Flag pairs with high similarity

**Example**:
```typescript
const columns = ['phase', 'status', 'company_id', 'user_id']

// Find semantically similar pairs
const suspiciousPairs = [
  ['phase', 'status'],  // Both track state
]

// Validate usage in code
const phaseRefs = findReferences('phase')  // 47 usages
const statusRefs = findReferences('status')  // 3 usages

if (phaseRefs > statusRefs * 5) {
  reportError(`Dual-column detected: 'phase' (${phaseRefs} refs) vs 'status' (${statusRefs} refs)`)
}
```

See `patterns/dual-column-detection.md` for detailed algorithm.

## Reporting Phase

### Step 9: Generate Audit Report

**Group findings by severity**:

```markdown
# DTO Schema Audit Report: {feature}

**Generated**: {timestamp}
**DB Schema**: db/drizzle/schema/{table}.schema.ts
**DTO Schema**: app/features/{feature}/dto/{name}-response.schema.ts
**Transformer**: app/features/{feature}/repository/{name}.repository.ts

## Summary

**Status**: L 3 Errors,   2 Warnings, 9 1 Info
**DB Columns**: 12
**DTO Fields**: 11
**Coverage**: 92% (1 field missing)

## Errors (Block Deployment)

### Missing nullable on `priceAnnual`
**Severity**: High
**File**: app/features/billing/dto/subscription-response.schema.ts
**Line**: 28

DB Schema:
```typescript
priceAnnual: integer('price_annual')  // Nullable
```

DTO Schema:
```typescript
priceAnnual: z.number()  // L Required
```

**Impact**: Runtime validation error when DB returns null
**Fix**:
```typescript
priceAnnual: z.number().nullable()
```

### Dual-column bug: `phase` vs `status`
**Severity**: Critical
**File**: db/drizzle/schema/pillar-generation-sessions.schema.ts
**Lines**: 20-21

Both columns track wizard state:
- `phase`: 47 code references
- `status`: 3 code references

**Impact**: Data inconsistency, unclear source of truth
**Fix**: Remove `status` column, migrate data to `phase`

## Warnings (Review Needed)

### Unsafe type cast in transformer
**Severity**: Medium
**File**: app/features/pillar-generation/repository/drizzle-pillar-wizard.repository.ts
**Line**: 16

```typescript
const rawDraftData = record.draftData as any  // L Unsafe
```

**Impact**: Bypasses type safety, potential runtime errors
**Fix**: Use Zod parsing
```typescript
const draftData = partialDraftDataSchema.safeParse(record.draftData)
```

## Info (Best Practice Suggestions)

### Consider drizzle-zod generation
Manual DTO schema duplicates DB logic. Consider using `createSelectSchema()` from drizzle-zod for automatic type safety.

Reference: https://orm.drizzle.team/docs/zod
```

### Step 10: Provide Auto-Fix Suggestions

For each error/warning, provide:
1. **Problem**: What's wrong
2. **Impact**: Why it matters
3. **Fix**: Exact code change
4. **File/Line**: Where to make change

**Example output**:
```
SUGGESTED FIXES:

1. app/features/billing/dto/subscription-response.schema.ts:28
   Replace:
     priceAnnual: z.number()
   With:
     priceAnnual: z.number().nullable()

2. app/features/pillar-generation/repository/drizzle-pillar-wizard.repository.ts:16
   Replace:
     const rawDraftData = record.draftData as any
   With:
     const draftData = partialDraftDataSchema.safeParse(record.draftData)
     const metadata = draftData.success ? draftData.data.metadata : undefined
```

## Post-Audit: Validation

### Step 11: Run Validation Commands

After applying fixes:

```bash
# Type check
pnpm typecheck

# AST-grep validation
pnpm exec ast-grep scan

# Run tests
pnpm test

# Build verification
pnpm build
```

### Step 12: Update Skill Examples

If new drift patterns discovered:
1. Add to `examples/bad-drift-examples.md`
2. Update detection rules in workflow
3. Commit changes to skill repository

## Automation Opportunities

### CI/CD Integration

**Pre-commit hook**:
```bash
# Run auditor on changed DTO schemas
git diff --name-only | grep "dto.*-response.schema.ts" | xargs dto-schema-auditor
```

**GitHub Action**:
```yaml
- name: DTO Schema Audit
  run: |
    pnpm dto-schema-auditor --all
    if [ $? -ne 0 ]; then
      echo "::error::DTO schema drift detected"
      exit 1
    fi
```

### Auto-Fix Mode

**Safe fixes** (apply automatically):
- Add `.nullable()` where DB is nullable
- Add missing audit fields (`createdAt`, `updatedAt`, `deletedAt`)
- Fix naming convention violations (snake_case ’ camelCase)

**Unsafe fixes** (require review):
- Remove dual columns
- Restructure JSONB schemas
- Change transformer logic

## Performance Considerations

**Large codebases**: Audit incrementally
- Only changed features (via git diff)
- Only features with recent migrations
- Cache results for unchanged files

**Parallel processing**: Audit multiple features concurrently
- Independent feature analysis
- Aggregate results at end

**Smart diffing**: Only re-analyze when files change
- Hash DB schema, DTO schema, transformer
- Compare hashes to detect changes
- Skip unchanged feature audits