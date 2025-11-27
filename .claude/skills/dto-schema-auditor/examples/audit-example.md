# DTO Schema Audit: Example Execution

Real-world audit of pillar-generation feature (demonstrating bug detection).

## Invocation

```
User: "Audit the pillar-generation DTO schema"
```

## Discovery Phase

**Step 1: Locate files**
```
Found DTO: app/features/pillar-generation/dto/pillar-wizard-session-response.schema.ts
Found DB: db/drizzle/schema/pillar-generation-sessions.schema.ts
Found Repo: app/features/pillar-generation/repository/drizzle-pillar-wizard.repository.ts
```

## Analysis Phase

### DB Schema Extraction

**File**: `db/drizzle/schema/pillar-generation-sessions.schema.ts`

**Columns**:
```typescript
{
  sessionId: { type: 'uuid', nullable: false, hasDefault: true, columnName: 'session_id' },
  companyId: { type: 'uuid', nullable: false, hasDefault: false, columnName: 'company_id' },
  userId: { type: 'uuid', nullable: false, hasDefault: false, columnName: 'user_id' },
  phase: { type: 'text', nullable: false, hasDefault: false, columnName: 'phase' },
  status: { type: 'text', nullable: false, hasDefault: false, columnName: 'status' },  // ⚠️
  draftData: { type: 'jsonb', nullable: true, hasDefault: false, columnName: 'partial_draft_data' },  // ⚠️
  approvedAt: { type: 'timestamp', nullable: true, hasDefault: false, columnName: 'approved_at' },
  createdAt: { type: 'timestamp', nullable: false, hasDefault: true, columnName: 'created_at' },
  updatedAt: { type: 'timestamp', nullable: false, hasDefault: true, columnName: 'updated_at' },
}
```

**Total**: 9 columns

### DTO Schema Extraction

**File**: `app/features/pillar-generation/dto/pillar-wizard-session-response.schema.ts`

**Fields**:
```typescript
{
  sessionId: { zodType: 'uuid', nullable: false, optional: false },
  companyId: { zodType: 'uuid', nullable: false, optional: false },
  userId: { zodType: 'uuid', nullable: false, optional: false },
  phase: { zodType: 'enum', nullable: false, optional: false },
  wizardStep: { zodType: 'object', nullable: false, optional: false },
  partialDraftData: { zodType: 'object', nullable: false, optional: true },  // ⚠️
  createdAt: { zodType: 'string', nullable: false, optional: false },
  updatedAt: { zodType: 'string', nullable: false, optional: false },
}
```

**Total**: 8 fields

### Cross-Reference Analysis

**Missing in DTO**:
- `status` (DB column present, not in DTO)
- `approvedAt` (DB column present, not in DTO)

**Phantom in DTO**:
- `wizardStep` (DTO field present, not a DB column)

**Naming Mismatches**:
- DB: `partial_draft_data` → DTO: `partialDraftData`
- Note: Repository uses `draftData` (inconsistent)

### Type Validation

**Field: sessionId**
- ✅ DB `uuid` → DTO `z.uuid()` (correct)

**Field: phase**
- ✅ DB `text` → DTO `z.enum()` (correct with enum constraint)

**Field: partialDraftData**
- ⚠️ DB nullable → DTO `.optional()` (should be `.nullable()` or both)

**Field: createdAt**
- ✅ DB `timestamp` → DTO `z.string()` (correct with transform)

### Transformer Validation

**File**: `app/features/pillar-generation/repository/drizzle-pillar-wizard.repository.ts`

**Unsafe patterns detected**:

**Line 16**:
```typescript
const rawDraftData = record.draftData as any  // ❌ UNSAFE
```

**Line 32**:
```typescript
phase: phase as WizardSession['phase'],  // ⚠️ Cast without validation
```

**Missing transformations**:
- `approvedAt` not transformed (field exists in DB but not mapped)

**Manual metadata extraction**:
```typescript
const storedMetadata = rawDraftData?.__wizardStepMetadata
// ...
delete partialDraftData.__wizardStepMetadata  // ❌ Fragile
```

### Dual-Column Detection

**Candidates**: `phase` + `status`

**Evidence**:
1. **Semantic similarity**: Both track wizard state
2. **Reference count**:
   - `phase`: 47 references in codebase
   - `status`: 3 references in codebase
   - Ratio: 15.7:1 (highly imbalanced)
3. **DTO exposure**:
   - `phase`: ✅ In DTO
   - `status`: ❌ Not in DTO
4. **Type**: Both `text().notNull()`

**Confidence**: HIGH

**Conclusion**: Dual-column bug detected

## Report

