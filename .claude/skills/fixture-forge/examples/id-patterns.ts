// Pattern: Two distinct ID types - DOM vs Database
// Source: fixture-forge SKILL.md lines 161-176

import { FixtureIds } from '@/app/testing/fixtures/constants'
import type {{Domain}Response} from '@/app/features/{domain}/dto/{domain}-response.schema'

// DOM identifiers (data-testid attributes)
// Used in: <button data-testid="{domain}-selector-button">
export const {Domain}TestIds = {
  selectorButton: '{domain}-selector-button',
  nameInput: '{domain}-name-input',
  saveButton: '{domain}-save-button',
} as const

// Text constants for UI content
export const {Domain}Text = {
  name: 'ACME Corporation',
  tagline: 'Making the world a better place',
} as const

// Database/API entity IDs (single source of truth from constants file)
export const mock{Domain} = {
  id: FixtureIds.{domain},  // ✅ Shared constant - same ID across all tests
  name: {Domain}Text.name,
  tagline: {Domain}Text.tagline,
} as const satisfies {Domain}Response

// ❌ WRONG: Hardcoded database ID (creates conflicts across tests)
export const wrongMock{Domain} = {
  id: '{domain}-123',  // ❌ No! Use FixtureIds.{domain}
  name: {Domain}Text.name,
} satisfies {Domain}Response