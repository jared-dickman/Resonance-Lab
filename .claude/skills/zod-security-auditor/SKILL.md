---
name: Zod Security Auditor
description: Audits Zod schemas for security vulnerabilities, SQL injection vectors, DoS risks, and enterprise best practices
auto_trigger: false
keywords: [zod security, schema audit, validation security, sql injection, uuid validation, zod vulnerabilities, input validation, schema security, zod best practices, security audit]
---

# Zod Security Auditor

**Mission**: Prevent security vulnerabilities in Zod validation schemas across the codebase.

**Why**: Weak validation = SQL injection, DoS attacks, type confusion, information disclosure.

---

## Workflow

### Scan Schema Files

Search all schema files in project:
```
app/features/*/dto/*-request.schema.ts
app/features/*/dto/*-response.schema.ts
```

### Security Checks

**UUID Validation (SQL Injection Prevention)**
- ❌ `z.string()` or `z.string().min(1)` on ID fields
- ✅ `z.uuid()` with error message
- Files: All `*id`, `*Id`, `*ID` fields must use `.uuid()`

**Strict Mode (Unknown Property Rejection)**
- ❌ Missing `.strict()` on object schemas
- ✅ `.strict()` on all request/response schemas
- Pattern: `z.object({...}).strict()`

**Input Boundary Limits (DoS Prevention)**
- ❌ Unbounded strings: `z.string()` without `.max()`
- ❌ Unbounded arrays: `z.array()` without `.max()`
- ✅ Set limits: `z.string().max(500)`, `z.array().max(100)`

**URL Security (Data URI & Protocol Injection)**
- ❌ Plain `z.string().url()`
- ✅ HTTPS enforcement: `.refine(v => v.startsWith('https://'))`
- ✅ Data URI block: `.refine(v => !v.startsWith('data:'))`
- Reference: `app/features/user/dto/user-request.schema.ts`

**Control Character Sanitization**
- ❌ Accepting `\u0000-\u001F\u007F` in user input
- ✅ Refine check: `!CONTROL_CHAR_PATTERN.test(value)`
- Reference: `app/features/user/dto/user-request.schema.ts`

**Email Normalization**
- ❌ Direct email validation without normalization
- ✅ Transform → normalize → validate pattern
- Reference: `app/features/user/validation/email-normalizer`

**Type Coercion Safety**
- ❌ Implicit coercion: `z.number()` on query params
- ✅ Explicit coercion: `z.coerce.number()` or `.transform()`
- Usage: Query params only, never request bodies

**Discriminated Unions Performance**
- ❌ Loose unions: `z.union([schema1, schema2, ...])`
- ✅ Discriminated: `z.discriminatedUnion('type', [...])`
- Pattern: All polymorphic responses

**Error Message Sanitization**
- ❌ Exposing input in errors: `error.message` to client
- ✅ Generic messages: `'Invalid request data'`
- ✅ Log full errors internally only

**Nullable Handling**
- ❌ Mismatch with DB: DB allows null, schema doesn't
- ✅ Match DB schema: `.nullable()` where DB column nullable
- Reference: `dto-schema-auditor` skill

### Report Format

```markdown
## Security Audit Report

**Scanned**: X schema files
**Issues Found**: N

### Critical (SQL Injection Risk)
- File:line - Missing `.uuid()` on `userId` field

### High (DoS Risk)
- File:line - Unbounded string on `description` field

### Medium (Information Disclosure)
- File:line - Missing `.strict()` on request schema

### Low (Best Practice)
- File:line - Use discriminated union instead of loose union

## Recommendations
[Auto-fix suggestions]
```

### Auto-Fix

Apply fixes via Edit tool:
- Add `.uuid()` to ID fields
- Add `.strict()` to object schemas
- Add `.max()` constraints to strings/arrays
- Convert loose unions to discriminated unions

---

## Validation

After fixes, run:
```bash
pnpm typecheck
pnpm exec ast-grep scan
```

---

## Enterprise Impact

**SQL Injection Prevention**: UUID validation blocks malicious ID payloads
**DoS Prevention**: Boundary limits prevent memory exhaustion attacks
**Type Safety**: Strict mode catches schema drift and unknown properties
**Information Security**: Error sanitization prevents data leakage

---

## References

- Security patterns: `llm/rules/security.md`
- Zod patterns: `llm/rules/zod-patterns.md`
- Research: `.claude/output/zod-security-research.md`
- CVE-2023-4316: ReDoS in Zod <3.22.3 (ensure upgraded)
