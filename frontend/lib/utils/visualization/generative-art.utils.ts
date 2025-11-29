/**
 * Generative Art Utilities
 * Helper functions and classes for P5.js generative visualizations
 */

import p5 from 'p5';
import * as Tone from 'tone';
import { GENERATIVE_ART, CANVAS_DIMENSIONS } from '@/lib/constants/visualization.constants';

export interface P5Dimensions {
  width: number;
  height: number;
}

export interface AudioData {
  waveform: Float32Array;
  avgAmplitude: number;
}

export type VisualizationStyle = 'flow-field' | 'spiral' | 'mandala' | 'particles';

const VISUAL_CONFIG = {
  ANALYZER_SIZE: 1024,
  BACKGROUND_ALPHA: {
    FLOW_FIELD: 10,
    SPIRAL: 20,
    MANDALA: 30,
    PARTICLES: 40,
  },
  NOISE_SCALE: 0.1,
  NOISE_SPEED: 0.001,
  COLOR: {
    SATURATION: 80,
    BRIGHTNESS: 100,
    HUE_SHIFT_SPEED: 0.5,
  },
  FLOW_FIELD: {
    NOISE_MULTIPLIER: 4,
    BASE_MAG: 0.1,
    AMPLITUDE_MULTIPLIER: 2,
    AMPLITUDE_FORCE_MULTIPLIER: 5,
    ALPHA_BASE: 30,
    ALPHA_MULTIPLIER: 70,
  },
  SPIRAL: {
    ROTATION_MULTIPLIER: 3,
    RADIUS_MULTIPLIER: 0.5,
    WAVE_MULTIPLIER: 100,
    HUE_OFFSET: 45,
    STROKE_BASE: 1,
    STROKE_MULTIPLIER: 3,
  },
  MANDALA: {
    AMPLITUDE_MULTIPLIER: 100,
    SIZE_BASE: 10,
    SIZE_MULTIPLIER: 30,
    HUE_LAYER_OFFSET: 30,
    HUE_SEGMENT_OFFSET: 10,
    ROTATION_SPEED: 0.01,
  },
  PARTICLES: {
    AMPLITUDE_MULTIPLIER: 200,
    WAVE_MULTIPLIER: 150,
    SIZE_BASE: 5,
    SIZE_MULTIPLIER: 20,
    HUE_MULTIPLIER: 3.6,
    ROTATION_SPEED: 0.02,
    TRAIL_RADIUS_RATIO: 0.3,
  },
} as const;

export function getDefaultDimensions(): P5Dimensions {
  return {
    width: CANVAS_DIMENSIONS.DEFAULT.WIDTH,
    height: CANVAS_DIMENSIONS.DEFAULT.HEIGHT,
  };
}

export function createAudioAnalyzer(audioNode?: Tone.ToneAudioNode): Tone.Analyser {
  const analyzer = new Tone.Analyser('waveform', VISUAL_CONFIG.ANALYZER_SIZE);

  if (audioNode) {
    audioNode.connect(analyzer);
  } else {
    Tone.getDestination().connect(analyzer);
  }

  return analyzer;
}

export function getAudioData(analyzer: Tone.Analyser): AudioData {
  const waveform = analyzer.getValue() as Float32Array;
  const avgAmplitude = waveform.reduce((sum, val) => sum + Math.abs(val), 0) / waveform.length;

  return { waveform, avgAmplitude };
}

export function createFlowField(p: p5, _dimensions: P5Dimensions): p5.Vector[][] {
  const flowField: p5.Vector[][] = [];
  const { COLS, ROWS, NOISE_SCALE } = GENERATIVE_ART.FLOW_FIELD;

  for (let x = 0; x < COLS; x++) {
    flowField[x] = [];
    for (let y = 0; y < ROWS; y++) {
      const angle =
        p.noise(x * NOISE_SCALE, y * NOISE_SCALE) *
        p.TWO_PI *
        VISUAL_CONFIG.FLOW_FIELD.NOISE_MULTIPLIER;
      const v = p5.Vector.fromAngle(angle);
      v.setMag(VISUAL_CONFIG.FLOW_FIELD.BASE_MAG);
      const column = flowField[x] ?? [];
      column[y] = v;
      flowField[x] = column;
    }
  }

  return flowField;
}

export function updateFlowField(
  p: p5,
  flowField: p5.Vector[][],
  _dimensions: P5Dimensions,
  amplitude: number
): void {
  const { COLS, ROWS, NOISE_SCALE } = GENERATIVE_ART.FLOW_FIELD;
  const zoff = p.frameCount * VISUAL_CONFIG.NOISE_SPEED;

  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const angle =
        p.noise(x * NOISE_SCALE, y * NOISE_SCALE, zoff) *
        p.TWO_PI *
        VISUAL_CONFIG.FLOW_FIELD.NOISE_MULTIPLIER *
        (1 + amplitude * VISUAL_CONFIG.FLOW_FIELD.AMPLITUDE_FORCE_MULTIPLIER);
      const v = p5.Vector.fromAngle(angle);
      v.setMag(
        VISUAL_CONFIG.FLOW_FIELD.BASE_MAG +
          amplitude * VISUAL_CONFIG.FLOW_FIELD.AMPLITUDE_MULTIPLIER
      );
      const column = flowField[x] ?? [];
      column[y] = v;
      flowField[x] = column;
    }
  }
}

export function drawFlowFieldBackground(p: p5): void {
  p.background(0, 0, 0, VISUAL_CONFIG.BACKGROUND_ALPHA.FLOW_FIELD);
}

export function drawSpiralBackground(p: p5): void {
  p.background(0, 0, 0, VISUAL_CONFIG.BACKGROUND_ALPHA.SPIRAL);
}

export function drawMandalaBackground(p: p5): void {
  p.background(0, 0, 0, VISUAL_CONFIG.BACKGROUND_ALPHA.MANDALA);
}

export function drawParticlesBackground(p: p5): void {
  p.background(0, 0, 0, VISUAL_CONFIG.BACKGROUND_ALPHA.PARTICLES);
}

export function calculateParticleAlpha(amplitude: number): number {
  return (
    VISUAL_CONFIG.FLOW_FIELD.ALPHA_BASE + amplitude * VISUAL_CONFIG.FLOW_FIELD.ALPHA_MULTIPLIER
  );
}

export function calculateSpiralStrokeWeight(amplitude: number): number {
  return VISUAL_CONFIG.SPIRAL.STROKE_BASE + amplitude * VISUAL_CONFIG.SPIRAL.STROKE_MULTIPLIER;
}

export function getVisualizationConfig() {
  return {
    SPIRAL: {
      ARM_COUNT: GENERATIVE_ART.SPIRAL.ARM_COUNT,
      POINT_COUNT: GENERATIVE_ART.SPIRAL.POINT_COUNT,
      ROTATION_MULTIPLIER: GENERATIVE_ART.SPIRAL.ROTATION_MULTIPLIER,
    },
    MANDALA: {
      SEGMENT_COUNT: GENERATIVE_ART.MANDALA.SEGMENT_COUNT,
      LAYER_COUNT: GENERATIVE_ART.MANDALA.LAYER_COUNT,
      BASE_RADIUS: GENERATIVE_ART.MANDALA.BASE_RADIUS,
    },
    PARTICLE_RING: {
      COUNT: GENERATIVE_ART.PARTICLE_RING.COUNT,
      BASE_RADIUS: GENERATIVE_ART.PARTICLE_RING.BASE_RADIUS,
    },
    VISUAL: VISUAL_CONFIG,
  };
}
