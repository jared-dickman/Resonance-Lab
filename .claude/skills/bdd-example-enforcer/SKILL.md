---
name: BDD Example Enforcer
description: Auto-validates BDD tests against canonical patterns. Triggers on: "BDD", "Cucumber", "step definition", "feature file", "test generation"
auto_trigger: true
keywords: [bdd, cucumber, gherkin, playwright, test, step definition, feature, scenario, e2e]
---

# BDD Example Enforcer

**Canonical Reference**: `llm/templates/bdd-example.md`

## Workflow

**When triggered:**
1. Run `pnpm validate:bdd`
2. Read violations + canonical pattern (llm/templates/bdd-example.md lines specified)
3. Report violations to user with file:line
4. Apply fixes matching EXACT pattern
5. Re-validate until script exits 0

**Critical**: Automated checks catch structure. YOU must verify code matches canonical patterns EXACTLY.

## Non-Negotiable Rules

**Locators** - MUST use TestIds from fixtures:
```typescript
// ✅ CORRECT
import {BlogTestIds} from '@/app/testing/fixtures/blog/blog-fixtures'
export const createBlogPageLocators = (page: Page) => ({
  saveButton: page.getByTestId(BlogTestIds.saveButton)
})

// ❌ WRONG - hardcoded
saveButton: page.getByTestId('blog-save-button')
```

**Flows** - 1-3 lines max, pure delegation:
```typescript
// ✅ CORRECT
export const createBlogPageFlow = (basePage, locators) => ({
  clickSave: async () => await locators.saveButton.click()
})

// ❌ WRONG - logic
clickSave: async () => {
  if (await locators.saveButton.isVisible()) {
    await locators.saveButton.click()
  }
}
```

**Assertions** - 1-2 expects max:
```typescript
// ✅ CORRECT
export const createBlogPageAssertions = (basePage, locators) => ({
  isLoading: async () => await expect(locators.loadingSpinner).toBeVisible()
})

// ❌ WRONG - too complex
isLoading: async () => {
  await expect(locators.loadingSpinner).toBeVisible()
  await expect(locators.saveButton).toBeDisabled()
}
```

**Steps** - Unified pattern (ONE import):
```typescript
// ✅ CORRECT
import {createBlogPage} from '@/e2e/pages/blog-page.pom'
await createBlogPage(page).flows.clickSave()
await createBlogPage(page).assertions.isLoading()
```

## Directory Structure

Required files for EVERY domain:
```
e2e/
├── features/{domain}/{feature}.feature
├── locators/{domain}-page.locators.ts    # TestIds from fixtures
├── flows/{domain}-page.flow.ts           # 1-3 lines per method
├── assertions/{domain}-page.assertions.ts # 1-2 expects per method
├── intercepts/{domain}.intercepts.ts
├── pages/{domain}-page.pom.ts            # All 5 params
└── steps/{domain}/{feature}.steps.ts     # safe-steps, unified pattern

app/testing/fixtures/{domain}/{domain}-fixtures.ts  # TestIds constants
```

## Validation

**Script checks:**
- AST-Grep structural patterns
- safe-steps imports
- TestID fixture usage
- TypeScript compilation

**Manual review:**
- Read canonical example (llm/templates/bdd-example.md lines from script output)
- Compare side-by-side: imports, structure, delegation, naming
- Verify EXACT match - not "similar", not "improved", EXACT

**Fix violations:**
1. Read canonical section (line numbers from script)
2. Read violating file
3. Apply exact pattern
4. Re-read and confirm character-for-character match

**Common mistakes:**
- ❌ "This is basically the same" → NO, must match exactly
- ❌ "I improved it" → NO, consistency > cleverness
- ❌ Hardcoded string "just this once" → NO, use fixtures
- ✅ "Matches canonical exactly" → YES

## Quick Reference

| Violation | Fix | Canonical Lines |
|-----------|-----|-----------------|
| `@cucumber/cucumber` | Use `safe-steps` | 148-171 |
| Separate intercept import | Unified `.intercepts` | 148-156 |
| Hardcoded testid | Import from fixtures | 96-105 |
| Direct page methods | Delegate to POM | 107-114 |
| 4-param POM | Include intercepts (5th) | 133-146 |

**Post-fix verification:**
```bash
pnpm validate:bdd  # Must exit 0
pnpm test:bdd:smoke  # Warn if fails, don't block on infrastructure issues
```
