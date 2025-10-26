import { Chord, Scale, Key, Note, Interval } from 'tonal';

/**
 * TonalHelper - Music theory utilities using Tonal.js
 * Provides intelligent chord analysis, scale detection, and progression suggestions
 */

export interface ChordInfo {
  name: string;
  notes: string[];
  intervals: string[];
  quality: string;
  rootNote: string;
  bassNote?: string;
}

export interface ScaleInfo {
  name: string;
  notes: string[];
  intervals: string[];
  type: string;
}

export interface KeyInfo {
  tonic: string;
  type: 'major' | 'minor';
  scale: string[];
  chords: string[];
  relatives: {
    relative: string;
    parallel: string;
  };
}

/**
 * Analyze a chord name and return detailed information
 */
export function analyzeChord(chordName: string): ChordInfo | null {
  const chord = Chord.get(chordName);

  if (!chord.notes.length) {
    return null;
  }

  return {
    name: chord.name,
    notes: chord.notes,
    intervals: chord.intervals,
    quality: chord.quality,
    rootNote: chord.tonic || '',
    bassNote: chord.notes[0],
  };
}

/**
 * Get all notes in a chord with proper octave numbers
 */
export function getChordNotes(
  chordName: string,
  octave: number = 4
): string[] {
  const chord = Chord.get(chordName);

  if (!chord.notes.length) {
    return [];
  }

  return chord.notes.map(note => `${note}${octave}`);
}

/**
 * Detect the key from a chord progression
 */
export function detectKey(chordProgression: string[]): KeyInfo | null {
  // Simple heuristic: use the first chord as likely tonic
  const firstChordName = chordProgression[0];
  if (!firstChordName) {
    return null;
  }

  const firstChord = Chord.get(firstChordName);

  if (!firstChord.tonic) {
    return null;
  }

  // Determine if major or minor based on first chord quality
  const isMajor = firstChord.quality === 'Major' || !firstChord.quality;
  const keyData = isMajor
    ? Key.majorKey(firstChord.tonic)
    : Key.minorKey(firstChord.tonic);

  // Type guard for key data
  const scale = 'scale' in keyData ? [...keyData.scale] : [];
  const chords = 'chords' in keyData ? [...keyData.chords] : [];
  const relative = isMajor
    ? (keyData as ReturnType<typeof Key.majorKey>).minorRelative || ''
    : '';

  return {
    tonic: keyData.tonic,
    type: isMajor ? 'major' : 'minor',
    scale,
    chords,
    relatives: {
      relative,
      parallel: isMajor
        ? Key.minorKey(keyData.tonic).tonic
        : Key.majorKey(keyData.tonic).tonic,
    },
  };
}

/**
 * Get scale information
 */
export function getScale(scaleName: string): ScaleInfo | null {
  const scale = Scale.get(scaleName);

  if (!scale.notes.length) {
    return null;
  }

  return {
    name: scale.name,
    notes: scale.notes,
    intervals: scale.intervals,
    type: scale.type,
  };
}

/**
 * Suggest next chords based on music theory
 * Returns array of chord names with probability scores
 */
export function suggestNextChords(
  currentChord: string,
  key?: string
): Array<{ chord: string; probability: number; reason: string }> {
  const suggestions: Array<{
    chord: string;
    probability: number;
    reason: string;
  }> = [];

  const current = Chord.get(currentChord);

  if (!current.tonic) {
    return [];
  }

  // If key is provided, use diatonic chord suggestions
  if (key) {
    const keyData = Key.majorKey(key);
    const currentIndex = keyData.chords.indexOf(currentChord);

    if (currentIndex !== -1) {
      // Common progressions in major keys
      const commonProgressions: Record<number, Array<[number, string]>> = {
        0: [
          [3, 'IV - Subdominant'],
          [4, 'V - Dominant'],
          [5, 'vi - Relative minor'],
        ], // I → IV, V, vi
        1: [
          [3, 'ii → IV common'],
          [4, 'ii → V (secondary dominant)'],
        ], // ii → IV, V
        2: [
          [4, 'iii → V common'],
          [5, 'iii → vi common'],
        ], // iii → V, vi
        3: [
          [0, 'IV → I (plagal cadence)'],
          [4, 'IV → V common'],
        ], // IV → I, V
        4: [
          [0, 'V → I (perfect cadence)'],
          [5, 'V → vi (deceptive cadence)'],
        ], // V → I, vi
        5: [
          [1, 'vi → ii common'],
          [3, 'vi → IV common'],
        ], // vi → ii, IV
      };

      const nexts = commonProgressions[currentIndex] || [];
      const chords = 'chords' in keyData ? keyData.chords : [];
      nexts.forEach(([idx, reason]) => {
        const chord = chords[idx];
        if (chord) {
          suggestions.push({
            chord,
            probability: 0.8,
            reason,
          });
        }
      });
    }
  }

  // Always suggest dominant (V) and subdominant (IV) relative to current root
  const root = current.tonic;
  if (root) {
    const fifth = Note.transpose(root, '5P'); // Perfect fifth up (dominant)
    const fourth = Note.transpose(root, '4P'); // Perfect fourth up (subdominant)

    suggestions.push(
      {
        chord: `${fifth}${current.quality === 'Minor' ? 'm' : ''}`,
        probability: 0.7,
        reason: 'Dominant relationship',
      },
      {
        chord: `${fourth}${current.quality === 'Minor' ? 'm' : ''}`,
        probability: 0.6,
        reason: 'Subdominant relationship',
      }
    );
  }

  // Remove duplicates and sort by probability
  const unique = Array.from(
    new Map(suggestions.map(s => [s.chord, s])).values()
  );
  return unique.sort((a, b) => b.probability - a.probability);
}

