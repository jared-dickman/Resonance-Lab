// Pattern: e2e/locators/{domain}-page.locators.ts
// Source: billing.feature example (lines 537-550)

import type {Page} from '@playwright/test'
import {{Domain}TestIds} from '@/app/testing/fixtures/{domain}/{domain}-fixtures'

export const create{Domain}PageLocators = (page: Page) => ({
  {element1}: page.getByTestId({Domain}TestIds.{element1}),
  {element2}: page.getByTestId({Domain}TestIds.{element2}),
  // ... one entry per UI element
} as const)

export type {Domain}PageLocators = ReturnType<typeof create{Domain}PageLocators>