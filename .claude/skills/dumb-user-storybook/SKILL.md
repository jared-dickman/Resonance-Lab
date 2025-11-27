---
name: Dumb User Storybook
description: Generates missing visual/interaction edge cases for Storybook component tests. Identifies gaps in empty, error, loading, overflow, and permission states. NOT for bdd or vitest!
auto_trigger: true
keywords: [storybook, story, stories, component test, visual test, interaction test, play function, msw]
---

# Dumb User Storybook

**Auto-triggers when:** Creating/updating `.stories.tsx` files in `app/components/`

**Generates:** `.dumb.stories.tsx` file parallel to main stories

**Scope:** Component visual/interaction states only - never E2E flows or unit logic

---

## Workflow

### 1. Think Deeply First

**Before generating anything:**
- Read ALL existing stories in the component's `.stories.tsx` file
- List every story that already exists
- Identify what states are truly missing
- Avoid duplication at all costs

### 2. Analyze Existing Coverage

**Check what exists:**
- Default/interactive states
- Loading states (slow API, skeleton screens)
- Error states (API failures, validation)
- Empty states (no data, null props)
- Overflow states (long text, many items)
- Permission states (disabled, read-only)

### 3. Identify Genuine Gaps

**Only add stories for truly missing states:**

**Empty states:** No data, zero items, null props
**Error states:** API 500/404/403, validation errors
**Loading states:** Delayed API, disabled during load
**Overflow states:** Very long text, truncation, many items
**Permission states:** Disabled buttons, hidden elements

### 4. Generate in `.dumb.stories.tsx`

**CRITICAL: Use separate dumb file to avoid duplicating existing stories**

Create `.claude/skills/dumb-user-storybook/examples/ComponentName.dumb.stories.tsx`

Follow patterns in `examples/` folder.

### 5. Validation

- [ ] Read all existing stories first
- [ ] No duplication of existing stories
- [ ] Component visual/interaction states only
- [ ] Uses fixtures from `@/app/testing/fixtures`
- [ ] MSW handlers for API mocking
- [ ] Follows codebase story naming conventions

---

## Decision Matrix

| Edge Case | Story? | Why |
|-----------|--------|-----|
| Empty array | ✅ | Visual state |
| API error | ✅ | Error UI |
| Long text | ✅ | Truncation |
| Validation logic | ❌ | Unit test |
| E2E workflow | ❌ | BDD test |

---

## Anti-Patterns

❌ Duplicating existing stories
❌ E2E workflows (use BDD)
❌ Unit logic (use Vitest)
❌ Hardcoded strings (use fixtures)
❌ Skipping deep analysis of existing stories

✅ Visual component states only
✅ Fixtures and MSW handlers
✅ Think before generating

---

## References

- `llm/rules/testing-storybook.md`
- `llm/rules/testing-fixtures.md`
- `.claude/skills/dumb-user-storybook/examples/`