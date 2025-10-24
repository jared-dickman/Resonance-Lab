import { FLAT_SCALE, SEMITONES_IN_OCTAVE, SHARP_SCALE } from '@/lib/constants/music.constants';

const CHORD_ROOT_REGEX = /^([A-G][#b]?)(.*)/;

interface ChordParts {
  root: string;
  quality: string;
}

function parseChord(chordName: string): ChordParts | null {
  const match = chordName.match(CHORD_ROOT_REGEX);
  if (!match) {
    return null;
  }

  const [, root, quality] = match;
  return { root, quality };
}

function shouldUseFlatScale(root: string): boolean {
  return root.includes('b');
}

function isValidNote(root: string, scale: readonly string[]): root is typeof scale[number] {
  return scale.includes(root);
}

function getNewRoot(root: string, steps: number): string | null {
  const scale = shouldUseFlatScale(root) ? FLAT_SCALE : SHARP_SCALE;

  const index = scale.findIndex(note => note === root);

  if (index === -1) {
    return null;
  }

  const newIndex = (index + steps + SEMITONES_IN_OCTAVE) % SEMITONES_IN_OCTAVE;
  const newNote = scale[newIndex];
  return newNote !== undefined ? newNote : null;
}

export function transposeChord(chordName: string, steps: number): string {
  const chordParts = parseChord(chordName);
  if (!chordParts) {
    return chordName;
  }

  const { root, quality } = chordParts;
  const newRoot = getNewRoot(root, steps);

  if (!newRoot) {
    return chordName;
  }

  return newRoot + quality;
}
