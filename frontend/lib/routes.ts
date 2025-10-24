/**
 * Application route constants
 * Use these instead of hardcoded strings to ensure type safety and consistency
 */
export const pageRoutes = {
  home: '/',
  songwriter: '/songwriter',
  jam: '/jam',
  metronome: '/metronome',
} as const;

export type PageRoute = (typeof pageRoutes)[keyof typeof pageRoutes];
