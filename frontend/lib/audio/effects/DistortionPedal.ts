/**
 * DistortionPedal - Enterprise-grade distortion effect with multiple algorithms
 * Emulates classic guitar pedals with accurate DSP processing
 */

import * as Tone from 'tone';

export type DistortionAlgorithm = 'tube' | 'fuzz' | 'overdrive' | 'heavy' | 'soft-clip';

export interface DistortionPreset {
  name: string;
  description: string;
  algorithm: DistortionAlgorithm;
  settings: {
    drive: number;        // 0-1
    tone: number;         // 0-1
    level: number;        // 0-1
    mix: number;          // 0-1
    gate?: number;        // 0-1
    bias?: number;        // -1 to 1
  };
}

export interface DistortionPedalConfig {
  drive?: number;
  tone?: number;
  level?: number;
  mix?: number;
  algorithm?: DistortionAlgorithm;
  preset?: string;
}

/**
 * Professional distortion pedal with multiple saturation algorithms
 */
export class DistortionPedal {
  // Audio nodes
  private input: Tone.Gain;
  private output: Tone.Gain;
  private distortion: Tone.Distortion;
  private waveshaper: Tone.WaveShaper;
  private preGain: Tone.Gain;
  private postGain: Tone.Gain;
  private toneFilter: Tone.Filter;
  private wetDry: Tone.CrossFade;
  private noiseGate: Tone.Gate;

  // State
  private algorithm: DistortionAlgorithm = 'overdrive';
  private enabled = true;