```markdown
# DTO Schema Audit Report: pillar-generation

**Generated**: 2025-11-08T12:00:00Z
**Status**: ❌ CRITICAL ISSUES FOUND

## Summary

**DB Schema**: db/drizzle/schema/pillar-generation-sessions.schema.ts
**DTO Schema**: app/features/pillar-generation/dto/pillar-wizard-session-response.schema.ts
**Transformer**: app/features/pillar-generation/repository/drizzle-pillar-wizard.repository.ts

**Findings**: ❌ 4 Errors, ⚠️ 3 Warnings
**DB Columns**: 9
**DTO Fields**: 8
**Coverage**: 78% (2 DB fields missing from DTO)

---

## ❌ ERRORS (BLOCK DEPLOYMENT)

### Error 1: Dual-Column Bug Detected

**Severity**: CRITICAL
**Columns**: `phase` vs `status`
**File**: db/drizzle/schema/pillar-generation-sessions.schema.ts
**Lines**: 20-21

Both columns track wizard state:
- `phase`: 47 code references, ✅ in DTO
- `status`: 3 code references, ❌ not in DTO
- Reference ratio: 15.7:1

**Impact**:
- Data inconsistency risk
- Unclear source of truth
- Wasted storage

**Fix**:
```sql
-- Migration: Remove redundant status column
ALTER TABLE pillar_generation_sessions DROP COLUMN status;
```

**Files to update**:
- db/drizzle/schema/pillar-generation-sessions.schema.ts (remove line 21)
- Remove all references to `.status` (3 occurrences)

---

### Error 2: Missing Field in DTO

**Severity**: HIGH
**Field**: `approvedAt`
**DB**: timestamp('approved_at', {withTimezone: true})
**DTO**: (missing)

**Impact**: Approval timestamp data lost in API responses

**Fix**:

app/features/pillar-generation/dto/pillar-wizard-session-response.schema.ts:
```typescript
const wizardSessionSchema = z.object({
  // ... existing fields
  approvedAt: z.string().nullable(),  // ADD THIS
})
```

app/features/pillar-generation/repository/drizzle-pillar-wizard.repository.ts:
```typescript
function toDomain(record) {
  return {
    // ... existing fields
    approvedAt: record.approvedAt ? record.approvedAt.toISOString() : null,  // ADD THIS
  }
}
```

---

### Error 3: Unsafe Type Cast

**Severity**: HIGH
**File**: app/features/pillar-generation/repository/drizzle-pillar-wizard.repository.ts
**Line**: 16

```typescript
const rawDraftData = record.draftData as any  // ❌ UNSAFE
```

**Impact**:
- Bypasses type safety
- Potential runtime errors if DB structure changes
- No validation of JSONB structure

**Fix**:
```typescript
// Define schema for JSONB validation
const draftDataSchema = z.object({
  pillar: partialPillarDraftSchema.optional(),
  clusters: partialClusterDraftSchema.optional(),
}).nullable()

// Use safe parsing
const draftDataResult = draftDataSchema.safeParse(record.draftData)
const partialDraftData = draftDataResult.success ? draftDataResult.data : null
```

---

### Error 4: Naming Inconsistency

**Severity**: MEDIUM
**Field**: Draft data field name

**Inconsistency**:
- DB column: `partial_draft_data` (snake_case)
- Repository field: `draftData` (abbreviated)
- DTO field: `partialDraftData` (full name)

**Impact**: Developer confusion, maintenance burden

**Fix (Option 1)**: Rename DB column
```sql
ALTER TABLE pillar_generation_sessions
RENAME COLUMN partial_draft_data TO draft_data;
```

**Fix (Option 2)**: Use full name everywhere
```typescript
// Repository
draftData: record.partialDraftData  // Use full name

// DTO already correct: partialDraftData
```

**Recommendation**: Option 1 (rename DB to `draft_data` for simplicity)

---

## ⚠️ WARNINGS (REVIEW NEEDED)

### Warning 1: Incorrect Nullability Modifier

**Field**: `partialDraftData`
**DB**: `jsonb('partial_draft_data')` (nullable)
**DTO**: `.optional()` (field can be omitted)

**Issue**: DB column is nullable (can be NULL), but DTO uses `.optional()` which means field can be omitted from object entirely.

**Current behavior**: Field always returned by SELECT, but can be NULL

**Expected DTO**:
```typescript
partialDraftData: z.object({...}).nullable()  // Field present but can be null
```

OR if field truly can be omitted:
```typescript
partialDraftData: z.object({...}).nullable().optional()  // Can be omitted OR null
```

---

### Warning 2: Manual Metadata Extraction

**File**: app/features/pillar-generation/repository/drizzle-pillar-wizard.repository.ts
**Lines**: 20-26

```typescript
const storedMetadata = rawDraftData?.__wizardStepMetadata
// ...
delete partialDraftData.__wizardStepMetadata
```

**Issue**: Manual embedding/extraction of metadata in JSONB column is fragile

**Better approach**: Separate DB column
```typescript
wizardStepMetadata: jsonb('wizard_step_metadata')
```

**Impact**: Brittle code, breaks if any field starts with `__`

---

### Warning 3: Unvalidated Enum Cast

**File**: repository
**Line**: 32

```typescript
phase: phase as WizardSession['phase'],
```

**Issue**: Casting without validation means invalid DB values pass through

**Better approach**:
```typescript
const phaseSchema = z.enum(PILLAR_WIZARD_PHASES_TUPLE)
const validatedPhase = phaseSchema.parse(phase)  // Throws if invalid
```

---

## ℹ️ INFO (BEST PRACTICE)

### Consider drizzle-zod Generation

Current approach: Manually maintaining separate Zod schemas

**Alternative**:
```typescript
import { createSelectSchema } from 'drizzle-zod'

const baseSchema = createSelectSchema(pillarGenerationSessions)
export const wizardSessionSchema = baseSchema.extend({
  // Custom API fields
}).omit({
  status: true,  // Exclude redundant field
})
```

**Benefits**:
- Automatic type safety
- Reduces duplication
- Schema changes auto-propagate

**Trade-off**: Less control over exact validation rules

---

## Validation Commands

After applying fixes:

```bash
# Type check
pnpm typecheck

# AST-grep validation
pnpm exec ast-grep scan

# Run tests
pnpm test:unit

# Build verification
pnpm build
```

## Summary

**Critical**: 4 errors must be fixed before deployment
**High Priority**: 3 warnings should be addressed
**Nice to Have**: 1 optimization suggestion

**Estimated fix time**: 2-3 hours
**Risk if ignored**: HIGH (dual-column bug causes data inconsistency, unsafe casts cause runtime errors)
```

## Outcome

**Before audit**: Undetected schema drift, potential production bugs
**After audit**: 4 critical issues identified with exact fix instructions
**Developer action**: Apply suggested fixes, validate with provided commands
**Prevention**: Skill catches similar bugs in future migrations