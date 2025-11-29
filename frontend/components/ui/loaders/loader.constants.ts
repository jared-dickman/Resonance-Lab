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
 * sm: 48x48 - compact inline use
 * md: 64x64 - default display
 * lg: 80x80 - prominent display
 */
export const LOADER_SIZE = {
  sm: 48,
  md: 64,
  lg: 80,
} as const;

/**
 * Standard rectangular dimensions for wave/bar loaders
 * Maintains 4:3 aspect ratio
 */
export const LOADER_RECT = {
  sm: { width: 56, height: 42 },
  md: { width: 72, height: 54 },
  lg: { width: 88, height: 66 },
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
