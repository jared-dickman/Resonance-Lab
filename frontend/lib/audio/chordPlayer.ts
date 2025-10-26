import * as Tone from 'tone';

/**
 * ChordPlayer - Plays chord progressions using Tone.js
 * Handles audio synthesis, timing, and loop playback
 */
export class ChordPlayer {
  private synth: Tone.PolySynth;
  private isInitialized = false;

  constructor() {
    // Create a polyphonic synthesizer with piano-like sound
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.4,
        release: 1.2,
      },
    }).toDestination();

    this.synth.volume.value = -8; // Reduce volume slightly
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await Tone.start();
      this.isInitialized = true;
    }
  }

  /**
   * Play a single chord
   */
  playChord(chordName: string, duration: number = 1): void {
    const notes = this.getChordNotes(chordName);
    const durationStr = `${duration}n`; // Convert to Tone.js duration format
    this.synth.triggerAttackRelease(notes, durationStr);
  }

  /**
   * Convert chord name to array of notes
   */
  private getChordNotes(chordName: string): string[] {
    // Parse chord name (e.g., "Cmaj7", "Am", "G7")
    const root = chordName.match(/^[A-G][#b]?/)?.[0] || 'C';
    const quality = chordName.replace(root, '');

    // Get root note in octave 4
    const rootNote = `${root}4`;
    const notes = [rootNote];

    // Major triad by default
    let intervals = [4, 7]; // Major third, perfect fifth

    // Adjust intervals based on chord quality
    if (quality.includes('m') && !quality.includes('maj')) {
      intervals = [3, 7]; // Minor third, perfect fifth
    }
    if (quality.includes('7')) {
      if (quality.includes('maj7')) {
        intervals.push(11); // Major seventh
      } else {
        intervals.push(10); // Dominant seventh
      }
    }
    if (quality.includes('sus4')) {
      intervals = [5, 7]; // Perfect fourth, perfect fifth
    }
    if (quality.includes('dim')) {
      intervals = [3, 6]; // Minor third, diminished fifth
    }
    if (quality.includes('aug')) {
      intervals = [4, 8]; // Major third, augmented fifth
    }

    // Convert intervals to notes
    intervals.forEach(interval => {
      notes.push(Tone.Frequency(rootNote).transpose(interval).toNote());
    });

    return notes;
  }

  /**
   * Stop all currently playing notes
   */
  stop(): void {
    this.synth.releaseAll();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.synth.dispose();
  }

  /**
   * Check if audio is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let chordPlayerInstance: ChordPlayer | null = null;

export function getChordPlayer(): ChordPlayer {
  if (!chordPlayerInstance) {
    chordPlayerInstance = new ChordPlayer();
  }
  return chordPlayerInstance;
}
