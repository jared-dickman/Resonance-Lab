# Transformer Validation Patterns

How to audit `toDomain()` methods for correctness.

## Safe Transformation Patterns

### Date Handling

**Non-nullable timestamp**:
```typescript
createdAt: record.createdAt.toISOString()
```

**Nullable timestamp**:
```typescript
publishDate: record.publishDate ? record.publishDate.toISOString() : null
```

**With fallback (when DB should always have value)**:
```typescript
createdAt: record.createdAt ? record.createdAt.toISOString() : new Date().toISOString()
```

### Null Coalescing

**Nullable field returning null**:
```typescript
topic: record.topic ?? null
```

**Array with empty default**:
```typescript
commonUserQuestions: record.commonUserQuestions ?? []
```

**Number with null default**:
```typescript
wordCount: record.wordCount ?? null
```

### Type Casts (Domain Only)

**Enum cast (SAFE)**:
```typescript
type: record.type as BlogPostType
status: record.status as BlogPostStatus
```

**Reason**: Domain types are validated by DB enum, cast is for TypeScript only

**Generic cast (UNSAFE)**:
```typescript
draftData: record.draftData as any  // L NEVER DO THIS
```

## Unsafe Patterns to Flag

### Pattern 1: Unchecked `as any`

```typescript
// L BAD
const rawDraftData = record.draftData as any
const metadata = rawDraftData?.__wizardStepMetadata
```

**Problem**: Bypasses all type checking
**Fix**: Use Zod parsing
```typescript
//  GOOD
const draftData = partialDraftDataSchema.safeParse(record.draftData)
const metadata = draftData.success ? draftData.data.metadata : undefined
```

### Pattern 2: Missing Null Checks

```typescript
// L BAD
publishDate: record.publishDate.toISOString()
```

**Problem**: Runtime error if DB value is null
**Fix**: Add null check
```typescript
//  GOOD
publishDate: record.publishDate ? record.publishDate.toISOString() : null
```

### Pattern 3: Wrong Nullability Operator

```typescript
// L BAD (using ?? when field should be required)
title: record.title ?? 'Untitled'
```

**Problem**: Hides DB schema issues
**Fix**: Make DB column `.notNull()` or handle properly
```typescript
//  GOOD (if DB truly nullable)
title: record.title ?? null

//  BETTER (make DB non-nullable)
// DB: title: text('title').notNull()
title: record.title
```

### Pattern 4: Inconsistent Array Handling

```typescript
// L BAD (different defaults for similar fields)
commonUserQuestions: record.commonUserQuestions ?? []
supportingLongTailKeywords: record.supportingLongTailKeywords || []
```

**Problem**: `||` treats empty array as falsy
**Fix**: Always use `??`
```typescript
//  GOOD
commonUserQuestions: record.commonUserQuestions ?? []
supportingLongTailKeywords: record.supportingLongTailKeywords ?? []
```

### Pattern 5: Hardcoded Fallbacks

```typescript
// L BAD
createdAt: record.createdAt?.toISOString() ?? '2025-01-01T00:00:00Z'
```

**Problem**: Hardcoded date misleading
**Fix**: Use current time or make required
```typescript
//  GOOD
createdAt: record.createdAt ? record.createdAt.toISOString() : new Date().toISOString()
```

## Validation Checklist

### For Each Field in `toDomain()`

**Field exists in DB schema**
- [ ] Field name matches schema export (camelCase)
- [ ] Type matches DB type (text’string, integer’number, uuid’string)

**Nullability correct**
- [ ] DB nullable ’ transformer uses `??` or `?` operator
- [ ] DB non-nullable ’ no null coalescing
- [ ] DTO matches: nullable ’ `.nullable()`, required ’ no modifier

**Date transformations**
- [ ] `timestamp` ’ `.toISOString()`
- [ ] Nullable timestamps ’ ternary with null check
- [ ] Non-nullable timestamps ’ direct `.toISOString()`

**Arrays**
- [ ] DB `array()` ’ transformer `?? []`
- [ ] DTO `z.array(...)`

**Enums**
- [ ] Shared constants between DB and DTO
- [ ] Cast to domain type (not `as any`)

**JSONB**
- [ ] Zod parsing, not `as any`
- [ ] Structured schema defined

**No unsafe patterns**
- [ ] No `as any` or `as unknown`
- [ ] No hardcoded fallback values
- [ ] No missing null checks
- [ ] Consistent use of `??` for arrays/nulls

## Common Validation Bugs

**Bug**: Field missing from transformer
```typescript
// DB has field
approvedAt: timestamp('approved_at', {withTimezone: true})

// Transformer omits it
// (field not in return object)

// DTO doesn't validate it
// (no `approvedAt` in schema)
```

**Impact**: Data loss in API responses

**Bug**: Wrong date transformation
```typescript
// Transformer
createdAt: record.createdAt  // L Returns Date object

// DTO expects
createdAt: z.string()  // L Validation fails
```

**Impact**: Runtime validation error

**Bug**: Type mismatch
```typescript
// DB
wordCount: integer('word_count')

// Transformer
wordCount: record.wordCount?.toString() ?? null  // L Converts to string

// DTO expects
wordCount: z.number().nullable()  // L Validation fails
```

**Impact**: Type validation error

## Auto-Fix Suggestions

When auditor finds unsafe pattern:

**For `as any` cast**:
```
Suggest: Define proper Zod schema and use .parse() or .safeParse()
Example: const data = mySchema.safeParse(record.field)
```

**For missing null check**:
```
Suggest: Add ternary operator
Before: field: record.field.toISOString()
After:  field: record.field ? record.field.toISOString() : null
```

**For hardcoded defaults**:
```
Suggest: Use dynamic default or make field required in DB
Before: createdAt: record.createdAt ?? '2025-01-01'
After:  createdAt: record.createdAt ? record.createdAt.toISOString() : new Date().toISOString()
```

**For missing field**:
```
Suggest: Add field to transformer and DTO
File: {repository}.ts, line {X}
Add: approvedAt: record.approvedAt ? record.approvedAt.toISOString() : null,

File: {dto}-response.schema.ts
Add: approvedAt: z.string().nullable(),
```