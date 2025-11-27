---
name: bdd-debugger
description: Self-healing BDD debugger - auto-fixes environment, intercepts, selectors, assertions
auto_trigger: false
keywords: [bdd, cucumber, playwright, test failing, timeout, hanging, frozen, self-healing, debug, troubleshoot, e2e, end-to-end, dev server, port conflict, intercept missing, selector not found, assertion failed, mock, fixture, testid, auto-fix, auto-heal]
---

# BDD Debugger

Self-healing debugger for Cucumber/Playwright tests. Checks environment health first, then auto-fixes code issues.

---

## Core Principle

Most BDD failures are environment issues (dev server down, port conflicts, stale processes). Check infrastructure before debugging test code.

---

## Auto-Healing Workflow

### Environment Health Check

Detects and fixes:
- Dev server not responding → Kill stale, clear cache, restart
- Port conflicts → Kill conflicting process
- Corrupted build cache → Clear `.next`, rebuild
- Database connection → Validate connection string

```bash
curl -sf http://localhost:3000 || (lsof -ti:3000 | xargs kill -9 && rm -rf .next && PORT=3000 pnpm dev)
```

### Failure Classification

**Timeout on navigation** → Environment issue (dev server or network)
**Timeout on action** → Missing API intercept
**Selector not found** → TestId changed in component
**Assertion failed** → Expected value changed
**Flaky test** → Race condition or missing loading state

### Auto-Fix Strategies

**Missing Intercept**
- Extract hooks from component
- Resolve to API routes
- Generate intercept with types
- Inject into step definition
- Validate typecheck + test

**Selector Changed**
- Search components for actual TestId
- Compare with fixture
- Update fixture automatically
- Validate compilation

**Text Changed**
- Extract actual text from component
- Compare with fixture constant
- Update fixture (skip dynamic/null/undefined)
- Validate test passes

**Response Shape Mismatch**
- Parse Zod schema from API hook
- Validate mock against schema
- Auto-fix field names and structure
- Regenerate intercept

### Self-Learning

After each auto-fix:
- Document failure type and solution
- Track patterns
- Update classification logic
- Add to decision tree
- Improve detection

---

## Decision Tree

```
Test Failure
  ↓
curl localhost:3000 fails?
  YES → Auto-heal environment → Retry
  NO → Classify error
    ↓
  Timeout on action → Generate intercept
  Selector not found → Update TestId fixture
  Assertion failed → Update text fixture
  Complex → Document + escalate
    ↓
  Validate fix
    ↓
  Document session
    ↓
  Update skill patterns
```

---

## Common Pitfalls

**Starting with code** → Should check environment first
**Modifying wait strategies** → Masks real issue
**Wrong tools** → Playwright MCP for server issues
**Skip documentation** → Loses knowledge, issues repeat

---

## Examples Directory

`examples/auto-heal.sh` - Health check and auto-restart script
`examples/intercept-gen.ts` - Mock generation from component hooks
`examples/selector-fix.ts` - TestId search and fixture update
`examples/session.md` - Real debugging session (billing page timeout)

---

## References

`llm/templates/bdd-example.md` - Canonical BDD patterns
`llm/commands/bdd-intercept-debug.md` - Intercept debugging
`.claude/skills/bdd-implementation-generator/` - Test generation

---

## Quick Start

```bash
# Test failing? Check server first:
curl -I http://localhost:3000

# If hangs, restart:
lsof -ti:3000 | xargs kill -9 && PORT=3000 pnpm dev

# If server responds, use skill to classify and auto-fix
```