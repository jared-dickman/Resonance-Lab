export const SCROLL_AREA_HEIGHT = {
  SMALL: '400px',
  MEDIUM: '600px',
  LARGE: '800px',
} as const;

export const MAX_WIDTH = {
  SMALL: 'max-w-md',
  MEDIUM: 'max-w-2xl',
  LARGE: 'max-w-4xl',
  EXTRA_LARGE: 'max-w-7xl',
} as const;

export const GRID_COLUMNS = {
  SINGLE: 'grid-cols-1',
  TWO: 'grid-cols-1 md:grid-cols-2',
  THREE: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
} as const;

export const DEFAULT_BPM = 90;
export const MIN_BPM = 40;
export const MAX_BPM = 240;

export const PANEL_SIZE = {
  MIN: 20,
  DEFAULT: 33,
} as const;
