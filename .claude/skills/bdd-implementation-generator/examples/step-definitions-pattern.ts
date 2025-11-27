// Pattern: e2e/steps/{domain}/{domain}.steps.ts
// Source: billing.feature example (lines 649-699)
// ALWAYS import from safe-steps, NEVER from @cucumber/cucumber

import type {Page} from '@playwright/test'
import {Given, When, Then} from '@/e2e/support/safe-steps'
import {create{Domain}Page} from '@/e2e/pages/{domain}-page.pom'
import {{Domain}Text, mock{Domain}Profile} from '@/app/testing/fixtures/{domain}/{domain}-fixtures'

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