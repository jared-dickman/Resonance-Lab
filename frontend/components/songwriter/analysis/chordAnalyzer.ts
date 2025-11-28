import type {
  ChordInstance,
  ChordProgression,
  HarmonicFunction,
  MusicalKey,
} from '@/components/songwriter/types/song';

export function calculateVoiceLeadingQuality(progression: ChordInstance[]): number {
  if (progression.length < 2) {
    return 1.0;
  }

  let totalQuality = 0;

  for (let i = 0; i < progression.length - 1; i++) {
    const current = progression[i];
    const next = progression[i + 1];

    if (!current || !next) {
      continue;
    }

    const movement = calculateSemitonemovement(current.root, next.root);

    const quality = evaluateMovementQuality(movement);

    totalQuality += quality;
  }

  return totalQuality / (progression.length - 1);
}

export function determineHarmonicFunction(
  chord: ChordInstance,
  key: MusicalKey
): HarmonicFunction {
  const interval = calculateSemitoneDistance(key, chord.root);

  const functionMap: Record<number, HarmonicFunction> = {
    0: 'tonic',
    2: 'supertonic',
    4: 'mediant',
    5: 'subdominant',
    7: 'dominant',
    9: 'submediant',
    11: 'leadingTone',
  };

  return functionMap[interval % 12] || 'chromatic';
}

export function calculateTensionLevel(chord: ChordInstance): number {
  const qualityTension: Record<string, number> = {
    major: 0.0,
    minor: 0.2,
    diminished: 0.8,
    augmented: 0.9,
    dominant7: 0.7,
    major7: 0.3,
    minor7: 0.4,
    diminished7: 0.9,
    halfDiminished7: 0.8,
    augmented7: 0.95,
    sus2: 0.5,
    sus4: 0.6,
    add9: 0.3,
    add11: 0.4,
    major9: 0.4,
    minor9: 0.5,
    major11: 0.5,
    minor11: 0.6,
    major13: 0.6,
    minor13: 0.7,
    '6': 0.2,
    minor6: 0.3,
    power: 0.1,
  };

  return qualityTension[chord.quality] || 0.5;
}

export function analyzeProgressionResolves(progression: ChordProgression): boolean {
  if (progression.chords.length < 2) {
    return false;
  }

  const lastChord = progression.chords[progression.chords.length - 1];
  const penultimateChord = progression.chords[progression.chords.length - 2];

  if (!lastChord || !penultimateChord) {
    return false;
  }

  const tonicFunction = determineHarmonicFunction(lastChord, progression.key);

  if (tonicFunction === 'tonic') {
    return true;
  }

  const penultimateFunction = determineHarmonicFunction(
    penultimateChord,
    progression.key
  );

  return penultimateFunction === 'dominant';
}

function calculateSemitonemovement(from: MusicalKey, to: MusicalKey): number {
  const distance = calculateSemitoneDistance(from, to);

  return Math.min(distance, 12 - distance);
}

function calculateSemitoneDistance(from: MusicalKey, to: MusicalKey): number {
  const noteValues: Record<MusicalKey, number> = {
    C: 0,
    'C#': 1,
    Db: 1,
    D: 2,
    'D#': 3,
    Eb: 3,
    E: 4,
    F: 5,
    'F#': 6,
    Gb: 6,
    G: 7,
    'G#': 8,
    Ab: 8,
    A: 9,
    'A#': 10,
    Bb: 10,
    B: 11,
  };

  const fromValue = noteValues[from];
  const toValue = noteValues[to];

  const distance = toValue - fromValue;

  return ((distance % 12) + 12) % 12;
}

function evaluateMovementQuality(semitones: number): number {
  const qualityMap: Record<number, number> = {
    0: 0.3,
    1: 0.5,
    2: 0.9,
    3: 0.7,
    4: 0.8,
    5: 0.95,
    6: 0.4,
  };

  return qualityMap[semitones] || 0.6;
}
