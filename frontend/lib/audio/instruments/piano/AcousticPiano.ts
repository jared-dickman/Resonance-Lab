/**
 * Acoustic Piano - Professional grand piano sound
 * Uses high-quality synthesis for realistic piano tones
 */

import * as Tone from 'tone';
import { Instrument } from '@/lib/audio/instruments/base/Instrument';
import type {
  InstrumentConfig,
  InstrumentPreset,
} from '@/lib/audio/instruments/base/InstrumentConfig';

export class AcousticPiano extends Instrument {
  private ready = false;

  constructor(config: InstrumentConfig = {}) {
    super(config);
    this.initializeSynth();
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.loadPreset('bright');
    }
    this.synth.connect(this.volume);
    this.volume.toDestination();
  }

  private initializeSynth(): void {
    // Use Sampler with Tone.js piano samples for realistic sound
    this.synth = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3',
        C1: 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',
        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',
        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',
        C8: 'C8.mp3',
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => {
        this.ready = true;
      },
    });
  }

  getPresets(): InstrumentPreset[] {
    return [
      {
        name: 'bright',
        description: 'Bright concert grand piano',
        settings: {
          volume: -8,
          release: 1,
        },
      },
      {
        name: 'warm',
        description: 'Warm studio piano',
        settings: {
          volume: -6,
          release: 1.5,
        },
      },
      {
        name: 'mellow',
        description: 'Mellow upright piano',
        settings: {
          volume: -10,
          release: 2,
        },
      },
    ];
  }

  loadPreset(presetName: string): void {
    const preset = this.getPresets().find(p => p.name === presetName);
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    const settings = preset.settings as {
      volume: number;
      release?: number;
    };

    if (this.synth instanceof Tone.Sampler) {
      this.synth.volume.value = settings.volume;
      if (settings.release) {
        this.synth.release = settings.release;
      }
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  static presets = {
    bright: 'bright',
    warm: 'warm',
    mellow: 'mellow',
  } as const;
}
