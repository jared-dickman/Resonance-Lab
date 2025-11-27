# Environment Variables

## File Protection

**.env.local** - NEVER read or write (user manages manually)
**.env.example** - Update placeholders only
**.env.backups/** - Auto-managed by `scripts/backup-env.sh`

## Code Usage

**✅ Correct:**
```typescript
import {env} from '@/app/config/env'
const url = env.DATABASE_URL
```

**❌ Incorrect:**
```typescript
const url = process.env.DATABASE_URL // No validation, no type safety
```

**Exception:** Tool configs (drizzle.config.ts, playwright.config.ts) - exempt

## Adding Variables

1. Add to `app/config/env.ts` schema
2. Add placeholder to `.env.example`
3. Tell user: "Add VARIABLE_NAME to .env.local"
4. Configure Vercel dashboard

**Schema structure:**
```typescript
server: {
  DATABASE_URL: z.url(),
  AUTH_SECRET: z.string().min(32)
},
client: {
  NEXT_PUBLIC_APP_URL: z.url().optional()
}
```

## NEXT_PUBLIC_ Prefix

**Use ONLY for:**
- Public analytics IDs
- Feature flags for UI
- App URLs in browser

**NEVER for:**
- API keys
- Database credentials
- Auth secrets
- Internal service URLs

**Why:** Inlined into JavaScript bundle, visible in DevTools, cannot change without rebuild

## Security Pitfalls

**Bundle exposure:**
- Server vars in client components get exposed
- Verify browser DevTools after adding client vars

**Logging leaks:**
- Error handlers dump entire environment
- Stack traces include env values
- Always use logger utility

**Child process inheritance:**
- Spawned processes inherit all env vars
- Pass only needed vars explicitly

**Vercel preview deployments:**
- Inherit production env vars
- Use preview-specific test keys

**Static secrets:**
- No rotation schedule, no audit trail
- Use secrets manager for production

## Shell Environment Variables

**CRITICAL: Never export environment variables from agents or scripts**

**The Problem:**
- Shell environment variables take precedence over `.env.local` files
- Previous agents may have exported variables that persist in the shell session
- These stale exports can override correct `.env.local` values causing hard-to-diagnose issues

**Symptoms:**
- Database timeouts despite correct `.env.local` configuration
- App using wrong API endpoints or credentials
- Changes to `.env.local` not taking effect

**Detection:**
```bash
# Check for exported project variables
env | grep -E "^(DATABASE|POSTGRES|AUTH|GOOGLE|N8N|NEXT_PUBLIC)"
```

**Solution:**
- Restart your terminal to clear all exported variables
- Never run `export VARIABLE=value` for project secrets
- Let Next.js load variables from `.env.local` automatically

**`env -i`:**
- `env -i` strips ALL environment variables

## Placeholder Format

```bash
# ❌ Bad
DATABASE_URL=postgresql://user:pass@host:5432/db

# ✅ Good
AUTH_SECRET=generate_with_openssl_rand_base64_32
```

## Minimum Lengths

- Auth secrets: 32+ characters
- JWT secrets: 32+ characters
- Webhook keys: 32+ characters

## Naming Patterns

- Database: `*_URL`, `*_PASSWORD`, `*_HOST`
- Auth: `*_SECRET`, `*_CLIENT_ID`, `*_CLIENT_SECRET`
- APIs: `*_API_KEY`, `*_TOKEN`
- Public: `NEXT_PUBLIC_*`

## Service-Specific Variables

### OpenAI Integration

**OPENAI_API_KEY** (server-only, optional)
- Used for: Content generation (pillar/cluster topics)
- Development: Not required if `NEXT_PUBLIC_ENABLE_MSW=true` (MSW intercepts API calls)
- Production: Required for real OpenAI API calls
- Format: `sk-proj-...` (starts with sk-proj for project keys)
- Get from: https://platform.openai.com/api-keys
- Security: Server-only, never expose to client

**Implementation:**
```typescript
// app/config/env.ts
server: {
  OPENAI_API_KEY: z.string().optional().describe('OpenAI API key for content generation')
}

// Usage in worker
import {env} from '@/app/config/env'
const apiKey = env.OPENAI_API_KEY
if (!apiKey) {
  return NextResponse.json({error: 'OpenAI API key not configured'}, {status: 500})
}
```

**MSW Testing:**
MSW intercepts `https://api.openai.com/v1/chat/completions` when `NEXT_PUBLIC_ENABLE_MSW=true`, returning mock data. This allows E2E testing without API keys or costs.

## Vercel Scopes

**Production** - Live user traffic
**Preview** - PR deployments (use different keys)
**Development** - Local `vercel dev`

**Common mistakes:**
- Same database for preview/production
- Sharing auth secrets across environments
