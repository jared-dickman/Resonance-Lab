---
name: UI TestID Injector
description: Enterprise-grade TestID integration ensuring semantic, hierarchical naming that works flawlessly across Vitest, Storybook, and Playwright. Enforces industry best practices for maintainable, resilient test automation.
auto_trigger: false
keywords: []
---

# UI TestID Injector

**Mission**: Deliver production-grade TestID integration with semantic, self-documenting identifiers that ensure test stability across all testing frameworks.

**Standards**: Playwright + Vitest + Storybook compatibility, zero ambiguity, maximum clarity.

---

## EXECUTIVE SUMMARY

### Core Mandate

Every UI element requiring test coverage receives a precisely-named, semantically-rich `data-testid` that:

- **Describes WHAT** (element type: button, input, form, card)
- **Describes WHERE** (domain, component hierarchy)
- **Describes PURPOSE** (action or content: save, filter, error, loading)
- **Works EVERYWHERE** (Vitest component tests, Storybook interactions, Playwright E2E)

### Quality Standards

**❌ Unacceptable:**

- `data-testid="button1"` (meaningless)
- `data-testid="save"` (ambiguous - what saves?)
- `data-testid={saveBtn}` (missing context)

**✅ World-Class:**

- `data-testid={BillingTestIds.planCardSaveButton}` (domain + component + element + purpose)
- `data-testid={KeywordTestIds.searchFormInput}` (component + element type)
- `data-testid={BrandTestIds.profileHeaderTitle}` (location + element)

---

## NAMING ARCHITECTURE

### Hierarchical Structure

**Format:** `domain-component-element-type-purpose`

**Examples:**

```typescript
export const BillingTestIds = {
  // Page-level elements
  pageHeader: 'billing-page-header', // domain-page-element
  pageTitle: 'billing-page-title-text', // domain-page-element-type

  // Component-level elements
  planCardContainer: 'billing-plan-card-container', // domain-component-element
  planCardTitle: 'billing-plan-card-title-text', // domain-component-element-type
  planCardPrice: 'billing-plan-card-price-text',
  planCardSaveButton: 'billing-plan-card-save-button', // domain-component-element-action
  planCardCancelButton: 'billing-plan-card-cancel-button',

  // Form elements
  upgradeFormInput: 'billing-upgrade-form-input', // domain-component-element
  upgradeFormSubmitButton: 'billing-upgrade-form-submit-button',
  upgradeFormCancelButton: 'billing-upgrade-form-cancel-button',

  // State elements
  loadingSpinner: 'billing-loading-spinner', // domain-state-element
  errorMessage: 'billing-error-message-text', // domain-state-element-type
  successToast: 'billing-success-toast-container',

  // List elements (with dynamic functions)
  planCard: (planId: string) => `billing-plan-card-${planId}`,
  planCardButton: (planId: string, action: string) =>
    `billing-plan-card-${planId}-${action}-button`,
} as const;
```

### Element Type Taxonomy

**Always include element type in name:**

```typescript
// Buttons
(saveButton, cancelButton, submitButton, closeButton, deleteButton);

// Inputs
(emailInput, passwordInput, searchInput, filterInput, amountInput);

// Text Elements
(titleText, descriptionText, labelText, errorText, hintText);

// Containers
(cardContainer, formContainer, modalContainer, listContainer);

// Interactive Elements
(dropdown, checkbox, radioButton, toggle, slider);

// State Indicators
(loadingSpinner, errorMessage, successBanner, warningAlert);

// Navigation
(headerNav, sidebarNav, breadcrumbNav, tabNav);

// Media
(avatarImage, logoImage, thumbnailImage, videoPlayer);

// Tables/Lists
(dataTable, itemList, gridLayout);
```

### Domain Prefix Requirements

**Rule:** Every TestID starts with domain name

**Rationale:** Prevents collisions across features, enables grep-based searching, clarifies ownership

```typescript
// ✅ Correct - Clear domain ownership
billing - plan - card - save - button;
keywords - search - form - input;
brand - profile - header - title;

// ❌ Wrong - Domain ambiguous
plan - card - save - button; // Which feature's plans?
search - input; // Which search?
header - title; // Which page?
```

---

## LIST & ARRAY PATTERNS

### Pattern 1: Dynamic Function (Preferred)

**Use when:** List items have unique IDs

```typescript
// In fixtures
export const KeywordTestIds = {
  keywordCard: (id: string) => `keyword-card-${id}`,
  keywordCardTitle: (id: string) => `keyword-card-${id}-title-text`,
  keywordCardEditButton: (id: string) => `keyword-card-${id}-edit-button`,
  keywordCardDeleteButton: (id: string) => `keyword-card-${id}-delete-button`,
} as const

// In component
{keywords.map((kw) => (
  <Card key={kw.id} data-testid={KeywordTestIds.keywordCard(kw.id)}>
    <h3 data-testid={KeywordTestIds.keywordCardTitle(kw.id)}>{kw.title}</h3>
    <Button data-testid={KeywordTestIds.keywordCardEditButton(kw.id)}>Edit</Button>
    <Button data-testid={KeywordTestIds.keywordCardDeleteButton(kw.id)}>Delete</Button>
  </Card>
))}
```

