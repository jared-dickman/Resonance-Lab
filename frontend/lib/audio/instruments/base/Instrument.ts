/**
 * Abstract base class for all instruments
 * Provides unified interface for sound generation
 */

import * as Tone from 'tone';
import type { InstrumentConfig, InstrumentPreset, Note, ChordOptions } from './InstrumentConfig';

export abstract class Instrument {
  protected synth: Tone.Instrument | Tone.Sampler;
  protected volume: Tone.Volume;
  protected config: InstrumentConfig;

  constructor(config: InstrumentConfig = {}) {
    this.config = { volume: -10, ...config };
    this.volume = new Tone.Volume(this.config.volume);

    // Subclass must initialize this.synth
    this.synth = null as unknown as Tone.Instrument;
  }

  /**
   * Get available presets for this instrument
   */
  abstract getPresets(): InstrumentPreset[];

  /**
   * Load a preset by name
   */
  abstract loadPreset(presetName: string): void;

  /**
   * Play a single note
   */
  playNote(note: Note): void {
    // Check if instrument is ready before playing
    if (!this.isReady()) {
      // Silently skip if not ready - samples are loading
      return;
    }

    const velocity = note.velocity ?? 0.8;
    const time = note.time ?? Tone.now();

    // Ensure note has an octave number
    // If note is just a letter (e.g., "C"), add default octave 4
    let noteString = String(note.note);
    if (!/\d/.test(noteString)) {
      noteString = `${noteString}4`;
    }

    if (this.synth instanceof Tone.Sampler) {
      this.synth.triggerAttackRelease(
        noteString,
        note.duration,
        time,
        velocity
      );
    } else {
      this.synth.triggerAttackRelease(
        noteString,
        note.duration,
        time,
        velocity
      );
    }
  }

  /**
   * Play multiple notes simultaneously
   */
  playChord(notes: string[], duration: Tone.Unit.Time, time?: Tone.Unit.Time, velocity = 0.8): void {
    const triggerTime = time ?? Tone.now();

    notes.forEach((note) => {
      this.playNote({
        note,
        duration,
        time: triggerTime,
        velocity,
      });
    });
  }

  /**
   * Connect to audio destination or effect
   */
  connect(destination: Tone.ToneAudioNode): this {
    this.volume.connect(destination);
    return this;
  }

  /**
   * Disconnect from all destinations
   */
  disconnect(): this {
    this.volume.disconnect();
    return this;
  }

  /**
   * Set volume in dB
   */
  setVolume(db: number): this {
    this.volume.volume.value = db;
    return this;
  }

  /**
   * Get current volume in dB
   */
  getVolume(): number {
    return this.volume.volume.value;
  }

  /**
   * Dispose of all audio resources
   */
  dispose(): void {
    this.synth.dispose();
    this.volume.dispose();
  }

  /**
   * Check if instrument is ready to play
   */
  abstract isReady(): boolean;
}
