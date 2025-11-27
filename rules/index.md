# Rules Index

Load ONLY rules required for the current task. File descriptions are not completely inclusive.

## Rule Categories

### Core Development
- **`styling.md`** - CSS, Tailwind, design tokens
- **`components.md`** - React, JSX, component patterns
- **`animations.md`** - Framer Motion, system components, performance rules
- **`imports.md`** - Import paths, directory structure
- **`logging.md`** - Logger, error tracking (required: no `console.*`)
- **`analytics.md`** - Event tracking, user behavior
- **`linting-strategy.md`** - ESLint, ast-grep, Prettier tool responsibilities
- **`code-standards.md`** - TypeScript, functions, naming, anti-patterns
- **`zod-patterns.md`** - Zod validation, deprecated methods, common patterns
- **`environment.md`** - Environment variables, .env files, Vercel config, NEXT_PUBLIC_ rules

### Testing
- **`testing-fixtures.md`** - Centralized test data (Playwright + Storybook)
- **`testing-playwright.md`** - E2E testing (BDD, POM, intercepts, auth setup)
- **`testing-storybook.md`** - Component testing
- **`vitest.md`** - Integration testing patterns, utilities, anti-patterns

### Framework & Libraries
- **`nextjs.md`** - Server/client boundary, API routes
- **`tanstack-query.md`** - Data fetching (queryOptions, feature hooks)
- **`tanstack-query-mutations.md`** - Mutations, optimistic updates, infinite scroll
- **`db.md`** - Postgres, Drizzle, OpenAPI, serverless pooling, TOCTOU prevention (db.md:137-174)
- **`vercel-deployment.md`** - Serverless config, build pipeline, connection pooling

### Database Migrations
- **`migrations.md`** - Creating safe migrations (daily workflow)
- **`migrations-cicd.md`** - CI/CD automation setup

### Project Management
- **`packages.md`** - pnpm, dependency versioning
- **`security.md`** - Security best practices
- **`writing-rules.md`** - Meta-guidelines for rule authoring

## Code Standards

**All changes must:**
- Self-document via explicit names, focused functions (Do One Thing)
- The code must speak for itself and read like elegant prose
- Eliminate repetition (DRY)
- Use logger/error-tracker (NEVER `console.*`)
- Add minimal comments (complex logic only)

## Templates

**Use these examples as templates when creating new files:**

- **`llm/templates/schema-change-example.md`** - Complete database schema change workflow
- **`llm/templates/server-action-example.md`** - Next.js server actions with auth, validation, and tracking
- **`llm/templates/feature-module-example.md`** - Complete feature module with 8-12 files (keys, options, hooks, service, repository, DTOs)
- **`llm/templates/api-endpoint-example.md`** - API route creation with security patterns
- **`llm/templates/component-creation-example.md`** - React component creation and standards

These examples provide step-by-step guidance with actual codebase patterns, safety checks, and validation commands.

## Agent Prompt Files

**When creating task/prompt files for other agents (e.g., NEXT_STEPS.md, LOW_PRIORITY_TASKS.md):**

**NEVER duplicate code, examples, or instructions that already exist elsewhere.**

Create concise summaries:
- List tasks by name/number
- Reference source files with line numbers (e.g., "See BILLING_AUDIT_FIXES.md lines 661-1030")
- Include only critical context
- Keep under 50 lines when possible

This prevents token waste and maintains single source of truth.

**Writing meta-rules:** See `README.md`
