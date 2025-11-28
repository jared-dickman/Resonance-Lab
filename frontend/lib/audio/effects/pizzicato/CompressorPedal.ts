/**
 * CompressorPedal - Dynamics control for sustain and punch
 * Based on: MXR Dyna Comp (classic squish), Boss CS-2 (Gilmour's choice), Keeley Compressor Plus
 * Sustains notes forever, adds Nashville snap, evens out dynamics
 */

import type { Sound } from 'pizzicato';
import * as Tone from 'tone';
import { loadPizzicato } from '@/lib/audio/effects/pizzicato/loadPizzicato';

export interface CompressorPreset {
  name: string;
  description: string;
  settings: {
    threshold: number;  // -60 to 0 dB
    knee: number;       // 0-40 dB (smoothness)
    ratio: number;      // 1-20 (compression amount)
    attack: number;     // 0-1 seconds
    release: number;    // 0-1 seconds
  };
}

export interface CompressorPedalConfig {
  threshold?: number;
  knee?: number;
  ratio?: number;
  attack?: number;
  release?: number;
  preset?: string;
}

/**
 * Professional compressor pedal for sustain and dynamics
 */
export class CompressorPedal {
  // Pizzicato sound for processing
  private sound: Sound;
  private compressorEffect: any;

  // Bridge nodes for Tone.js compatibility
  private inputNode: Tone.Gain;
  private outputNode: Tone.Gain;

  // Audio context nodes for bridging
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

  // State
  private enabled = true;
  private currentThreshold = -25;
  private currentKnee = 30;
  private currentRatio = 4;
  private currentAttack = 0.005;
  private currentRelease = 0.05;

