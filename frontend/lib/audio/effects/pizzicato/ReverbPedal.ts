/**
 * ReverbPedal - Studio-grade reverb with legendary spaces
 * Based on: Strymon BlueSky, Eventide Space, Boss RV-6
 * Abbey Road chamber, Cathedral shimmer, Spring '65
 */

import type { Sound } from 'pizzicato';
import * as Tone from 'tone';
import { loadPizzicato } from './loadPizzicato';

export interface ReverbPreset {
  name: string;
  description: string;
  settings: {
    time: number;        // Decay time (0.01-10s)
    mix: number;         // Wet/dry mix (0-1)
  };
}

export interface ReverbPedalConfig {
  time?: number;
  mix?: number;
  preset?: string;
}

/**
 * Professional reverb pedal with legendary spaces
 */
export class ReverbPedal {
  // Pizzicato sound for processing
  private sound: Sound;
  private reverbEffect: any;

  // Bridge nodes for Tone.js compatibility
  private inputNode: Tone.Gain;
  private outputNode: Tone.Gain;

  // Audio context nodes for bridging
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

  // State
  private enabled = true;
  private currentTime = 2.5;
  private currentMix = 0.3;

  constructor(config: ReverbPedalConfig = {}) {
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

    // Create reverb effect
    this.reverbEffect = new Pizzicato.Effects.Reverb({
      time: config.time ?? 2.5,
      decay: config.time ?? 2.5,  // Pizzicato uses 'decay' for reverb time
      reverse: false,
      mix: config.mix ?? 0.3,
    });

    // Add effect to sound
    this.sound.addEffect(this.reverbEffect);

    // Bridge connection
    this.connectBridge();

    // Apply initial configuration
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.setTime(config.time ?? 2.5);
      this.setMix(config.mix ?? 0.3);
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
   * Set reverb decay time (0.01-10 seconds)
   */
  setTime(value: number): this {
    const time = Math.max(0.01, Math.min(10, value));
    this.currentTime = time;
    this.reverbEffect.time = time;
    this.reverbEffect.decay = time;
    return this;
  }

  /**
   * Set wet/dry mix (0-1)
   */
  setMix(value: number): this {
    const mix = Math.max(0, Math.min(1, value));
    this.currentMix = mix;
    this.reverbEffect.mix = mix;
    return this;
  }

  /**
   * Enable/disable the pedal
   */
  setEnabled(enabled: boolean): this {
    this.enabled = enabled;

    if (enabled) {
      this.sound.addEffect(this.reverbEffect);
    } else {
      this.sound.removeEffect(this.reverbEffect);
    }

    return this;
  }

  /**
   * Get all legendary reverb presets
   */
  static getPresets(): ReverbPreset[] {
    return [
      {
        name: 'bluesky-studio',
        description: "Strymon's pristine plate reverb",
        settings: {
          time: 2.5,
          mix: 0.3,
        },
      },
      {
        name: 'spring-65',
        description: "Fender '65 Spring Reverb Tank",
        settings: {
          time: 1.2,
          mix: 0.25,
        },
      },
      {
        name: 'abbey-road',
        description: "Beatles' echo chamber",
        settings: {
          time: 3.2,
          mix: 0.4,
        },
      },
      {
        name: 'cathedral',
        description: 'Massive church reverb',
        settings: {
          time: 8.5,
          mix: 0.5,
        },
      },
      {
        name: 'shimmer',
        description: 'Ambient octave-up reverb',
        settings: {
          time: 6.0,
          mix: 0.6,
        },
      },
    ];
  }

  /**
   * Load a preset by name
   */
  loadPreset(presetName: string): this {
    const preset = ReverbPedal.getPresets().find((p) => p.name === presetName);

    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    this.setTime(preset.settings.time);
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
      time: this.currentTime,
      mix: this.currentMix,
    };
  }

  /**
   * Cleanup audio resources
   */
  dispose(): void {
    try {
      this.sound.removeEffect(this.reverbEffect);
      this.sound.disconnect(this.mediaStreamDestination);
    } catch (e) {
      // Pizzicato may already be disposed
    }

    this.inputNode.dispose();
    this.outputNode.dispose();
  }
}
