/**
 * Visualization Constants
 * Centralized configuration for all audio/visual components
 */

// Canvas Dimensions
export const CANVAS_DIMENSIONS = {
  DEFAULT: {
    WIDTH: 800,
    HEIGHT: 600,
  },
  COMPACT: {
    WIDTH: 600,
    HEIGHT: 200,
  },
  WAVEFORM: {
    WIDTH: 600,
    HEIGHT: 150,
  },
  SQUARE: {
    WIDTH: 600,
    HEIGHT: 600,
  },
  REGION_EDITOR: {
    WIDTH: 800,
    HEIGHT: 200,
  },
  INTERACTIVE_SYNTH: {
    WIDTH: 800,
    HEIGHT: 400,
  },
  SIGNAL_PATH: {
    WIDTH: 800,
    HEIGHT: 400,
  },
  CHORD_ANALYZER: {
    WIDTH: 600,
    HEIGHT: 300,
  },
} as const;

// Audio Analysis
export const AUDIO_ANALYSIS = {
  FFT_SIZE: {
    SMALL: 128,
    MEDIUM: 1024,
    LARGE: 2048,
  },
  WAVEFORM_SIZE: {
    SMALL: 256,
    MEDIUM: 1024,
    LARGE: 2048,
  },
  SPECTRUM: {
    DEFAULT_BAR_COUNT: 64,
    DEFAULT_SMOOTHING: 0.8,
    FREQUENCY_RANGE: {
      MIN: 20,
      MAX: 20000,
    },
  },
  CHORD_DETECTION: {
    PEAK_COUNT: 8,
    MIN_NOTES_FOR_CHORD: 3,
    FREQUENCY_RANGE: {
      MIN: 20,
      MAX: 4000,
    },
  },
} as const;

// Particle Systems
export const PARTICLE_SYSTEM = {
  COUNT: {
    SMALL: 100,
    MEDIUM: 500,
    LARGE: 1000,
    EXTRA_LARGE: 2000,
  },
  SPHERE_RADIUS: 15,
  SIZE_RANGE: {
    MIN: 1,
    MAX: 3,
  },
} as const;

// Animation
export const ANIMATION = {
  FPS_TARGET: 60,
  TRANSITION_DURATION: {
    FAST: 100,
    NORMAL: 200,
    SLOW: 500,
  },
  ROTATION_SPEED: {
    SLOW: 0.05,
    NORMAL: 0.1,
    FAST: 0.2,
  },
} as const;

// Colors
export const VISUALIZATION_COLORS = {
  SIGNAL_STRENGTH: {
    LOW: '#3b82f6', // Blue
    MEDIUM: '#8b5cf6', // Purple
    HIGH: '#ef4444', // Red
  },
  KEY_TYPES: {
    MAJOR: '#3b82f6', // Blue
    MINOR: '#8b5cf6', // Purple
  },
  NOTE_COLORS: {
    C: '#ef4444',
    D: '#f97316',
    E: '#f59e0b',
    F: '#84cc16',
    G: '#10b981',
    A: '#06b6d4',
    B: '#3b82f6',
    C5: '#8b5cf6',
  },
  UI: {
    BACKGROUND: '#000000',
    DARK_BG: '#111827',
    BORDER: '#374151',
    TEXT_PRIMARY: '#ffffff',
    TEXT_SECONDARY: '#9ca3af',
    TEXT_MUTED: '#6b7280',
  },
} as const;

// Circle of Fifths
export const CIRCLE_OF_FIFTHS = {
  KEYS: {
    MAJOR: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'] as const,
    MINOR: ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'] as const,
  },
  RADIUS_RATIOS: {
    OUTER: 0.38,
    INNER: 0.65,
    MINOR: 0.48,
  },
  SEGMENT_COUNT: 12,
} as const;

// Generative Art
export const GENERATIVE_ART = {
  FLOW_FIELD: {
    COLS: 50,
    ROWS: 50,
    PARTICLE_COUNT: 500,
    MAX_SPEED: 2,
    NOISE_SCALE: 0.1,
  },
  SPIRAL: {
    ARM_COUNT: 8,
    POINT_COUNT: 200,
    ROTATION_MULTIPLIER: 3,
  },
  MANDALA: {
    SEGMENT_COUNT: 12,
    LAYER_COUNT: 8,
    BASE_RADIUS: 30,
  },
  PARTICLE_RING: {
    COUNT: 100,
    BASE_RADIUS: 150,
  },
} as const;

// Waveform Region Editor
export const WAVEFORM_EDITOR = {
  TIMELINE_HEIGHT: 20,
  TIME_INTERVALS: {
    PRIMARY: 5,
    SECONDARY: 1,
  },
  ZOOM_LEVELS: [10, 50, 100, 200] as const,
  REGION_COLORS: {
    INTRO: '#3b82f680',
    VERSE: '#8b5cf680',
    CHORUS: '#10b98180',
    OUTRO: '#f59e0b80',
  },
  WAVEFORM_STYLE: {
    WAVE_COLOR: '#3b82f6',
    PROGRESS_COLOR: '#8b5cf6',
    CURSOR_COLOR: '#ef4444',
    BAR_WIDTH: 2,
    BAR_GAP: 1,
    BAR_RADIUS: 2,
  },
} as const;

