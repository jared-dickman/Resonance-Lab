---
name: BDD Implementation Generator
description: Generates complete BDD test infrastructure (fixtures, locators, flows, assertions, intercepts, POMs, step definitions) following exact codebase patterns. Never deviates from established architecture.
auto_trigger: false
keywords: []
---

# BDD Implementation Generator

**Role**: Test Infrastructure Specialist - Exact Pattern Replication

**Called by**: `/bdd` command after gherkin-generator completes

**Input**: Generated `.feature` file with scenarios

**Output**: Complete, runnable test suite matching codebase patterns EXACTLY

---

## ARCHITECTURE PATTERN (7-Layer Structure)

**EVERY feature requires these 7 files:**

```
app/testing/fixtures/{domain}/
  └── {domain}-fixtures.ts          # TestIds + Text constants + Mock data

e2e/locators/
  └── {domain}-page.locators.ts     # Selectors using TestIds

e2e/flows/
  └── {domain}-page.flow.ts         # 1-3 line action methods

e2e/assertions/
  └── {domain}-page.assertions.ts   # 1-2 expect verification methods

e2e/intercepts/
  └── {domain}.intercepts.ts        # API mocking with intercept() utility

e2e/pages/
  └── {domain}-page.pom.ts          # Factory combining all 5 layers

e2e/steps/{domain}/
  └── {feature}.steps.ts            # Cucumber step definitions
```

---

## MANDATORY RULES

### Rule 1: TestIds in Fixtures ONLY
**✅ CORRECT**:
```typescript
// app/testing/fixtures/billing/billing-fixtures.ts
export const BillingTestIds = {
  pageHeader: 'billing-page-header',
  saveButton: 'billing-save-button',
} as const

// e2e/locators/billing-page.locators.ts
import {BillingTestIds} from '@/app/testing/fixtures/billing/billing-fixtures'
export const createBillingPageLocators = (page: Page) => ({
  saveButton: page.getByTestId(BillingTestIds.saveButton),
})
```

**❌ WRONG**:
```typescript
// e2e/locators/billing-page.locators.ts
saveButton: page.getByTestId('billing-save-button') // ❌ NO hardcoded strings!
```

### Rule 2: Flows Are 1-3 Lines Max
**✅ CORRECT**:
```typescript
export const createBillingPageFlow = (basePage: BasePagePom, locators: BillingPageLocators) => ({
  clickSaveButton: async () => await locators.saveButton.click(), // 1 line
})
```

**❌ WRONG**:
```typescript
clickSaveButton: async () => {
  if (await locators.saveButton.isVisible()) { // ❌ NO logic!
    await locators.saveButton.click()
    await basePage.page.waitForTimeout(1000) // ❌ NO waits!
  }
}
```

### Rule 3: Assertions Are 1-2 Expects Max
**✅ CORRECT**:
```typescript
export const createBillingPageAssertions = (basePage: BasePagePom, locators: BillingPageLocators) => ({
  showsSaveButton: async () => await expect(locators.saveButton).toBeVisible(),
})
```

**❌ WRONG**:
```typescript
showsSaveButton: async () => {
  await expect(locators.saveButton).toBeVisible()
  await expect(locators.saveButton).toBeEnabled()
  const text = await locators.saveButton.textContent()
  expect(text).toBe('Save') // ❌ Too many expects!
}
```

### Rule 4: Step Definitions Use Safe-Steps + Unified Pattern
**✅ CORRECT**:
```typescript
import {Given, When, Then} from '@/e2e/support/safe-steps'
import {createBillingPage} from '@/e2e/pages/billing-page.pom'

When('I click save', async (page: Page) => {
  await createBillingPage(page).flows.clickSaveButton()
})
```

