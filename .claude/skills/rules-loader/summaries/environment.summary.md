# Environment Variables Summary

## What This Covers

Environment variable management: file protection, code patterns, NEXT_PUBLIC_ prefix rules, Vercel configuration, security pitfalls.

## When to Read Full File

**Read environment.md when:**
- Adding new environment variable to project
- Deciding whether to use NEXT_PUBLIC_ prefix
- User reports env var not loading in Vercel
- Security audit flags environment configuration
- Debugging validation errors from app/config/env.ts
- Setting up preview vs production environments
- Investigating bundle size increase (possible NEXT_PUBLIC_ overuse)
- Migrating from direct process.env to validated config

## Critical Rules (Always Apply)

**File protection:**
- NEVER read or write .env.local
- Tell user to manually update .env.local

**Code usage:**
- Always use `import {env} from '@/app/config/env'`
- Never use `process.env.VARIABLE_NAME` in app code

**NEXT_PUBLIC_ decision:**
- Only for non-sensitive data visible in browser
- Never for API keys, secrets, or credentials