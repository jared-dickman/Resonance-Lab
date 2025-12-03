/**
 * Application route constants
 * Use these instead of hardcoded strings to ensure type safety and consistency
 */
export const pageRoutes = {
  home: '/',
  repertoire: '/repertoire',
  songs: '/songs',
  artists: '/artists',
  songwriter: '/songwriter',
  jam: '/jam',
  studio: '/studio',
  metronome: '/metronome',
  musicTheory: '/music-theory',
  composer: '/composer',
  pedalboard: '/pedalboard',
} as const;

export type PageRoute = (typeof pageRoutes)[keyof typeof pageRoutes];