### Pattern 2: Index-Based (Use Sparingly)

**Use when:** Items don't have stable IDs AND order is guaranteed

```typescript
// In fixtures
export const StepTestIds = {
  wizardStep: (index: number) => `checkout-wizard-step-${index}`,
  wizardStepTitle: (index: number) => `checkout-wizard-step-${index}-title-text`,
} as const

// In component
{steps.map((step, index) => (
  <div key={index} data-testid={StepTestIds.wizardStep(index)}>
    <h4 data-testid={StepTestIds.wizardStepTitle(index)}>{step.title}</h4>
  </div>
))}
```

**⚠️ Warning:** Avoid positional selectors in tests (`.first()`, `.nth(2)`) - always use specific TestIDs

### Pattern 3: Composite Keys

**Use when:** Items have multiple identifying attributes

```typescript
export const CompanyTestIds = {
  userRow: (userId: string, role: string) => `company-user-row-${userId}-${role}`,
  userRowEditButton: (userId: string) => `company-user-row-${userId}-edit-button`,
} as const;
```

---

## INTEGRATION WORKFLOW

### Phase 1: Analyze Fixtures

**Input:** Generated fixtures file

```typescript
// app/testing/fixtures/billing/billing-fixtures.ts
export const BillingTestIds = {
  pageHeader: 'billing-page-header',
  planCardSaveButton: 'billing-plan-card-save-button',
  upgradeFormInput: 'billing-upgrade-form-input',
} as const;
```

**Extract:**

1. Domain: `billing`
2. Components: `page`, `plan-card`, `upgrade-form`
3. Elements: `header`, `save-button`, `input`
4. Element types: `-header`, `-button`, `-input`

### Phase 2: Map to Components

**Search strategy:**

```
1. app/components/billing/          → BillingPage.tsx, PlanCard.tsx
2. app/(routes)/billing/page.tsx    → Route page
3. app/components/pages/            → Shared page components
4. app/components/forms/            → Shared form components
```

**Matching algorithm:**

```
TestID: billing-plan-card-save-button
↓
1. Find domain: "billing" → app/components/billing/
2. Find component: "plan-card" → PlanCard.tsx
3. Find element: "button" with "save" context → <Button>Save</Button>
4. Match confirmed: Inject testId
```

### Phase 3: Semantic Element Matching

**Precision matching rules:**

```typescript
// TestID: billing-plan-card-title-text
// Match criteria:
1. Component: PlanCard.tsx (from "plan-card")
2. Element type: <h2>, <h3>, <p> (from "-text")
3. Purpose: Title/heading element (from "title")
4. Location: Top of card component

// TestID: billing-upgrade-form-submit-button
// Match criteria:
1. Component: UpgradeForm.tsx (from "upgrade-form")
2. Element type: <Button> or <button> (from "-button")
3. Purpose: Form submission (from "submit")
4. Location: Inside <form> element

// TestID: billing-error-message-text
// Match criteria:
1. Conditional render: {error && ...}
2. Element type: <p>, <span>, <div> with text (from "-text")
3. Purpose: Error display (from "error-message")
4. Styling: text-destructive or error classes
```

### Phase 4: Inject with Precision

**Import pattern:**

```typescript
// Add after existing imports, before component definition
import { BillingTestIds } from '@/app/testing/fixtures/billing/billing-fixtures';
```

**Injection pattern:**

```typescript
// BEFORE
<Button
  onClick={handleSave}
  variant="default"
>
  Save Changes
</Button>

// AFTER - testId as final attribute
<Button
  onClick={handleSave}
  variant="default"
  data-testid={BillingTestIds.planCardSaveButton}
>
  Save Changes
</Button>
```

**Formatting rules:**

- `data-testid` on separate line (readability)
- Final attribute position (consistent location)
- Curly braces: `{TestIds.element}` (never strings)
- Preserve all existing formatting

### Phase 5: Validate Excellence

**Automated checks:**

```bash
pnpm typecheck                    # TypeScript compilation
pnpm exec ast-grep scan          # No magic string testIds
pnpm exec eslint --fix           # Code style compliance
```

**Manual verification:**

- [ ] Every TestID from fixtures has matching element
- [ ] Element type matches name suffix (-button, -input, -text)
- [ ] Semantic meaning is clear and unambiguous
- [ ] List patterns use functions, not hardcoded indices
- [ ] No duplicate TestIDs across components
- [ ] Import statement properly placed

---

## SPECIAL CASES

### Reusable Components

**Pattern:** Pass TestID as prop

