/**
 * Visualization Renderers
 * Specialized rendering functions for each generative art style
 */

import type p5 from 'p5';
import type { AudioData, P5Dimensions } from '@/lib/utils/visualization/generative-art.utils';
import {
  drawFlowFieldBackground,
  drawSpiralBackground,
  drawMandalaBackground,
  drawParticlesBackground,
  updateFlowField,
  calculateParticleAlpha,
  calculateSpiralStrokeWeight,
  getVisualizationConfig,
} from '@/lib/utils/visualization/generative-art.utils';
import type { FlowFieldParticle } from '@/lib/utils/visualization/particle.utils';
import { updateAndShowParticles } from '@/lib/utils/visualization/particle.utils';

const config = getVisualizationConfig();

export function renderFlowField(
  p: p5,
  dimensions: P5Dimensions,
  audioData: AudioData,
  flowField: p5.Vector[][],
  particles: FlowFieldParticle[]
): void {
  drawFlowFieldBackground(p);
  updateFlowField(p, flowField, dimensions, audioData.avgAmplitude);
  const alpha = calculateParticleAlpha(audioData.avgAmplitude);
  updateAndShowParticles(particles, flowField, alpha);
}

export function renderSpiral(
  p: p5,
  dimensions: P5Dimensions,
  audioData: AudioData
): void {
  drawSpiralBackground(p);
  p.translate(dimensions.width / 2, dimensions.height / 2);

  const { ARM_COUNT, POINT_COUNT } = config.SPIRAL;

  for (let arm = 0; arm < ARM_COUNT; arm++) {
    p.push();
    p.rotate((p.TWO_PI / ARM_COUNT) * arm);

    renderSpiralArm(p, POINT_COUNT, audioData, arm);

    p.pop();
  }
}

function renderSpiralArm(
  p: p5,
  pointCount: number,
  audioData: AudioData,
  armIndex: number
): void {
  p.beginShape();
  p.noFill();

  for (let i = 0; i < pointCount; i++) {
    const waveIndex = Math.floor((i / pointCount) * audioData.waveform.length);
    const waveVal = Math.abs(audioData.waveform[waveIndex] ?? 0);

    const angle = (i / pointCount) * p.TWO_PI * config.SPIRAL.ROTATION_MULTIPLIER;
    const radius = i * config.VISUAL.SPIRAL.RADIUS_MULTIPLIER + waveVal * config.VISUAL.SPIRAL.WAVE_MULTIPLIER;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const hue = (p.frameCount + i + armIndex * config.VISUAL.SPIRAL.HUE_OFFSET) % 360;
    p.stroke(hue, config.VISUAL.COLOR.SATURATION, config.VISUAL.COLOR.BRIGHTNESS, 80);
    p.strokeWeight(calculateSpiralStrokeWeight(audioData.avgAmplitude));
    p.vertex(x, y);
  }

  p.endShape();
}

export function renderMandala(
  p: p5,
  dimensions: P5Dimensions,
  audioData: AudioData
): void {
  drawMandalaBackground(p);
  p.translate(dimensions.width / 2, dimensions.height / 2);

  const { SEGMENT_COUNT, LAYER_COUNT, BASE_RADIUS } = config.MANDALA;

  for (let layer = 0; layer < LAYER_COUNT; layer++) {
    renderMandalaLayer(p, layer, SEGMENT_COUNT, BASE_RADIUS, audioData);
  }
}