  constructor(config: DistortionPedalConfig = {}) {
    // Initialize audio nodes
    this.input = new Tone.Gain(1);
    this.output = new Tone.Gain(1);
    this.preGain = new Tone.Gain(1);
    this.postGain = new Tone.Gain(1);

    // Distortion processing
    this.distortion = new Tone.Distortion(0.8);
    this.waveshaper = new Tone.WaveShaper(this.createDistortionCurve('overdrive', 0.5));

    // Tone control (low-pass filter for classic pedal tone stack)
    this.toneFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 3000,
      rolloff: -24,
      Q: 0.7,
    });

    // Wet/dry mix
    this.wetDry = new Tone.CrossFade(1);

    // Noise gate to reduce hum
    this.noiseGate = new Tone.Gate(-50, 0.1);

    // Connect signal chain:
    // input -> noiseGate -> [dry path, wet path] -> wetDry -> output
    // wet path: preGain -> waveshaper -> toneFilter -> postGain
    this.input.connect(this.noiseGate);
    this.noiseGate.connect(this.wetDry.a); // Dry signal
    this.noiseGate.connect(this.preGain); // Wet signal
    this.preGain.connect(this.waveshaper);
    this.waveshaper.connect(this.toneFilter);
    this.toneFilter.connect(this.postGain);
    this.postGain.connect(this.wetDry.b);
    this.wetDry.connect(this.output);

    // Apply initial configuration
    if (config.preset) {
      this.loadPreset(config.preset);
    } else {
      this.setDrive(config.drive ?? 0.5);
      this.setTone(config.tone ?? 0.5);
      this.setLevel(config.level ?? 0.7);
      this.setMix(config.mix ?? 1.0);
      if (config.algorithm) {
        this.setAlgorithm(config.algorithm);
      }
    }
  }

  /**
   * Create waveshaping transfer curve for distortion
   * Each algorithm has unique saturation characteristics
   */
  private createDistortionCurve(algorithm: DistortionAlgorithm, amount: number): Float32Array {
    const samples = 1024;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      let y: number;

      switch (algorithm) {
        case 'tube':
          // Smooth tube-like saturation with asymmetric clipping
          y = Math.tanh(x * (1 + amount * 10)) * (1 + x * 0.1);
          break;

        case 'fuzz':
          // Hard clipping with aggressive saturation
          const fuzzGain = 1 + amount * 50;
          y = Math.max(-1, Math.min(1, x * fuzzGain));
          // Add some sine wave folding
          y = Math.sin(y * Math.PI * 0.5);
          break;

        case 'overdrive':
          // Classic soft clipping (Tube Screamer style)
          const k = amount * 100;
          y = ((1 + k) * x) / (1 + k * Math.abs(x));
          break;

        case 'heavy':
          // Modern high-gain distortion
          const heavyGain = 1 + amount * 20;
          y = Math.tanh(x * heavyGain) * 0.9;
          // Add some harmonic content
          y += Math.sin(x * 3 * Math.PI) * 0.05 * amount;
          break;

        case 'soft-clip':
          // Gentle compression and saturation
          y = x / (1 + Math.abs(x * amount * 2));
          break;

        default:
          y = x;
      }

      curve[i] = y;
    }

    return curve;
  }

  /**
   * Set drive/gain amount (0-1)
   */
  setDrive(value: number): this {
    const drive = Math.max(0, Math.min(1, value));

    // Pre-gain stages the signal for distortion
    this.preGain.gain.rampTo(1 + drive * 8, 0.05);

    // Update waveshaper curve with new drive amount
    this.waveshaper.curve = this.createDistortionCurve(this.algorithm, drive);

    return this;
  }

  /**
   * Set tone/brightness (0-1)
   * 0 = dark, 1 = bright
   */
  setTone(value: number): this {
    const tone = Math.max(0, Math.min(1, value));

    // Map to frequency range (500Hz - 8kHz)
    const frequency = 500 + tone * 7500;
    this.toneFilter.frequency.rampTo(frequency, 0.05);

    return this;
  }

  /**
   * Set output level (0-1)
   */
  setLevel(value: number): this {
    const level = Math.max(0, Math.min(1, value));

    // Post-gain compensates for drive boost
    this.postGain.gain.rampTo(level, 0.05);

    return this;
  }

  /**
   * Set wet/dry mix (0-1)
   * 0 = fully dry, 1 = fully wet
   */
  setMix(value: number): this {
    const mix = Math.max(0, Math.min(1, value));
    this.wetDry.fade.rampTo(mix, 0.05);
    return this;
  }

  /**
   * Set noise gate threshold (-100 to 0 dB)
   */
  setGate(threshold: number): this {
    this.noiseGate.threshold = Math.max(-100, Math.min(0, threshold));
    return this;
  }

  /**
   * Set distortion algorithm
   */
  setAlgorithm(algorithm: DistortionAlgorithm): this {
    this.algorithm = algorithm;

    // Regenerate curve with current drive setting
    const currentGain = this.preGain.gain.value;
    const driveAmount = (currentGain - 1) / 8; // Reverse the drive calculation
    this.waveshaper.curve = this.createDistortionCurve(algorithm, driveAmount);

    return this;
  }

  /**
   * Bypass/enable the pedal
   */
  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    this.wetDry.fade.rampTo(enabled ? 1 : 0, 0.05);
    return this;
  }

  /**
   * Get all classic pedal presets
   */
  static getPresets(): DistortionPreset[] {
    return [
      {
        name: 'ts9',
        description: 'Tube Screamer - Mid-hump overdrive',
        algorithm: 'overdrive',
        settings: {
          drive: 0.6,
          tone: 0.65,
          level: 0.75,
          mix: 1.0,
        },
      },
      {
        name: 'ds1',
        description: 'Boss DS-1 - Classic hard distortion',
        algorithm: 'heavy',
        settings: {
          drive: 0.7,
          tone: 0.6,
          level: 0.7,
          mix: 1.0,
        },
      },
      {
        name: 'big-muff',
        description: 'Big Muff - Thick, sustaining fuzz',
        algorithm: 'fuzz',
        settings: {
          drive: 0.75,
          tone: 0.5,
          level: 0.65,
          mix: 1.0,
        },
      },
      {
        name: 'blues-breaker',
        description: 'Blues Breaker - Transparent overdrive',
        algorithm: 'tube',
        settings: {
          drive: 0.4,
          tone: 0.7,
          level: 0.8,
          mix: 0.85,
        },
      },
      {
        name: 'rat',
        description: 'ProCo RAT - Aggressive distortion',
        algorithm: 'heavy',
        settings: {
          drive: 0.8,
          tone: 0.55,
          level: 0.7,
          mix: 1.0,
        },
      },
      {
        name: 'clean-boost',
        description: 'Clean Boost - Transparent gain',
        algorithm: 'soft-clip',
        settings: {
          drive: 0.3,
          tone: 0.8,
          level: 0.9,
          mix: 0.5,
        },
      },
      {
        name: 'metal-zone',
        description: 'Metal Zone - High-gain modern distortion',
        algorithm: 'heavy',
        settings: {
          drive: 0.9,
          tone: 0.65,
          level: 0.75,
          mix: 1.0,
        },
      },
      {
        name: 'fuzz-face',
        description: 'Fuzz Face - Vintage germanium fuzz',
        algorithm: 'fuzz',
        settings: {
          drive: 0.7,
          tone: 0.45,
          level: 0.7,
          mix: 1.0,
          bias: 0.2,
        },
      },
    ];
  }

  /**
   * Load a preset by name
   */
  loadPreset(presetName: string): this {
    const preset = DistortionPedal.getPresets().find((p) => p.name === presetName);

    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    this.setAlgorithm(preset.algorithm);
    this.setDrive(preset.settings.drive);
    this.setTone(preset.settings.tone);
    this.setLevel(preset.settings.level);
    this.setMix(preset.settings.mix);

    if (preset.settings.gate !== undefined) {
      this.setGate(preset.settings.gate * -100); // Convert 0-1 to -100-0
    }

    return this;
  }

  /**
   * Connect pedal to destination
   */
  connect(destination: Tone.InputNode): this {
    this.output.connect(destination);
    return this;
  }

  /**
   * Disconnect from all outputs
   */
  disconnect(): this {
    this.output.disconnect();
    return this;
  }

  /**
   * Get input node for connecting signal
   */
  getInput(): Tone.InputNode {
    return this.input;
  }

  /**
   * Get output node
   */
  getOutput(): Tone.OutputNode {
    return this.output;
  }

  /**
   * Get current state
   */
  getState() {
    const driveValue = typeof this.preGain.gain.value === 'number' ? this.preGain.gain.value : 1;
    const toneValue = typeof this.toneFilter.frequency.value === 'number' ? this.toneFilter.frequency.value : 3000;
    const levelValue = typeof this.postGain.gain.value === 'number' ? this.postGain.gain.value : 1;
    const mixValue = typeof this.wetDry.fade.value === 'number' ? this.wetDry.fade.value : 1;

    return {
      enabled: this.enabled,
      algorithm: this.algorithm,
      drive: (driveValue - 1) / 8,
      tone: (toneValue - 500) / 7500,
      level: levelValue,
      mix: mixValue,
      gateThreshold: -50,
    };
  }

  /**
   * Cleanup audio resources
   */
  dispose(): void {
    this.input.dispose();
    this.output.dispose();
    this.distortion.dispose();
    this.waveshaper.dispose();
    this.preGain.dispose();
    this.postGain.dispose();
    this.toneFilter.dispose();
    this.wetDry.dispose();
    this.noiseGate.dispose();
  }
}
