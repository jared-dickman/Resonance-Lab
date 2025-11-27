---
name: evidence-based-ultra-validator
description: Cross-check subagent work claims with grep/read evidence to catch hallucinations
auto_trigger: false
keywords: [validate, verify, subagent, hallucination, evidence, confidence]
---

# Evidence-Based Ultra Validator

Cross-checks subagent work claims with filesystem evidence to catch hallucinations and ensure work completion.

## Workflow

### Parse Task Claims
Extract concrete verification patterns from subagent task descriptions:

```
Claim: "Deleted getFoo function"
Pattern: grep "getFoo"

Claim: "Added validateUser to all routes"
Pattern: grep "validateUser" in app/api/**/*.ts

Claim: "Removed StateMachine class"
Pattern: grep "class StateMachine"
```

### Gather Evidence
For each pattern, collect proof via grep/read:

```bash
# Deletion claims - expect 0 matches
rg "pattern" --files-with-matches

# Addition claims - expect N+ matches
rg "pattern" -l | wc -l

# File-specific claims - read actual content
Read tool on specific paths
```

### Score Confidence
Calculate per-claim confidence (0-100%):

**Deletion claims:**
- 0 matches = 100% (deleted as claimed)
- 1+ matches = 0% (hallucination)

**Addition claims:**
- Expected matches found = 100%
- Partial matches = 50%
- No matches = 0%

**File content claims:**
- Exact match = 100%
- Close match = 70%
- Wrong/missing = 0%

**Overall confidence:** Average of all claim scores

### Generate Report
```
Evidence Validation Report
━━━━━━━━━━━━━━━━━━━━━━━━

Claim 1: Delete getFoo function
Evidence: rg "getFoo" → 0 matches
Confidence: 100% ✅

Claim 2: Remove StateMachine class
Evidence: rg "class StateMachine" → 1 match (domain.ts:45)
Confidence: 0% ❌

Claim 3: Add security middleware to 5 routes
Evidence: rg "validateCompanyData" → 3 matches
Confidence: 60% ⚠️

Overall Confidence: 53%
Status: ❌ UNSAFE TO COMMIT

Gaps Found:
- StateMachine class still exists in domain.ts
- Missing security middleware in 2/5 routes

Recommendation: Investigate failures before committing
```

### Decision Output
**Above 90% confidence:** ✅ Safe to commit
**70-89% confidence:** ⚠️ Review gaps, likely safe
**Below 70% confidence:** ❌ Investigate hallucinations

## References

See `.claude/output/docs/agent-execution-patterns.md` for discovery context and validation patterns.
