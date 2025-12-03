# Install nuqs + Create URL State Wrapper

## Setup
Run `/7` before starting.

## Rules
Focus on: `hooks.md`, `lib-utils.md`, `naming.md`, `dependencies.md`

## Goal
Add type-safe URL search params to Jamium via `nuqs`, wrapped in a single abstraction so the codebase never imports nuqs directly. This enables Buddy (our AI agent) to drive UI state through URL params.

## Requirements

**Install** `nuqs` package

**Create wrapper hook** at `frontend/lib/hooks/useJamParams.ts`
- Name it something music/jam themed: `useJamParams`, `useQueryJam`, `useSearchParty`, `useParamour`, etc.
- Re-export all nuqs parsers and hooks through this single file
- Add app-specific parser presets (song, bpm, tab type, etc.)

**Wire up NuqsAdapter** in root layout (required for Next.js App Router)

## Constraints
- Single source of truth: only the wrapper file imports from nuqs
- No direct nuqs imports anywhere else in the app
- Type-safe throughout
- Keep it thin - just re-exports + app presets

## Why
- Buddy can set `?song=hotel-california&tab=chords` to control UI
- Easy swap if we ever need a different URL state lib
- Centralized parser definitions for consistency

## Deliverable
- nuqs installed
- Wrapper hook with fun name
- NuqsAdapter in layout
- Brief usage example in hook file comments
