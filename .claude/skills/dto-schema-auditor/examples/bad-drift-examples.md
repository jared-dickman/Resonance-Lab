t# Bad DTO Mapping Example: pillar-generation

**Anti-patterns** to avoid when mapping DB↔DTO.

## File Structure

**DB Schema**: `db/drizzle/schema/pillar-generation-sessions.schema.ts`
**DTO Response**: `app/features/pillar-generation/dto/pillar-wizard-session-response.schema.ts`
**Transformer**: `app/features/pillar-generation/repository/drizzle-pillar-wizard.repository.ts`

## Critical Issues

### Issue 1: Dual-Column Bug

**DB Schema (lines 20-21)**:
```typescript
phase: text('phase').notNull(),
status: text('status').notNull(),
```

**Problem**: Two columns tracking same concept (wizard state)
**Impact**: Data inconsistency, unclear which is source of truth
**Fix**: Remove `status`, use `phase` only

**DTO exposes only `phase`**:
```typescript
phase: z.enum(PILLAR_WIZARD_PHASES_TUPLE),
```

**Result**: `status` column orphaned in DB

### Issue 2: Naming Mismatch

**DB Schema**:
```typescript
draftData: jsonb('partial_draft_data'),
```

**DTO Field**:
```typescript
partialDraftData: partialDraftDataSchema,
```

**Problem**: DB column `partial_draft_data` → DTO field `partialDraftData` (inconsistent transformation)
**Expected**: DB `partial_draft_data` → should be `draftData` OR DTO should be `partialDraftData` matching full column name
**Actual**: Hybrid approach causing confusion

### Issue 3: Unsafe Type Casts

**Transformer (line 16)**:
```typescript
const rawDraftData = record.draftData as any
```

**Problem**: `as any` bypasses TypeScript type safety
**Impact**: Runtime errors if DB returns unexpected structure
**Fix**: Proper type validation with Zod parsing

### Issue 4: Manual Metadata Extraction

**Transformer (lines 20-26)**:
```typescript
const storedMetadata = rawDraftData?.__wizardStepMetadata

const partialDraftData = rawDraftData ? { ...rawDraftData } : undefined
if (partialDraftData) {
  delete partialDraftData.__wizardStepMetadata
}
```

**Problem**: Manual embedding/extraction of metadata in JSONB column
**Impact**: Brittle, error-prone, breaks if structure changes
**Better**: Separate DB column for metadata OR structured JSONB schema

### Issue 5: Missing Transformer Validation

**Transformer (line 32)**:
```typescript
phase: phase as WizardSession['phase'],
```

**Problem**: Casting without validation
**Risk**: DB contains invalid phase value → runtime error
**Fix**: Validate against enum before casting

### Issue 6: Incomplete Field Mapping

**DB has `approvedAt`**:
```typescript
approvedAt: timestamp('approved_at', {withTimezone: true}),
```

**DTO missing `approvedAt`**:
Not in `wizardSessionSchema`

**Impact**: Approval timestamp data lost in API responses

## Comparison: Good vs Bad

### Field Naming

**Good (blog-posts)**:
DB: `created_at` → DTO: `createdAt` (systematic)

**Bad (pillar-generation)**:
DB: `partial_draft_data` → DTO: `partialDraftData` (inconsistent with field name `draftData` in repo)

### Nullability

**Good (blog-posts)**:
DB: `topic: text()` (nullable)
DTO: `topic: z.string().nullable()`

**Bad (pillar-generation)**:
DB: `draftData: jsonb()` (nullable)
DTO: `partialDraftData: ...optional()` (not `.nullable()`, uses `.optional()` instead)

**Difference**: `.optional()` means field can be omitted, `.nullable()` means field must exist but can be null

### Type Safety

**Good (blog-posts)**:
```typescript
commonUserQuestions: record.commonUserQuestions ?? []
```

**Bad (pillar-generation)**:
```typescript
const rawDraftData = record.draftData as any
```

## How This Would Fail

### Scenario 1: Dual Column Confusion
- Developer updates `phase` but not `status`
- Another query filters by `status`
- Stale data returned

### Scenario 2: Metadata Corruption
- DB update adds field starting with `__`
- Metadata extraction conflicts
- Production runtime error

### Scenario 3: Type Mismatch
- DB returns unexpected JSONB structure
- `as any` bypasses validation
- Client crashes on malformed data

## Fixes Required

**Remove dual column**:
Drop `status` column, migrate data to `phase`

**Consistent naming**:
Rename DB column `partial_draft_data` → `draft_data`

**Remove unsafe casts**:
Use Zod `.parse()` for JSONB validation

**Add missing fields**:
Include `approvedAt` in DTO schema

**Separate metadata**:
New column: `wizard_step_metadata: jsonb('wizard_step_metadata')`