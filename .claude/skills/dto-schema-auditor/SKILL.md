---
name: DTO Schema Auditor
description: Validates DTO response schemas match DB schemas. Prevents schema drift and type mismatches.
auto_trigger: true
keywords: [dto, schema, response schema, zod, database schema, type validation, nullable, schema drift, api validation, drizzle schema, dto validation, schema mismatch, field types, response types, transformer, toDomain, dual column]
---

# DTO Schema Auditor

**Mission**: Detect and prevent DTO↔DB schema drift through automated validation.

**Why**: Schema drift causes runtime failures that tests miss. DB adds nullable field → DTO expects non-null → production crashes.

**Would have caught**: Dual `phase`/`status` columns in pillar-generation, snake_case in billing DTOs, missing nullable fields.

## Quick Start

### Auto-Trigger Scenarios
- After DB migration (`*.sql` changes in `/db/drizzle/migrations/`)
- When creating/updating DTO schemas (`*-response.schema.ts`)
- Before production deploys (CI/CD validation)
- When debugging type mismatch errors

### Manual Invocation
Request schema audit for specific feature or all DTOs.

## Workflow

### Scan Phase
Discover all DTO response schemas and their corresponding DB tables.
- Find: `app/features/*/dto/*-response.schema.ts`
- Map: Feature name → table name (e.g., `blog-posts` → `blog_posts`)
- Locate: `db/drizzle/schema/{table}.schema.ts`
- Extract: Repository transformers (`**/repository/*.repository.ts`)

### Analysis Phase
For each DTO-DB pair, validate:

**Field Coverage**
- Missing DB fields in DTO (drift)
- Phantom DTO fields (not in DB)
- Audit fields (`createdAt`, `updatedAt`, `deletedAt`) presence

**Type Mapping**
- DB `uuid` → DTO `z.uuid()`
- DB `timestamp` → DTO `z.string()` (via `.toISOString()`)
- DB `text` → DTO `z.string()`
- DB `integer` → DTO `z.number()`
- DB `jsonb` → DTO structured schema
- DB `text[]` → DTO `z.array(z.string())`

**Nullability Alignment**
- DB nullable → DTO `.nullable()`
- DB `.notNull()` → DTO required field
- DB default → DTO `.optional()` (context-dependent)

**Naming Conventions**
- DB: snake_case (`created_at`)
- DTO: camelCase (`createdAt`)
- Enums: SCREAMING_SNAKE_CASE (shared)

**Anti-Patterns**
- Dual columns (same concept, different names like `phase`/`status`)
- Unsafe casts (`as any`, `as unknown` in transformers)
- Missing transformer validation

### Validation Phase
Cross-reference `toDomain()` transformers:
- Date transformations use `.toISOString()`
- Null coalescing (`??`) matches DTO nullability
- Array defaults match DTO schemas
- No unsafe type casts

### Reporting Phase
Group findings by severity:

**❌ Errors (Block deployment)**
- Type mismatches (UUID vs string)
- Missing required fields
- Nullable drift (DB null but DTO non-null)
- Dual-column bugs

**⚠️ Warnings (Review needed)**
- Naming convention violations
- Missing audit fields
- Unsafe casts in transformers

**ℹ️ Info (Best practice suggestions)**
- Consider using drizzle-zod generation
- Transformer simplification opportunities
- Enum extraction candidates

### Output Format
```markdown
## DTO Schema Audit: {Feature}

**Status**: ✅ Valid | ⚠️ Warnings | ❌ Errors

### DB Schema
File: `db/drizzle/schema/{table}.schema.ts`
Table: `{table_name}`
Columns: {count}

### DTO Schema
File: `app/features/{feature}/dto/{dto}-response.schema.ts`
Fields: {count}

### Findings

❌ **Error**: Missing nullable on `priceAnnual`
- DB: `priceAnnual: integer('price_annual')` (nullable)
- DTO: `priceAnnual: z.number()`
- Fix: `priceAnnual: z.number().nullable()`

⚠️ **Warning**: Naming convention violation
- DTO field: `company_id` (snake_case)
- Expected: `companyId` (camelCase)

ℹ️ **Info**: Consider drizzle-zod generation
- Manual DTO duplicates DB schema logic
- Suggest: Use `createSelectSchema()` for type safety
```

## Progressive Disclosure

**Core workflow** (above) covers 80% of use cases.

**Deep dives available:**
- `examples/good-dto-mapping.md` - blog-posts pattern (gold standard)
- `examples/bad-drift-examples.md` - pillar-generation anti-patterns
- `validation/type-mappings.md` - Complete DB→DTO type matrix
- `validation/naming-conventions.md` - Casing rules and transformers
- `validation/edge-cases.md` - Nullable, optional, default handling
- `patterns/transformer-validation.md` - toDomain() best practices
- `patterns/dual-column-detection.md` - Same-concept field detection
- `workflow.md` - Detailed step-by-step implementation

## Constitution Compliance

**Single Responsibility**: Validates DTO↔DB schema alignment only
**DRY**: References research at `.claude/output/docs/25-01-08-dto-schema-auditor-research.md`
**Fail Fast**: Errors block deployment, warnings require acknowledgment
**Self-Healing**: Updates examples when drift patterns evolve

## References

- Drizzle schemas: `db/drizzle/schema/*.schema.ts`
- DTO patterns: `app/features/*/dto/*-response.schema.ts`
- Transformers: `app/features/*/repository/*.repository.ts`