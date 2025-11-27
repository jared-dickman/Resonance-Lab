// Pattern: e2e/pages/{domain}-page.pom.ts
// Source: billing.feature example (lines 628-646)
// EXACTLY this structure - ALWAYS use createPageObject factory

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