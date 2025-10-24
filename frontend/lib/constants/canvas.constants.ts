/**
 * Canvas Rendering Constants
 * Device pixel ratio, sizing, and rendering settings
 */

export const DEVICE_PIXEL_RATIO = {
  DEFAULT: 1,
  get CURRENT(): number {
    return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  },
} as const;

export const CANVAS_COLOR = {
  BACKGROUND: '#000000',
  GRID_LINE: '#333',
  TEXT: '#ffffff',
  FRETBOARD_BACKGROUND: '#8B4513',
  FRETBOARD_FRET: '#C0C0C0',
  STRING: '#FFD700',
  MARKER: '#FFFFFF',
} as const;

export const FINGER_COLORS = [
  '#666',    // neutral (0/muted)
  '#3b82f6', // blue-500 (1)
  '#10b981', // green-500 (2)
  '#f59e0b', // amber-500 (3)
  '#ef4444', // red-500 (4)
  '#a855f7', // purple-500 (5)
] as const;

export const NOTE_COLORS = {
  WHITE_KEY: '#FFFFFF',
  WHITE_KEY_PRESSED: '#E0E0E0',
  BLACK_KEY: '#000000',
  BLACK_KEY_PRESSED: '#333333',
  ACTIVE_NOTE: '#3b82f6',
} as const;