**❌ WRONG**:
```typescript
import {When} from '@cucumber/cucumber' // ❌ NO! Use safe-steps
import {createBillingPageFlow} from '@/e2e/flows/billing-page.flow' // ❌ NO separate imports!

When('I click save', async function() {
  await createBillingPageFlow(this.basePage, this.locators).clickSaveButton() // ❌ Wrong pattern!
})
```

---

## GENERATION WORKFLOW

### Step 1: Parse Feature File

**Extract from generated .feature**:
```typescript
{
  domain: string            // from tags: @billing
  feature: string           // from filename: billing.feature
  scenarios: Array<{
    name: string
    steps: Array<{
      type: 'Given' | 'When' | 'Then' | 'And'
      text: string
    }>
  }>
}
```

### Step 2: Identify Required Elements

**For each step, determine:**
- **Locator**: Does step interact with UI element? → Extract element name
- **Flow**: Does step perform action? → Create flow method
- **Assertion**: Does step verify state? → Create assertion method
- **Intercept**: Does step mock API? → Create intercept method

**Example**:
```gherkin
When I click the save button
  → Locator: saveButton
  → Flow: clickSaveButton()

Then I see "Saving..."
  → Locator: savingMessage
  → Assertion: showsSavingMessage()

Given the billing API will fail
  → Intercept: mockFailingBillingAPI()
```

### Step 3: Generate Fixtures File

**Template**:
```typescript
// app/testing/fixtures/{domain}/{domain}-fixtures.ts
export const {Domain}TestIds = {
  pageHeader: '{domain}-page-header',
  {element1}: '{domain}-{element1}',
  {element2}: '{domain}-{element2}',
  // ... one entry per UI element
} as const

export const {Domain}Text = {
  pageTitle: '{Title}',
  {textConstant1}: '{value1}',
  // ... UI text constants
} as const

// Mock data for intercepts
export const mock{Entity}Data = {
  // ... mock response data
} as const
```

**Naming convention**:
- TestIds: `{domain}-{element-name}` (kebab-case)
- Keys: camelCase
- Export as `const`

### Step 4: Generate Locators File

**Template**:
```typescript
// e2e/locators/{domain}-page.locators.ts
import type {Page} from '@playwright/test'
import {{Domain}TestIds} from '@/app/testing/fixtures/{domain}/{domain}-fixtures'

export const create{Domain}PageLocators = (page: Page) => ({
  {element1}: page.getByTestId({Domain}TestIds.{element1}),
  {element2}: page.getByTestId({Domain}TestIds.{element2}),
  // ... one entry per UI element
} as const)

export type {Domain}PageLocators = ReturnType<typeof create{Domain}PageLocators>
```

**Rules**:
- Import TestIds from fixtures
- NEVER hardcode testId strings
- Use `page.getByTestId()` exclusively
- Export type for TypeScript safety

### Step 5: Generate Flows File

**Template**:
```typescript
// e2e/flows/{domain}-page.flow.ts
import type {BasePagePom} from '@/e2e/pages/base-page.pom'
import type {{Domain}PageLocators} from '@/e2e/locators/{domain}-page.locators'
import {pageRoutes} from '@/app/config/pageRoutes'

export const create{Domain}PageFlow = (basePage: BasePagePom, locators: {Domain}PageLocators) => {
  return {
    navigateTo{Domain}Page: async () => {
      await basePage.flows.goto(pageRoutes.{domain})
    },

    {actionMethod1}: async () => {
      await locators.{element}.click()
    },

    {actionMethod2}: async (text: string) => {
      await locators.{element}.fill(text)
    },
    // ... one method per user action
  } as const
}

export type {Domain}PageFlow = ReturnType<typeof create{Domain}PageFlow>
```

**Rules**:
- Accept `basePage` and `locators` as parameters
- Each method is 1-3 lines
- Only call locator methods (`.click()`, `.fill()`, `.check()`, etc.)
- For navigation, use `basePage.flows.goto()`
- NO business logic, NO conditionals, NO waits

### Step 6: Generate Assertions File

