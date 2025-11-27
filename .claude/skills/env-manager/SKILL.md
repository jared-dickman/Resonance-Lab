---
name: env-manager
description: Safely manage environment variables - never touches .env.local
auto_trigger: false
keywords: [environment variable, env var, add variable, OPENAI_API_KEY, DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC, env.ts, .env.example]
---

# Environment Variable Manager

Manages environment variables following project safety rules. **NEVER reads or writes .env.local**.

## Critical Rules

**🚨 PROTECTED FILES:**
- `.env.local` - NEVER read, NEVER write (user manages manually)
- `.env.backups/` - Auto-managed by scripts, don't touch

**✅ SAFE OPERATIONS:**
- Update `app/config/env.ts` schema
- Update `.env.example` placeholders
- Tell user to manually update `.env.local`

## Workflow

### Read Environment Rules
Read `llm/rules/environment.md` for complete patterns and security guidelines.

### Add Variable to Schema
Update `app/config/env.ts` with Zod validation:

**Server-only:** Add to `server` object
**Client-exposed:** Add to `client` object with `NEXT_PUBLIC_` prefix
**Optional:** Use `.optional()` for non-required vars

### Update Example File
Add placeholder to `.env.example` following placeholder format rules.

### Verify NEXT_PUBLIC_ Decision
Check if variable truly needs client exposure. Most variables should be server-only.

### Tell User to Update .env.local
Output clear instruction:
```
Add {VARIABLE_NAME} to .env.local:
{VARIABLE_NAME}=your_actual_value_here
```

Never attempt to read or write this file.

### Validate Configuration
```bash
pnpm typecheck
```

## Anti-Patterns

❌ Reading `.env.local` to "check" or "fix" values
❌ Writing to `.env.local` automatically
❌ Using `process.env.VARIABLE` in app code
❌ Adding `NEXT_PUBLIC_` to secrets/credentials
❌ Copying real values into `.env.example`

## References

- `llm/rules/environment.md` - Complete environment variable rules
- `app/config/env.ts` - Schema definition
- `.env.example` - Placeholder reference