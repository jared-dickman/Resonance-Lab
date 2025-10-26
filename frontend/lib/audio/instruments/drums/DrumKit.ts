/**
 * DrumKit - Complete acoustic drum kit
 * Professional drum sounds for backing tracks
 */

import * as Tone from 'tone';
import { Instrument } from '../base/Instrument';
import type { InstrumentConfig, InstrumentPreset } from '../base/InstrumentConfig';

export interface DrumHit {
  /** Drum type */
  drum: 'kick' | 'snare' | 'hihat' | 'tom' | 'crash' | 'ride';
  /** Time to trigger */
  time: Tone.Unit.Time;
  /** Velocity (0-1) */
  velocity?: number;
}

export class DrumKit extends Instrument {
  private kick: Tone.MembraneSynth;
  private snare: Tone.NoiseSynth;
  private hihat: Tone.MetalSynth;
  private ready = false;

  constructor(config: InstrumentConfig = {}) {
    super(config);
    // Better drum synthesis
    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' },
    });
    this.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    });
    this.hihat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    });
    this.hihat.frequency.value = 200;
    this.initializeSynth();
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.loadPreset('rock');
    }
    this.connectDrums();
    this.volume.toDestination();
  }

  private initializeSynth(): void {
    // Placeholder synth (not directly used)
    this.synth = this.kick;
    this.ready = true;
  }

  private connectDrums(): void {
    this.kick.connect(this.volume);
    this.snare.connect(this.volume);
    this.hihat.connect(this.volume);
  }

  /**
   * Hit a specific drum
   */
  hit(drum: DrumHit['drum'], time?: Tone.Unit.Time, velocity = 0.8): void {
    const triggerTime = time ?? Tone.now();

    switch (drum) {
      case 'kick':
        this.kick.triggerAttackRelease('C1', '8n', triggerTime, velocity);
        break;
      case 'snare':
        this.snare.triggerAttackRelease('16n', triggerTime, velocity);
        break;
      case 'hihat':
        this.hihat.triggerAttackRelease('32n', triggerTime, velocity * 0.5);
        break;
      default:
        break;
    }
  }

  /**
   * Play multiple drum hits
   */
  playPattern(hits: DrumHit[]): void {
    hits.forEach((hit) => {
      this.hit(hit.drum, hit.time, hit.velocity);
    });
  }

  getPresets(): InstrumentPreset[] {
    return [
      {
        name: 'rock',
        description: 'Rock drum kit',
        settings: {
          kick: { pitchDecay: 0.05, octaves: 10, volume: -3 },
          snare: { volume: -8 },
          hihat: { volume: -18 },
        },
      },
      {
        name: 'jazz',
        description: 'Jazz drum kit',
        settings: {
          kick: { pitchDecay: 0.08, octaves: 8, volume: -10 },
          snare: { volume: -12 },
          hihat: { volume: -16 },
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
      kick: { pitchDecay: number; octaves: number; volume: number };
      snare: { volume: number };
      hihat: { volume: number };
    };

    this.kick.set({
      pitchDecay: settings.kick.pitchDecay,
      octaves: settings.kick.octaves,
    });
    this.kick.volume.value = settings.kick.volume;
    this.snare.volume.value = settings.snare.volume;
    this.hihat.volume.value = settings.hihat.volume;
  }

  isReady(): boolean {
    return this.ready;
  }

  dispose(): void {
    this.kick.dispose();
    this.snare.dispose();
    this.hihat.dispose();
    this.volume.dispose();
  }

  static presets = {
    rock: 'rock',
    jazz: 'jazz',
  } as const;
}
