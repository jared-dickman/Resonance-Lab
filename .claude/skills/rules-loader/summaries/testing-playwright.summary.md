# Playwright E2E Testing

## Core Pattern
BDD (Cucumber) with factory-based Page Object Model. MSW always enabled. Test user-visible behavior, not implementation.

## Directory Structure
```
e2e/
  features/      # .feature files by domain
  steps/         # Step definitions (*.steps.ts)
  pages/         # Page objects (*.pom.ts)
  locators/      # Locator factories (*.locators.ts)
  assertions/    # Assertion factories (*.assertions.ts)
  flows/         # Flow functions (*.flow.ts)
  intercepts/    # API intercepts (*.intercepts.ts)
```

## BDD Pattern
```gherkin
Feature: User Authentication
  @smoke
  Scenario: Successful Google OAuth login
    Given I am on the login page
    When I click the Google login button
    Then I should be redirected to the dashboard
```

```ts
// Step delegates to page object
Given('I am on the login page', async (page) => {
  await createAuthPage(page).flows.gotoLoginPage()
  await createAuthPage(page).assertions.verifyLoginPageVisible()
})
```

## Page Object Factory
```ts
export const createLoginPage = (page: Page) =>
  createPageObject(page, createLoginPageLocators, createLoginPageAssertions, createLoginPageFlow, createAuthIntercepts)

export const createLoginPageLocators = (page: Page) => ({
  googleButton: page.getByTestId('google-signin-button'),
} as const)

export const createLoginPageFlow = (basePage, locators) => ({
  clickGoogleSignIn: async () => await locators.googleButton.click(),
} as const)

export const createAuthIntercepts = (page: Page) => ({
  mockOAuthFailure: async () => {
    await page.route('**/api/auth/**', route =>
      route.fulfill({status: 500, body: JSON.stringify({error: '...'})})
    )
  },
} as const)
```

## Locator Priority
1. `data-testid` (best), 2. Roles (`getByRole`), 3. Text (constants/regex), 4. CSS selectors (last resort)

## New Feature Checklist
1. `features/{domain}/{feature}.feature`, 2. `steps/{domain}/{feature}.steps.ts`, 3. `locators/{page}.locators.ts`, 4. `assertions/{page}.assertions.ts`, 5. `flows/{page}.flow.ts`, 6. `intercepts/{domain}.intercepts.ts`, 7. `pages/{page}.pom.ts`

## Rules
Factory functions returning `as const` (never classes), step definitions delegate to page objects, MSW always enabled, auth configured once in `auth.setup.ts` reused via `storageState`

## Commands
```bash
pnpm test:e2e      # All tests
pnpm test:e2e:ui   # UI mode
```

## Anti-Patterns
- ❌ Class-based POMs, hardcoded strings, real API calls, testing implementation details

## Validation
- [ ] Factory functions with `as const`, step definitions delegate to POMs, MSW enabled, `data-testid` locators

## Read Full File If
Setting up new E2E tests or understanding BDD architecture.