```typescript
// Parent component
<PlanCard
  plan={activePlan}
  testId={BillingTestIds.activePlanCard}
  buttonTestId={BillingTestIds.activePlanCardUpgradeButton}
/>

// PlanCard.tsx
interface PlanCardProps {
  plan: Plan
  testId?: string
  buttonTestId?: string
}

export function PlanCard({ plan, testId, buttonTestId }: PlanCardProps) {
  return (
    <Card data-testid={testId}>
      <h3>{plan.name}</h3>
      <Button data-testid={buttonTestId}>Upgrade</Button>
    </Card>
  )
}
```

### Conditional Elements

**Pattern:** TestID ready even if not rendered

```typescript
export const BillingTestIds = {
  successMessage: 'billing-success-message-text',
  errorMessage: 'billing-error-message-text',
  loadingSpinner: 'billing-loading-spinner',
} as const

// Component - all states have TestIDs
{isLoading && <Spinner data-testid={BillingTestIds.loadingSpinner} />}
{error && <p data-testid={BillingTestIds.errorMessage}>{error}</p>}
{success && <p data-testid={BillingTestIds.successMessage}>Saved!</p>}
```

### Third-Party Components

**Pattern:** Wrap with testId container if component doesn't accept data-testid

```typescript
// If <ThirdPartySelect> doesn't accept data-testid
<div data-testid={FormTestIds.planSelectContainer}>
  <ThirdPartySelect options={plans} />
</div>
```

---

## QUALITY ASSURANCE

### Pre-Integration Checklist

Before injecting any TestIDs:

- [ ] Fixtures follow hierarchical naming: `domain-component-element-type-purpose`
- [ ] Element types are explicit: `-button`, `-input`, `-text`, `-container`
- [ ] No ambiguous names: avoid `item`, `box`, `thing`, `data`
- [ ] List patterns use functions with IDs, not indices
- [ ] Domain prefix present on every TestID

### Post-Integration Validation

After injecting TestIDs:

- [ ] `pnpm typecheck` passes
- [ ] `pnpm exec ast-grep scan` shows no violations
- [ ] All TestIDs from fixtures are mapped
- [ ] Semantic match: button names end in `-button`, inputs in `-input`
- [ ] No duplicate TestIDs
- [ ] Import statements properly placed

### Unmapped TestIDs Report

If TestIDs can't be mapped:

```markdown
⚠️ TestID Integration Issues

**Domain:** billing

**Unmapped TestIDs** (3):

1. **BillingTestIds.exportButton** (`billing-export-button`)
   - Expected: Export/download button in billing page
   - Searched: BillingPage.tsx, PlanCard.tsx, BillingTable.tsx
   - Status: Feature not implemented
   - Action: Remove TestID or implement export feature

2. **BillingTestIds.filterFormInput** (`billing-filter-form-input`)
   - Expected: Filter input in billing interface
   - Searched: All billing components
   - Status: Filter UI pending
   - Action: Add filter UI or remove TestID

3. **BillingTestIds.chartContainer** (`billing-chart-container`)
   - Expected: Usage chart visualization
   - Searched: BillingPage.tsx
   - Status: Charts not in current scope
   - Action: Remove TestID from fixtures
```

---

## COMPLETION STANDARD

**Success criteria:**

```markdown
✅ TestID Integration Complete

**Domain:** {domain}
**Components Modified:** {N}
**TestIDs Integrated:** {M}/{Total}

**Quality Metrics:**

- ✅ Semantic naming: 100% compliance
- ✅ Element type suffix: 100% present
- ✅ Domain prefix: 100% present
- ✅ TypeScript: No errors
- ✅ ast-grep: No violations
- ✅ Duplicate TestIDs: None

**Testing Ready:**

- Vitest: `pnpm test:unit --grep "{domain}"`
- Storybook: All stories with play functions
- Playwright: `pnpm test:bdd:smoke --grep "@{domain}"`

**Maintainability Score:** A+

- Clear, self-documenting TestIDs
- Hierarchical organization
- List patterns using functions
- No positional selectors required
```

---

## INTEGRATION PIPELINE

```
/bdd command
  ↓
[gherkin-generator]
  ↓
[bdd-implementation-generator]
  • Generates semantic TestID fixtures
  ↓
[ui-testid-injector] ← YOU ARE HERE
  • Validates naming: domain-component-element-type-purpose
  • Injects data-testid with precision matching
  • Ensures Vitest + Storybook + Playwright compatibility
  ↓
[bdd-example-enforcer]
  • Validates no magic strings
  • Enforces fixture imports
  ↓
Production-Ready ✅
```

---

## NOTES

**Philosophy:** TestIDs are first-class documentation. A developer should read `billing-plan-card-save-button` and immediately know:

- Domain: `billing`
- Component: `plan-card`
- Element: `button`
- Purpose: `save`

**Zero ambiguity. Maximum clarity. World-class quality.**
