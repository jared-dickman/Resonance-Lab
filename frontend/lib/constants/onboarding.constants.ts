/**
 * Onboarding demo script - plays automatically on landing page
 */

export interface OnboardingStep {
  query: string;
  response: string;
}

export const ONBOARDING_SCRIPT: OnboardingStep[] = [
  {
    query: 'What can you do?',
    response:
      "I'm Buddy! I find songs, explain music theory, navigate the app, and coach your playing. Ask me anything!",
  },
  {
    query: 'Find Hotel California',
    response: 'Found it! Hotel California by Eagles. Key: Bm. Want me to add it to your library?',
  },
  {
    query: 'What makes that key special?',
    response:
      'B minor has a haunting, introspective quality. The iconic intro uses Am to E7 - that unresolved tension defines the song.',
  },
];

export const ONBOARDING_TIMING = {
  INITIAL_DELAY_MS: 800,
  CHAR_DELAY_MS: 45,
  THINKING_DELAY_MS: 1200,
  POST_RESPONSE_DELAY_MS: 1500,
  CTA_DELAY_MS: 800,
} as const;

export const ONBOARDING_STORAGE_KEY = 'buddy_onboarding_seen';