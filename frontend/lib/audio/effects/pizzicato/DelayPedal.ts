/**
 * DelayPedal - Legendary delay emulation with iconic presets
 * Based on: MXR Carbon Copy, Boss DD-3, Strymon Timeline
 * The Edge's dotted eighth, Gilmour's ambient wash, Elvis slapback
 */

import type { Sound } from 'pizzicato';
import * as Tone from 'tone';
import { loadPizzicato } from '@/lib/audio/effects/pizzicato/loadPizzicato';

export interface DelayPreset {
  name: string;
  description: string;
  settings: {
    time: number;         // 5ms-2000ms (in seconds for Pizzicato)
    feedback: number;     // 0-1
    mix: number;          // 0-1
    modulation?: number;  // 0-1 (analog warmth)
    pingPong?: boolean;   // Stereo ping-pong mode
  };
}

export interface DelayPedalConfig {
  time?: number;
  feedback?: number;
  mix?: number;
  modulation?: number;
  pingPong?: boolean;
  preset?: string;
}

/**
 * Professional delay pedal with legendary presets
 */
export class DelayPedal {
  // Pizzicato sound for processing
  private sound: Sound;
  private delayEffect: any;

  // Bridge nodes for Tone.js compatibility
  private inputNode: Tone.Gain;
  private outputNode: Tone.Gain;

  // Audio context nodes for bridging
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private mediaStreamDestination: MediaStreamAudioDestinationNode;

  // State
  private enabled = true;
  private currentTime = 0.38;
  private currentFeedback = 0.45;
  private currentMix = 0.35;

  constructor(config: DelayPedalConfig = {}) {
    const Pizzicato = loadPizzicato();
    const audioContext = Tone.getContext().rawContext as AudioContext;
    const pizzicatoContext = ((Pizzicato as unknown as { context?: AudioContext }).context) ?? audioContext;

    // Create bridge nodes
    this.inputNode = new Tone.Gain(1);
    this.outputNode = new Tone.Gain(1);
    this.mediaStreamDestination = pizzicatoContext.createMediaStreamDestination();

    // Create Pizzicato sound from input stream
    this.sound = new Pizzicato.Sound({
      source: 'input',
      options: {
        volume: 1.0,
      }
    });

    // Create delay effect with initial settings
    this.delayEffect = new Pizzicato.Effects.Delay({
      time: config.time ?? 0.38,
      feedback: config.feedback ?? 0.45,
      mix: config.mix ?? 0.35,
    });

    // Add effect to sound
    this.sound.addEffect(this.delayEffect);

    // Bridge Tone.js input to Pizzicato
    // We'll connect directly via Web Audio API
    this.connectBridge();

    // Apply initial configuration
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.setTime(config.time ?? 0.38);
      this.setFeedback(config.feedback ?? 0.45);
      this.setMix(config.mix ?? 0.35);
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
   * Set delay time (in seconds, 0.005-2.0)
   */
  setTime(value: number): this {
    const time = Math.max(0.005, Math.min(2.0, value));
    this.currentTime = time;
    this.delayEffect.time = time;
    return this;
  }

  /**
   * Set feedback/repeats (0-1)
   */
  setFeedback(value: number): this {
    const feedback = Math.max(0, Math.min(0.99, value)); // Prevent runaway feedback
    this.currentFeedback = feedback;
    this.delayEffect.feedback = feedback;
    return this;
  }

  /**
   * Set wet/dry mix (0-1)
   */
  setMix(value: number): this {
    const mix = Math.max(0, Math.min(1, value));
    this.currentMix = mix;
    this.delayEffect.mix = mix;
    return this;
  }

  /**
   * Enable/disable the pedal
   */
  setEnabled(enabled: boolean): this {
    this.enabled = enabled;

    if (enabled) {
      this.sound.addEffect(this.delayEffect);
    } else {
      this.sound.removeEffect(this.delayEffect);
    }

    return this;
  }

  /**
   * Get all legendary delay presets
   */
  static getPresets(): DelayPreset[] {
    return [
      {
        name: 'carbon-copy',
        description: 'MXR Carbon Copy - Warm analog delay',
        settings: {
          time: 0.38,      // 380ms
          feedback: 0.45,
          mix: 0.35,
          modulation: 0.3,
        },
      },
      {
        name: 'slapback',
        description: 'Slapback Rockabilly - Classic 50s Elvis/Scotty Moore',
        settings: {
          time: 0.12,      // 120ms
          feedback: 0.1,
          mix: 0.25,
          modulation: 0,
        },
      },
      {
        name: 'the-edge',
        description: "The Edge - U2's signature dotted eighth delay",
        settings: {
          time: 0.38,      // 380ms (dotted 8th at 120 BPM)
          feedback: 0.6,
          mix: 0.5,
          modulation: 0.2,
        },
      },
      {
        name: 'gilmour-ambient',
        description: 'Gilmour Ambient - Pink Floyd ethereal delay',
        settings: {
          time: 0.46,      // 460ms
          feedback: 0.65,
          mix: 0.45,
          modulation: 0.25,
        },
      },
      {
        name: 'dub-echo',
        description: 'Dub Echo - Reggae/Dub massive feedback',
        settings: {
          time: 0.75,      // 750ms
          feedback: 0.85,
          mix: 0.6,
          modulation: 0.15,
        },
      },
    ];
  }

  /**
   * Load a preset by name
   */
  loadPreset(presetName: string): this {
    const preset = DelayPedal.getPresets().find((p) => p.name === presetName);

    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    this.setTime(preset.settings.time);
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
      time: this.currentTime,
      feedback: this.currentFeedback,
      mix: this.currentMix,
    };
  }

  /**
   * Cleanup audio resources
   */
  dispose(): void {
    try {
      this.sound.removeEffect(this.delayEffect);
      this.sound.disconnect(this.mediaStreamDestination);
    } catch (e) {
      // Pizzicato may already be disposed
    }

    this.inputNode.dispose();
    this.outputNode.dispose();

    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
    }
  }
}
