/**
 * Game Mechanics Constants
 * All magic values related to rhythm game, practice modes, and game scoring
 */

// Hit Detection Thresholds (milliseconds)
export const HIT_WINDOW = {
  PERFECT: 100,
  GOOD: 200,
} as const;

// Scoring Points
export const SCORE_POINTS = {
  PERFECT: 100,
  GOOD: 50,
  MISS: 0,
} as const;

// Hit Quality Types
export const HIT_QUALITY = {
  PERFECT: 'perfect',
  GOOD: 'good',
  MISS: 'miss',
} as const;

// Game Visual Settings
export const GAME_VISUAL = {
  FALL_SPEED_PX_PER_SEC: 200,
  GRID_SPACING_PX: 50,
  CHORD_COLOR_HASH_MULTIPLIER: 137,
  CHORD_COLOR_HUE_MODULO: 360,
} as const;

// Practice Mode Settings
export const PRACTICE_MODE = {
  DEFAULT_LINE_LIMIT: 7,
  MIN_BPM: 40,
  MAX_BPM: 200,
  DEFAULT_BPM: 90,
} as const;

// Fretboard Constants
export const FRETBOARD = {
  MARKER_FRETS: [3, 5, 7, 9, 12],
  STANDARD_TUNING: ['E', 'A', 'D', 'G', 'B', 'E'],
} as const;

// Canvas Rendering Ratios
export const CANVAS_RATIO = {
  BLACK_KEY_HEIGHT: 0.7,
  BLACK_KEY_OFFSET: 0.45,
  BLACK_KEY_WIDTH: 0.6,
} as const;

// Audio Context
export const AUDIO = {
  DEFAULT_VOLUME: 0.5,
  NOTE_DURATION_SEC: 0.2,
} as const;
