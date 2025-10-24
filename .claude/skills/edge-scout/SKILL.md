---
name: Edge Scout
description: Pre-implementation analyzer that surfaces business logic edge cases and cross-feature conflicts before coding starts
auto_trigger: false
keywords: [edge cases, analysis, planning, implementation, validate plan]
---

# Edge Scout

**Mode**: Pre-implementation edge case analyzer

## Purpose

Catch obscure business logic gotchas before coding starts. Reduce "oh shit" moments during implementation.

## Scope

**Analyzes:**

- Business logic conflicts (billing plans, roles, permissions, subscription states)
- Cross-feature interactions (forgotten features that touch the same domain)
- State management edge cases (what happens during transitions)
- Data consistency issues (orphaned records, cascade effects)

**Does NOT:**

- Generate code or tests
- Auto-fix issues
- Cover technical integration details (API contracts, race conditions)

## Input

Accepts any of:

- `/plan` output (plan.md)
- Spec file (spec.md)
- Natural language feature description

## Output

**Conversational warnings grouped by risk level:**

```markdown
## 🚨 High Risk

**Downgrade while admin features active**

- Current: Admins can use advanced analytics
- Conflict: What if user downgrades from Pro to Basic?
- Impact: Loss of data? Feature locked? Permission errors?
- Found in: app/features/billing, app/features/analytics

## ⚠️ Medium Risk

**Multi-workspace role inheritance**

- Current: Users can be admin in workspace A, viewer in workspace B
- Conflict: New global permissions might override workspace-level
- Impact: Potential privilege escalation or access denial
- Found in: app/features/workspaces, app/features/permissions

## 💡 Low Risk / Questions

**Trial expiration edge case**

- What happens if trial expires mid-blog-generation?
- Should operation complete or fail immediately?
```

## Workflow

1. **Parse input** - Extract feature description from plan/spec/description
2. **Identify domain** - Classify change (billing, auth, content, permissions, etc.)
3. **Scan codebase** - Find related features, state machines, business rules
4. **Cross-reference** - Map interactions between new change and existing features
5. **Generate warnings** - Surface edge cases grouped by severity
6. **Present for discussion** - Output conversational prompts, not solutions

## Detection Strategies

**State transition conflicts:**

```bash
# Find state machines and enums in domain
ast-grep --pattern 'enum $NAME { $$$ }' --lang typescript
# Look for status/state fields in related models
```

**Permission/role conflicts:**

```bash
# Find permission checks
grep -r "hasPermission\|canAccess\|isAdmin" app/features/[domain]
# Map role definitions
```

**Billing plan conflicts:**

```bash
# Find plan-gated features
grep -r "plan\.\|subscription\.\|tier\." app/features/
# Check feature flags tied to billing
```

**Cross-feature dependencies:**

```bash
# Find imports from other features
grep -r "from.*features/" app/features/[new-feature]
# Check shared utilities and state
```

## Anti-Patterns

❌ **Generating solutions:**

```markdown
Fix: Add `if (user.plan === 'basic') return false`
```

✅ **Raising questions:**

```markdown
What should happen when Basic plan users try to access Pro analytics?
Found similar check in: app/features/reports/permissions.ts:45
```

❌ **Technical implementation details:**

```markdown
Race condition in API endpoint...
```

✅ **Business logic focus:**

```markdown
Two users editing same blog post - who wins? Current behavior unclear.
```

## Success Metrics

- Surfaces 3-5 high-value edge cases per feature
- Finds forgotten cross-feature interactions
- Reduces mid-implementation design changes
- Warnings lead to upfront decisions vs late fixes

## Invocation

**Auto-triggered by:**

- gherkin-generator (after feature file generation, before implementation)

**Manual trigger:**

- After `/plan` completes
- Before `/implement` starts
- When spec feels incomplete

Command: `/edge-scout` or invoke skill directly

---

## Security Edge Cases

**Check for these patterns when analyzing new features:**

**Authentication gaps** - Does new endpoint use `requireAuthForRoute()` or `authenticateApiRequest()`?

**Company isolation** - Multi-tenant features must call `validateCompanyAccess()` to prevent cross-tenant data leaks

**Super admin audit** - Privileged operations require `eventTracker.trackEvent('super_admin_accessed', {...})`
