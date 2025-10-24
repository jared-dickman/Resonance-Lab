export const SHARP_SCALE = [
  'A',
  'A#',
  'B',
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
] as const;
export const FLAT_SCALE = [
  'A',
  'Bb',
  'B',
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
] as const;

export const SEMITONES_IN_OCTAVE = 12;

export const CHORD_FUNCTION = {
  TONIC: 'tonic',
  SUBDOMINANT: 'subdominant',
  DOMINANT: 'dominant',
  MEDIANT: 'mediant',
  SUBMEDIANT: 'submediant',
  SUPERTONIC: 'supertonic',
  LEADING_TONE: 'leading tone',
} as const;

export const DEFAULT_KEY = 'C';
export const DEFAULT_CHORD_DURATION = 4;
export const DEFAULT_BPM = 90;
