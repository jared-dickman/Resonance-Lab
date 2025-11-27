# MSW (Mock Service Worker) - Summary

MSW is used for API mocking in tests with handler-based interception. Handlers intercept HTTP requests and return configured responses.

## Core Patterns

Handlers are pure functions that receive a request context and return a response. Each handler maps to a specific endpoint and HTTP method using factory patterns (e.g., `http.get()`, `http.post()`).

Handlers must be stateless - they receive all dependencies via closures from fixtures or factory arguments, never from module-level state or global variables.

## Critical Anti-Patterns to Avoid

**Do NOT use bypass():** Bypass functions create brittle tests by routing to real APIs. Tests must be fully isolated with predictable mock responses.

**Do NOT use stateful session management in handlers:** Handlers should not modify or depend on module-scoped variables, global state, or session tokens. All state must flow through request/response data.

**Do NOT import domains directly in handlers:** Handlers must import only fixture functions and types. Never import service classes, repositories, or business logic from the domain layer. This creates coupling between test infrastructure and application code.

**Do NOT store handler references or modify them after setup:** Handler definitions must be immutable once initialized.

## Key Validation Steps

Validate handlers are pure:
- No references to module-level mutable state
- No imports from domain/service/repository layers
- All dependencies passed through request context or fixture factories
- Consistent behavior for same input across test runs

Validate request/response schemas:
- Use Zod schemas to parse incoming requests
- Type responses with proper shape matching API contracts
- Validate all required fields are present in fixtures

Validate isolation:
- Each test has its own isolated set of handlers or clear defaults
- No test leaks state into the next test
- Handler behavior is deterministic and predictable

## When to Read Full File

Read the full testing-fixtures.md and testing-fixtures-msw.summary.md if:
- Building new handler factories for reuse
- Establishing handler patterns across multiple features
- Implementing complex fixture composition patterns
- Debugging test isolation issues
- Creating request schema validation
