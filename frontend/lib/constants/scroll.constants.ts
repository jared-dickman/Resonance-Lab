/**
 * Scroll Behavior Constants
 * Auto-scroll, manual scroll, and scroll speed settings
 */

export const SCROLL_SPEED = {
  MIN: 0.1,
  MAX: 3.0,
  DEFAULT: 1.0,
  INCREMENT: 0.1,
} as const;

export const SCROLL_OFFSET = {
  TOP_MARGIN_PX: 100,
  VISIBLE_THRESHOLD_PX: 50,
} as const;

export const SCROLL_BEHAVIOR = {
  SMOOTH: 'smooth' as ScrollBehavior,
  AUTO: 'auto' as ScrollBehavior,
  INSTANT: 'instant' as ScrollBehavior,
} as const;
