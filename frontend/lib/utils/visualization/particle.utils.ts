/**
 * Particle System Utilities
 * Particle class for flow field visualization
 */

import p5 from 'p5';
import { GENERATIVE_ART } from '@/lib/constants/visualization.constants';

export class FlowFieldParticle {
  private p: p5;
  private pos: p5.Vector;
  private vel: p5.Vector;
  private acc: p5.Vector;
  private prevPos: p5.Vector;
  private hue: number;
  private dimensions: { width: number; height: number };

  constructor(p: p5, width: number, height: number) {
    this.p = p;
    this.dimensions = { width, height };
    this.pos = p.createVector(p.random(width), p.random(height));
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.prevPos = this.pos.copy();
    this.hue = p.random(360);
  }

  public update(): void {
    this.vel.add(this.acc);
    this.vel.limit(GENERATIVE_ART.FLOW_FIELD.MAX_SPEED);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  public applyForce(force: p5.Vector): void {
    this.acc.add(force);
  }

  public show(alpha: number = 50): void {
    this.p.stroke(this.hue, 80, 100, alpha);
    this.p.strokeWeight(1);
    this.p.line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
    this.updatePrev();
  }

  private updatePrev(): void {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  public edges(): void {
    const { width, height } = this.dimensions;

    if (this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  }

  public follow(vectors: p5.Vector[][]): void {
    const { width, height } = this.dimensions;
    const { COLS, ROWS } = GENERATIVE_ART.FLOW_FIELD;

    const x = Math.floor(this.pos.x / (width / COLS));
    const y = Math.floor(this.pos.y / (height / ROWS));
    const index_x = Math.max(0, Math.min(x, COLS - 1));
    const index_y = Math.max(0, Math.min(y, ROWS - 1));
    const force = vectors[index_x]?.[index_y];
    if (force) {
      this.applyForce(force);
    }
  }
}

export function createParticles(p: p5, count: number, width: number, height: number): FlowFieldParticle[] {
  const particles: FlowFieldParticle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push(new FlowFieldParticle(p, width, height));
  }
  return particles;
}

export function updateAndShowParticles(
  particles: FlowFieldParticle[],
  flowField: p5.Vector[][],
  alpha: number
): void {
  for (const particle of particles) {
    particle.follow(flowField);
    particle.update();
    particle.edges();
    particle.show(alpha);
  }
}
