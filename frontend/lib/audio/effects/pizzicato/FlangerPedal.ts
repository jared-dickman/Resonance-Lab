/**
 * FlangerPedal - Swooshing jet plane and dreamy liquid motion
 * Based on: EHX Electric Mistress (Gilmour's secret weapon), Boss BF-3, MXR Flanger
 * Van Halen "Unchained", Gilmour's dreamy Animals tone
 */

import type { Sound } from 'pizzicato';
import * as Tone from 'tone';
import { loadPizzicato } from '@/lib/audio/effects/pizzicato/loadPizzicato';

export interface FlangerPreset {
  name: string;
  description: string;
  settings: {
    rate: number;      // 0.1-10 Hz (LFO speed)
    depth: number;     // 0-1 (intensity)
    feedback: number;  // 0-1 (regeneration)
    mix: number;       // 0-1 (wet/dry)
  };
}

export interface FlangerPedalConfig {
  rate?: number;
  depth?: number;
  feedback?: number;
  mix?: number;
  preset?: string;
}

/**
 * Professional flanger pedal with jet plane swoosh
 */
export class FlangerPedal {
  // Pizzicato sound for processing
  private sound: Sound;
  private flangerEffect: any;

  // Bridge nodes for Tone.js compatibility
  private inputNode: Tone.Gain;
  private outputNode: Tone.Gain;

  // Audio context nodes for bridging
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

  // State
  private enabled = true;
  private currentRate = 0.3;
  private currentDepth = 0.7;
  private currentFeedback = 0.6;
  private currentMix = 0.5;

  constructor(config: FlangerPedalConfig = {}) {
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

    // Create flanger effect
    this.flangerEffect = new Pizzicato.Effects.Flanger({
      time: 0.45,
      speed: config.rate ?? 0.3,
      depth: config.depth ?? 0.7,
      feedback: config.feedback ?? 0.6,
      mix: config.mix ?? 0.5,
    });

    // Add effect to sound
    this.sound.addEffect(this.flangerEffect);

    // Bridge connection
    this.connectBridge();

    // Apply initial configuration
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.setRate(config.rate ?? 0.3);
      this.setDepth(config.depth ?? 0.7);
      this.setFeedback(config.feedback ?? 0.6);
      this.setMix(config.mix ?? 0.5);
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
   * Set flanger rate/speed (0.1-10 Hz)
   */
  setRate(value: number): this {
    const rate = Math.max(0.1, Math.min(10, value));
    this.currentRate = rate;
    this.flangerEffect.speed = rate;
    return this;
  }

  /**
   * Set flanger depth (0-1)
   */
  setDepth(value: number): this {
    const depth = Math.max(0, Math.min(1, value));
    this.currentDepth = depth;
    this.flangerEffect.depth = depth;
    return this;
  }

  /**
   * Set feedback/regeneration (0-1)
   */
  setFeedback(value: number): this {
    const feedback = Math.max(0, Math.min(1, value));
    this.currentFeedback = feedback;
    this.flangerEffect.feedback = feedback;
    return this;
  }

  /**
   * Set wet/dry mix (0-1)
   */
  setMix(value: number): this {
    const mix = Math.max(0, Math.min(1, value));
    this.currentMix = mix;
    this.flangerEffect.mix = mix;
    return this;
  }

  /**
   * Enable/disable the pedal
   */
  setEnabled(enabled: boolean): this {
    this.enabled = enabled;

    if (enabled) {
      this.sound.addEffect(this.flangerEffect);
    } else {
      this.sound.removeEffect(this.flangerEffect);
    }

    return this;
  }

  /**
   * Get all legendary flanger presets
   */
  static getPresets(): FlangerPreset[] {
    return [
      {
        name: 'electric-mistress',
        description: "David Gilmour's classic",
        settings: {
          rate: 0.3,
          depth: 0.7,
          feedback: 0.6,
          mix: 0.5,
        },
      },
      {
        name: 'jet-plane',
        description: 'Van Halen "Unchained"',
        settings: {
          rate: 0.5,
          depth: 0.9,
          feedback: 0.8,
          mix: 0.7,
        },
      },
      {
        name: 'through-the-never',
        description: 'Metallica flange',
        settings: {
          rate: 1.8,
          depth: 0.6,
          feedback: 0.5,
          mix: 0.6,
        },
      },
      {
        name: 'barracuda',
        description: 'Heart intro riff',
        settings: {
          rate: 2.5,
          depth: 0.8,
          feedback: 0.7,
          mix: 0.75,
        },
      },
      {
        name: 'gilmour-animals',
        description: 'Pink Floyd dreamy liquid motion',
        settings: {
          rate: 0.2,
          depth: 0.65,
          feedback: 0.55,
          mix: 0.4,
        },
      },
    ];
  }

  /**
   * Load a preset by name
   */
  loadPreset(presetName: string): this {
    const preset = FlangerPedal.getPresets().find((p) => p.name === presetName);

    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    this.setRate(preset.settings.rate);
    this.setDepth(preset.settings.depth);
    this.setFeedback(preset.settings.feedback);
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
      feedback: this.currentFeedback,
      mix: this.currentMix,
    };
  }

  /**
   * Cleanup audio resources
   */
  dispose(): void {
    try {
      this.sound.removeEffect(this.flangerEffect);
      this.sound.disconnect(this.mediaStreamDestination);
    } catch (e) {
      // Pizzicato may already be disposed
    }

    this.inputNode.dispose();
    this.outputNode.dispose();
  }
}