**Template**:
```typescript
// e2e/assertions/{domain}-page.assertions.ts
import {expect} from '@playwright/test'
import type {{Domain}PageLocators} from '@/e2e/locators/{domain}-page.locators'
import type {BasePagePom} from '@/e2e/pages/base-page.pom'
import {{Domain}Text} from '@/app/testing/fixtures/{domain}/{domain}-fixtures'

export const create{Domain}PageAssertions = (basePage: BasePagePom, locators: {Domain}PageLocators) => ({
  isVisible: async () => {
    await expect(locators.pageHeader).toBeVisible()
  },

  {assertionMethod1}: async () => {
    await expect(locators.{element}).toBeVisible()
  },

  {assertionMethod2}: async (expectedText: string) => {
    await expect(locators.{element}).toContainText(expectedText)
  },
  // ... one method per verification
} as const)

export type {Domain}PageAssertions = ReturnType<typeof create{Domain}PageAssertions>
```

**Rules**:
- Accept `basePage` and `locators` as parameters
- Each method is 1-2 expect statements
- Use locators from parameter
- Common patterns:
  - `.toBeVisible()`
  - `.not.toBeVisible()`
  - `.toContainText()`
  - `.toBeEnabled()`
  - `.toBeDisabled()`
  - `.toHaveClass()`

### Step 7: Generate Intercepts File

**Template**:
```typescript
// e2e/intercepts/{domain}.intercepts.ts
import type {Page} from '@playwright/test'
import {apiRoutes} from '@/app/config/apiRoutes'
import {API_ERROR_MESSAGES} from '@/app/config/constants'
import {mock{Entity}Data} from '@/app/testing/fixtures/{domain}/{domain}-fixtures'
import type {E2EApiErrorResponse} from '@/e2e/types/api-responses'
import {intercept} from '@/e2e/utils/intercept'

export const create{Domain}Intercepts = (page: Page) => ({
  mockFailing{Domain}API: async () => {
    await intercept<E2EApiErrorResponse>(page, `api/${apiRoutes.{domain}}`, {
      status: 500,
      body: { error: API_ERROR_MESSAGES.internalServerError },
    })
  },

  mockSlow{Domain}API: async () => {
    await intercept(page, `api/${apiRoutes.{domain}}`, {
      delay: 3000,
      body: mock{Entity}Data,
    })
  },

  // ... one method per API scenario
} as const)

export type {Domain}Intercepts = ReturnType<typeof create{Domain}Intercepts>
```

**Rules**:
- Accept `page` as parameter
- Use `intercept()` utility from `@/e2e/utils/intercept`
- Import API routes from `@/app/config/apiRoutes`
- Always provide: error scenario, slow/loading scenario
- Use mock data from fixtures

### Step 8: Generate POM File

**Template** (EXACTLY this structure):
```typescript
// e2e/pages/{domain}-page.pom.ts
import type {Page} from '@playwright/test'
import {createPageObject} from './page-factory'
import {create{Domain}PageAssertions} from '@/e2e/assertions/{domain}-page.assertions'
import {create{Domain}PageFlow} from '@/e2e/flows/{domain}-page.flow'
import {create{Domain}PageLocators} from '@/e2e/locators/{domain}-page.locators'
import {create{Domain}Intercepts} from '@/e2e/intercepts/{domain}.intercepts'

export const create{Domain}Page = (page: Page) =>
  createPageObject(
    page,
    create{Domain}PageLocators,
    create{Domain}PageAssertions,
    create{Domain}PageFlow,
    create{Domain}Intercepts
  )

export type {Domain}Page = ReturnType<typeof create{Domain}Page>
```

**Rules**:
- ALWAYS use `createPageObject` factory
- ALWAYS provide ALL 5 parameters (page, locators, assertions, flows, intercepts)
- Import order: assertions, flows, locators, intercepts
- Export both function and type

### Step 9: Generate Step Definitions

