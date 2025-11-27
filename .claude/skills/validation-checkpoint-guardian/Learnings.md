# Validation Edge Cases & Learnings

Captured patterns from failed first attempts. Keep entries 2-3 lines max.

---

## Orphaned Method Call After Deletion

**Error Pattern:** `Property 'getNextPhaseAfterApproval' does not exist` after deleting private repository method
**Fix:** Replace with domain layer equivalent - check domain files for existing phase transition helpers. Example: `getNextDraftPhase()` already existed in `pillar-wizard-phases.domain.ts`

---

## Example Entry Format

**Error Pattern:** TypeScript migration drift after schema changes
**Fix:** Run `pnpm drizzle-kit generate` before typecheck. Example: `pnpm db:verify && pnpm typecheck`

---