function renderMandalaLayer(
  p: p5,
  layer: number,
  segmentCount: number,
  baseRadius: number,
  audioData: AudioData
): void {
  const radius = (layer + 1) * baseRadius + audioData.avgAmplitude * config.VISUAL.MANDALA.AMPLITUDE_MULTIPLIER;

  for (let i = 0; i < segmentCount; i++) {
    const waveIndex = Math.floor((i / segmentCount) * audioData.waveform.length);
    const waveVal = Math.abs(audioData.waveform[waveIndex] ?? 0);

    const angle = (p.TWO_PI / segmentCount) * i + p.frameCount * config.VISUAL.MANDALA.ROTATION_SPEED;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const size = config.VISUAL.MANDALA.SIZE_BASE + waveVal * config.VISUAL.MANDALA.SIZE_MULTIPLIER;
    const hue =
      (layer * config.VISUAL.MANDALA.HUE_LAYER_OFFSET +
        i * config.VISUAL.MANDALA.HUE_SEGMENT_OFFSET +
        p.frameCount * config.VISUAL.COLOR.HUE_SHIFT_SPEED) %
      360;

    p.fill(hue, config.VISUAL.COLOR.SATURATION, config.VISUAL.COLOR.BRIGHTNESS, 60);
    p.noStroke();
    p.circle(x, y, size);

    if (i < segmentCount - 1) {
      renderMandalaConnection(p, angle, radius, segmentCount, hue);
    }
  }
}

function renderMandalaConnection(
  p: p5,
  currentAngle: number,
  radius: number,
  segmentCount: number,
  hue: number
): void {
  const nextAngle = (p.TWO_PI / segmentCount) + currentAngle;
  const nextX = Math.cos(nextAngle) * radius;
  const nextY = Math.sin(nextAngle) * radius;
  const currentX = Math.cos(currentAngle) * radius;
  const currentY = Math.sin(currentAngle) * radius;

  p.stroke(hue, config.VISUAL.COLOR.SATURATION, config.VISUAL.COLOR.BRIGHTNESS, 30);
  p.strokeWeight(1);
  p.line(currentX, currentY, nextX, nextY);
}

export function renderParticleSystem(
  p: p5,
  dimensions: P5Dimensions,
  audioData: AudioData
): void {
  drawParticlesBackground(p);
  p.translate(dimensions.width / 2, dimensions.height / 2);

  const { COUNT, BASE_RADIUS } = config.PARTICLE_RING;
  const radius = BASE_RADIUS + audioData.avgAmplitude * config.VISUAL.PARTICLES.AMPLITUDE_MULTIPLIER;

  for (let i = 0; i < COUNT; i++) {
    renderParticle(p, i, COUNT, radius, audioData);
  }
}

function renderParticle(
  p: p5,
  index: number,
  totalCount: number,
  baseRadius: number,
  audioData: AudioData
): void {
  const waveIndex = Math.floor((index / totalCount) * audioData.waveform.length);
  const waveVal = Math.abs(audioData.waveform[waveIndex] ?? 0);

  const angle = (p.TWO_PI / totalCount) * index + p.frameCount * config.VISUAL.PARTICLES.ROTATION_SPEED;
  const r = baseRadius + waveVal * config.VISUAL.PARTICLES.WAVE_MULTIPLIER;

  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;

  const size = config.VISUAL.PARTICLES.SIZE_BASE + waveVal * config.VISUAL.PARTICLES.SIZE_MULTIPLIER;
  const hue = (index * config.VISUAL.PARTICLES.HUE_MULTIPLIER + p.frameCount) % 360;

  p.fill(hue, config.VISUAL.COLOR.SATURATION, config.VISUAL.COLOR.BRIGHTNESS, 80);
  p.noStroke();
  p.circle(x, y, size);

  renderParticleTrail(p, angle, baseRadius, hue);
}

function renderParticleTrail(p: p5, angle: number, baseRadius: number, hue: number): void {
  const innerR = baseRadius * config.VISUAL.PARTICLES.TRAIL_RADIUS_RATIO;
  const innerX = Math.cos(angle) * innerR;
  const innerY = Math.sin(angle) * innerR;
  const outerX = Math.cos(angle) * baseRadius;
  const outerY = Math.sin(angle) * baseRadius;

  p.stroke(hue, config.VISUAL.COLOR.SATURATION, config.VISUAL.COLOR.BRIGHTNESS, 30);
  p.strokeWeight(1);
  p.line(innerX, innerY, outerX, outerY);
}