**Template**:
```typescript
// e2e/steps/{domain}/{feature}.steps.ts
import type {Page} from '@playwright/test'
import {Given, When, Then} from '@/e2e/support/safe-steps'
import {create{Domain}Page} from '@/e2e/pages/{domain}-page.pom'
import {{Domain}Text, mock{Entity}Data} from '@/app/testing/fixtures/{domain}/{domain}-fixtures'

// ============================================================================
// Given Steps
// ============================================================================

Given('I am on the {domain} page', async (page: Page) => {
  await create{Domain}Page(page).flows.navigateTo{Domain}Page()
})

Given('{precondition step}', async (page: Page) => {
  await create{Domain}Page(page).intercepts.{interceptMethod}()
})

// ============================================================================
// When Steps
// ============================================================================

When('I {action step}', async (page: Page) => {
  await create{Domain}Page(page).flows.{flowMethod}()
})

When('I {action with param} {string}', async (page: Page, param: string) => {
  await create{Domain}Page(page).flows.{flowMethod}(param)
})

// ============================================================================
// Then Steps
// ============================================================================

Then('I see {verification step}', async (page: Page) => {
  await create{Domain}Page(page).assertions.{assertionMethod}()
})

Then('I see {string}', async (page: Page, expectedText: string) => {
  await create{Domain}Page(page).assertions.{assertionMethod}(expectedText)
})
```

**Rules**:
- Import from `@/e2e/support/safe-steps` (NOT `@cucumber/cucumber`)
- Organize with comment sections: Given / When / Then
- Each step is 1-2 lines max
- Use unified pattern: `create{Domain}Page(page).{layer}.{method}()`
- Parameters use TypeScript types: `(page: Page, text: string)`

---

## EXAMPLES

### Input: Generated Feature
```gherkin
Feature: Subscription Management

  Background:
    Given I am logged in as admin
    And I am on the billing page

  @smoke @billing
  Scenario: View current plan
    Then I see my current plan name

  @billing @loading
  Scenario: Billing page loading state
    Given the billing API is slow
    When I visit the billing page
    Then I see loading skeleton

  @billing @error
  Scenario: Error loading billing data
    Given the billing API will fail
    When I visit the billing page
    Then I see "Failed to load"
    And I see "Retry" button
```

### Output: 7 Generated Files

#### 1. Fixtures
```typescript
export const BillingTestIds = {
  pageHeader: 'billing-page-header',
  currentPlanName: 'billing-current-plan-name',
  loadingSkeleton: 'billing-loading-skeleton',
  errorMessage: 'billing-error-message',
  retryButton: 'billing-retry-button',
} as const

export const BillingText = {
  pageTitle: 'Billing & Usage',
  loadError: 'Failed to load',
  retryButton: 'Retry',
} as const

export const mockPlanData = {
  name: 'Pro',
  price: 45000,
} as const
```

#### 2. Locators
```typescript
import type {Page} from '@playwright/test'
import {BillingTestIds} from '@/app/testing/fixtures/billing/billing-fixtures'

export const createBillingPageLocators = (page: Page) => ({
  pageHeader: page.getByTestId(BillingTestIds.pageHeader),
  currentPlanName: page.getByTestId(BillingTestIds.currentPlanName),
  loadingSkeleton: page.getByTestId(BillingTestIds.loadingSkeleton),
  errorMessage: page.getByTestId(BillingTestIds.errorMessage),
  retryButton: page.getByTestId(BillingTestIds.retryButton),
} as const)

export type BillingPageLocators = ReturnType<typeof createBillingPageLocators>
```

#### 3. Flows
```typescript
import type {BasePagePom} from '@/e2e/pages/base-page.pom'
import type {BillingPageLocators} from '@/e2e/locators/billing-page.locators'
import {pageRoutes} from '@/app/config/pageRoutes'

export const createBillingPageFlow = (basePage: BasePagePom, locators: BillingPageLocators) => {
  return {
    navigateToBillingPage: async () => {
      await basePage.flows.goto(pageRoutes.billing)
    },

    clickRetryButton: async () => {
      await locators.retryButton.click()
    },
  } as const
}

export type BillingPageFlow = ReturnType<typeof createBillingPageFlow>
```