  constructor(config: CompressorPedalConfig = {}) {
    const Pizzicato = loadPizzicato();
    const audioContext = Tone.getContext().rawContext as AudioContext;
    const pizzicatoContext = ((Pizzicato as unknown as { context?: AudioContext }).context) ?? audioContext;

    // Create bridge nodes
    this.inputNode = new Tone.Gain(1);
    this.outputNode = new Tone.Gain(1);
    this.mediaStreamDestination = pizzicatoContext.createMediaStreamDestination();

    // Create Pizzicato sound
    this.sound = new Pizzicato.Sound({
      source: 'input',
      options: {
        volume: 1.0,
      }
    });

    // Create compressor effect
    this.compressorEffect = new Pizzicato.Effects.Compressor({
      threshold: config.threshold ?? -25,
      knee: config.knee ?? 30,
      attack: config.attack ?? 0.005,
      release: config.release ?? 0.05,
      ratio: config.ratio ?? 4,
    });

    // Add effect to sound
    this.sound.addEffect(this.compressorEffect);

    // Bridge connection
    this.connectBridge();

    // Apply initial configuration
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.setThreshold(config.threshold ?? -25);
      this.setKnee(config.knee ?? 30);
      this.setRatio(config.ratio ?? 4);
      this.setAttack(config.attack ?? 0.005);
      this.setRelease(config.release ?? 0.05);
    }
  }

  /**
   * Bridge Tone.js and Pizzicato
   */
  private connectBridge(): void {
    const toneContext = this.inputNode.context as unknown as { rawContext: AudioContext };
    const inputGainNode = toneContext.rawContext.createGain();
    this.inputNode.connect(inputGainNode as unknown as Tone.InputNode);

    const soundWithNodes = this.sound as unknown as { sourceNode?: AudioNode };
    if (soundWithNodes.sourceNode) {
      const outputContext = this.outputNode.context as unknown as { rawContext: AudioContext };
      soundWithNodes.sourceNode.connect(outputContext.rawContext.destination);
    }

    this.sound.connect(this.mediaStreamDestination);
  }

  /**
   * Set threshold (-60 to 0 dB)
   */
  setThreshold(value: number): this {
    const threshold = Math.max(-60, Math.min(0, value));
    this.currentThreshold = threshold;
    this.compressorEffect.threshold = threshold;
    return this;
  }

  /**
   * Set knee (0-40 dB)
   */
  setKnee(value: number): this {
    const knee = Math.max(0, Math.min(40, value));
    this.currentKnee = knee;
    this.compressorEffect.knee = knee;
    return this;
  }

  /**
   * Set ratio (1-20)
   */
  setRatio(value: number): this {
    const ratio = Math.max(1, Math.min(20, value));
    this.currentRatio = ratio;
    this.compressorEffect.ratio = ratio;
    return this;
  }

  /**
   * Set attack time (0-1 seconds)
   */
  setAttack(value: number): this {
    const attack = Math.max(0, Math.min(1, value));
    this.currentAttack = attack;
    this.compressorEffect.attack = attack;
    return this;
  }

  /**
   * Set release time (0-1 seconds)
   */
  setRelease(value: number): this {
    const release = Math.max(0, Math.min(1, value));
    this.currentRelease = release;
    this.compressorEffect.release = release;
    return this;
  }

  /**
   * Enable/disable the pedal
   */
  setEnabled(enabled: boolean): this {
    this.enabled = enabled;

    if (enabled) {
      this.sound.addEffect(this.compressorEffect);
    } else {
      this.sound.removeEffect(this.compressorEffect);
    }

    return this;
  }

  /**
   * Get all legendary compressor presets
   */
  static getPresets(): CompressorPreset[] {
    return [
      {
        name: 'dyna-comp',
        description: 'MXR Dyna Comp default sustain',
        settings: {
          threshold: -25,
          knee: 30,
          ratio: 4,
          attack: 0.005,
          release: 0.05,
        },
      },
      {
        name: 'country-chicken',
        description: 'Nashville snap and punch',
        settings: {
          threshold: -30,
          knee: 40,
          ratio: 8,
          attack: 0.0005,
          release: 0.03,
        },
      },
      {
        name: 'gilmour-sustain',
        description: "David Gilmour's Boss CS-2",
        settings: {
          threshold: -20,
          knee: 20,
          ratio: 3,
          attack: 0.003,
          release: 0.1,
        },
      },
      {
        name: 'funk-slap',
        description: 'Bass/guitar pop and punch',
        settings: {
          threshold: -35,
          knee: 35,
          ratio: 6,
          attack: 0.0001,
          release: 0.04,
        },
      },
      {
        name: 'parallel-ny',
        description: 'Studio-style parallel blend',
        settings: {
          threshold: -15,
          knee: 10,
          ratio: 10,
          attack: 0.001,
          release: 0.06,
        },
      },
    ];
  }

  /**
   * Load a preset by name
   */
  loadPreset(presetName: string): this {
    const preset = CompressorPedal.getPresets().find((p) => p.name === presetName);

    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    this.setThreshold(preset.settings.threshold);
    this.setKnee(preset.settings.knee);
    this.setRatio(preset.settings.ratio);
    this.setAttack(preset.settings.attack);
    this.setRelease(preset.settings.release);

    return this;
  }

  /**
   * Connect pedal to destination
   */
  connect(destination: Tone.InputNode): this {
    this.outputNode.connect(destination);
    return this;
  }

  /**
   * Disconnect from all outputs
   */
  disconnect(): this {
    this.outputNode.disconnect();
    return this;
  }

  /**
   * Get input node for connecting signal
   */
  getInput(): Tone.InputNode {
    return this.inputNode;
  }

  /**
   * Get output node
   */
  getOutput(): Tone.OutputNode {
    return this.outputNode;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      enabled: this.enabled,
      threshold: this.currentThreshold,
      knee: this.currentKnee,
      ratio: this.currentRatio,
      attack: this.currentAttack,
      release: this.currentRelease,
    };
  }

  /**
   * Cleanup audio resources
   */
  dispose(): void {
    try {
      this.sound.removeEffect(this.compressorEffect);
      this.sound.disconnect(this.mediaStreamDestination);
    } catch (e) {
      // Pizzicato may already be disposed
    }

    this.inputNode.dispose();
    this.outputNode.dispose();
  }
}
