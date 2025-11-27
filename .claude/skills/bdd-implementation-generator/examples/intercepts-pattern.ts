// Pattern: e2e/intercepts/{domain}.intercepts.ts
// Source: billing.feature example (lines 601-625)

import type {Page} from '@playwright/test'
import {apiRoutes} from '@/app/config/apiRoutes'
import {API_ERROR_MESSAGES} from '@/app/config/constants'
import {mock{Domain}Profile} from '@/app/testing/fixtures/{domain}/{domain}-fixtures'
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
    await intercept<{Domain}Response>(page, `api/${apiRoutes.{domain}}`, {
      delay: 3000,
      body: mock{Domain}Profile,
    })
  },

  // ... one method per API scenario
} as const)

export type {Domain}Intercepts = ReturnType<typeof create{Domain}Intercepts>