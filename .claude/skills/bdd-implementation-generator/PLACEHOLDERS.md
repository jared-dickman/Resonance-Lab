# Placeholder Documentation: bdd-implementation-generator

Auto-generated documentation of placeholder usage in example files.

## Overview

- **Total placeholders:** 25
- **Example files:** 7

## Domain Naming

### `{domain}`

**Description:** Feature domain name (plural, kebab-case)

**Format:** lowercase

**Related:** `{Domain}`

**Usage:** 31 occurrence(s) across 7 file(s)

**Files:**
- `assertions-pattern.ts` (4×)
- `fixtures-pattern.ts` (5×)
- `flows-pattern.ts` (3×)
- `intercepts-pattern.ts` (5×)
- `locators-pattern.ts` (3×)
- `pom-pattern.ts` (5×)
- `step-definitions-pattern.ts` (6×)

**Examples:**
```typescript
pageHeader: '{domain}-page-header',
await basePage.flows.goto(pageRoutes.{domain})
await intercept<E2EApiErrorResponse>(page, `api/${apiRoutes.{domain}}`, {
```

### `{Domain}`

**Description:** Feature domain name (plural, kebab-case)

**Format:** PascalCase (capitalized)

**Related:** `{domain}`

**Usage:** 50 occurrence(s) across 7 file(s)

**Files:**
- `assertions-pattern.ts` (6×)
- `fixtures-pattern.ts` (3×)
- `flows-pattern.ts` (6×)
- `intercepts-pattern.ts` (8×)
- `locators-pattern.ts` (6×)
- `pom-pattern.ts` (11×)
- `step-definitions-pattern.ts` (10×)

**Examples:**
```typescript
export const create{Domain}PageAssertions = (basePage: BasePagePom, locators: {Domain}PageLocator...
export const {Domain}TestIds = {
export const create{Domain}PageFlow = (basePage: BasePagePom, locators: {Domain}PageLocators) => {
```

## Element Naming

### `{actionMethod1}`

**Description:** Placeholder value

**Format:** camelCase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `flows-pattern.ts` (1×)

**Examples:**
```typescript
{actionMethod1}: async () => {
```

### `{actionMethod2}`

**Description:** Placeholder value

**Format:** camelCase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `flows-pattern.ts` (1×)

**Examples:**
```typescript
{actionMethod2}: async (text: string) => {
```

### `{assertionMethod}`

**Description:** Placeholder value

**Format:** camelCase

**Usage:** 2 occurrence(s) across 1 file(s)

**Files:**
- `step-definitions-pattern.ts` (2×)

**Examples:**
```typescript
await create{Domain}Page(page).assertions.{assertionMethod}()
```

### `{assertionMethod1}`

**Description:** Placeholder value

**Format:** camelCase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `assertions-pattern.ts` (1×)

**Examples:**
```typescript
{assertionMethod1}: async () => {
```

### `{assertionMethod2}`

**Description:** Placeholder value

**Format:** camelCase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `assertions-pattern.ts` (1×)

**Examples:**
```typescript
{assertionMethod2}: async (expectedText: string) => {
```

### `{element}`

**Description:** UI element or component property name

**Format:** lowercase

**Usage:** 4 occurrence(s) across 2 file(s)

**Files:**
- `assertions-pattern.ts` (2×)
- `flows-pattern.ts` (2×)

**Examples:**
```typescript
await expect(locators.{element}).toBeVisible()
await locators.{element}.click()
```

### `{element1}`

**Description:** UI element or component property name

**Format:** lowercase

**Usage:** 4 occurrence(s) across 2 file(s)

**Files:**
- `fixtures-pattern.ts` (2×)
- `locators-pattern.ts` (2×)

**Examples:**
```typescript
{element1}: '{domain}-{element1}',
{element1}: page.getByTestId({Domain}TestIds.{element1}),
```

### `{element2}`

**Description:** UI element or component property name

**Format:** lowercase

**Usage:** 4 occurrence(s) across 2 file(s)

**Files:**
- `fixtures-pattern.ts` (2×)
- `locators-pattern.ts` (2×)

**Examples:**
```typescript
{element2}: '{domain}-{element2}',
{element2}: page.getByTestId({Domain}TestIds.{element2}),
```

## Code Patterns

### `{flowMethod}`

**Description:** Code pattern or function name

**Format:** camelCase

**Usage:** 2 occurrence(s) across 1 file(s)

**Files:**
- `step-definitions-pattern.ts` (2×)

**Examples:**
```typescript
await create{Domain}Page(page).flows.{flowMethod}()
```

### `{interceptMethod}`

**Description:** Code pattern or function name

**Format:** camelCase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `step-definitions-pattern.ts` (1×)

**Examples:**
```typescript
await create{Domain}Page(page).intercepts.{interceptMethod}()
```

## Import References

### `{BasePagePom}`

**Description:** Import reference (library/framework type or function)

**Format:** PascalCase (capitalized)

**Usage:** 2 occurrence(s) across 2 file(s)

**Files:**
- `assertions-pattern.ts` (1×)
- `flows-pattern.ts` (1×)

### `{createPageObject}`

**Description:** Factory or constructor function name

**Format:** camelCase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `pom-pattern.ts` (1×)

### `{E2EApiErrorResponse}`

**Description:** Import reference (library/framework type or function)

**Format:** PascalCase (capitalized)

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `intercepts-pattern.ts` (1×)

### `{expect}`

**Description:** Import reference (library/framework type or function)

**Format:** lowercase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `assertions-pattern.ts` (1×)

### `{Page}`

**Description:** Import reference (library/framework type or function)

**Format:** PascalCase (capitalized)

**Usage:** 4 occurrence(s) across 4 file(s)

**Files:**
- `intercepts-pattern.ts` (1×)
- `locators-pattern.ts` (1×)
- `pom-pattern.ts` (1×)
- `step-definitions-pattern.ts` (1×)

### `{pageRoutes}`

**Description:** Import reference (library/framework type or function)

**Format:** camelCase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `flows-pattern.ts` (1×)

## Data Constants

### `{textConstant1}`

**Description:** Test data constant or value

**Format:** camelCase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `fixtures-pattern.ts` (1×)

**Examples:**
```typescript
{textConstant1}: '{value1}',
```

### `{Title}`

**Description:** Test data constant or value

**Format:** PascalCase (capitalized)

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `fixtures-pattern.ts` (1×)

**Examples:**
```typescript
pageTitle: '{Title}',
```

### `{value1}`

**Description:** Test data constant or value

**Format:** lowercase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `fixtures-pattern.ts` (1×)

**Examples:**
```typescript
{textConstant1}: '{value1}',
```

## Other

### `{API_ERROR_MESSAGES}`

**Description:** Placeholder value

**Format:** SCREAMING_SNAKE_CASE

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `intercepts-pattern.ts` (1×)

### `{apiRoutes}`

**Description:** Placeholder value

**Format:** camelCase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `intercepts-pattern.ts` (1×)

### `{intercept}`

**Description:** Placeholder value

**Format:** lowercase

**Usage:** 1 occurrence(s) across 1 file(s)

**Files:**
- `intercepts-pattern.ts` (1×)

### `{string}`

**Description:** Placeholder value

**Format:** lowercase

**Usage:** 2 occurrence(s) across 1 file(s)

**Files:**
- `step-definitions-pattern.ts` (2×)

**Examples:**
```typescript
When('I {action with param} {string}', async (page: Page, param: string) => {
```

---

*Generated by `pnpm generate:placeholders`*