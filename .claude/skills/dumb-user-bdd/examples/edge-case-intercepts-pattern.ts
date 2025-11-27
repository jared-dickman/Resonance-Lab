// Edge case intercepts - extend existing intercepts file
// Based on: e2e/intercepts/billing.intercepts.ts

import type {Page} from '@playwright/test'
import {apiRoutes} from '@/app/config/apiRoutes'
import {API_ERROR_MESSAGES} from '@/app/config/constants'
import {mockSubscriptionActiveResponse} from '@/app/testing/fixtures/billing/billing-fixtures'
import type {E2EApiErrorResponse} from '@/e2e/types/api-responses'
import {intercept} from '@/e2e/utils/intercept'

// Add to existing createBillingIntercepts factory:
export const createBillingIntercepts = (page: Page) => ({
  // ... existing intercepts (mockSubscriptionActiveResponse, mockFailingBillingAPI, etc.)

  // Edge case: 409 Conflict for concurrent modification
  mockSubscriptionConflict: async () => {
    await intercept<E2EApiErrorResponse>(page, `**/api${apiRoutes.billingSubscription}*`, {
      status: 409,
      body: { error: 'Subscription was modified by another user' },
    })
  },

  // Edge case: Session expired during API call
  mockSessionExpired: async () => {
    await intercept<E2EApiErrorResponse>(page, `**/api${apiRoutes.billingSubscription}*`, {
      status: 401,
      body: { error: API_ERROR_MESSAGES.unauthorized },
    })
  },

  // Edge case: Partial response (missing optional fields)
  mockPartialSubscriptionData: async () => {
    await intercept(page, `**/api${apiRoutes.billingSubscription}*`, {
      body: {
        ...mockSubscriptionActiveResponse,
        limits: [], // Missing limits data
        features: {}, // Missing features data
      },
    })
  },
} as const)
