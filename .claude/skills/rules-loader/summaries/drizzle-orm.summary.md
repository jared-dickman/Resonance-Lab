# Drizzle ORM Summary

**When to read full file:** Complex queries, relationship setup, or column type definitions

## Core Patterns

Drizzle uses schema-first approach with TypeScript types automatically inferred. Tables defined as objects with columns using `varchar()`, `text()`, `timestamp()`, `boolean()`, `serial()`, etc.

Relationships: Use `relations()` for computed fields and references. References validate foreign key integrity at schema level. One-to-many relationships expose array properties; many-to-one expose single reference objects.

Migrations: Use `drizzle-kit generate` after schema changes. Generates timestamped SQL files in `/db/drizzle/migrations/`. Always review generated SQL before applying.

Query patterns: Use `.select()`, `.where()`, `.insert().values()`, `.update().set()`, `.delete()`. All chainable. Subqueries supported via `.from(subqueryAlias)`.

## Critical Anti-Patterns

DO NOT: Manually write SQL migrations without schema definition first. DO NOT: Bypass type safety with raw SQL—use builder API.

DO NOT: Use deprecated Drizzle versions without checking migration guides. DO NOT: Forget to run `drizzle-kit sync` to reconcile schema with actual DB state.

## Key Validation Steps

1. Schema change reflected in both TS and generated SQL
2. Foreign keys point to correct tables/columns
3. Migrations are idempotent (safe to re-run)
4. Relations export correctly from schema file
5. Type inference works—no `unknown` types in queries

## Session-Specific Notes

For updateSession: Check schema for session table columns (created_at, updated_at, status, phase). Ensure timestamps auto-update. Verify constraints block invalid state transitions.