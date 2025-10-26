/**
 * Synth Bass - Analog-style bass synthesizer
 * Fat, punchy bass tones with sub-bass presence
 */

import * as Tone from 'tone';
import { Instrument } from '../base/Instrument';
import type { InstrumentConfig, InstrumentPreset } from '../base/InstrumentConfig';

export class SynthBass extends Instrument {
  private ready = false;

  constructor(config: InstrumentConfig = {}) {
    super(config);
    this.initializeSynth();
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.loadPreset('fat');
    }
    this.synth.connect(this.volume);
    this.volume.toDestination();
  }

  private initializeSynth(): void {
    // Fat analog bass with harmonics
    this.synth = new Tone.MonoSynth({
      oscillator: {
        type: 'fatsawtooth', // Richer harmonics
      },
      filter: {
        Q: 4,
        type: 'lowpass',
        frequency: 800,
        rolloff: -24,
      },
      envelope: {
        attack: 0.005,
        decay: 0.2,
        sustain: 0.5,
        release: 0.6,
      },
      filterEnvelope: {
        attack: 0.005,
        decay: 0.15,
        sustain: 0.4,
        release: 0.4,
        baseFrequency: 200,
        octaves: 3,
      },
      volume: -8,
    });
    this.ready = true;
  }

  getPresets(): InstrumentPreset[] {
    return [
      {
        name: 'fat',
        description: 'Fat analog bass',
        settings: {
          oscillator: { type: 'fatsawtooth' },
          filter: { Q: 4, frequency: 800 },
          envelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.6 },
          filterEnvelope: { baseFrequency: 200, octaves: 3 },
          volume: -8,
        },
      },
      {
        name: 'sub',
        description: 'Deep sub bass',
        settings: {
          oscillator: { type: 'fatsine' },
          filter: { Q: 2, frequency: 300 },
          envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.8 },
          filterEnvelope: { baseFrequency: 100, octaves: 2 },
          volume: -6,
        },
      },
      {
        name: 'pluck',
        description: 'Plucky bass',
        settings: {
          oscillator: { type: 'fatsquare' },
          filter: { Q: 6, frequency: 1000 },
          envelope: { attack: 0.001, decay: 0.15, sustain: 0.2, release: 0.4 },
          filterEnvelope: { baseFrequency: 400, octaves: 3.5 },
          volume: -10,
        },
      },
    ];
  }

  loadPreset(presetName: string): void {
    const preset = this.getPresets().find((p) => p.name === presetName);
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    const settings = preset.settings as {
      oscillator: { type: string };
      filter: { Q: number; frequency: number };
      envelope: { attack: number; decay: number; sustain: number; release: number };
      filterEnvelope: { baseFrequency: number; octaves: number };
      volume: number;
    };

    if (this.synth instanceof Tone.MonoSynth) {
      this.synth.set({
        oscillator: settings.oscillator,
        filter: settings.filter,
        envelope: settings.envelope,
        filterEnvelope: settings.filterEnvelope,
      });
      this.synth.volume.value = settings.volume;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  static presets = {
    fat: 'fat',
    sub: 'sub',
    pluck: 'pluck',
  } as const;
}
