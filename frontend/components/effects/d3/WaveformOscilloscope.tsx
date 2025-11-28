'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as Tone from 'tone';

import {
  CANVAS_DIMENSIONS,
  AUDIO_ANALYSIS,
  VISUALIZATION_COLORS,
} from '@/lib/constants/visualization.constants';
import { cn } from '@/lib/utils';

interface WaveformOscilloscopeProps {
  audioNode?: Tone.OutputNode;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const WAVEFORM_CONFIG = {
  SAMPLE_SIZE: AUDIO_ANALYSIS.WAVEFORM_SIZE.MEDIUM,
  GRID_LINES: 5,
  STROKE_WIDTH: 2,
  GLOW_STD_DEVIATION: 2,
  OPACITY: {
    WAVEFORM: 0.9,
    GRID: 0.3,
    CENTER_LINE: 0.5,
  },
} as const;

function createWaveformAnalyzer(audioNode?: Tone.OutputNode): Tone.Waveform {
  const waveform = new Tone.Waveform(WAVEFORM_CONFIG.SAMPLE_SIZE);

  if (audioNode) {
    Tone.connect(audioNode, waveform);
  } else {
    Tone.connect(Tone.getDestination(), waveform);
  }

  return waveform;
}

function createGridLines(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  height: number
): void {
  const gridGroup = svg.append('g').attr('class', 'grid');
  const { GRID_LINES } = WAVEFORM_CONFIG;

  for (let i = 0; i <= GRID_LINES; i++) {
    const y = (i / GRID_LINES) * height;
    const isCenterLine = i === GRID_LINES / 2;

    gridGroup
      .append('line')
      .attr('x1', 0)
      .attr('y1', y)
      .attr('x2', width)
      .attr('y2', y)
      .attr('stroke', VISUALIZATION_COLORS.UI.BORDER)
      .attr('stroke-width', isCenterLine ? 1 : 0.5)
      .attr('opacity', WAVEFORM_CONFIG.OPACITY.GRID);
  }
}

function createCenterReferenceLine(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  height: number
): void {
  svg
    .append('line')
    .attr('x1', 0)
    .attr('y1', height / 2)
    .attr('x2', width)
    .attr('y2', height / 2)
    .attr('stroke', VISUALIZATION_COLORS.UI.TEXT_MUTED)
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '5,5')
    .attr('opacity', WAVEFORM_CONFIG.OPACITY.CENTER_LINE);
}

function createGlowFilter(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
): void {
  const defs = svg.append('defs');
  const filter = defs
    .append('filter')
    .attr('id', 'waveformGlow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  filter
    .append('feGaussianBlur')
    .attr('stdDeviation', WAVEFORM_CONFIG.GLOW_STD_DEVIATION)
    .attr('result', 'coloredBlur');

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
}

function createWaveformLine(width: number, height: number): d3.Line<number> {
  return d3
    .line<number>()
    .x((_, i) => (i / WAVEFORM_CONFIG.SAMPLE_SIZE) * width)
    .y((value) => height / 2 - (value * height) / 2)
    .curve(d3.curveBasis);
}

export const WaveformOscilloscope: React.FC<WaveformOscilloscopeProps> = ({
  audioNode,
  width = CANVAS_DIMENSIONS.WAVEFORM.WIDTH,
  height = CANVAS_DIMENSIONS.WAVEFORM.HEIGHT,
  color = VISUALIZATION_COLORS.SIGNAL_STRENGTH.MEDIUM,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const analyzerRef = useRef<Tone.Waveform | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const analyzer = createWaveformAnalyzer(audioNode);
    analyzerRef.current = analyzer;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    createGridLines(svg, width, height);
    createCenterReferenceLine(svg, width, height);
    createGlowFilter(svg);

    const pathGroup = svg.append('g').attr('class', 'waveform');
    const line = createWaveformLine(width, height);

    const path = pathGroup
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', WAVEFORM_CONFIG.STROKE_WIDTH)
      .attr('opacity', WAVEFORM_CONFIG.OPACITY.WAVEFORM)
      .style('filter', 'url(#waveformGlow)');

    const animate = (): void => {
      if (!analyzerRef.current) return;

      const values = analyzerRef.current.getValue();
      path.datum(Array.from(values)).attr('d', line);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      analyzer.dispose();
    };
  }, [audioNode, width, height, color]);

  return (
    <div className={cn('relative bg-gray-950 rounded-lg p-4', className)}>
      <div className="text-xs font-bold text-gray-400 uppercase mb-2">Waveform</div>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
