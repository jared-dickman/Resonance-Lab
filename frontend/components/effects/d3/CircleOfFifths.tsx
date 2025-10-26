'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Scale } from 'tonal';

import {
  CANVAS_DIMENSIONS,
  CIRCLE_OF_FIFTHS,
  VISUALIZATION_COLORS,
} from '@/lib/constants/visualization.constants';

interface CircleOfFifthsProps {
  width?: number;
  height?: number;
  selectedKey?: string;
  onKeySelect?: (key: string) => void;
}

const GLOW_FILTER_ID = 'glow';

const ARC_CONFIG = {
  ANGLE_OFFSET: -Math.PI / 2,
  SEGMENT_COUNT: CIRCLE_OF_FIFTHS.SEGMENT_COUNT,
} as const;

const LABEL_CONFIG = {
  MAJOR_FONT_SIZE: 16,
  MAJOR_SELECTED_FONT_SIZE: 20,
  MINOR_FONT_SIZE: 12,
  MINOR_SELECTED_FONT_SIZE: 16,
} as const;

const CENTER_TEXT_CONFIG = {
  LINE_1: 'CIRCLE OF',
  LINE_2: 'FIFTHS',
  LINE_2_Y_OFFSET: 20,
  FONT_SIZE: 14,
} as const;

const BACKGROUND_CIRCLE = {
  RADIUS_OFFSET: 20,
  OPACITY: 0.3,
} as const;

const GLOW_FILTER = {
  STD_DEVIATION: 4,
} as const;

const TRANSITION = {
  DURATION_MS: 200,
  CSS_PROPERTY: 'all 0.2s ease',
} as const;

function calculateAngleStep(): number {
  return (2 * Math.PI) / ARC_CONFIG.SEGMENT_COUNT;
}

function calculateSegmentAngles(index: number): {
  startAngle: number;
  endAngle: number;
  midAngle: number;
} {
  const angleStep = calculateAngleStep();
  const startAngle = index * angleStep + ARC_CONFIG.ANGLE_OFFSET - angleStep / 2;
  const endAngle = startAngle + angleStep;
  const midAngle = (startAngle + endAngle) / 2;

  return { startAngle, endAngle, midAngle };
}

function calculateRadii(width: number, height: number): {
  outer: number;
  inner: number;
  minor: number;
  majorLabel: number;
  minorLabel: number;
} {
  const { OUTER, INNER, MINOR } = CIRCLE_OF_FIFTHS.RADIUS_RATIOS;
  const outerRadius = Math.min(width, height) * OUTER;
  const innerRadius = outerRadius * INNER;
  const minorRadius = outerRadius * MINOR;

  return {
    outer: outerRadius,
    inner: innerRadius,
    minor: minorRadius,
    majorLabel: (innerRadius + outerRadius) / 2,
    minorLabel: (innerRadius * 0.7 + minorRadius) / 2,
  };
}

function getMajorKeyColors(isSelected: boolean, isHovered: boolean): {
  fill: string;
  text: string;
} {
  if (isSelected) {
    return {
      fill: VISUALIZATION_COLORS.KEY_TYPES.MAJOR,
      text: VISUALIZATION_COLORS.UI.TEXT_PRIMARY,
    };
  }
  if (isHovered) {
    return {
      fill: '#1e40af',
      text: '#93c5fd',
    };
  }
  return {
    fill: VISUALIZATION_COLORS.UI.DARK_BG,
    text: VISUALIZATION_COLORS.UI.TEXT_SECONDARY,
  };
}

function getMinorKeyColors(isSelected: boolean, isHovered: boolean): {
  fill: string;
  text: string;
} {
  if (isSelected) {
    return {
      fill: VISUALIZATION_COLORS.KEY_TYPES.MINOR,
      text: VISUALIZATION_COLORS.UI.TEXT_PRIMARY,
    };
  }
  if (isHovered) {
    return {
      fill: '#6d28d9',
      text: '#c4b5fd',
    };
  }
  return {
    fill: '#111827',
    text: VISUALIZATION_COLORS.UI.TEXT_MUTED,
  };
}

function getMajorKeyFontSize(isSelected: boolean): number {
  return isSelected
    ? LABEL_CONFIG.MAJOR_SELECTED_FONT_SIZE
    : LABEL_CONFIG.MAJOR_FONT_SIZE;
}

function getMinorKeyFontSize(isSelected: boolean): number {
  return isSelected
    ? LABEL_CONFIG.MINOR_SELECTED_FONT_SIZE
    : LABEL_CONFIG.MINOR_FONT_SIZE;
}

function createGlowFilter(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
  const defs = svg.append('defs');
  const filter = defs.append('filter').attr('id', GLOW_FILTER_ID);

  filter
    .append('feGaussianBlur')
    .attr('stdDeviation', GLOW_FILTER.STD_DEVIATION)
    .attr('result', 'coloredBlur');

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
}

function drawBackgroundCircle(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  outerRadius: number
): void {
  group
    .append('circle')
    .attr('r', outerRadius + BACKGROUND_CIRCLE.RADIUS_OFFSET)
    .attr('fill', 'none')
    .attr('stroke', VISUALIZATION_COLORS.UI.DARK_BG)
    .attr('stroke-width', 1)
    .attr('opacity', BACKGROUND_CIRCLE.OPACITY);
}

