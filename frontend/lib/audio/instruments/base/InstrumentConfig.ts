/**
 * Shared configuration types for all instruments
 * Part of the composable audio system
 */

import type * as Tone from 'tone';

export interface InstrumentConfig {
  /** Preset name to load */
  preset?: string;
  /** Master volume in dB */
  volume?: number;
  /** Connect to specific destination */
  destination?: Tone.ToneAudioNode;
}

export interface InstrumentPreset {
  name: string;
  description: string;
  settings: Record<string, unknown>;
}

export interface Note {
  /** MIDI note or note name (e.g., 'C4', 60) */
  note: string | number;
  /** Duration in seconds or note value (e.g., '4n', '8n') */
  duration: Tone.Unit.Time;
  /** Time to trigger (relative or absolute) */
  time?: Tone.Unit.Time;
  /** Velocity (0-1) */
  velocity?: number;
}

export interface ChordOptions {
  /** Root note */
  root: string;
  /** Chord type (e.g., 'maj7', 'min', 'dom7') */
  type: string;
  /** Duration */
  duration: Tone.Unit.Time;
  /** Voicing strategy */
  voicing?: 'close' | 'spread' | 'drop2' | 'drop3';
  /** Velocity (0-1) */
  velocity?: number;
}
