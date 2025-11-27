// Auto-generate missing intercepts from component hooks
// Based on real debugging session: billing page timeout

/**
 * Problem: Billing page test times out on page load
 * Cause: Component calls APIs not mocked
 * Solution: Extract hooks → generate intercepts → inject into steps
 */

// Extract hooks from component
const componentHooks = [
  'useCompanyDetails',      // → /api/company-details/:id
  'useBillingSubscription', // → /api/billing/subscription
  'useFeatureUsage',        // → /api/billing/features/:name
]

// Check existing intercepts (e2e/steps/billing/billing.steps.ts)
const existingIntercepts = [
  'interceptCommonAPIs',            // Has: companies, company-details, user-role
  'mockSubscriptionActiveResponse',    // Has: billing/subscription
  // Missing: billing/features/* ← Root cause
]

// Auto-generate missing intercept

// e2e/intercepts/billing.intercepts.ts
export const createBillingIntercepts = (page: Page) => ({
  mockActiveSubscription: async () => {
    await intercept<SubscriptionResponse>(
      page,
      `**/api${apiRoutes.billingSubscription}*`,
      { body: mockActiveSubscriptionApiResponse }
    )
  },

  // Auto-generated
  mockFeatureUsage: async () => {
    await intercept<FeatureUsage>(
      page,
      `**/api${apiRoutes.billingFeature('*')}*`,
      {
        body: {
          allowed: true,
          current: 2,
          limit: 10,
          remaining: 8,
          percentUsed: 20,
        },
      }
    )
  },
})

// Auto-inject into step

// e2e/steps/billing/billing.steps.ts
Given('I am on the billing page', async (page) => {
  await createCommonIntercepts(page).mockCommonAPIs()
  await createBillingPage(page).intercepts.mockActiveSubscription()
  await createBillingPage(page).intercepts.mockFeatureUsage() // ← Injected
  await createBillingPage(page).flows.navigateToBillingPage()
})

// Result: Test passes in 18s (was timing out at 30s)
