# Agent Prompt for Resonance Lab Development

## Project Overview
You are working on the Resonance Lab project - a music/tone analysis application with a frontend, scraper, and Ultimate Guitar integration. The project has enterprise-grade code quality and security enforcement tools configured.

## Critical: Code Quality Enforcement
This project has **STRICT** code quality rules that are automatically enforced. You CANNOT bypass these checks:

### 🔒 Security Rules (MUST FOLLOW)
1. **NO hardcoded secrets**: Use environment variables for API keys, tokens, passwords
2. **NO unsafe innerHTML**: Never use dangerouslySetInnerHTML or .innerHTML
3. **NO SQL injection**: Use parameterized queries only
4. **REQUIRE validation**: All API endpoints must use Zod validation

### 📝 Code Standards (ENFORCED)
1. **Function components only**: Use `export function Component()` NOT arrow functions
2. **NO console.log**: Use proper logging utilities
3. **NO template literal classNames**: Use cn() utility
4. **NO direct TanStack Query**: Use feature hooks in `/hooks` directories
5. **NO `as any`**: Maintain type safety
6. **NO magic strings**: Use constants for routes, test IDs

### 🚨 Git Hooks (CANNOT SKIP)
- **Pre-commit**: Runs ESLint, Prettier, ast-grep, TypeScript checks
- **Commit messages**: Must follow format: `type(scope): description`
  - Types: feat, fix, docs, style, refactor, perf, test, chore
- **Pre-push**: Full validation suite runs

## Before Starting Any Work

1. **Run the setup if not done:**
   ```bash
   ./setup-linting-enhanced.sh
   ```

2. **Test the rules work:**
   ```bash
   npm run test:ast-grep-rules
   npm run ast-grep:scan
   ```

3. **Check current violations:**
   ```bash
   npm run lint:check
   npm run format:check
   ```

## Project Structure
```
resonance-lab/
├── frontend/          # Next.js frontend application
├── scraper/          # Go-based scraper
├── scripts/          # Build and linting scripts
│   ├── eslint-plugin-resonance.mjs  # Custom ESLint rules
│   └── test-ast-grep-rules.ts       # Rule testing
├── rules/            # ast-grep security rules
├── .husky/          # Git hooks (enforced)
└── .github/         # CI/CD workflows
```

## Available Commands
```bash
# Development
npm run dev           # Start development server

# Code Quality (ALL REQUIRED BEFORE COMMIT)
npm run lint         # Fix linting issues
npm run format       # Format with Prettier
npm run typecheck    # TypeScript validation
npm run ast-grep:scan # Security scan

# Testing
npm run test:ast-grep-rules  # Test all rules
npm run check:all            # Run everything
```

## Common Tasks

### Adding a New Component
```typescript
// ✅ CORRECT - Function declaration
export function MyComponent({ data }: Props) {
  return <div className={cn('base', data.active && 'active')}>{data.text}</div>
}

// ❌ WRONG - Arrow function (WILL BE BLOCKED)
export const MyComponent = () => { ... }
```

### Adding API Endpoints
```typescript
// ✅ CORRECT - With validation
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = schema.parse(body); // REQUIRED
  // ... rest of handler
}

// ❌ WRONG - No validation (WILL BE BLOCKED)
export async function POST(request: Request) {
  const body = await request.json(); // NO VALIDATION = BLOCKED
}
```

### Using Environment Variables
```typescript
// ✅ CORRECT
const apiKey = process.env.ULTIMATE_GUITAR_API_KEY;

// ❌ WRONG - Hardcoded (WILL BE BLOCKED)
const apiKey = 'sk-1234567890'; // BLOCKED BY no-exposed-secrets
```

### Data Fetching
```typescript
// ✅ CORRECT - Feature hook
// In: app/hooks/useSongs.ts
import { useQuery } from '@tanstack/react-query';
export function useSongs() {
  return useQuery({ ... });
}

// ❌ WRONG - Direct import (WILL BE BLOCKED)
// In: app/components/SongList.tsx
import { useQuery } from '@tanstack/react-query'; // BLOCKED
```

## Working with Frontend

The frontend is a Next.js application. Key points:
- Server/client boundary awareness required
- Use App Router patterns
- Follow Next.js 14+ best practices

## Working with Scraper

The scraper is written in Go. When modifying:
- Maintain existing patterns
- Update tests if changing functionality
- Ensure API compatibility with frontend

## Commit Workflow

1. **Make changes** following all rules above
2. **Stage files**: `git add .`
3. **Commit** (hooks will run automatically):
   ```bash
   git commit -m "feat(frontend): add song analysis view"
   ```
4. If checks fail, fix issues and try again
5. **Push** (more checks run): `git push`

## ⚠️ IMPORTANT WARNINGS

1. **NEVER use `--no-verify`** - It won't work, hooks are enforced
2. **NEVER commit to main/master directly** - Use feature branches
3. **NEVER add .env files** to Git
4. **NEVER use console.log** - Use proper logging
5. **ALWAYS run `npm run check:all`** before pushing

## Troubleshooting

### ESLint Errors
```bash
npm run lint        # Auto-fix what's possible
npm run lint:check  # See what needs manual fixing
```

### ast-grep Violations
```bash
npm run ast-grep:scan  # See violations
npm run test:ast-grep-rules  # Test rules
```

### Type Errors
```bash
npm run typecheck  # See TypeScript errors
```

### Commit Rejected
- Check commit message format: `type(scope): description`
- Run `npm run check:all` and fix all issues
- Ensure no TODO/FIXME/console.log in code

## Rule Documentation

See `rules-documentation.ts` for complete details on all 16 enforced rules including:
- Detailed explanations
- Valid/invalid examples
- Business justification
- Compliance requirements

## Emergency Override (NOT RECOMMENDED)

If absolutely necessary (should never be):
```bash
HUSKY=0 git commit ...  # Temporarily disable hooks
```
**Note**: This will still fail in CI/CD, so violations must be fixed eventually.

## Summary

This project enforces enterprise-grade code quality. Every commit must pass:
- 16 security and quality rules
- TypeScript type checking
- ESLint standards
- Prettier formatting
- Conventional commit format

There are no shortcuts. Write clean, secure code from the start.