// Interactive Synth
export const INTERACTIVE_SYNTH = {
  NOTES: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] as const,
  KEYBOARD_MAPPING: {
    a: 'C4',
    s: 'D4',
    d: 'E4',
    f: 'F4',
    g: 'G4',
    h: 'A4',
    j: 'B4',
    k: 'C5',
  } as const,
  SYNTH_CONFIG: {
    VOLUME: -10,
    OSCILLATOR_TYPE: 'triangle8',
    ENVELOPE: {
      ATTACK: 0.005,
      DECAY: 0.2,
      SUSTAIN: 0.4,
      RELEASE: 1.5,
    },
  },
  KEY_DIMENSIONS: {
    HEIGHT: 80,
    BORDER_RADIUS: 4,
  },
  HISTORY_LIMIT: 20,
  DISPLAY_LIMIT: 10,
} as const;

// Shader Configuration
export const SHADER_CONFIG = {
  FFT_SIZE: {
    SMALL: 128,
  },
  GEOMETRY: {
    ICOSAHEDRON_RADIUS: 2,
    ICOSAHEDRON_DETAIL: 64,
  },
  CAMERA: {
    FOV: 75,
    POSITION_Z: 6,
    POSITION_Y: 0,
    POSITION_X: 0,
  },
  LIGHT: {
    AMBIENT_INTENSITY: 0.3,
    POINT_INTENSITY: 1,
    POINT_POSITION: [10, 10, 10] as [number, number, number],
  },
  AUDIO_INFLUENCE: {
    LOW_PULSE: 0.5,
    MID_WAVE: 0.3,
    HIGH_DETAIL: 0.2,
  },
  ANIMATION: {
    ROTATION_SPEED: {
      SLOW: 0.05,
      NORMAL: 0.2,
      FAST: 0.4,
    },
  },
} as const;

// Animated Cable Routing
export const CABLE_ROUTING = {
  CABLE: {
    BASE_STROKE_WIDTH: 4,
    SHADOW_STROKE_WIDTH: 6,
    HOVER_STROKE_WIDTH: 6,
    SHADOW_OPACITY: 0.5,
    ACTIVE_OPACITY: 0.8,
    INACTIVE_OPACITY: 0.3,
    HOVER_OPACITY: 1,
    HOVER_DURATION: 200,
    ARCH_OFFSET: -50,
  },
  PARTICLE: {
    BASE_RADIUS: 3,
    SIGNAL_RADIUS_MULTIPLIER: 2,
    OPACITY_VISIBLE: 0.8,
    OPACITY_HIDDEN: 0,
    MIN_COUNT: 3,
    MAX_ADDITIONAL_COUNT: 2,
  },
  ANIMATION: {
    PARTICLE_DURATION: 2000,
    PARTICLE_DELAY_DIVISOR: 1000,
  },
  FILTER: {
    GLOW_STD_DEVIATION: 3,
    SIGNAL_STRENGTH_THRESHOLD: 0.7,
  },
  GRADIENT: {
    STOP_LOW: '0%',
    STOP_MID: '50%',
    STOP_HIGH: '100%',
  },
} as const;

// Signal Path Diagram
export const SIGNAL_PATH = {
  FORCE_SIMULATION: {
    LINK_DISTANCE: 120,
    CHARGE_STRENGTH: -300,
  },
  NODE: {
    RADIUS: 30,
    STROKE_WIDTH: 3,
  },
  ZOOM: {
    MIN: 0.5,
    MAX: 3,
  },
} as const;

// Notation Display (VexFlow)
export const NOTATION = {
  DEFAULT_DIMENSIONS: {
    WIDTH: 800,
    HEIGHT: 200,
  },
  STAVE: {
    MARGIN_X: 10,
    MARGIN_TOP: 40,
    PADDING_HORIZONTAL: 20,
  },
  VOICE: {
    NUM_BEATS: 4,
    BEAT_VALUE: 4,
  },
  FORMAT: {
    MARGIN_HORIZONTAL: 40,
  },
  DEFAULT_CLEF: 'treble' as const,
  DEFAULT_TIME_SIGNATURE: '4/4',
  CLEF_EMOJI: {
    treble: '🎼 Treble Clef',
    bass: '🎼 Bass Clef',
  },
} as const;

// Chord to Notation Mapping
export const CHORD_TO_NOTES_MAP = {
  C: ['c/4', 'e/4', 'g/4'],
  Cm: ['c/4', 'eb/4', 'g/4'],
  D: ['d/4', 'f#/4', 'a/4'],
  Dm: ['d/4', 'f/4', 'a/4'],
  E: ['e/4', 'g#/4', 'b/4'],
  Em: ['e/4', 'g/4', 'b/4'],
  F: ['f/4', 'a/4', 'c/5'],
  Fm: ['f/4', 'ab/4', 'c/5'],
  G: ['g/4', 'b/4', 'd/5'],
  Gm: ['g/4', 'bb/4', 'd/5'],
  A: ['a/4', 'c#/5', 'e/5'],
  Am: ['a/4', 'c/5', 'e/5'],
  B: ['b/4', 'd#/5', 'f#/5'],
  Bm: ['b/4', 'd/5', 'f#/5'],
} as const;

export const DEFAULT_NOTATION_NOTES = [
  { keys: ['e/4'], duration: 'q' },
  { keys: ['d/4'], duration: 'q' },
  { keys: ['c/4'], duration: 'q' },
  { keys: ['d/4'], duration: 'q' },
  { keys: ['e/4'], duration: 'q' },
  { keys: ['e/4'], duration: 'q' },
  { keys: ['e/4'], duration: 'h' },
] as const;

// File Size Limits (for documentation)
export const CODE_QUALITY = {
  MAX_FUNCTION_LINES: 20,
  MAX_FILE_LINES: 300,
  MAX_PARAMETERS: 3,
  MAX_COMPLEXITY: 5,
} as const;