function drawCenterText(group: d3.Selection<SVGGElement, unknown, null, undefined>): void {
  const { LINE_1, LINE_2, LINE_2_Y_OFFSET, FONT_SIZE } = CENTER_TEXT_CONFIG;

  group
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', VISUALIZATION_COLORS.UI.TEXT_SECONDARY)
    .attr('font-size', FONT_SIZE)
    .attr('font-weight', 'bold')
    .text(LINE_1);

  group
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('y', LINE_2_Y_OFFSET)
    .attr('fill', VISUALIZATION_COLORS.UI.TEXT_SECONDARY)
    .attr('font-size', FONT_SIZE)
    .attr('font-weight', 'bold')
    .text(LINE_2);
}

function renderMajorKeySegment(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  key: string,
  index: number,
  radii: ReturnType<typeof calculateRadii>,
  selectedKey: string | undefined,
  hoveredKey: string | null,
  setHoveredKey: (key: string | null) => void,
  onKeySelect: ((key: string) => void) | undefined
): void {
  const { startAngle, endAngle, midAngle } = calculateSegmentAngles(index);
  const isSelected = selectedKey === key;
  const isHovered = hoveredKey === key;
  const colors = getMajorKeyColors(isSelected, isHovered);

  const arcGenerator = d3
    .arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(radii.inner)
    .outerRadius(radii.outer);

  const arc = group
    .append('path')
    .datum({ startAngle, endAngle })
    .attr('d', arcGenerator)
    .attr('fill', colors.fill)
    .attr('stroke', VISUALIZATION_COLORS.UI.BORDER)
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .style('transition', TRANSITION.CSS_PROPERTY)
    .on('mouseenter', () => setHoveredKey(key))
    .on('mouseleave', () => setHoveredKey(null))
    .on('click', () => onKeySelect?.(key));

  if (isSelected) {
    arc.attr('filter', `url(#${GLOW_FILTER_ID})`);
  }

  const labelX = radii.majorLabel * Math.cos(midAngle);
  const labelY = radii.majorLabel * Math.sin(midAngle);

  group
    .append('text')
    .attr('x', labelX)
    .attr('y', labelY)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', colors.text)
    .attr('font-size', getMajorKeyFontSize(isSelected))
    .attr('font-weight', isSelected ? 'bold' : 'normal')
    .style('pointer-events', 'none')
    .text(key);
}

function renderMinorKeySegment(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  key: string,
  index: number,
  radii: ReturnType<typeof calculateRadii>,
  selectedKey: string | undefined,
  hoveredKey: string | null,
  setHoveredKey: (key: string | null) => void,
  onKeySelect: ((key: string) => void) | undefined
): void {
  const { startAngle, endAngle, midAngle } = calculateSegmentAngles(index);
  const isSelected = selectedKey === key;
  const isHovered = hoveredKey === key;
  const colors = getMinorKeyColors(isSelected, isHovered);

  const arcGenerator = d3
    .arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(radii.inner * 0.7)
    .outerRadius(radii.minor);

  const arc = group
    .append('path')
    .datum({ startAngle, endAngle })
    .attr('d', arcGenerator)
    .attr('fill', colors.fill)
    .attr('stroke', VISUALIZATION_COLORS.UI.BORDER)
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .style('transition', TRANSITION.CSS_PROPERTY)
    .on('mouseenter', () => setHoveredKey(key))
    .on('mouseleave', () => setHoveredKey(null))
    .on('click', () => onKeySelect?.(key));

  if (isSelected) {
    arc.attr('filter', `url(#${GLOW_FILTER_ID})`);
  }

  const labelX = radii.minorLabel * Math.cos(midAngle);
  const labelY = radii.minorLabel * Math.sin(midAngle);

  group
    .append('text')
    .attr('x', labelX)
    .attr('y', labelY)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', colors.text)
    .attr('font-size', getMinorKeyFontSize(isSelected))
    .attr('font-weight', isSelected ? 'bold' : 'normal')
    .style('pointer-events', 'none')
    .text(key);
}

function getScaleName(key: string): string {
  const isMajor = !key.includes('m');
  return `${key} ${isMajor ? 'major' : 'minor'}`;
}

function renderSelectedKeyInfo(selectedKey: string): JSX.Element {
  const scale = Scale.get(getScaleName(selectedKey));

  return (
    <div className="mt-4 text-center">
      <div className="text-sm text-gray-400">Selected Key</div>
      <div className="text-2xl font-bold text-white">{selectedKey}</div>
      <div className="text-sm text-gray-500 mt-1">{scale.notes.join(' - ')}</div>
    </div>
  );
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({
  width = CANVAS_DIMENSIONS.SQUARE.WIDTH,
  height = CANVAS_DIMENSIONS.SQUARE.HEIGHT,
  selectedKey,
  onKeySelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const centerX = width / 2;
    const centerY = height / 2;
    const radii = calculateRadii(width, height);

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    drawBackgroundCircle(mainGroup, radii.outer);

    CIRCLE_OF_FIFTHS.KEYS.MAJOR.forEach((key, index) => {
      renderMajorKeySegment(
        mainGroup,
        key,
        index,
        radii,
        selectedKey,
        hoveredKey,
        setHoveredKey,
        onKeySelect
      );
    });

    CIRCLE_OF_FIFTHS.KEYS.MINOR.forEach((key, index) => {
      renderMinorKeySegment(
        mainGroup,
        key,
        index,
        radii,
        selectedKey,
        hoveredKey,
        setHoveredKey,
        onKeySelect
      );
    });

    drawCenterText(mainGroup);
    createGlowFilter(svg);
  }, [width, height, selectedKey, hoveredKey, onKeySelect]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} width={width} height={height} />
      {selectedKey && renderSelectedKeyInfo(selectedKey)}
    </div>
  );
};
