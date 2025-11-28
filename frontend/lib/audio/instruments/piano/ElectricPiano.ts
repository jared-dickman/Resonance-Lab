/**
 * Electric Piano - Rhodes/Wurlitzer style
 * Classic electric piano tones with bell-like character
 */

import * as Tone from 'tone';
import { Instrument } from '@/lib/audio/instruments/base/Instrument';
import type { InstrumentConfig, InstrumentPreset } from '@/lib/audio/instruments/base/InstrumentConfig';

export class ElectricPiano extends Instrument {
  private ready = false;

  constructor(config: InstrumentConfig = {}) {
    super(config);
    this.initializeSynth();
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.loadPreset('rhodes');
    }
    this.synth.connect(this.volume);
    this.volume.toDestination();
  }

  private initializeSynth(): void {
    // FM synthesis for electric piano character
    this.synth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2,
      modulationIndex: 12,
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.01,
        decay: 0.5,
        sustain: 0.4,
        release: 1.5,
      },
      modulation: {
        type: 'triangle',
      },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.2,
        release: 0.8,
      },
      volume: -12,
    });
    this.ready = true;
  }

  getPresets(): InstrumentPreset[] {
    return [
      {
        name: 'rhodes',
        description: 'Classic Fender Rhodes',
        settings: {
          harmonicity: 2,
          modulationIndex: 12,
          envelope: { attack: 0.01, decay: 0.5, sustain: 0.4, release: 1.5 },
          volume: -12,
        },
      },
      {
        name: 'wurlitzer',
        description: 'Wurlitzer electric piano',
        settings: {
          harmonicity: 3,
          modulationIndex: 8,
          envelope: { attack: 0.005, decay: 0.3, sustain: 0.3, release: 1.0 },
          volume: -10,
        },
      },
      {
        name: 'clavinet',
        description: 'Funky clavinet',
        settings: {
          harmonicity: 1.5,
          modulationIndex: 15,
          envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.3 },
          volume: -8,
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
      harmonicity: number;
      modulationIndex: number;
      envelope: { attack: number; decay: number; sustain: number; release: number };
      volume: number;
    };

    if (this.synth instanceof Tone.PolySynth) {
      this.synth.set({
        harmonicity: settings.harmonicity,
        modulationIndex: settings.modulationIndex,
        envelope: settings.envelope,
      });
      this.synth.volume.value = settings.volume;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  static presets = {
    rhodes: 'rhodes',
    wurlitzer: 'wurlitzer',
    clavinet: 'clavinet',
  } as const;
}
