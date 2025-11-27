// Auto-fix TestId mismatches
// Real pattern from codebase

/**
 * Error: locator.getByTestId('upgrade-button') not found
 * Cause: Component refactored, TestId changed
 * Solution: Search actual → Call TestId Skill → update fixture
 */

// Search component for actual TestId
// $ grep -r "upgrade" app/features/billing/ | grep "testid"
// Found: data-testid="billing-pro-upgrade-button"

const actualTestId = 'billing-pro-upgrade-button'
const expectedTestId = 'upgrade-button' // From error

// Find fixture definition
// $ grep -r "upgradeButton" app/testing/fixtures/billing/
// Found: app/testing/fixtures/billing/billing-fixtures.ts

// Auto-update using Edit tool
Edit({
  file_path: 'app/testing/fixtures/billing/billing-fixtures.ts',
  old_string: `upgradeButton: 'upgrade-button'`,
  new_string: `upgradeButton: 'billing-pro-upgrade-button'`,
})

// Validate
// $ pnpm typecheck && pnpm test:bdd -- --name "upgrade scenario"
// ✅ Passes

/**
 * Pattern from codebase:
 * - TestIds use format: {domain}-{action}-{element}
 * - Defined in app/testing/fixtures/{domain}/{domain}-fixtures.ts
 * - Used in e2e/locators/{domain}-page.locators.ts
 * - Components import from fixtures: import {TestIds} from '@/app/testing/fixtures/...'
 */
