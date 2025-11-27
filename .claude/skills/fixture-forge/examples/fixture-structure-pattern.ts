// Pattern: Complete fixture file structure (Factory-Based)
// Source: fixture-forge SKILL.md lines 110-154
// Location: app/testing/fixtures/{domain}/{domain}-fixtures.ts

import type {{Domain}Request, {Domain}Response} from '@/app/features/{domain}/dto/{domain}-request.schema'
import type {{Domain}Response} from '@/app/features/{domain}/dto/{domain}-response.schema'
import { build{Domain} } from '@/app/testing/factories'
import { FixtureIds } from '@/app/testing/fixtures/constants'

/**
 * {Domain} Fixtures - /api/{endpoint}
 *
 * Used by:
 * - MSW: app/testing/msw/handlers/{domain}-handler.ts
 * - Vitest: [auto-tracked on import]
 * - Playwright: [auto-tracked on import]
 * - Storybook: [auto-tracked on import]
 *
 * Single request/response pair for full API shape.
 * Factory-based fixtures with stable IDs.
 * Fun, creative test data with type safety.
 */

// DOM test identifiers (data-testid attributes)
export const {Domain}TestIds = {
  button: '{domain}-button',
  input: '{domain}-input',
} as const

// Text content constants (use 'as const', no satisfies)
export const {Domain}Text = {
  field1: 'Steve McTestFace',
  field2: 'Building the future, one test at a time',
} as const

// Factory-built fixtures (use 'satisfies', NOT 'as const satisfies')
export const mock{Domain}Request = build{Domain}()
  .withField1({Domain}Text.field1)
  .build() satisfies {Domain}Request

export const mock{Domain}Response = build{Domain}()
  .withId(FixtureIds.{domain})  // Always use stable IDs
  .withField1({Domain}Text.field1)
  .withField2({Domain}Text.field2)
  .build() satisfies {Domain}Response