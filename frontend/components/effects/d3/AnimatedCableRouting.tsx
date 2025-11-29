'use client';

/**
 * AnimatedCableRouting - D3-powered cable visualization with flowing signal particles
 * Bezier curves, glow effects, and animated signal flow
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import { CABLE_ROUTING, VISUALIZATION_COLORS } from '@/lib/constants/visualization.constants';
import { cn } from '@/lib/utils';

interface Cable {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  active: boolean;
  signalStrength: number; // 0-1
}

interface AnimatedCableRoutingProps {
  cables: Cable[];
  width?: number;
  height?: number;
  className?: string;
}

type SvgDefsSelection = d3.Selection<SVGDefsElement, unknown, SVGSVGElement | null, unknown>;
type SvgGroupSelection = d3.Selection<SVGGElement, unknown, SVGSVGElement | null, unknown>;
type SvgPathSelection = d3.Selection<SVGPathElement, unknown, SVGGElement | null, unknown>;
type SvgCircleSelection = d3.Selection<SVGCircleElement, unknown, SVGGElement | null, unknown>;

interface BezierControlPoints {
  midX: number;
  midY: number;
}

const DEFAULT_DIMENSIONS = {
  WIDTH: 800,
  HEIGHT: 400,
} as const;

const GRADIENT_ID = 'signalGradient';
const GLOW_FILTER_ID = 'glow';

function calculateBezierControlPoints(cable: Cable): BezierControlPoints {
  const midX = (cable.fromX + cable.toX) / 2;
  const minY = Math.min(cable.fromY, cable.toY);
  const midY = minY + CABLE_ROUTING.CABLE.ARCH_OFFSET;

  return { midX, midY };
}

function generateBezierPathData(cable: Cable, controlPoints: BezierControlPoints): string {
  const { fromX, fromY, toX, toY } = cable;
  const { midX, midY } = controlPoints;
  return `M ${fromX},${fromY} Q ${midX},${midY} ${toX},${toY}`;
}

function createGlowFilter(defs: SvgDefsSelection): void {
  const filter = defs
    .append('filter')
    .attr('id', GLOW_FILTER_ID)
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  filter
    .append('feGaussianBlur')
    .attr('stdDeviation', CABLE_ROUTING.FILTER.GLOW_STD_DEVIATION)
    .attr('result', 'coloredBlur');

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
}

function createSignalGradient(defs: SvgDefsSelection): void {
  const gradient = defs
    .append('linearGradient')
    .attr('id', GRADIENT_ID)
    .attr('gradientUnits', 'userSpaceOnUse');

  const { STOP_LOW, STOP_MID, STOP_HIGH } = CABLE_ROUTING.GRADIENT;
  const { LOW, MEDIUM, HIGH } = VISUALIZATION_COLORS.SIGNAL_STRENGTH;

  gradient.append('stop').attr('offset', STOP_LOW).attr('stop-color', LOW);
  gradient.append('stop').attr('offset', STOP_MID).attr('stop-color', MEDIUM);
  gradient.append('stop').attr('offset', STOP_HIGH).attr('stop-color', HIGH);
}

function shouldApplyGlowEffect(cable: Cable): boolean {
  return cable.active && cable.signalStrength > CABLE_ROUTING.FILTER.SIGNAL_STRENGTH_THRESHOLD;
}

function getCableStrokeColor(cable: Cable): string {
  return cable.active ? `url(#${GRADIENT_ID})` : VISUALIZATION_COLORS.UI.BORDER;
}

function getCableOpacity(cable: Cable): number {
  const { ACTIVE_OPACITY, INACTIVE_OPACITY } = CABLE_ROUTING.CABLE;
  return cable.active ? ACTIVE_OPACITY : INACTIVE_OPACITY;
}

function drawCableShadow(group: SvgGroupSelection, pathData: string): void {
  const { SHADOW_STROKE_WIDTH, SHADOW_OPACITY } = CABLE_ROUTING.CABLE;

  group
    .append('path')
    .attr('d', pathData)
    .attr('stroke', VISUALIZATION_COLORS.UI.DARK_BG)
    .attr('stroke-width', SHADOW_STROKE_WIDTH)
    .attr('fill', 'none')
    .attr('opacity', SHADOW_OPACITY);
}

function attachHoverInteractions(path: SvgPathSelection, cable: Cable): void {
  const { HOVER_DURATION, BASE_STROKE_WIDTH, HOVER_STROKE_WIDTH, HOVER_OPACITY } =
    CABLE_ROUTING.CABLE;

  path
    .on('mouseenter', function () {
      d3.select(this)
        .transition()
        .duration(HOVER_DURATION)
        .attr('stroke-width', HOVER_STROKE_WIDTH)
        .attr('opacity', HOVER_OPACITY);
    })
    .on('mouseleave', function () {
      d3.select(this)
        .transition()
        .duration(HOVER_DURATION)
        .attr('stroke-width', BASE_STROKE_WIDTH)
        .attr('opacity', getCableOpacity(cable));
    });
}

function drawMainCable(group: SvgGroupSelection, pathData: string, cable: Cable): SvgPathSelection {
  const cablePath = group
    .append('path')
    .attr('d', pathData)
    .attr('stroke', getCableStrokeColor(cable))
    .attr('stroke-width', CABLE_ROUTING.CABLE.BASE_STROKE_WIDTH)
    .attr('fill', 'none')
    .attr('opacity', getCableOpacity(cable))
    .style('filter', shouldApplyGlowEffect(cable) ? `url(#${GLOW_FILTER_ID})` : 'none');

  attachHoverInteractions(cablePath, cable);

  return cablePath;
}

function calculateParticleCount(signalStrength: number): number {
  const { MIN_COUNT, MAX_ADDITIONAL_COUNT } = CABLE_ROUTING.PARTICLE;
  return Math.floor(MIN_COUNT + signalStrength * MAX_ADDITIONAL_COUNT);
}

function calculateParticleRadius(signalStrength: number): number {
  const { BASE_RADIUS, SIGNAL_RADIUS_MULTIPLIER } = CABLE_ROUTING.PARTICLE;
  return BASE_RADIUS + signalStrength * SIGNAL_RADIUS_MULTIPLIER;
}

function animateParticleAlongPath(
  particle: SvgCircleSelection,
  cablePath: SvgPathSelection,
  particleIndex: number,
  particleCount: number
): void {
  const { PARTICLE_DURATION, PARTICLE_DELAY_DIVISOR } = CABLE_ROUTING.ANIMATION;
  const { OPACITY_VISIBLE, OPACITY_HIDDEN } = CABLE_ROUTING.PARTICLE;

  const pathLength = (cablePath.node() as SVGPathElement).getTotalLength();
  const delay = particleIndex * (PARTICLE_DELAY_DIVISOR / particleCount);

  const animationTween = (t: number) => {
    const point = (cablePath.node() as SVGPathElement).getPointAtLength(t * pathLength);
    return `translate(${point.x},${point.y})`;
  };

  particle
    .transition()
    .delay(delay)
    .duration(PARTICLE_DURATION)
    .ease(d3.easeLinear)
    .attrTween('transform', () => animationTween)
    .attr('opacity', OPACITY_VISIBLE)
    .transition()
    .attr('opacity', OPACITY_HIDDEN)
    .on('end', function loopAnimation() {
      d3.select(this)
        .attr('opacity', OPACITY_HIDDEN)
        .transition()
        .delay(delay)
        .duration(PARTICLE_DURATION)
        .ease(d3.easeLinear)
        .attrTween('transform', () => animationTween)
        .attr('opacity', OPACITY_VISIBLE)
        .transition()
        .attr('opacity', OPACITY_HIDDEN);
    });
}

function createSignalParticles(
  cablesGroup: SvgGroupSelection,
  cable: Cable,
  cablePath: SvgPathSelection
): void {
  if (!cable.active) return;

  const particlesGroup = cablesGroup.append('g').attr('class', `particles-${cable.id}`);
  const particleCount = calculateParticleCount(cable.signalStrength);
  const particleRadius = calculateParticleRadius(cable.signalStrength);

  for (let i = 0; i < particleCount; i++) {
    const particle = particlesGroup
      .append('circle')
      .attr('r', particleRadius)
      .attr('fill', VISUALIZATION_COLORS.SIGNAL_STRENGTH.LOW)
      .attr('opacity', CABLE_ROUTING.PARTICLE.OPACITY_HIDDEN);

    animateParticleAlongPath(particle, cablePath, i, particleCount);
  }
}

function renderCable(cablesGroup: SvgGroupSelection, cable: Cable): void {
  const controlPoints = calculateBezierControlPoints(cable);
  const pathData = generateBezierPathData(cable, controlPoints);

  drawCableShadow(cablesGroup, pathData);
  const cablePath = drawMainCable(cablesGroup, pathData, cable);
  createSignalParticles(cablesGroup, cable, cablePath);
}

export const AnimatedCableRouting: React.FC<AnimatedCableRoutingProps> = ({
  cables,
  width = DEFAULT_DIMENSIONS.WIDTH,
  height = DEFAULT_DIMENSIONS.HEIGHT,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs: SvgDefsSelection = svg.append('defs');
    createGlowFilter(defs);
    createSignalGradient(defs);

    const cablesGroup: SvgGroupSelection = svg.append('g').attr('class', 'cables');

    cables.forEach(cable => renderCable(cablesGroup, cable));
  }, [cables]);

  return (
    <div className={cn('relative', className)}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
};