#### 4. Assertions
```typescript
import {expect} from '@playwright/test'
import type {BillingPageLocators} from '@/e2e/locators/billing-page.locators'
import type {BasePagePom} from '@/e2e/pages/base-page.pom'

export const createBillingPageAssertions = (basePage: BasePagePom, locators: BillingPageLocators) => ({
  showsCurrentPlanName: async () => {
    await expect(locators.currentPlanName).toBeVisible()
  },

  showsLoadingSkeleton: async () => {
    await expect(locators.loadingSkeleton).toBeVisible()
  },

  showsErrorMessage: async (message: string) => {
    await expect(locators.errorMessage).toContainText(message)
  },

  showsRetryButton: async () => {
    await expect(locators.retryButton).toBeVisible()
  },
} as const)

export type BillingPageAssertions = ReturnType<typeof createBillingPageAssertions>
```

#### 5. Intercepts
```typescript
import type {Page} from '@playwright/test'
import {apiRoutes} from '@/app/config/apiRoutes'
import {API_ERROR_MESSAGES} from '@/app/config/constants'
import {mockPlanData} from '@/app/testing/fixtures/billing/billing-fixtures'
import {intercept} from '@/e2e/utils/intercept'

export const createBillingIntercepts = (page: Page) => ({
  mockSlowBillingAPI: async () => {
    await intercept(page, `api/${apiRoutes.billing}`, {
      delay: 3000,
      body: mockPlanData,
    })
  },

  mockFailingBillingAPI: async () => {
    await intercept(page, `api/${apiRoutes.billing}`, {
      status: 500,
      body: { error: API_ERROR_MESSAGES.internalServerError },
    })
  },
} as const)

export type BillingIntercepts = ReturnType<typeof createBillingIntercepts>
```

#### 6. POM
```typescript
import type {Page} from '@playwright/test'
import {createPageObject} from './page-factory'
import {createBillingPageAssertions} from '@/e2e/assertions/billing-page.assertions'
import {createBillingPageFlow} from '@/e2e/flows/billing-page.flow'
import {createBillingPageLocators} from '@/e2e/locators/billing-page.locators'
import {createBillingIntercepts} from '@/e2e/intercepts/billing.intercepts'

export const createBillingPage = (page: Page) =>
  createPageObject(
    page,
    createBillingPageLocators,
    createBillingPageAssertions,
    createBillingPageFlow,
    createBillingIntercepts
  )

export type BillingPage = ReturnType<typeof createBillingPage>
```

#### 7. Step Definitions
```typescript
import type {Page} from '@playwright/test'
import {Given, When, Then} from '@/e2e/support/safe-steps'
import {createBillingPage} from '@/e2e/pages/billing-page.pom'

// ============================================================================
// Given Steps
// ============================================================================

Given('I am on the billing page', async (page: Page) => {
  await createBillingPage(page).flows.navigateToBillingPage()
})

Given('the billing API is slow', async (page: Page) => {
  await createBillingPage(page).intercepts.mockSlowBillingAPI()
})

Given('the billing API will fail', async (page: Page) => {
  await createBillingPage(page).intercepts.mockFailingBillingAPI()
})

// ============================================================================
// When Steps
// ============================================================================

When('I visit the billing page', async (page: Page) => {
  await createBillingPage(page).flows.navigateToBillingPage()
})

// ============================================================================
// Then Steps
// ============================================================================

Then('I see my current plan name', async (page: Page) => {
  await createBillingPage(page).assertions.showsCurrentPlanName()
})

Then('I see loading skeleton', async (page: Page) => {
  await createBillingPage(page).assertions.showsLoadingSkeleton()
})

Then('I see {string}', async (page: Page, text: string) => {
  await createBillingPage(page).assertions.showsErrorMessage(text)
})

Then('I see {string} button', async (page: Page, buttonText: string) => {
  if (buttonText === 'Retry') {
    await createBillingPage(page).assertions.showsRetryButton()
  }
})
```

