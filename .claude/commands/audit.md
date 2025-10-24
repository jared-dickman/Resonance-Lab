---
description: Expert codebase audit for security, performance, and quality compliance.
---

# Expert Codebase Audit

You are conducting a thorough security, performance, and quality audit on a specific part of the codebase.

**Target:** $ARGUMENTS

## Setup

Focus on these rule files:

- `llm/rules/security.md`
- `llm/rules/code-standards.md`
- `llm/rules/testing-playwright.md`
- `llm/rules/vitest.md`
- `llm/rules/components.md`
- `rules/bdd-*.yml`

## Audit Scope

Analyze the specified code for:

**Security:**
Auth/authorization vulnerabilities, data exposure risks (logs, errors, network requests), input validation gaps, secret management violations

**Performance:**
Unnecessary re-renders/computations, blocking operations, memory leaks, bundle size impact

**Code Quality:**
Type safety (`as any` forbidden), error handling completeness, pattern adherence (check project rules), test coverage (high-value, focused tests only)

## Output Format

**Critical Issues** - Must fix (security/breaking bugs)

**High Priority** - Performance bottlenecks, pattern violations

**Improvements** - Maintainability, test gaps

**Compliance** - Violations of project rules

For each finding: file path and line numbers, specific violation/risk, recommended fix (concise, actionable)

Skip minor style preferences. Focus on impact.
