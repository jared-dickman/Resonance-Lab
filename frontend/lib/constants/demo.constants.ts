/**
 * Landing page demo constants
 */

export interface DemoSong {
  query: string;
  artist: string;
  title: string;
  key: string;
  isRickroll?: boolean;
}

export const DEMO_SONGS: DemoSong[] = [
  { query: 'Get me Wonderwall', artist: 'Oasis', title: 'Wonderwall', key: 'F#m' },
  {
    query: 'Never gonna give you up',
    artist: 'Rick Astley',
    title: 'Never Gonna Give You Up',
    key: 'Ab',
    isRickroll: true,
  },
  { query: 'Hotel California', artist: 'Eagles', title: 'Hotel California', key: 'Bm' },
  { query: 'Stairway to Heaven', artist: 'Led Zeppelin', title: 'Stairway to Heaven', key: 'Am' },
];

export const DEMO_RESPONSES = {
  standard: [
    'Found it! {title} by {artist} 🔥',
    'Added to your library. Wanna jam on it? 🎸',
  ],
  rickroll: [
    'Oh no... I mean, great choice! 🕺',
    "Added to your library! Never gonna let you down 🎤",
  ],
} as const;

export const DEMO_TIMING = {
  CHAR_DELAY_MS: 60,
  THINKING_DURATION_MS: 1800,
  RESPONSE_PAUSE_MS: 800,
  CTA_DELAY_MS: 1500,
} as const;

export type DemoState =
  | 'idle'
  | 'typing'
  | 'submitted'
  | 'thinking_1'
  | 'response_1'
  | 'thinking_2'
  | 'response_2'
  | 'cta'
  | 'complete';

export const DEMO_STORAGE_KEY = 'buddy_demo_seen';

export const BUDDY_CAPABILITIES = [
  { icon: '🎸', title: 'Find Songs', desc: 'Search for any song by name, artist, or lyrics' },
  { icon: '🧭', title: 'Navigate', desc: 'Jump to any page - library, jam room, theory, composer' },
  { icon: '🎵', title: 'Music Theory', desc: 'Get chord progressions, scales, and music knowledge' },
  { icon: '🎓', title: 'Coaching', desc: 'Learn guitar techniques, history, and artist stories' },
] as const;