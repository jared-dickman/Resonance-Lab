/**
 * Application route constants
 * Use these instead of hardcoded strings to ensure type safety and consistency
 */
export const pageRoutes = {
  home: '/',
  artists: '/artists',
  songwriter: '/songwriter',
  jam: '/jam',
  metronome: '/metronome',
  musicTheory: '/music-theory',
  composer: '/composer',
  pedalboard: '/pedalboard',
} as const;

export type PageRoute = (typeof pageRoutes)[keyof typeof pageRoutes];
