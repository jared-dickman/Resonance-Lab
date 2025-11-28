/**
 * Wavesurfer.js Audio Utilities
 * Clean wrapper for waveform visualization and audio playback control
 */

import WaveSurfer from 'wavesurfer.js';
import type { WaveSurferOptions, WaveSurferEvents } from 'wavesurfer.js';

export interface WaveformOptions {
  container: HTMLElement;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  height?: number;
  normalize?: boolean;
  responsive?: boolean;
}

export interface RegionConfig {
  id: string;
  start: number;
  end: number;
  color?: string;
  drag?: boolean;
  resize?: boolean;
  label?: string;
}

/**
 * Create Wavesurfer instance with sensible defaults
 */
export function createWavesurfer(options: WaveformOptions): WaveSurfer {
  const defaultOptions: Partial<WaveformOptions> = {
    waveColor: '#8b5cf6',
    progressColor: '#6d28d9',
    cursorColor: '#c4b5fd',
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    height: 128,
    normalize: true,
    responsive: true,
  };

  const wavesurfer = WaveSurfer.create({
    ...defaultOptions,
    ...options,
  });

  return wavesurfer;
}

/**
 * Advanced waveform controller
 */
export class WaveformController {
  private wavesurfer: WaveSurfer;

  constructor(options: WaveformOptions) {
    this.wavesurfer = createWavesurfer(options);
  }

  /**
   * Load audio file or blob
   */
  async load(url: string | Blob): Promise<void> {
    if (typeof url === 'string') {
      await this.wavesurfer.load(url);
    } else {
      await this.wavesurfer.loadBlob(url);
    }
  }

  /**
   * Playback controls
   */
  play(): void {
    this.wavesurfer.play();
  }

  pause(): void {
    this.wavesurfer.pause();
  }

  stop(): void {
    this.wavesurfer.stop();
  }

  isPlaying(): boolean {
    return this.wavesurfer.isPlaying();
  }

  /**
   * Seek to time (in seconds)
   */
  seekTo(seconds: number): void {
    const duration = this.wavesurfer.getDuration();
    const progress = seconds / duration;
    this.wavesurfer.seekTo(progress);
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.wavesurfer.getCurrentTime();
  }

  /**
   * Get duration
   */
  getDuration(): number {
    return this.wavesurfer.getDuration();
  }

  /**
   * Volume control (0-1)
   */
  setVolume(volume: number): void {
    this.wavesurfer.setVolume(Math.max(0, Math.min(1, volume)));
  }

  getVolume(): number {
    return this.wavesurfer.getVolume();
  }

  /**
   * Playback rate (0.5 = half speed, 2 = double speed)
   */
  setPlaybackRate(rate: number): void {
    this.wavesurfer.setPlaybackRate(rate);
  }

  /**
   * Zoom level (pixels per second)
   */
  zoom(level: number): void {
    this.wavesurfer.zoom(level);
  }

  /**
   * Event listeners with type-safe event names
   */
  on<E extends keyof WaveSurferEvents>(
    event: E,
    callback: (...args: WaveSurferEvents[E]) => void
  ): () => void {
    return this.wavesurfer.on(event, callback);
  }

  off<E extends keyof WaveSurferEvents>(
    event: E,
    callback: (...args: WaveSurferEvents[E]) => void
  ): void {
    this.wavesurfer.un(event, callback);
  }

  /**
   * Destroy instance
   */
  destroy(): void {
    this.wavesurfer.destroy();
  }

  /**
   * Get underlying WaveSurfer instance for advanced usage
   */
  getInstance(): WaveSurfer {
    return this.wavesurfer;
  }
}

/**
 * Chord region marker utilities
 */
export const regionUtils = {
  /**
   * Add chord change markers to waveform
   */
  addChordMarkers: (
    _wavesurfer: WaveSurfer,
    chords: Array<{ name: string; time: number; duration: number }>
  ) => {
    const colors = {
      major: 'rgba(139, 92, 246, 0.2)',
      minor: 'rgba(59, 130, 246, 0.2)', // Using sapphire-500 RGB values
      dominant: 'rgba(249, 115, 22, 0.2)',
      diminished: 'rgba(239, 68, 68, 0.2)',
    };

    chords.forEach((chord, index) => {
      const color = chord.name.includes('m')
        ? colors.minor
        : chord.name.includes('7')
          ? colors.dominant
          : colors.major;

      // Note: Regions plugin needs to be added separately
      // This is placeholder for the API
      const regionConfig = {
        id: `chord-${index}`,
        start: chord.time,
        end: chord.time + chord.duration,
        color,
        drag: false,
        resize: false,
        label: chord.name,
      };

      return regionConfig;
    });
  },

  /**
   * Create practice loop region
   */
  createLoopRegion: (
    _wavesurfer: WaveSurfer,
    start: number,
    end: number,
    label = 'Practice Loop'
  ) => {
    return {
      id: 'practice-loop',
      start,
      end,
      color: 'rgba(34, 197, 94, 0.2)',
      drag: true,
      resize: true,
      label,
    };
  },
};

/**
 * Audio analysis utilities
 */
export const analysisUtils = {
  /**
   * Detect peaks in waveform
   */
  detectPeaks: (
    decodedData: AudioBuffer,
    threshold = 0.9,
    minDistance = 0.5
  ): number[] => {
    const peaks: number[] = [];
    const data = decodedData.getChannelData(0);
    const sampleRate = decodedData.sampleRate;
    const minSamples = minDistance * sampleRate;

    let lastPeakIndex = -minSamples;

    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i] || 0) > threshold) {
        if (i - lastPeakIndex > minSamples) {
          peaks.push(i / sampleRate);
          lastPeakIndex = i;
        }
      }
    }

    return peaks;
  },

  /**
   * Simple beat detection (placeholder - use more sophisticated algorithm)
   */
  detectBeats: (decodedData: AudioBuffer, bpm?: number): number[] => {
    if (bpm) {
      const beatInterval = 60 / bpm;
      const duration = decodedData.duration;
      const beats: number[] = [];

      for (let time = 0; time < duration; time += beatInterval) {
        beats.push(time);
      }

      return beats;
    }

    // Fallback to peak detection
    return analysisUtils.detectPeaks(decodedData, 0.8, 0.3);
  },
};

/**
 * Waveform styling presets
 */
export const waveformPresets = {
  purple: {
    waveColor: '#8b5cf6',
    progressColor: '#6d28d9',
    cursorColor: '#c4b5fd',
  },
  blue: {
    waveColor: 'var(--sapphire-500)',
    progressColor: 'var(--sapphire-700)',
    cursorColor: 'var(--sapphire-300)',
  },
  green: {
    waveColor: '#10b981',
    progressColor: '#059669',
    cursorColor: '#6ee7b7',
  },
  orange: {
    waveColor: '#f97316',
    progressColor: '#ea580c',
    cursorColor: '#fdba74',
  },
  gradient: {
    waveColor: 'violet',
    progressColor: 'purple',
    cursorColor: '#c4b5fd',
  },
};
