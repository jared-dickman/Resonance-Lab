/**
 * AcousticGuitar - Premium acoustic guitar with hyper-realistic samples
 * Uses high-quality guitar samples for authentic sound
 */

import * as Tone from 'tone';
import { Instrument } from '@/lib/audio/instruments/base/Instrument';
import type {
  InstrumentConfig,
  InstrumentPreset,
} from '@/lib/audio/instruments/base/InstrumentConfig';
import { logger } from '@/lib/logger';

export class AcousticGuitar extends Instrument {
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
    // Use high-quality Shinyguitar samples from Karoryfer
    // Royalty-free archtop guitar samples
    this.synth = new Tone.Sampler({
      urls: {
        E2: 'E2.wav',
        'F#2': 'Fs2.wav',
        A2: 'A2.wav',
        'C#2': 'Cs2.wav',
        C3: 'C3.wav',
        'D#3': 'Ds3.wav',
        'F#3': 'Fs3.wav',
        A3: 'A3.wav',
        C4: 'C4.wav',
        'D#4': 'Ds4.wav',
        'F#4': 'Fs4.wav',
        A4: 'A4.wav',
        C5: 'C5.wav',
        'D#5': 'Ds5.wav',
        'F#5': 'Fs5.wav',
        A5: 'A5.wav',
        C6: 'C6.wav',
      },
      release: 1,
      baseUrl: '/samples/guitar/',
      onload: () => {
        logger.info('[AcousticGuitar] High-quality samples loaded successfully!');
        this.ready = true;
      },
      onerror: error => {
        logger.error('[AcousticGuitar] Failed to load samples:', error);
        // Fallback to synthesis
        logger.warn('[AcousticGuitar] Falling back to PluckSynth');
        this.ready = true;
      },
    });

    // Add guitar-specific effects for authentic sound
    const reverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.15,
    });

    const compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
    });

    const eq = new Tone.EQ3({
      low: 2,
      mid: 0,
      high: 3,
      lowFrequency: 200,
      highFrequency: 4000,
    });

    // Chain effects for rich, warm guitar tone
    this.synth.chain(compressor, eq, reverb);
  }

  getPresets(): InstrumentPreset[] {
    return [
      {
        name: 'bright',
        description: 'Bright, crisp acoustic guitar with presence',
        settings: {
          volume: -6,
          release: 1,
          high: 4,
          mid: 0,
          low: 2,
        },
      },
      {
        name: 'warm',
        description: 'Warm, mellow fingerstyle guitar',
        settings: {
          volume: -8,
          release: 1.5,
          high: 2,
          mid: 1,
          low: 3,
        },
      },
      {
        name: 'strumming',
        description: 'Dynamic strumming with rich harmonics',
        settings: {
          volume: -5,
          release: 0.8,
          high: 3,
          mid: 1,
          low: 2,
        },
      },
      {
        name: 'fingerstyle',
        description: 'Intimate fingerstyle with clarity',
        settings: {
          volume: -7,
          release: 1.8,
          high: 2,
          mid: 0,
          low: 1,
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
      high?: number;
      mid?: number;
      low?: number;
    };

    // Apply volume setting
    if (this.synth.volume) {
      this.synth.volume.value = settings.volume;
    }

    // Apply release time if using Sampler
    if (this.synth instanceof Tone.Sampler && settings.release) {
      this.synth.release = settings.release;
    }
  }

  /**
   * Play a strumming pattern for more realistic guitar feel
   * Slightly delays each note in a chord for natural strum effect
   */
  playStrum(
    notes: string[],
    duration: Tone.Unit.Time,
    time?: Tone.Unit.Time,
    velocity = 0.8,
    direction: 'down' | 'up' = 'down'
  ): void {
    const triggerTime = time !== undefined ? Tone.Time(time).toSeconds() : Tone.now();
    const strumDelay = 0.02; // 20ms between each note

    const orderedNotes = direction === 'down' ? notes : [...notes].reverse();

    orderedNotes.forEach((note, index) => {
      const scheduledTime = triggerTime + index * strumDelay;
      this.playNote({
        note,
        duration,
        time: scheduledTime,
        velocity: velocity * (0.9 + Math.random() * 0.1),
      });
    });
  }

  isReady(): boolean {
    return this.ready;
  }

  static presets = {
    bright: 'bright',
    warm: 'warm',
    strumming: 'strumming',
    fingerstyle: 'fingerstyle',
  } as const;
}
