/**
 * D3.js Visualization Utilities
 * Clean wrapper for audio-reactive visualizations using D3.js
 */

import * as d3 from 'd3';

export type D3Selection = d3.Selection<SVGElement, unknown, null, undefined>;
export type D3ScaleLinear = d3.ScaleLinear<number, number>;
export type D3ScaleBand = d3.ScaleBand<string>;

/**
 * Create a frequency spectrum visualization
 */
export function createFrequencySpectrum(
  container: HTMLElement,
  width: number,
  height: number
) {
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);

  return {
    svg,
    xScale,
    yScale,
    update: (frequencyData: number[]) => {
      xScale.domain([0, frequencyData.length]);
      yScale.domain([0, Math.max(...frequencyData, 1)]);

      svg
        .selectAll('rect')
        .data(frequencyData)
        .join('rect')
        .attr('x', (_d, i) => xScale(i))
        .attr('y', (d) => yScale(d))
        .attr('width', width / frequencyData.length - 1)
        .attr('height', (d) => height - yScale(d))
        .attr('fill', (d) => d3.interpolateViridis(d / 255));
    },
    clear: () => svg.selectAll('*').remove(),
  };
}

/**
 * Create a circular chord wheel (circle of fifths)
 */
export function createChordWheel(
  container: HTMLElement,
  radius: number,
  onChordClick?: (chord: string) => void
) {
  const width = radius * 2 + 40;
  const height = radius * 2 + 40;
  const centerX = width / 2;
  const centerY = height / 2;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const group = svg
    .append('g')
    .attr('transform', `translate(${centerX}, ${centerY})`);

  return {
    svg,
    group,
    update: (chords: string[], currentIndex?: number) => {
      const angleStep = (2 * Math.PI) / chords.length;

      const chordGroups = group
        .selectAll('g.chord-node')
        .data(chords)
        .join('g')
        .attr('class', 'chord-node')
        .attr('transform', (_d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          return `translate(${x}, ${y})`;
        });

      // Add circles
      chordGroups
        .selectAll('circle')
        .data((d) => [d])
        .join('circle')
        .attr('r', 25)
        .attr('fill', (_d, i) => (i === currentIndex ? '#8b5cf6' : '#4c1d95'))
        .attr('stroke', '#a78bfa')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', (_event, d) => onChordClick?.(d));

      // Add text labels
      chordGroups
        .selectAll('text')
        .data((d) => [d])
        .join('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text((d) => d);
    },
    clear: () => svg.selectAll('*').remove(),
  };
}

/**
 * Create a waveform visualization
 */
export function createWaveform(
  container: HTMLElement,
  width: number,
  height: number
) {
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);

  const line = d3
    .line<number>()
    .x((_d, i) => xScale(i))
    .y((d) => yScale(d))
    .curve(d3.curveMonotoneX);

  const path = svg
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', '#8b5cf6')
    .attr('stroke-width', 2);

  return {
    svg,
    xScale,
    yScale,
    update: (waveformData: number[]) => {
      xScale.domain([0, waveformData.length - 1]);
      yScale.domain([
        Math.min(...waveformData, -1),
        Math.max(...waveformData, 1),
      ]);

      path.attr('d', line(waveformData));
    },
    clear: () => svg.selectAll('*').remove(),
  };
}

/**
 * Create color scales for audio visualization
 */
export const colorScales = {
  viridis: (value: number) => d3.interpolateViridis(value),
  plasma: (value: number) => d3.interpolatePlasma(value),
  rainbow: (value: number) => d3.interpolateRainbow(value),
  cool: (value: number) => d3.interpolateCool(value),
  warm: (value: number) => d3.interpolateWarm(value),
};

/**
 * Animation utilities
 */
export const animations = {
  /**
   * Smooth transition for data updates
   */
  transition: (duration = 300) => d3.transition().duration(duration),

  /**
   * Easing functions
   */
  ease: {
    linear: d3.easeLinear,
    quad: d3.easeQuad,
    cubic: d3.easeCubic,
    elastic: d3.easeElastic,
    bounce: d3.easeBounce,
  },
};