/**
 * TremoloPedal - Volume pulsation from subtle to helicopter chop
 * Based on: Boss TR-2, Fender '65 Amp Tremolo, Strymon Flint
 * Rolling Stones "Gimme Shelter", The Smiths "How Soon Is Now"
 */

import type { Sound } from 'pizzicato';
import * as Tone from 'tone';
import { loadPizzicato } from './loadPizzicato';

export interface TremoloPreset {
  name: string;
  description: string;
  settings: {
    rate: number;   // 0.1-20 Hz (speed)
    depth: number;  // 0-1 (intensity)
  };
}

export interface TremoloPedalConfig {
  rate?: number;
  depth?: number;
  preset?: string;
}

/**
 * Professional tremolo pedal with pulsating volume waves
 */
export class TremoloPedal {
  // Pizzicato sound for processing
  private sound: Sound;
  private tremoloEffect: any;

  // Bridge nodes for Tone.js compatibility
  private inputNode: Tone.Gain;
  private outputNode: Tone.Gain;

  // Audio context nodes for bridging
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

  // State
  private enabled = true;
  private currentRate = 4.0;
  private currentDepth = 0.5;

  constructor(config: TremoloPedalConfig = {}) {
    const Pizzicato = loadPizzicato();
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

    // Create tremolo effect
    this.tremoloEffect = new Pizzicato.Effects.Tremolo({
      speed: config.rate ?? 4.0,
      depth: config.depth ?? 0.5,
      mix: 1.0,  // Tremolo is always 100% wet (it modulates volume)
    });

    // Add effect to sound
    this.sound.addEffect(this.tremoloEffect);

    // Bridge connection
    this.connectBridge();

    // Apply initial configuration
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.setRate(config.rate ?? 4.0);
      this.setDepth(config.depth ?? 0.5);
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

    this.sound.connect(this.mediaStreamDestination);
  }

  /**
   * Set tremolo rate/speed (0.1-20 Hz)
   */
  setRate(value: number): this {
    const rate = Math.max(0.1, Math.min(20, value));
    this.currentRate = rate;
    this.tremoloEffect.speed = rate;
    return this;
  }

  /**
   * Set tremolo depth/intensity (0-1)
   */
  setDepth(value: number): this {
    const depth = Math.max(0, Math.min(1, value));
    this.currentDepth = depth;
    this.tremoloEffect.depth = depth;
    return this;
  }

  /**
   * Enable/disable the pedal
   */
  setEnabled(enabled: boolean): this {
    this.enabled = enabled;

    if (enabled) {
      this.sound.addEffect(this.tremoloEffect);
    } else {
      this.sound.removeEffect(this.tremoloEffect);
    }

    return this;
  }

  /**
   * Get all legendary tremolo presets
   */
  static getPresets(): TremoloPreset[] {
    return [
      {
        name: 'fender-65',
        description: "Classic blackface amp tremolo",
        settings: {
          rate: 4.0,
          depth: 0.5,
        },
      },
      {
        name: 'gimme-shelter',
        description: 'Rolling Stones intro',
        settings: {
          rate: 5.5,
          depth: 0.7,
        },
      },
      {
        name: 'how-soon-is-now',
        description: 'The Smiths iconic tremolo',
        settings: {
          rate: 3.2,
          depth: 0.85,
        },
      },
      {
        name: 'helicopter',
        description: 'Fast stutter effect',
        settings: {
          rate: 12,
          depth: 1.0,
        },
      },
      {
        name: 'slow-swell',
        description: 'Ambient volume waves',
        settings: {
          rate: 0.3,
          depth: 0.6,
        },
      },
    ];
  }

  /**
   * Load a preset by name
   */
  loadPreset(presetName: string): this {
    const preset = TremoloPedal.getPresets().find((p) => p.name === presetName);

    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    this.setRate(preset.settings.rate);
    this.setDepth(preset.settings.depth);

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
    };
  }

  /**
   * Cleanup audio resources
   */
  dispose(): void {
    try {
      this.sound.removeEffect(this.tremoloEffect);
      this.sound.disconnect(this.mediaStreamDestination);
    } catch (e) {
      // Pizzicato may already be disposed
    }

    this.inputNode.dispose();
    this.outputNode.dispose();
  }
}
