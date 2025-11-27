# Dual-Column Detection

Identify when two DB columns represent the same concept (schema design bug).

## What is a Dual-Column Bug?

**Definition**: Two columns in same table tracking the same business concept

**Example from pillar-generation**:
```typescript
export const pillarGenerationSessions = pgTable('pillar_generation_sessions', {
  phase: text('phase').notNull(),
  status: text('status').notNull(),  // ❌ Duplicate concept
  // ...
})
```

**Problem**:
- Both track "wizard state"
- Unclear which is source of truth
- Data can become inconsistent
- Developer confusion about which to use

## Detection Algorithm

### Phase 1: Semantic Similarity

**Check 1: Name similarity**
```typescript
const semanticSynonyms = {
  'state': ['status', 'phase', 'stage', 'step'],
  'type': ['kind', 'category', 'classification'],
  'date': ['time', 'timestamp', 'datetime'],
  'id': ['identifier', 'key'],
}

function areSemanticallyRelated(col1, col2) {
  for (const [concept, synonyms] of Object.entries(semanticSynonyms)) {
    if (synonyms.includes(col1) && synonyms.includes(col2)) {
      return { related: true, concept }
    }
  }
  return { related: false }
}
```

**Check 2: Type similarity**
```typescript
// Both are text enums
phase: text('phase').notNull()
status: text('status').notNull()

// Flag: Same type, similar semantics
```

### Phase 2: Usage Pattern Analysis

**Check 1: Reference count imbalance**
```bash
# Count references in codebase
rg "\.phase\b" --count  # 47 matches
rg "\.status\b" --count  # 3 matches

# Significant imbalance suggests one is deprecated/unused
```

**Heuristic**: If one column has >5x more references, likely dual-column

**Check 2: Update pattern analysis**
```typescript
// Search for UPDATE statements
const phaseUpdates = findPatterns(/UPDATE.*SET phase =/)
const statusUpdates = findPatterns(/UPDATE.*SET status =/)

if (phaseUpdates.length > 0 && statusUpdates.length === 0) {
  // 'status' never updated → orphaned column
  reportSuspiciousPair('phase', 'status')
}
```

**Check 3: Transformer usage**
```typescript
// Check repository toDomain() method
function toDomain(record: DrizzlePillarGenerationSession) {
  return {
    phase: record.phase,  // ✅ Used
    // status: record.status,  // ❌ Not mapped to DTO
  }
}
```

**Pattern**: If one column mapped to DTO and other ignored → dual-column

### Phase 3: Historical Analysis

**Check 1: Migration history**
```bash
# Find when columns were added
git log -p -- db/drizzle/migrations/*.sql | grep "ADD COLUMN phase"
git log -p -- db/drizzle/migrations/*.sql | grep "ADD COLUMN status"
```

**Pattern**: If added in same migration → intentional design
**Pattern**: If added in different migrations → likely refactor that left orphan

**Check 2: Commit message analysis**
```bash
git log --grep="rename.*phase\|status" --oneline
git log --grep="migrate.*phase\|status" --oneline
```

**Keywords**: "rename", "migrate", "deprecate", "replace" suggest column evolution

## Real-World Examples

### Example 1: pillar-generation (CONFIRMED BUG)

**DB Schema**:
```typescript
phase: text('phase').notNull(),
status: text('status').notNull(),
```

**Evidence**:
1. Semantic: "phase" and "status" both track state
2. Usage: `phase` (47 refs) vs `status` (3 refs)
3. DTO: Only `phase` exposed in API response
4. Transformer: `status` not mapped

**Conclusion**: Dual-column bug, remove `status`

### Example 2: createdAt vs publishDate (VALID)

**DB Schema**:
```typescript
createdAt: timestamp('created_at').notNull(),
publishDate: timestamp('publish_date'),
```

**Evidence**:
1. Semantic: Both are dates, different meanings
2. Usage: Both used extensively
3. DTO: Both exposed in API
4. Business logic: `createdAt` = record creation, `publishDate` = content publication

**Conclusion**: NOT a dual-column (different concepts)

### Example 3: External IDs (VALID)

**DB Schema**:
```typescript
id: uuid('id').primaryKey(),
externalSubscriptionId: text('external_subscription_id'),
```

**Evidence**:
1. Semantic: Both are IDs, different systems
2. Usage: `id` (internal), `externalSubscriptionId` (Stripe reference)
3. DTO: Both exposed
4. Business logic: Internal primary key vs external system reference

**Conclusion**: NOT a dual-column (different sources)

## Detection Heuristics

### Red Flags (Likely Dual-Column)

**High confidence**:
- Semantic synonyms (phase/status, type/kind)
- 5x+ reference imbalance
- One column not in DTO
- One column never updated
- Both added in same migration but one later removed from code

