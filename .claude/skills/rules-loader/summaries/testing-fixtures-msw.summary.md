# MSW Handler Testing Patterns

## Core MSW Handler Structure

- All handlers live in `/app/testing/msw/handlers/`
- Use `msw.http.post()`, `msw.http.get()` for route matching
- Handlers must validate request structure before responding
- Use `validate-mock-request.ts` utilities for input validation
- Response objects must match actual API contract exactly

## Environment Variable Access in MSW

- MSW handlers run in Node.js test environment, not browser
- Access environment via `process.env` directly
- Use `.env.test` or `.env.local` for test-specific configuration
- NEVER hardcode API routes—always reference from constants
- Extract base URLs to handler-level constants or shared config

## Critical Anti-Patterns

**FAIL:** `as any` type assertions in handlers
**FAIL:** Hardcoded URLs like `'http://localhost:3000/api/pillars'`
**FAIL:** Direct `process.env.VARIABLE` without null-checking
**FAIL:** Response objects that don't match API schema

## Validation Steps

- Check handler response type matches client expectations
- Ensure env variable fallbacks exist for test environments
- Verify all routes use consistent base URL pattern
- Validate request/response bodies against schema

## When to Read Full Files

- Implementing new handler: read testing-fixtures.md
- MSW setup issues: check testing-fixtures.md
- Type safety concerns: read code-standards.md
- Environment configuration: read environment.md