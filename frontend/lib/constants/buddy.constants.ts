/**
 * Core Agent Buddy constants
 */

import type { Variants } from 'framer-motion';
import { pageRoutes } from '@/lib/routes';

export const BUDDY_SIDEBAR_WIDTH = 420;
export const BUDDY_PANEL_WIDTH = 395;
export const BUDDY_PANEL_HEIGHT = 640;
export const BUDDY_MINIMIZED_WIDTH = 280;
export const BUDDY_MINIMIZED_HEIGHT = 56;
export const BUDDY_PLACEHOLDER_INTERVAL_MS = 8000;
export const BUDDY_MAX_VISIBLE_RESULTS = 3;
export const BUDDY_DEFAULT_RATING = 0;
export const BUDDY_RATING_PRECISION = 1;
export const BUDDY_FIRST_LOAD_DELAY_MS = 500;

export const BUDDY_API_ENDPOINT = '/api/core-buddy';

export const BUDDY_ERROR_MESSAGE = 'Hit a wrong note. Try again?';
export const BUDDY_DEFAULT_THINKING = 'Thinking...';
export const BUDDY_EMPTY_STATE_SUBTITLE = '';
export const BUDDY_INPUT_PLACEHOLDER = 'Ask anything...';
export const BUDDY_DEFAULT_PLACEHOLDER = 'What would you like to play?';

/** Animation configs */
const SPRING_ANIMATION = { type: 'spring' as const, stiffness: 400, damping: 30 };

export const BUDDY_FIRST_LOAD_VARIANTS: Variants = {
  closed: {
    opacity: 0,
    scale: 0.85,
    y: 40,
    filter: 'blur(8px)',
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'tween',
      ease: 'easeOut',
      duration: 1.2,
      delay: 0.3,
    },
  },
};

export const BUDDY_PANEL_VARIANTS: Variants = {
  open: { opacity: 1, scale: 1, y: 0, transition: SPRING_ANIMATION },
  closed: { opacity: 0, scale: 0.95, y: 20, transition: SPRING_ANIMATION },
};

export const BUDDY_GLOW_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: [0, 0.4, 0],
    scale: [0.95, 1.1, 1.05],
    transition: { duration: 3, times: [0, 0.3, 1], ease: 'easeOut' as const },
  },
};

export const BUDDY_MINIMIZED_VARIANTS: Variants = {
  open: { width: BUDDY_PANEL_WIDTH, height: BUDDY_PANEL_HEIGHT, transition: SPRING_ANIMATION },
  minimized: { width: BUDDY_MINIMIZED_WIDTH, height: BUDDY_MINIMIZED_HEIGHT, transition: SPRING_ANIMATION },
};

/** State persistence */
export const BUDDY_POSITION_STORAGE_KEY = 'buddy-position';
export const BUDDY_VISIBLE_STORAGE_KEY = 'buddy-visible';
export const BUDDY_MINIMIZED_STORAGE_KEY = 'buddy-minimized';
export const BUDDY_STATE_DEBOUNCE_MS = 1000;
// Centered: will be calculated on mount if no saved position
export const BUDDY_DEFAULT_POSITION = { x: -1, y: -1 };

/** UI timing */
export const BUDDY_AUTOFOCUS_DELAY_MS = 100;
export const BUDDY_ENTRANCE_DELAY_MS = 1000;

export const BUDDY_THINKING_PUNS = [
  'Tuning up...',
  'Shredding through...',
  'Finding your jam...',
  'Strumming results...',
  'Riffing...',
  'Harmonizing...',
  'Dialing in tone...',
  'Running scales...',
  'Pentatonic matching...',
  'Circle of fifths...',
  'Sound check...',
  'Encore encoding...',
  'Groove grooving...',
  'Tone chasing...',
] as const;

export const STRUCTURED_DATA_TYPES = {
  INFLUENCE_CHAIN: 'influence_chain',
  ARTIST_CARD: 'artist_card',
} as const;

/** Navigation routes for Buddy's mini nav bar - DRY via pageRoutes */
export const BUDDY_NAV_ROUTES = [
  { path: pageRoutes.songs, label: 'Library', icon: 'music' },
  { path: pageRoutes.artists, label: 'Artists', icon: 'users' },
  // { path: pageRoutes.songwriter, label: 'Write', icon: 'pen' }, // TODO: Re-enable when songwriter is stable
  { path: pageRoutes.jam, label: 'Jam', icon: 'guitar' },
  { path: pageRoutes.musicTheory, label: 'Theory', icon: 'book' },
  { path: pageRoutes.metronome, label: 'Tempo', icon: 'clock' },
  { path: pageRoutes.composer, label: 'Compose', icon: 'piano' },
  { path: pageRoutes.pedalboard, label: 'FX', icon: 'sliders' },
] as const;
