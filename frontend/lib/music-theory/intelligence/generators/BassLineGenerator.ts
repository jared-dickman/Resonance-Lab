/**
 * BassLineGenerator - Intelligent bass line creation
 * Generates musically appropriate bass patterns from chord progressions
 */

import { Chord, Note } from 'tonal';

export interface BassNote {
  /** Note name with octave */
  note: string;
  /** Start time in measures */
  time: number;
  /** Duration in beats */
  duration: number;
  /** Velocity (0-1) */
  velocity: number;
}

export interface BassLineOptions {
  /** Pattern style */
  style: 'root' | 'walking' | 'arpeggio' | 'octave';
  /** Octave for bass notes */
  octave: number;
  /** Beats per measure */
  beatsPerMeasure: number;
  /** Complexity (0-1) */
  complexity: number;
}

export class BassLineGenerator {
  /**
   * Generate bass line for chord progression
   */
  generate(chords: string[], options: Partial<BassLineOptions> = {}): BassNote[] {
    const { style = 'root', octave = 2, beatsPerMeasure = 4, complexity = 0.5 } = options;

    switch (style) {
      case 'walking':
        return this.generateWalking(chords, octave, beatsPerMeasure);
      case 'arpeggio':
        return this.generateArpeggio(chords, octave, beatsPerMeasure);
      case 'octave':
        return this.generateOctave(chords, octave, beatsPerMeasure);
      case 'root':
      default:
        return this.generateRoot(chords, octave, beatsPerMeasure);
    }
  }

  /**
   * Simple root note pattern
   */
  private generateRoot(chords: string[], octave: number, bpm: number): BassNote[] {
    const notes: BassNote[] = [];

    chords.forEach((chordSymbol, index) => {
      const chord = Chord.get(chordSymbol);
      const root = chord.tonic;

      if (root) {
        notes.push({
          note: `${root}${octave}`,
          time: index * bpm,
          duration: bpm,
          velocity: 0.8,
        });
      }
    });

    return notes;
  }

  /**
   * Walking bass line
   */
  private generateWalking(chords: string[], octave: number, bpm: number): BassNote[] {
    const notes: BassNote[] = [];

    chords.forEach((chordSymbol, index) => {
      const chord = Chord.get(chordSymbol);
      const chordNotes = chord.notes;

      if (chordNotes.length >= 3) {
        // Walk through chord tones
        for (let beat = 0; beat < bpm; beat++) {
          const noteIndex = beat % chordNotes.length;
          notes.push({
            note: `${chordNotes[noteIndex]}${octave}`,
            time: index * bpm + beat,
            duration: 1,
            velocity: beat === 0 ? 0.9 : 0.7,
          });
        }
      }
    });

    return notes;
  }

  /**
   * Arpeggiated bass pattern
   */
  private generateArpeggio(chords: string[], octave: number, bpm: number): BassNote[] {
    const notes: BassNote[] = [];

    chords.forEach((chordSymbol, index) => {
      const chord = Chord.get(chordSymbol);
      const chordNotes = chord.notes.slice(0, 3); // Root, 3rd, 5th

      if (chordNotes.length > 0) {
        // Root on beat 1
        notes.push({
          note: `${chordNotes[0]}${octave}`,
          time: index * bpm,
          duration: 1,
          velocity: 0.85,
        });

        // 5th on beat 3 (if exists)
        if (chordNotes.length >= 3) {
          notes.push({
            note: `${chordNotes[2]}${octave}`,
            time: index * bpm + 2,
            duration: 1,
            velocity: 0.75,
          });
        }
      }
    });

    return notes;
  }

  /**
   * Octave bounce pattern
   */
  private generateOctave(chords: string[], octave: number, bpm: number): BassNote[] {
    const notes: BassNote[] = [];

    chords.forEach((chordSymbol, index) => {
      const chord = Chord.get(chordSymbol);
      const root = chord.tonic;

      if (root) {
        // Low root
        notes.push({
          note: `${root}${octave}`,
          time: index * bpm,
          duration: 1,
          velocity: 0.9,
        });

        // High root (octave up)
        notes.push({
          note: `${root}${octave + 1}`,
          time: index * bpm + 2,
          duration: 1,
          velocity: 0.75,
        });
      }
    });

    return notes;
  }
}
