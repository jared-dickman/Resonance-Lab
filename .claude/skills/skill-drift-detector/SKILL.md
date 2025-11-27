---
name: skill-drift-detector
description: Detects when skill examples diverge from production code patterns
auto_trigger: false
keywords: [drift, examples, patterns, divergence, validate examples, check drift, skill audit]
---

# Skill Drift Detector

**Why:** Skill examples become stale as production evolves. Detect drift before developers copy outdated patterns.

**What:** Structural comparison between skill examples and production code. Report divergence by architectural pattern, not syntax.

---

## Detection Strategy

### Pattern Extraction

**Examples:** Extract canonical patterns (imports, structure, key architectural decisions)

**Production:** Sample representative files, extract same patterns

**Compare:** Structural alignment, not line-by-line diff

### Drift Metrics

**Thresholds:**
- 0-1%: Normal evolution (cosmetic differences)
- 2-10%: Review 
- 10%+: Update required

**What counts as drift:**
- Architectural shifts (class → factory, sync → async)
- Removed/added core patterns (auth middleware, error tracking)
- Import path changes reflecting structure refactors
- Type system evolution (satisfies, as const adoption)

**What doesn't:**
- Whitespace, comments, variable names
- Business logic specifics
- Test data creativity

### Skill-Specific Mappings

**api-generator:** Compare against `app/features/*/` (repository, service, transformer, TanStack)

**fixture-forge:** Compare against `app/testing/fixtures/*/`

**bdd-implementation-generator:** Compare against `e2e/` (POMs, locators, flows)

**ast-grep-auditor:** Compare against `rules/*.yml`

check for others

---

## Output

### Report Structure

**Summary:** short. Skills audited, drift distribution, highest-priority updates

**Per-skill findings:** short.  Drift %, production samples checked, specific mismatches

**Action items:** short. Prioritized by impact (>10% drift = high, 5-10% = medium)

**Save:** `.claude/output/reports/[DD-MM-YY]-skill-drift.md`

### Actionable Recommendations

Not just "12% drift detected" — explain what changed and why

Example: "service-pattern now uses middleware auth instead of inline checks. Update lines 23-45."

---

## Philosophy

**Goal:** Maintain trust in skill system. Developers copy examples — they must be current.

**Not a linter:** Architectural alignment, not code style enforcement.

**Evolve gracefully:** Production changes fast. Drift is inevitable — detection enables maintenance.