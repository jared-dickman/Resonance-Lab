export const ANIMATION_DURATION = {
  FAST: 0.3,
  NORMAL: 0.5,
  LONG: 0.8,
  SLOW: 0.8,
  PAGE_TRANSITION: 0.5,
  STAGGER_CHILDREN: 0.08,
} as const;

export const ANIMATION_DELAY = {
  NONE: 0,
  SHORT: 0.1,
  MEDIUM: 0.2,
  LONG: 0.4,
  HEADER: 0.1,
  SUBTITLE: 0.5,
} as const;

export const SPRING_CONFIG = {
  DEFAULT: { stiffness: 300, damping: 24 },
  TIGHT: { stiffness: 500, damping: 30 },
  LOOSE: { stiffness: 200, damping: 20 },
} as const;

export const FADE_VARIANTS = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
} as const;

export const SLIDE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
} as const;

export const SCALE_VARIANTS = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
} as const;
