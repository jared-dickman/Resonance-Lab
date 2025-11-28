'use client';

/**
 * SignalPathDiagram - D3 force-directed graph of pedal chain
 * Interactive, draggable, zoom/pan visualization
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import {
  SIGNAL_PATH,
  VISUALIZATION_COLORS,
} from '@/lib/constants/visualization.constants';
import { cn } from '@/lib/utils';

interface PedalNode {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
}

interface SignalLink {
  source: string;
  target: string;
}

interface SignalPathDiagramProps {
  pedals: PedalNode[];
  width?: number;
  height?: number;
  className?: string;
}

type NodeDatum = d3.SimulationNodeDatum & PedalNode;
type LinkDatum = d3.SimulationLinkDatum<NodeDatum>;
type DragSubject = NodeDatum | d3.SubjectPosition;

function isNodeDatum(subject: DragSubject | undefined | null): subject is NodeDatum {
  return (
    !!subject &&
    typeof (subject as NodeDatum).id === 'string' &&
    typeof (subject as NodeDatum).name === 'string' &&
    typeof (subject as NodeDatum).type === 'string'
  );
}

const DIAGRAM_CONFIG = {
  INPUT_X_OFFSET: 50,
  OUTPUT_X_OFFSET: 50,
  PEDAL_SPACING: 120,
  PEDAL_START_X: 150,
  NODE: {
    RADIUS: 40,
    COLLISION_RADIUS: 50,
  },
  LINK: {
    STROKE_WIDTH: 3,
    OPACITY: 0.6,
  },
  ARROW: {
    VIEWBOX: '-0 -5 10 10',
    REF_X: 30,
    REF_Y: 0,
    WIDTH: 8,
    HEIGHT: 8,
    PATH: 'M 0,-5 L 10,0 L 0,5',
  },
  GLOW: {
    STD_DEVIATION: 4,
  },
  LABEL: {
    PRIMARY_FONT_SIZE: '12px',
    SECONDARY_FONT_SIZE: '9px',
    SECONDARY_Y_OFFSET: '2.5em',
  },
  DRAG: {
    ALPHA_TARGET: 0.3,
  },
} as const;

const DEFAULT_DIMENSIONS = {
  WIDTH: 800,
  HEIGHT: 400,
} as const;

const FILTER_IDS = {
  ARROW: 'arrowhead',
  GLOW: 'nodeGlow',
} as const;

const NODE_TYPES = {
  INPUT: 'input',
  OUTPUT: 'output',
} as const;

function createInputNode(height: number): NodeDatum {
  return {
    id: NODE_TYPES.INPUT,
    name: 'INPUT',
    type: NODE_TYPES.INPUT,
    enabled: true,
    x: DIAGRAM_CONFIG.INPUT_X_OFFSET,
    y: height / 2,
  };
}

function createOutputNode(width: number, height: number): NodeDatum {
  return {
    id: NODE_TYPES.OUTPUT,
    name: 'OUTPUT',
    type: NODE_TYPES.OUTPUT,
    enabled: true,
    x: width - DIAGRAM_CONFIG.OUTPUT_X_OFFSET,
    y: height / 2,
  };
}

function createPedalNode(pedal: PedalNode, index: number, height: number): NodeDatum {
  return {
    ...pedal,
    x: DIAGRAM_CONFIG.PEDAL_START_X + index * DIAGRAM_CONFIG.PEDAL_SPACING,
    y: height / 2,
  };
}

function createNodesData(pedals: PedalNode[], width: number, height: number): NodeDatum[] {
  const inputNode = createInputNode(height);
  const pedalNodes = pedals.map((pedal, index) => createPedalNode(pedal, index, height));
  const outputNode = createOutputNode(width, height);

  return [inputNode, ...pedalNodes, outputNode];
}

function createLinksData(nodes: NodeDatum[]): LinkDatum[] {
  const links: LinkDatum[] = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    const sourceNode = nodes[i];
    const targetNode = nodes[i + 1];
    if (!sourceNode || !targetNode) {
      continue;
    }

    links.push({
      source: sourceNode.id,
      target: targetNode.id,
    });
  }

  return links;
}

function createForceSimulation(
  nodes: NodeDatum[],
  links: LinkDatum[],
  width: number,
  height: number
): d3.Simulation<NodeDatum, undefined> {
  const { LINK_DISTANCE, CHARGE_STRENGTH } = SIGNAL_PATH.FORCE_SIMULATION;
  const { COLLISION_RADIUS } = DIAGRAM_CONFIG.NODE;

  return d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink<NodeDatum, LinkDatum>(links)
        .id((d) => d.id)
        .distance(LINK_DISTANCE)
    )
    .force('charge', d3.forceManyBody().strength(CHARGE_STRENGTH))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(COLLISION_RADIUS));
}

function createZoomBehavior(
  container: d3.Selection<SVGGElement, unknown, null, undefined>
): d3.ZoomBehavior<SVGSVGElement, unknown> {
  const { MIN, MAX } = SIGNAL_PATH.ZOOM;

  return d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([MIN, MAX])
    .on('zoom', (event) => {
      container.attr('transform', event.transform);
    });
}

function createArrowMarker(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>
): void {
  const { VIEWBOX, REF_X, REF_Y, WIDTH, HEIGHT, PATH } = DIAGRAM_CONFIG.ARROW;

  defs
    .append('marker')
    .attr('id', FILTER_IDS.ARROW)
    .attr('viewBox', VIEWBOX)
    .attr('refX', REF_X)
    .attr('refY', REF_Y)
    .attr('orient', 'auto')
    .attr('markerWidth', WIDTH)
    .attr('markerHeight', HEIGHT)
    .append('svg:path')
    .attr('d', PATH)
    .attr('fill', VISUALIZATION_COLORS.SIGNAL_STRENGTH.LOW);
}

function createGlowFilter(
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>
): void {
  const glowFilter = defs
    .append('filter')
    .attr('id', FILTER_IDS.GLOW)
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  glowFilter
    .append('feGaussianBlur')
    .attr('stdDeviation', DIAGRAM_CONFIG.GLOW.STD_DEVIATION)
    .attr('result', 'coloredBlur');

  const feMerge = glowFilter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
}

function getNodeFillColor(node: NodeDatum): string {
  const isTerminalNode = node.type === NODE_TYPES.INPUT || node.type === NODE_TYPES.OUTPUT;

  if (isTerminalNode) {
    return VISUALIZATION_COLORS.UI.BORDER;
  }

  return node.enabled
    ? VISUALIZATION_COLORS.KEY_TYPES.MAJOR
    : VISUALIZATION_COLORS.UI.TEXT_MUTED;
}

function shouldApplyGlow(node: NodeDatum): string {
  return node.enabled ? `url(#${FILTER_IDS.GLOW})` : 'none';
}

function drawLinks(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: LinkDatum[]
): d3.Selection<SVGLineElement, LinkDatum, SVGGElement, unknown> {
  const { STROKE_WIDTH, OPACITY } = DIAGRAM_CONFIG.LINK;

  return container
    .append('g')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', VISUALIZATION_COLORS.SIGNAL_STRENGTH.LOW)
    .attr('stroke-width', STROKE_WIDTH)
    .attr('opacity', OPACITY)
    .attr('marker-end', `url(#${FILTER_IDS.ARROW})`);
}

function drawNodeCircles(
  nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>
): void {
  const { RADIUS, STROKE_WIDTH } = SIGNAL_PATH.NODE;

  nodeGroup
    .append('circle')
    .attr('r', RADIUS)
    .attr('fill', getNodeFillColor)
    .attr('stroke', VISUALIZATION_COLORS.UI.DARK_BG)
    .attr('stroke-width', STROKE_WIDTH)
    .style('filter', shouldApplyGlow);
}

function drawNodeLabels(
  nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>
): void {
  const { PRIMARY_FONT_SIZE } = DIAGRAM_CONFIG.LABEL;

  nodeGroup
    .append('text')
    .text((d) => d.name)
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .attr('fill', VISUALIZATION_COLORS.UI.TEXT_PRIMARY)
    .attr('font-size', PRIMARY_FONT_SIZE)
    .attr('font-weight', 'bold')
    .style('pointer-events', 'none');
}

function drawNodeTypeLabels(
  nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>
): void {
  const { SECONDARY_FONT_SIZE, SECONDARY_Y_OFFSET } = DIAGRAM_CONFIG.LABEL;

  nodeGroup
    .append('text')
    .text((d) => d.type)
    .attr('text-anchor', 'middle')
    .attr('dy', SECONDARY_Y_OFFSET)
    .attr('fill', VISUALIZATION_COLORS.UI.TEXT_SECONDARY)
    .attr('font-size', SECONDARY_FONT_SIZE)
    .style('pointer-events', 'none');
}

function handleDragStart(
  event: d3.D3DragEvent<SVGGElement, NodeDatum, DragSubject>,
  simulation: d3.Simulation<NodeDatum, undefined>
): void {
  const subject = event.subject;
  if (!isNodeDatum(subject)) {
    return;
  }

  if (!event.active) {
    simulation.alphaTarget(DIAGRAM_CONFIG.DRAG.ALPHA_TARGET).restart();
  }
  subject.fx = subject.x ?? 0;
  subject.fy = subject.y ?? 0;
}

function handleDrag(event: d3.D3DragEvent<SVGGElement, NodeDatum, DragSubject>): void {
  const subject = event.subject;
  if (!isNodeDatum(subject)) {
    return;
  }

  subject.fx = event.x;
  subject.fy = event.y;
}

function handleDragEnd(
  event: d3.D3DragEvent<SVGGElement, NodeDatum, DragSubject>,
  simulation: d3.Simulation<NodeDatum, undefined>
): void {
  const subject = event.subject;
  if (!isNodeDatum(subject)) {
    return;
  }

  if (!event.active) {
    simulation.alphaTarget(0);
  }
  subject.fx = null;
  subject.fy = null;
}

function createDragBehavior(
  simulation: d3.Simulation<NodeDatum, undefined>
): d3.DragBehavior<SVGGElement, NodeDatum, DragSubject> {
  return d3
    .drag<SVGGElement, NodeDatum>()
    .subject((_event, d) => d)
    .on('start', (event) => handleDragStart(event, simulation))
    .on('drag', handleDrag)
    .on('end', (event) => handleDragEnd(event, simulation));
}

function getCoordinate(
  value: NodeDatum | string | number | undefined,
  axis: 'x' | 'y'
): number {
  if (typeof value === 'object' && value !== null) {
    const coordinate = (value as NodeDatum)[axis];
    return typeof coordinate === 'number' ? coordinate : 0;
  }
  return 0;
}

function updatePositionsOnTick(
  linkSelection: d3.Selection<SVGLineElement, LinkDatum, SVGGElement, unknown>,
  nodeGroup: d3.Selection<SVGGElement, NodeDatum, SVGGElement, unknown>
): void {
  linkSelection
    .attr('x1', (d) => getCoordinate(d.source as NodeDatum, 'x'))
    .attr('y1', (d) => getCoordinate(d.source as NodeDatum, 'y'))
    .attr('x2', (d) => getCoordinate(d.target as NodeDatum, 'x'))
    .attr('y2', (d) => getCoordinate(d.target as NodeDatum, 'y'));

  nodeGroup.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
}

export const SignalPathDiagram: React.FC<SignalPathDiagramProps> = ({
  pedals,
  width = DEFAULT_DIMENSIONS.WIDTH,
  height = DEFAULT_DIMENSIONS.HEIGHT,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || pedals.length === 0) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = createNodesData(pedals, width, height);
    const links = createLinksData(nodes);
    const simulation = createForceSimulation(nodes, links, width, height);

    const container = svg.append('g');
    const zoom = createZoomBehavior(container);
    svg.call(zoom);

    const defs = container.append('defs');
    createArrowMarker(defs);
    createGlowFilter(defs);

    const linkSelection = drawLinks(container, links);

    const nodeGroup = container
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(createDragBehavior(simulation));

    drawNodeCircles(nodeGroup);
    drawNodeLabels(nodeGroup);
    drawNodeTypeLabels(nodeGroup);

    simulation.on('tick', () => {
      updatePositionsOnTick(linkSelection, nodeGroup);
    });

    return () => {
      simulation.stop();
    };
  }, [pedals, width, height]);

  return (
    <div className={cn('relative bg-gray-950 rounded-lg p-4', className)}>
      <div className="text-xs font-bold text-gray-400 uppercase mb-2">
        Signal Path (Drag nodes, zoom/pan)
      </div>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
