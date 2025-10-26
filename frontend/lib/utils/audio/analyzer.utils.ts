/**
 * Audio Analyzer Utilities
 * Factory functions for creating and managing Tone.js analyzers
 */

import * as Tone from 'tone';

import { AUDIO_ANALYSIS } from '@/lib/constants/visualization.constants';

/**
 * Creates an FFT analyzer with specified size
 * @param fftSize - Size of the FFT analysis (power of 2)
 * @returns Configured FFT analyzer
 */
export function createFFTAnalyzer(fftSize: number): Tone.FFT {
  return new Tone.FFT(fftSize);
}

/**
 * Creates a waveform analyzer with specified size
 * @param waveformSize - Size of the waveform buffer
 * @returns Configured waveform analyzer
 */
export function createWaveformAnalyzer(waveformSize: number): Tone.Analyser {
  return new Tone.Analyser('waveform', waveformSize);
}

/**
 * Creates a spectrum analyzer for frequency visualization
 * @param barCount - Number of frequency bars to display
 * @returns Configured spectrum analyzer
 */
export function createSpectrumAnalyzer(barCount: number): Tone.Analyser {
  return new Tone.Analyser('fft', barCount * 2);
}

/**
 * Connects an audio node or destination to an analyzer
 * @param analyzer - The analyzer to connect to
 * @param audioNode - Optional audio node, defaults to destination
 */
export function connectAudioToAnalyzer(
  analyzer: Tone.Analyser | Tone.FFT,
  audioNode?: Tone.ToneAudioNode
): void {
  if (audioNode) {
    audioNode.connect(analyzer);
  } else {
    Tone.getDestination().connect(analyzer);
  }
}

/**
 * Creates and connects an FFT analyzer in one step
 * @param fftSize - Size of the FFT analysis
 * @param audioNode - Optional audio node to analyze
 * @returns Configured and connected FFT analyzer
 */
export function createConnectedFFTAnalyzer(
  fftSize: number = AUDIO_ANALYSIS.FFT_SIZE.MEDIUM,
  audioNode?: Tone.ToneAudioNode
): Tone.FFT {
  const analyzer = createFFTAnalyzer(fftSize);
  connectAudioToAnalyzer(analyzer, audioNode);
  return analyzer;
}

/**
 * Creates and connects a waveform analyzer in one step
 * @param waveformSize - Size of the waveform buffer
 * @param audioNode - Optional audio node to analyze
 * @returns Configured and connected waveform analyzer
 */
export function createConnectedWaveformAnalyzer(
  waveformSize: number = AUDIO_ANALYSIS.WAVEFORM_SIZE.MEDIUM,
  audioNode?: Tone.ToneAudioNode
): Tone.Analyser {
  const analyzer = createWaveformAnalyzer(waveformSize);
  connectAudioToAnalyzer(analyzer, audioNode);
  return analyzer;
}

/**
 * Calculates average amplitude from waveform data
 * @param waveform - Float32Array of waveform values
 * @returns Average amplitude (0-1)
 */
export function calculateAverageAmplitude(waveform: Float32Array): number {
  const sum = waveform.reduce((acc, val) => acc + Math.abs(val), 0);
  return sum / waveform.length;
}

/**
 * Splits FFT data into frequency bands
 * @param fftData - Float32Array of FFT values
 * @returns Object with low, mid, and high frequency averages
 */
export function splitFrequencyBands(fftData: Float32Array): {
  low: number;
  mid: number;
  high: number;
} {
  const thirdSize = Math.floor(fftData.length / 3);

  const lowFreqs = fftData.slice(0, thirdSize);
  const midFreqs = fftData.slice(thirdSize, thirdSize * 2);
  const highFreqs = fftData.slice(thirdSize * 2);

  const calculateAverage = (data: Float32Array): number => {
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
  };

  return {
    low: calculateAverage(lowFreqs),
    mid: calculateAverage(midFreqs),
    high: calculateAverage(highFreqs),
  };
}

/**
 * Normalizes FFT values from dB scale to 0-1 range
 * @param dbValue - Value in decibels (typically -100 to 0)
 * @param minDb - Minimum dB value (default: -100)
 * @param maxDb - Maximum dB value (default: 0)
 * @returns Normalized value (0-1)
 */
export function normalizeDBValue(
  dbValue: number,
  minDb: number = -100,
  maxDb: number = 0
): number {
  return Math.max(0, (dbValue - minDb) / (maxDb - minDb));
}

/**
 * Normalizes frequency bands from dB to 0-1 range
 * @param bands - Object with low, mid, high frequency values in dB
 * @returns Normalized frequency bands
 */
export function normalizeFrequencyBands(bands: {
  low: number;
  mid: number;
  high: number;
}): {
  low: number;
  mid: number;
  high: number;
} {
  return {
    low: normalizeDBValue(bands.low),
    mid: normalizeDBValue(bands.mid),
    high: normalizeDBValue(bands.high),
  };
}