---

## VALIDATION BEFORE OUTPUT

**Before showing generated files, verify:**
- [ ] All 7 files created
- [ ] Fixtures: TestIds use kebab-case, exported as const
- [ ] Locators: Use TestIds from fixtures (no hardcoded strings)
- [ ] Flows: Each method is 1-3 lines max
- [ ] Assertions: Each method is 1-2 expects max
- [ ] Intercepts: Use `intercept()` utility
- [ ] POM: Has ALL 5 parameters to createPageObject
- [ ] Steps: Import from safe-steps, use unified pattern
- [ ] TypeScript: All files export types
- [ ] Naming: PascalCase for types, camelCase for functions

---

## COMPLETION REPORT

```markdown
## Implementation Complete

**Generated 7 files**:
1. ✅ app/testing/fixtures/{domain}/{domain}-fixtures.ts ({N} TestIds, {M} constants)
2. ✅ e2e/locators/{domain}-page.locators.ts ({N} locators)
3. ✅ e2e/flows/{domain}-page.flow.ts ({X} flow methods)
4. ✅ e2e/assertions/{domain}-page.assertions.ts ({Y} assertion methods)
5. ✅ e2e/intercepts/{domain}.intercepts.ts ({Z} intercept methods)
6. ✅ e2e/pages/{domain}-page.pom.ts (factory with 5 layers)
7. ✅ e2e/steps/{domain}/{feature}.steps.ts ({K} step definitions)

**Coverage**:
- {X} user actions (flows)
- {Y} verifications (assertions)
- {Z} API scenarios (intercepts)
- {K} step definitions (Given/When/Then)

**Next**: bdd-example-enforcer will validate all patterns and auto-fix any violations.
```

---

## INTEGRATION WITH BDD PIPELINE

```
/bdd command
  ↓
[gherkin-generator]
  • Generates .feature file
  ↓
[edge-scout]
  • Surfaces business edge cases
  ↓
[bdd-implementation-generator] ← YOU ARE HERE
  • Generates 7-layer implementation
  • Follows codebase patterns exactly
  • No deviation allowed
  ↓
[bdd-example-enforcer]
  • Validates patterns
  • Auto-fixes violations
  ↓
[api-generator]
  • Fixtures
  • Rest endpoints
  • Security 
  ↓
Tests run ✅
  ↓
Test fails? → [bdd-fix]
  • Auto-invoked on failures
  • Trace analysis + surgical fixes
  • 10/10 validation
  ↓
Done ✅
```

---

# **Critical!!**

## API Security Test Patterns 

When generating tests for API routes, include these security scenarios:

**Authentication tests** - Mock unauthenticated requests expecting 401
```gherkin
Scenario: Unauthorized access blocked
  Given I am not logged in
  When I try to access billing data
  Then I see "Unauthorized" error
```

**Cross-tenant isolation** - Mock requests with different companyId
```gherkin
Scenario: Company data isolation
  Given I belong to Company A
  When I request Company B's billing data
  Then I see "Not found" error
```

**Input validation** - Test invalid schemas return 400
```gherkin
Scenario: Invalid input rejected
  Given I am logged in
  When I send invalid billing data
  Then I see "Validation failed" error
```

**Intercept patterns for security tests:**
```typescript
mockUnauthorizedAccess: async () => {
  await intercept(page, `api/${apiRoutes.route}`, {
    status: 401,
    body: { error: API_ERROR_MESSAGES.unauthorized },
  })
}

mockCrossTenantAttempt: async () => {}
```
---
