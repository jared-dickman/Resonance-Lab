// Pattern: e2e/flows/{domain}-page.flow.ts
// Source: billing.feature example (lines 553-571)

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