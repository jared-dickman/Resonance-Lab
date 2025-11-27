# Real Debugging Session

**Date**: 2025-01-26
**Test**: "And I am on the billing page"
**Symptom**: Timeout after 30s

---

## What DIDN'T Work ❌

**Modified page.goto() wait strategy**
```typescript
// e2e/pages/base-page.pom.ts:19
await page.goto(url, {waitUntil: 'domcontentloaded'}) // Changed from default
```
Result: Still timed out

**Tried Playwright MCP**
Result: Browsers not installed, wrong tool

**Analyzed intercepts/mocks**
Result: All correct, not the issue

**Time wasted**: ~90 minutes

---

## What DID Work ✅

**Tested dev server**
```bash
curl http://localhost:3000/billing
# Hung indefinitely ← Root cause!
```

**Checked process**
```bash
lsof -ti:3000
# 30020 ← Hung/crashed
```

**Restarted server**
```bash
kill 30020
PORT=3000 pnpm dev
```

**Ran test**
```bash
pnpm test:bdd -- --name "I am on the billing page"
# ✅ Passed in 18s
```

**Time to fix**: 5 minutes

---

## Key Lesson

**Always check dev server FIRST**

```bash
curl -I http://localhost:3000  # Should return in <2s
```

If hangs → server issue, not test issue

---

## Prevention

Add to pre-test script:
```bash
# scripts/pre-bdd.sh
./claude/skills/bdd-debugger/examples/01-auto-heal.sh && pnpm test:bdd
```

Update package.json:
```json
{
  "scripts": {
    "test:bdd": "bash examples/01-auto-heal.sh && cucumber-js"
  }
}
```

---

## Time Savings

- Without systematic approach: **90+ minutes**
- With environment check first: **5 minutes**
- **Savings: 85 minutes (17x faster)**