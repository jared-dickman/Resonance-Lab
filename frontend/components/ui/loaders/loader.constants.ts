/**
 * Standardized loader size system
 * All loaders MUST use these constants for consistency
 */

export const SAPPHIRE = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'] as const;

export type LoaderSize = 'sm' | 'md' | 'lg';

export interface LoaderProps {
  className?: string;
  size?: LoaderSize;
}

/**
 * Standard square dimensions for loaders
 * sm: 32x32 - compact inline buttons
 * md: 64x64 - default display
 * lg: 128x128 - dramatic full-page display
 */
export const LOADER_SIZE = {
  sm: 32,
  md: 64,
  lg: 128,
} as const;

/**
 * Standard rectangular dimensions for wave/bar loaders
 * Maintains 4:3 aspect ratio
 */
export const LOADER_RECT = {
  sm: { width: 40, height: 30 },
  md: { width: 72, height: 54 },
  lg: { width: 160, height: 120 },
} as const;

/**
 * Standard stroke widths that scale with size
 */
export const LOADER_STROKE = {
  sm: 1.5,
  md: 2,
  lg: 2.5,
} as const;

/**
 * Standard element counts for multi-element loaders
 */
export const LOADER_ELEMENTS = {
  sm: 4,
  md: 5,
  lg: 6,
} as const;

/**
 * Helper to get square size config
 */
export function getSquareSize(size: LoaderSize) {
  const dim = LOADER_SIZE[size];
  return { width: dim, height: dim };
}

/**
 * Helper to get rect size config
 */
export function getRectSize(size: LoaderSize) {
  return LOADER_RECT[size];
}

/**
 * Standard animation durations (seconds)
 * Use these to maintain consistent timing across loaders
 */
export const DURATION = {
  fast: 0.8,
  normal: 1.2,
  medium: 1.5,
  slow: 2,
  verySlow: 3,
} as const;

/**
 * Common opacity values
 */
export const OPACITY = {
  faint: 0.3,
  subtle: 0.5,
  medium: 0.7,
  strong: 0.9,
} as const;

/**
 * Common Framer Motion transition presets
 */
export const TRANSITION = {
  smooth: { ease: 'easeInOut', repeat: Infinity },
  linear: { ease: 'linear', repeat: Infinity },
  spring: { type: 'spring', stiffness: 100, damping: 10 },
  bounce: { ease: [0.45, 0.05, 0.55, 0.95], repeat: Infinity },
} as const;

/**
 * SVG accessibility defaults - use spread operator in SVG elements
 */
export const SVG_A11Y = {
  role: 'status' as const,
  'aria-label': 'Loading',
};
