/**
 * Application route constants
 * Use these instead of hardcoded strings to ensure type safety and consistency
 */
export const pageRoutes = {
  home: '/',
  repertoire: '/repertoire',
  artists: '/artists',
  songwriter: '/songwriter',
  jam: '/jam',
  studio: '/studio',
  metronome: '/metronome',
  musicTheory: '/music-theory',
  composer: '/composer',
  pedalboard: '/pedalboard',
} as const;

/** Routes Buddy can navigate to with descriptions */
export const buddyRoutes = {
  repertoire: { path: '/repertoire', desc: 'Song library' },
  jam: { path: '/jam', desc: 'Practice mode' },
  composer: { path: '/composer', desc: 'Build progressions' },
} as const;

export type PageRoute = (typeof pageRoutes)[keyof typeof pageRoutes];
