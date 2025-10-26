/**
 * ChorusPedal - Lush modulation with iconic 80s shimmer
 * Based on: Boss CE-2, EHX Small Clone (Nirvana), MXR Analog Chorus
 * Kurt Cobain's Come As You Are, The Police shimmer
 */

import Pizzicato from 'pizzicato';
import * as Tone from 'tone';

export interface ChorusPreset {
  name: string;
  description: string;
  settings: {
    rate: number;    // 0.1-10 Hz (speed/LFO frequency)
    depth: number;   // 0-1 (intensity)
    mix: number;     // 0-1 (wet/dry)
  };
}

export interface ChorusPedalConfig {
  rate?: number;
  depth?: number;
  mix?: number;
  preset?: string;
}

/**
 * Professional chorus pedal with legendary shimmer
 */
export class ChorusPedal {
  // Pizzicato sound for processing
  private sound: Pizzicato.Sound;
  private chorusEffect: any;

  // Bridge nodes for Tone.js compatibility
  private inputNode: Tone.Gain;
  private outputNode: Tone.Gain;

  // Audio context nodes for bridging
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

  // State
  private enabled = true;
  private currentRate = 1.2;
  private currentDepth = 0.6;
  private currentMix = 0.5;

  constructor(config: ChorusPedalConfig = {}) {
    const audioContext = Tone.getContext().rawContext as AudioContext;

    // Create bridge nodes
    this.inputNode = new Tone.Gain(1);
    this.outputNode = new Tone.Gain(1);
    this.mediaStreamDestination = audioContext.createMediaStreamDestination();

    // Create Pizzicato sound
    this.sound = new Pizzicato.Sound({
      source: 'input',
      options: {
        volume: 1.0,
      }
    });

    // Create flanger effect (Pizzicato's flanger works great for chorus)
    this.chorusEffect = new Pizzicato.Effects.Flanger({
      time: 0.45,
      speed: config.rate ?? 1.2,
      depth: config.depth ?? 0.6,
      feedback: 0.1,  // Low feedback for chorus (vs flanger)
      mix: config.mix ?? 0.5,
    });

    // Add effect to sound
    this.sound.addEffect(this.chorusEffect);

    // Bridge connection
    this.connectBridge();

    // Apply initial configuration
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.setRate(config.rate ?? 1.2);
      this.setDepth(config.depth ?? 0.6);
      this.setMix(config.mix ?? 0.5);
    }
  }

  /**
   * Bridge Tone.js and Pizzicato
   */
  private connectBridge(): void {
    const inputGainNode = (this.inputNode as any).context.rawContext.createGain();
    this.inputNode.connect(inputGainNode as any);

    if (this.sound && (this.sound as any).sourceNode) {
      (this.sound as any).sourceNode.connect((this.outputNode as any).context.rawContext);
    }
  }

  /**
   * Set chorus rate/speed (0.1-10 Hz)
   */
  setRate(value: number): this {
    const rate = Math.max(0.1, Math.min(10, value));
    this.currentRate = rate;
    this.chorusEffect.speed = rate;
    return this;
  }

  /**
   * Set chorus depth (0-1)
   */
  setDepth(value: number): this {
    const depth = Math.max(0, Math.min(1, value));
    this.currentDepth = depth;
    this.chorusEffect.depth = depth;
    return this;
  }

  /**
   * Set wet/dry mix (0-1)
   */
  setMix(value: number): this {
    const mix = Math.max(0, Math.min(1, value));
    this.currentMix = mix;
    this.chorusEffect.mix = mix;
    return this;
  }

  /**
   * Enable/disable the pedal
   */
  setEnabled(enabled: boolean): this {
    this.enabled = enabled;

    if (enabled) {
      this.sound.addEffect(this.chorusEffect);
    } else {
      this.sound.removeEffect(this.chorusEffect);
    }

    return this;
  }

  /**
   * Get all legendary chorus presets
   */
  static getPresets(): ChorusPreset[] {
    return [
      {
        name: 'ce2-classic',
        description: 'Boss CE-2 default setting',
        settings: {
          rate: 1.2,
          depth: 0.6,
          mix: 0.5,
        },
      },
      {
        name: 'small-clone',
        description: "Kurt Cobain's Come As You Are",
        settings: {
          rate: 0.8,
          depth: 0.75,
          mix: 0.65,
        },
      },
      {
        name: '80s-shimmer',
        description: 'The Police/Andy Summers',
        settings: {
          rate: 2.5,
          depth: 0.5,
          mix: 0.7,
        },
      },
      {
        name: 'frusciante-ce1',
        description: "John Frusciante's always-on tone",
        settings: {
          rate: 1.0,
          depth: 0.4,
          mix: 0.45,
        },
      },
      {
        name: 'vibrato',
        description: 'Full wet rotary speaker sim',
        settings: {
          rate: 6.0,
          depth: 1.0,
          mix: 1.0,
        },
      },
    ];
  }

  /**
   * Load a preset by name
   */
  loadPreset(presetName: string): this {
    const preset = ChorusPedal.getPresets().find((p) => p.name === presetName);

    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    this.setRate(preset.settings.rate);
    this.setDepth(preset.settings.depth);
    this.setMix(preset.settings.mix);

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
      rate: this.currentRate,
      depth: this.currentDepth,
      mix: this.currentMix,
    };
  }

  /**
   * Cleanup audio resources
   */
  dispose(): void {
    try {
      this.sound.removeEffect(this.chorusEffect);
      this.sound.disconnect();
    } catch (e) {
      // Pizzicato may already be disposed
    }

    this.inputNode.dispose();
    this.outputNode.dispose();
  }
}
