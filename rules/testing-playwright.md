# Playwright E2E Testing

Test critical user workflows end-to-end using BDD (Cucumber) with factory-based Page Object Model.

**Focus**: User-visible behavior, not implementation details. If UI displays correctly, integration works.

---

## Configuration

**Test directory**: `e2e/features/` (Cucumber BDD)

**MSW**: Always enabled. Never hit real databases/APIs. Every scenario must have matching handlers in `app/testing/msw/handlers/{domain}.handlers.ts`, and those handlers must be exported through `app/testing/msw/handlers/index.ts`.

**Auth**: Configured once in `e2e/specs/auth.setup.ts`, reused via `storageState`. Use `e2e-test` provider

---

## Directory Structure

```
e2e/
├── features/       # .feature files by domain (auth/, billing/, ideas/)
├── steps/          # Step definitions (*.steps.ts)
├── pages/          # Page objects (*.pom.ts)
├── locators/       # Locator factories (*.locators.ts)
├── assertions/     # Assertion factories (*.assertions.ts)
├── flows/          # Flow functions (*.flow.ts)
├── intercepts/     # API intercepts (*.intercepts.ts)
├── constants/      # Route/data constants
├── specs/          # Setup files (*.setup.ts)
└── utils/          # Shared utilities
```

---

## BDD Pattern

**Feature** (`e2e/features/auth/login.feature`):
```gherkin
Feature: User Authentication
  @smoke
  Scenario: Successful Google OAuth login
    Given I am on the login page
    When I click the Google login button
    Then I should be redirected to the dashboard
```

**Steps** (`e2e/steps/auth/login.steps.ts`):
```typescript
import {createAuthPage} from '@/e2e/pages/auth-page.pom'
import {Given, Then, When} from '@/e2e/support/safe-steps'

Given('I am on the login page', async (page) => {
  await createAuthPage(page).flows.gotoLoginPage()
  await createAuthPage(page).assertions.verifyLoginPageVisible()
})

When('I click the Google login button', async (page) => {
  await createLoginPage(page).flows.clickGoogleSignIn()
})

Then('I should be redirected to the dashboard', async (page) => {
  await createAuthPage(page).assertions.verifyOnIdeasPage()
})
```

**Principles**: Step definitions delegate to page object flows/assertions. Steps are reusable. Use centralized intercepts for mocking.

---

## Page Object Factory

**Page** (`e2e/pages/login-page.pom.ts`):
```typescript
import {createPageObject} from './page-factory'

export const createLoginPage = (page: Page) =>
  createPageObject(
    page,
    createLoginPageLocators,
    createLoginPageAssertions,
    createLoginPageFlow,
    createAuthIntercepts
  )
```

**Locators** (`e2e/locators/login-page.locators.ts`):
```typescript
export const createLoginPageLocators = (page: Page) => ({
  googleButton: page.getByTestId('google-signin-button'),
  signInText: page.getByText(/sign in to/i),
} as const)
```

**Priority**: `data-testid` > roles (`getByRole`) > text (constants/regex) > CSS selectors

**Assertions** (`e2e/assertions/login-page.assertions.ts`):
```typescript
export const createLoginPageAssertions = (page: Page, locators: LoginPageLocators) => ({
  googleButtonIsVisible: async () => {
    await expect(locators.googleButton).toBeVisible()
  },
} as const)
```

**Flows** (`e2e/flows/login.flow.ts`):
```typescript
export const createLoginPageFlow = (basePage: BasePagePom, locators: LoginPageLocators) => ({
  goToPage: async () => {
    await basePage.flows.goto(pageRoutes.login)
  },
  clickGoogleSignIn: async () => {
    await locators.googleButton.click()
  },
} as const)
```

**Intercepts** (`e2e/intercepts/auth.intercepts.ts`):
```typescript
import {apiRoutes} from '@/app/config/apiRoutes'
import {API_ERROR_MESSAGES} from '@/app/config/constants'
import {intercept} from '@/e2e/utils/intercept'

export const createAuthIntercepts = (page: Page) => ({
  mockOAuthFailure: async () => {
    await intercept(page, `**${apiRoutes.authSession}*`, {
      status: 500,
      body: {error: API_ERROR_MESSAGES.internalServerError},
    })
  },
  clearAuth: async () => {
    await page.context().clearCookies()
  },
} as const)
```

---

## New Feature Checklist

1. `e2e/features/{domain}/{feature}.feature` - Gherkin scenarios
2. `e2e/steps/{domain}/{feature}.steps.ts` - Step definitions
3. `e2e/locators/{page}.locators.ts` - Locator factory
4. `e2e/assertions/{page}.assertions.ts` - Assertion factory
5. `e2e/flows/{page}.flow.ts` - Flow factory
6. `e2e/intercepts/{domain}.intercepts.ts` - API intercepts
7. `e2e/pages/{page}.pom.ts` - Page object using page-factory

**Naming**: Files kebab-case, factory functions `create{Name}`, types PascalCase suffix

---

## Best Practices

- Test critical journeys only, minimal fixture data
- Factory functions returning `as const` (never classes)
- Separate concerns (locators, assertions, flows, intercepts)
- Step definitions delegate to page objects
- Always use intercepts (never hit real APIs)
- Reuse auth via `storageState`, override with `test.use({ storageState: { cookies: [], origins: [] } })`

---


## Running Tests

```bash
pnpm test:e2e          # Run all
pnpm test:e2e:ui       # UI mode
pnpm exec playwright show-report
```

---

## Troubleshooting

**Build errors**: `rm -rf .next && pnpm dev`
**Auth failures**: Verify `NEXT_PUBLIC_ENABLE_MSW=true`, dev server running, `e2e-test` provider exists
**Strict mode violations**: Use specific selectors, prefer `data-testid` from constants