**Medium confidence**:
- Same DB type (both text, both timestamp)
- Similar naming pattern (both end in "At", both end in "Id")
- One has default value, other nullable

### Green Flags (Likely Valid)

**Different concepts**:
- Different types (uuid vs text)
- Clear semantic distinction (createdAt vs publishDate)
- Both used extensively
- Both in DTO with clear documentation
- Foreign keys to different tables

## Automated Detection Query

```typescript
interface DualColumnCandidate {
  column1: string
  column2: string
  semanticScore: number
  referenceRatio: number
  bothInDTO: boolean
  confidence: 'high' | 'medium' | 'low'
}

function detectDualColumns(table: string): DualColumnCandidate[] {
  const columns = extractColumns(table)
  const candidates: DualColumnCandidate[] = []

  // Check all pairs
  for (let i = 0; i < columns.length; i++) {
    for (let j = i + 1; j < columns.length; j++) {
      const col1 = columns[i]
      const col2 = columns[j]

      const semantic = areSemanticallyRelated(col1.name, col2.name)
      if (!semantic.related) continue

      const refs1 = countReferences(col1.name)
      const refs2 = countReferences(col2.name)
      const ratio = Math.max(refs1, refs2) / Math.min(refs1, refs2)

      if (ratio < 3) continue  // Not significant imbalance

      const inDTO1 = isInDTO(col1.name)
      const inDTO2 = isInDTO(col2.name)

      let confidence: 'high' | 'medium' | 'low' = 'low'
      if (ratio > 5 && (!inDTO1 || !inDTO2)) {
        confidence = 'high'
      } else if (ratio > 3 || (!inDTO1 && !inDTO2)) {
        confidence = 'medium'
      }

      candidates.push({
        column1: col1.name,
        column2: col2.name,
        semanticScore: semantic.score,
        referenceRatio: ratio,
        bothInDTO: inDTO1 && inDTO2,
        confidence
      })
    }
  }

  return candidates.sort((a, b) =>
    b.referenceRatio - a.referenceRatio
  )
}
```

## Validation Workflow

When dual-column detected:

### Step 1: Manual Review
- Check migration history
- Review business logic
- Interview original developer (if possible)

### Step 2: Determine Winner
- Higher reference count usually wins
- Column in DTO usually wins
- Non-nullable usually wins
- More recent (based on migrations) usually wins

### Step 3: Create Migration
```sql
-- Example: Remove 'status' in favor of 'phase'
BEGIN;

-- Copy any status values not in phase (if needed)
UPDATE pillar_generation_sessions
SET phase = status
WHERE phase IS NULL AND status IS NOT NULL;

-- Drop the redundant column
ALTER TABLE pillar_generation_sessions DROP COLUMN status;

COMMIT;
```

### Step 4: Update Code
- Remove references to losing column
- Update types (remove from Drizzle schema)
- Update transformers
- Update tests

### Step 5: Validate
```bash
# Ensure no references remain
rg "\\.status\\b"  # Should return 0 matches (for removed column)

# Type check
pnpm typecheck

# Run tests
pnpm test
```

## Prevention Strategies

### Pre-Migration Review
Before adding column, search for semantic duplicates:
```bash
# Adding 'state' column
rg "status|phase|stage|step" db/drizzle/schema/
```

### Schema Documentation
Document column purpose in schema:
```typescript
export const pillarGenerationSessions = pgTable('pillar_generation_sessions', {
  /**
   * Current wizard phase (state machine)
   * Values: PILLAR_TITLE_GENERATING, PILLAR_TITLE_DRAFT, ...
   * Primary state tracking field
   */
  phase: text('phase').notNull(),
})
```

### Code Review Checklist
- [ ] No existing column with similar meaning
- [ ] Clear semantic distinction from other columns
- [ ] Will be used in DTO/API
- [ ] Migration plan documented

## Output Format

When dual-column detected, report:

```markdown
## Dual-Column Detected: `{table}.{col1}` vs `{table}.{col2}`

**Confidence**: High

**Evidence**:
- Semantic relationship: Both track "{concept}"
- Reference ratio: {col1} ({n1} refs) vs {col2} ({n2} refs) = {ratio}:1
- DTO exposure: {col1} ✅ | {col2} ❌
- Type similarity: Both {type}

**Recommendation**: Remove `{losing_column}`

**Migration**:
```sql
ALTER TABLE {table} DROP COLUMN {losing_column};
```

**Files to update**:
- db/drizzle/schema/{table}.schema.ts
- app/features/{feature}/repository/*.repository.ts
- app/features/{feature}/dto/*-response.schema.ts

**Validation**:
```bash
rg "\\.{losing_column}\\b"  # Should return 0 matches
pnpm typecheck
```
```

## References

- Semantic synonym database: Built from domain knowledge
- Reference counting: ripgrep pattern matching
- Migration history: git log analysis
- DTO exposure: Zod schema parsing