/**
 * Transpose a chord by semitones
 */
export function transposeChord(
  chordName: string,
  semitones: number
): string | null {
  const chord = Chord.get(chordName);

  if (!chord.tonic) {
    return null;
  }

  const newRoot = Note.transpose(chord.tonic, Interval.fromSemitones(semitones));
  return `${newRoot}${chord.aliases[0]?.replace(chord.tonic, '') || ''}`;
}

/**
 * Transpose an entire chord progression
 */
export function transposeProgression(
  chords: string[],
  semitones: number
): string[] {
  return chords
    .map(chord => transposeChord(chord, semitones))
    .filter((chord): chord is string => chord !== null);
}

/**
 * Get the bass note for a chord (useful for bass line generation)
 */
export function getBassNote(chordName: string, octave: number = 2): string {
  const chord = Chord.get(chordName);

  if (!chord.notes.length) {
    return `C${octave}`;
  }

  return `${chord.notes[0]}${octave}`;
}

/**
 * Generate a walking bass line pattern from chord progression
 */
export function generateWalkingBass(
  chordProgression: string[],
  octave: number = 2
): string[] {
  const bassNotes: string[] = [];

  chordProgression.forEach((chord, i) => {
    const chordInfo = Chord.get(chord);
    const nextChordName = chordProgression[i + 1];
    const nextChord = nextChordName ? Chord.get(nextChordName) : null;

    if (!chordInfo.notes.length) {
      return;
    }

    const rootNote = chordInfo.notes[0];
    if (!rootNote) {
      return;
    }

    // Root note
    bassNotes.push(`${rootNote}${octave}`);

    // If there's a next chord, add a passing tone
    if (nextChord && nextChord.notes.length) {
      const nextRootNote = nextChord.notes[0];
      if (!nextRootNote) {
        return;
      }

      const currentRoot = Note.get(rootNote).midi || 0;
      const nextRoot = Note.get(nextRootNote).midi || 0;
      const diff = nextRoot - currentRoot;

      if (Math.abs(diff) <= 2) {
        // Step-wise motion: add a passing tone
        const passingTone =
          diff > 0
            ? Note.transpose(rootNote, '2M')
            : Note.transpose(rootNote, '-2M');
        bassNotes.push(`${passingTone}${octave}`);
      } else {
        // Jump: use fifth of current chord
        if (chordInfo.notes.length >= 3) {
          bassNotes.push(`${chordInfo.notes[2]}${octave}`);
        }
      }
    }
  });

  return bassNotes;
}

/**
 * Get interval between two notes
 */
export function getInterval(note1: string, note2: string): string {
  return Interval.distance(note1, note2);
}

/**
 * Check if a note is in a scale
 */
export function isInScale(note: string, scaleName: string): boolean {
  const scale = Scale.get(scaleName);
  const noteClass = Note.get(note).pc; // Pitch class (without octave)
  return scale.notes.includes(noteClass);
}

/**
 * Get chord quality (major, minor, diminished, augmented, etc.)
 */
export function getChordQuality(chordName: string): string {
  const chord = Chord.get(chordName);
  return chord.quality || 'Unknown';
}

/**
 * Get all chords in a key
 */
export function getChordsInKey(keyName: string, type: 'major' | 'minor' = 'major'): string[] {
  const keyData = type === 'major' ? Key.majorKey(keyName) : Key.minorKey(keyName);
  return 'chords' in keyData ? [...keyData.chords] : [];
}

/**
 * Get circle of fifths position for a note
 */
export function getCircleOfFifthsPosition(note: string): number {
  const circleOrder = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  const noteClass = Note.get(note).pc;
  return circleOrder.indexOf(noteClass);
}

/**
 * Get related keys (relative, parallel, etc.)
 */
export function getRelatedKeys(keyName: string, type: 'major' | 'minor' = 'major') {
  const keyData = type === 'major' ? Key.majorKey(keyName) : Key.minorKey(keyName);

  const relative = type === 'major'
    ? (keyData as ReturnType<typeof Key.majorKey>).minorRelative || ''
    : '';

  return {
    relative,
    parallel: type === 'major' ? Key.minorKey(keyName).tonic : Key.majorKey(keyName).tonic,
  };
}
