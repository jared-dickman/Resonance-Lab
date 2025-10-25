/**
 * Songwriter Feature Constants
 * All magic values consolidated for maintainability
 */

// Local Storage Keys
export const STORAGE_KEYS = {
  PANEL_LAYOUT: 'songwriter-panel-layout',
  CURRENT_DRAFT: 'songwriter-current-draft',
  DRAFT_HISTORY: 'songwriter-draft-history',
} as const;

// Panel Configuration
export const PANEL_CONFIG = {
  DEFAULT_SIZES: [25, 40, 35] as const,
  MIN_SIZE: 15,
  MOBILE_BREAKPOINT: 1024,
} as const;

// Chat Configuration
export const CHAT_CONFIG = {
  TYPING_DELAY_MIN: 1000,
  TYPING_DELAY_MAX: 2000,
  MAX_MESSAGE_LENGTH: 2000,
} as const;

// Animation Durations (milliseconds)
export const ANIMATION_DURATION = {
  FADE_IN: 600,
  FADE_OUT: 300,
  SLIDE: 500,
  TYPING_DOT: 600,
} as const;

// Animation Delays (milliseconds)
export const ANIMATION_DELAY = {
  CHAT_PANEL: 200,
  LYRICS_PANEL: 300,
  CHORDS_PANEL: 400,
  TYPING_DOT_1: 0,
  TYPING_DOT_2: 200,
  TYPING_DOT_3: 400,
} as const;
