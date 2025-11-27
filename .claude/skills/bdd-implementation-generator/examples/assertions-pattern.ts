// Pattern: e2e/assertions/{domain}-page.assertions.ts
// Source: billing.feature example (lines 574-598)

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