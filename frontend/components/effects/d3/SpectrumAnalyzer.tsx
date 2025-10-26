'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as Tone from 'tone';

import {
  CANVAS_DIMENSIONS,
  AUDIO_ANALYSIS,
  VISUALIZATION_COLORS,
} from '@/lib/constants/visualization.constants';
import { normalizeDBValue } from '@/lib/utils/audio/analyzer.utils';

interface SpectrumAnalyzerProps {
  audioNode?: Tone.ToneAudioNode;
  width?: number;
  height?: number;
  barCount?: number;
  smoothing?: number;
  className?: string;
}

const SPECTRUM_CONFIG = {
  BAR_GAP: 2,
  BAR_OPACITY: 0.9,
  TRANSITION_DURATION: 50,
  LABEL_OFFSET: 15,
  LABEL_FONT_SIZE: '10px',
  GRADIENT_ID: 'spectrumGradient',
  FREQUENCY_LABELS: [20, 100, 500, '1k', '5k', '10k', '20k'] as const,
  LABEL_POSITIONS: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1.0] as const,
} as const;

function createSpectrumAnalyzer(
  barCount: number,
  smoothing: number,
  audioNode?: Tone.ToneAudioNode
): Tone.Analyser {
  const analyzer = new Tone.Analyser('fft', barCount * 2);
  analyzer.smoothing = smoothing;

  if (audioNode) {
    audioNode.connect(analyzer);
  } else {
    Tone.getDestination().connect(analyzer);
  }

  return analyzer;
}

function createSpectrumGradient(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
): void {
  const defs = svg.append('defs');
  const gradient = defs
    .append('linearGradient')
    .attr('id', SPECTRUM_CONFIG.GRADIENT_ID)
    .attr('x1', '0%')
    .attr('y1', '100%')
    .attr('x2', '0%')
    .attr('y2', '0%');

  gradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', VISUALIZATION_COLORS.SIGNAL_STRENGTH.LOW);

  gradient
    .append('stop')
    .attr('offset', '50%')
    .attr('stop-color', VISUALIZATION_COLORS.SIGNAL_STRENGTH.MEDIUM);

  gradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', VISUALIZATION_COLORS.SIGNAL_STRENGTH.HIGH);
}

function createFrequencyBars(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  barCount: number,
  width: number,
  height: number
): d3.Selection<d3.BaseType | SVGRectElement, number, SVGGElement, unknown> {
  const barsGroup = svg.append('g').attr('class', 'bars');
  const barWidth = width / barCount;

  return barsGroup
    .selectAll('rect')
    .data(Array.from({ length: barCount }))
    .enter()
    .append('rect')
    .attr('x', (_, i) => i * barWidth)
    .attr('y', height)
    .attr('width', barWidth - SPECTRUM_CONFIG.BAR_GAP)
    .attr('height', 0)
    .attr('fill', `url(#${SPECTRUM_CONFIG.GRADIENT_ID})`)
    .attr('opacity', SPECTRUM_CONFIG.BAR_OPACITY);
}

function createFrequencyLabels(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  height: number
): void {
  const labelsGroup = svg.append('g').attr('class', 'labels');
  const { FREQUENCY_LABELS, LABEL_POSITIONS } = SPECTRUM_CONFIG;

  labelsGroup
    .selectAll('text')
    .data(FREQUENCY_LABELS)
    .enter()
    .append('text')
    .attr('x', (_, i) => LABEL_POSITIONS[i] * width)
    .attr('y', height + SPECTRUM_CONFIG.LABEL_OFFSET)
    .attr('text-anchor', 'middle')
    .attr('fill', VISUALIZATION_COLORS.UI.TEXT_MUTED)
    .attr('font-size', SPECTRUM_CONFIG.LABEL_FONT_SIZE)
    .attr('font-family', 'monospace')
    .text((frequency) => `${frequency}Hz`);
}

function updateBarsWithFrequencyData(
  bars: d3.Selection<d3.BaseType | SVGRectElement, number, SVGGElement, unknown>,
  frequencyData: Float32Array,
  barCount: number,
  height: number
): void {
  bars
    .data(Array.from(frequencyData.slice(0, barCount)))
    .transition()
    .duration(SPECTRUM_CONFIG.TRANSITION_DURATION)
    .ease(d3.easeLinear)
    .attr('y', (dbValue) => {
      const normalized = normalizeDBValue(dbValue);
      return height - normalized * height;
    })
    .attr('height', (dbValue) => {
      const normalized = normalizeDBValue(dbValue);
      return normalized * height;
    });
}

export const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  audioNode,
  width = CANVAS_DIMENSIONS.COMPACT.WIDTH,
  height = CANVAS_DIMENSIONS.COMPACT.HEIGHT,
  barCount = AUDIO_ANALYSIS.SPECTRUM.DEFAULT_BAR_COUNT,
  smoothing = AUDIO_ANALYSIS.SPECTRUM.DEFAULT_SMOOTHING,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!svgRef.current) return;

    const analyzer = createSpectrumAnalyzer(barCount, smoothing, audioNode);
    analyzerRef.current = analyzer;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    createSpectrumGradient(svg);
    const bars = createFrequencyBars(svg, barCount, width, height);
    createFrequencyLabels(svg, width, height);

    const animate = (): void => {
      if (!analyzerRef.current) return;

      const frequencyData = analyzerRef.current.getValue() as Float32Array;
      updateBarsWithFrequencyData(bars, frequencyData, barCount, height);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      analyzer.dispose();
    };
  }, [audioNode, width, height, barCount, smoothing]);

  const svgHeight = height + SPECTRUM_CONFIG.LABEL_OFFSET + 5;

  return (
    <div className={`relative bg-gray-950 rounded-lg p-4 ${className}`}>
      <div className="text-xs font-bold text-gray-400 uppercase mb-2">Spectrum Analyzer</div>
      <svg ref={svgRef} width={width} height={svgHeight} />
    </div>
  );
};
