// Pattern: app/testing/fixtures/{domain}/{domain}-fixtures.ts
// Source: billing.feature example (lines 515-534)

export const {Domain}TestIds = {
  pageHeader: '{domain}-page-header',
  {element1}: '{domain}-{element1}',
  {element2}: '{domain}-{element2}',
  // ... one entry per UI element
} as const

export const {Domain}Text = {
  pageTitle: '{Title}',
  {textConstant1}: '{value1}',
  // ... UI text constants
} as const

// Mock data for intercepts
export const mock{Domain}Profile = {
  // ... mock response data
} as const