// Pattern: Type Safety with Factory Builders (MANDATORY)
// Source: fixture-forge SKILL.md lines 341-372
// WHY: Factory builders return new objects - use 'satisfies' NOT 'as const satisfies'

import type {{Domain}Request, {Domain}Response} from '@/app/features/{domain}/dto/{domain}-response.schema'
import { build{Domain} } from '@/app/testing/factories'
import { FixtureIds } from '@/app/testing/fixtures/constants'

// ✅ CORRECT: Text constants with 'as const' (no satisfies)
export const {Domain}Text = {
  title: 'The Testing Manifesto',
  content: 'Write tests like your users depend on them. Because they do.',
} as const

// ✅ CORRECT: Factory-built fixtures with 'satisfies' (NOT 'as const satisfies')
export const mock{Domain}Request = build{Domain}()
  .withTitle({Domain}Text.title)
  .withContent({Domain}Text.content)
  .build() satisfies {Domain}Request

export const mock{Domain}Response = build{Domain}()
  .withId(FixtureIds.{domain}.one)
  .withTitle({Domain}Text.title)
  .withContent({Domain}Text.content)
  .published()
  .build() satisfies {Domain}Response

// ✅ CORRECT: Multiple fixtures with stable IDs
export const mockDraft{Domain} = build{Domain}()
  .withId(FixtureIds.{domain}.draft)
  .withTitle({Domain}Text.title)
  .build() satisfies {Domain}Response

export const mockPublished{Domain} = build{Domain}()
  .withId(FixtureIds.{domain}.published)
  .withTitle({Domain}Text.title)
  .published()
  .build() satisfies {Domain}Response

// ✅ CORRECT: Composite fixtures use 'as const' for wrapper
export const mock{Domain}List = {
  items: [mockDraft{Domain}, mockPublished{Domain}]
} as const

// ❌ WRONG: Using 'as const satisfies' with factory builders
export const wrongFactory{Domain} = build{Domain}()
  .withId(FixtureIds.{domain}.one)
  .build() as const satisfies {Domain}Response  // Remove 'as const'!

// ❌ WRONG: Type annotation widens types
export const wrongAnnotation{Domain}: {Domain}Response = build{Domain}()
  .withId(FixtureIds.{domain}.one)
  .build()  // Use 'satisfies' instead

// ❌ WRONG: Missing type validation entirely
export const wrongNoType{Domain} = build{Domain}()
  .withId(FixtureIds.{domain}.one)
  .build()  // Add 'satisfies {Domain}Response'

// ❌ WRONG: Missing stable ID
export const wrongNoId{Domain} = build{Domain}()
  .withTitle({Domain}Text.title)
  .build() satisfies {Domain}Response  // Add .withId(FixtureIds.{domain}.x)
