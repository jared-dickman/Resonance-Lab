/**
 * Piano chord position database
 * Each chord is represented by MIDI note numbers (C4 = 60)
 */

export interface PianoChordPosition {
  notes: number[]; // MIDI note numbers (e.g., [60, 64, 67] for C major)
  fingerNumbers?: number[]; // Optional finger numbers (1-5, thumb to pinky)
  hand: "left" | "right" | "both";
  spread: "close" | "open" | "wide"; // How spread out the chord is
}

export interface PianoChordVoicing {
  name: string;
  position: PianoChordPosition;
  difficulty: "beginner" | "intermediate" | "advanced";
  positionName: string;
  octave: number; // Which octave this voicing is in
}

// MIDI note helper - Middle C (C4) = 60
const NOTE_C4 = 60;

// Helper to build chords from intervals
function buildChord(root: number, intervals: number[]): number[] {
  return intervals.map((interval) => root + interval);
}

/**
 * Piano chord database - multiple voicings per chord across octaves
 */
export const PIANO_CHORD_DATABASE: Record<string, PianoChordVoicing[]> = {
  // C Major
  C: [
    {
      name: "C",
      position: {
        notes: buildChord(NOTE_C4, [0, 4, 7]), // C E G
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "C",
      position: {
        notes: buildChord(NOTE_C4, [0, 7, 12 + 4]), // C G E (1st inversion)
        fingerNumbers: [1, 2, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "1st Inversion",
      octave: 4,
    },
    {
      name: "C",
      position: {
        notes: buildChord(NOTE_C4, [0, 12 + 4, 12 + 7]), // C E G (octave higher)
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "open",
      },
      difficulty: "intermediate",
      positionName: "Open Voicing",
      octave: 4,
    },
    {
      name: "C",
      position: {
        notes: buildChord(NOTE_C4 - 12, [0, 4, 7]), // C E G (lower octave)
        fingerNumbers: [5, 3, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  // D Major
  D: [
    {
      name: "D",
      position: {
        notes: buildChord(NOTE_C4 + 2, [0, 4, 7]), // D F# A
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "D",
      position: {
        notes: buildChord(NOTE_C4 + 2, [0, 7, 12 + 4]), // D A F#
        fingerNumbers: [1, 2, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "1st Inversion",
      octave: 4,
    },
    {
      name: "D",
      position: {
        notes: buildChord(NOTE_C4 + 2 - 12, [0, 4, 7]), // D F# A (lower octave)
        fingerNumbers: [5, 3, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  // E Major
  E: [
    {
      name: "E",
      position: {
        notes: buildChord(NOTE_C4 + 4, [0, 4, 7]), // E G# B
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "E",
      position: {
        notes: buildChord(NOTE_C4 + 4 - 12, [0, 4, 7]), // E G# B (lower octave)
        fingerNumbers: [5, 3, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  // F Major
  F: [
    {
      name: "F",
      position: {
        notes: buildChord(NOTE_C4 + 5, [0, 4, 7]), // F A C
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "F",
      position: {
        notes: buildChord(NOTE_C4 + 5 - 12, [0, 4, 7]), // F A C (lower octave)
        fingerNumbers: [5, 3, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  // G Major
  G: [
    {
      name: "G",
      position: {
        notes: buildChord(NOTE_C4 + 7, [0, 4, 7]), // G B D
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "G",
      position: {
        notes: buildChord(NOTE_C4 + 7, [0, 7, 12 + 4]), // G D B (1st inversion)
        fingerNumbers: [1, 2, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "1st Inversion",
      octave: 4,
    },
    {
      name: "G",
      position: {
        notes: buildChord(NOTE_C4 + 7 - 12, [0, 4, 7]), // G B D (lower octave)
        fingerNumbers: [5, 3, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  // A Major
  A: [
    {
      name: "A",
      position: {
        notes: buildChord(NOTE_C4 + 9, [0, 4, 7]), // A C# E
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "A",
      position: {
        notes: buildChord(NOTE_C4 + 9 - 12, [0, 4, 7]), // A C# E (lower octave)
        fingerNumbers: [5, 3, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  // B Major
  B: [
    {
      name: "B",
      position: {
        notes: buildChord(NOTE_C4 + 11, [0, 4, 7]), // B D# F#
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "B",
      position: {
        notes: buildChord(NOTE_C4 + 11 - 12, [0, 4, 7]), // B D# F# (lower octave)
        fingerNumbers: [5, 3, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  // Minor chords
  Am: [
    {
      name: "Am",
      position: {
        notes: buildChord(NOTE_C4 + 9, [0, 3, 7]), // A C E
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "Am",
      position: {
        notes: buildChord(NOTE_C4 + 9 - 12, [0, 3, 7]), // A C E (lower octave)
        fingerNumbers: [5, 3, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  Dm: [
    {
      name: "Dm",
      position: {
        notes: buildChord(NOTE_C4 + 2, [0, 3, 7]), // D F A
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "Dm",
      position: {
        notes: buildChord(NOTE_C4 + 2 - 12, [0, 3, 7]), // D F A (lower octave)
        fingerNumbers: [5, 3, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  Em: [
    {
      name: "Em",
      position: {
        notes: buildChord(NOTE_C4 + 4, [0, 3, 7]), // E G B
        fingerNumbers: [1, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "Em",
      position: {
        notes: buildChord(NOTE_C4 + 4 - 12, [0, 3, 7]), // E G B (lower octave)
        fingerNumbers: [5, 3, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "beginner",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  // Seventh chords
  G7: [
    {
      name: "G7",
      position: {
        notes: buildChord(NOTE_C4 + 7, [0, 4, 7, 10]), // G B D F
        fingerNumbers: [1, 2, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "intermediate",
      positionName: "Root Position",
      octave: 4,
    },
    {
      name: "G7",
      position: {
        notes: buildChord(NOTE_C4 + 7 - 12, [0, 4, 7, 10]), // G B D F (lower octave)
        fingerNumbers: [5, 3, 2, 1],
        hand: "left",
        spread: "close",
      },
      difficulty: "intermediate",
      positionName: "Root Position (Left)",
      octave: 3,
    },
  ],

  C7: [
    {
      name: "C7",
      position: {
        notes: buildChord(NOTE_C4, [0, 4, 7, 10]), // C E G Bb
        fingerNumbers: [1, 2, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "intermediate",
      positionName: "Root Position",
      octave: 4,
    },
  ],

  D7: [
    {
      name: "D7",
      position: {
        notes: buildChord(NOTE_C4 + 2, [0, 4, 7, 10]), // D F# A C
        fingerNumbers: [1, 2, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "intermediate",
      positionName: "Root Position",
      octave: 4,
    },
  ],

  E7: [
    {
      name: "E7",
      position: {
        notes: buildChord(NOTE_C4 + 4, [0, 4, 7, 10]), // E G# B D
        fingerNumbers: [1, 2, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "intermediate",
      positionName: "Root Position",
      octave: 4,
    },
  ],

  A7: [
    {
      name: "A7",
      position: {
        notes: buildChord(NOTE_C4 + 9, [0, 4, 7, 10]), // A C# E G
        fingerNumbers: [1, 2, 3, 5],
        hand: "right",
        spread: "close",
      },
      difficulty: "intermediate",
      positionName: "Root Position",
      octave: 4,
    },
  ],
};

/**
 * Get piano chord voicings for a chord name
 */
export function getPianoChordVoicings(chordName: string): PianoChordVoicing[] {
  const normalized = chordName.trim();

  if (PIANO_CHORD_DATABASE[normalized]) {
    return PIANO_CHORD_DATABASE[normalized];
  }

  const match = normalized.match(/^([A-G][#b]?)(.*)?$/);
  if (!match) {
    return [];
  }

  const [, root, quality = ""] = match;
  const withQuality = (root ?? '') + quality;

  if (root && PIANO_CHORD_DATABASE[withQuality]) {
    return PIANO_CHORD_DATABASE[withQuality];
  }

  if (root && PIANO_CHORD_DATABASE[root]) {
    return PIANO_CHORD_DATABASE[root];
  }

  return [];
}

/**
 * Get default piano voicing
 */
export function getDefaultPianoVoicing(chordName: string): PianoChordVoicing | null {
  const voicings = getPianoChordVoicings(chordName);
  return voicings.length > 0 ? (voicings[0] ?? null) : null;
}

/**
 * Convert MIDI note number to note name
 */
export function midiToNoteName(midi: number): string {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(midi / 12) - 1;
  const noteName = noteNames[midi % 12];
  return `${noteName}${octave}`;
}

/**
 * Convert MIDI note to frequency (Hz)
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
