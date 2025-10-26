/**
 * Synth Utilities
 * Helper functions for interactive synthesizer visualization
 */

import * as Tone from 'tone';
import * as d3 from 'd3';
import { INTERACTIVE_SYNTH, VISUALIZATION_COLORS } from '@/lib/constants/visualization.constants';

export interface Note {
  note: string;
  time: number;
  velocity: number;
  duration: number;
}

export interface SynthResources {
  synth: Tone.PolySynth;
  analyzer: Tone.Analyser;
}

const VISUALIZATION_CONFIG = {
  MARGIN: 20,
  VIZ_OFFSET_Y: 30,
  VIZ_HEIGHT: 200,
  PIANO_OFFSET_Y: 260,
  KEY_SPACING: 4,
  GRID_LINE_COUNT: 4,
  GLOW_STD_DEVIATION: 3,
  TITLE_FONT_SIZE: 18,
  NOTE_FONT_SIZE: 16,
  HINT_FONT_SIZE: 12,
} as const;

export function createSynth(): SynthResources {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: INTERACTIVE_SYNTH.SYNTH_CONFIG.OSCILLATOR_TYPE as any,
    },
    envelope: {
      attack: INTERACTIVE_SYNTH.SYNTH_CONFIG.ENVELOPE.ATTACK,
      decay: INTERACTIVE_SYNTH.SYNTH_CONFIG.ENVELOPE.DECAY,
      sustain: INTERACTIVE_SYNTH.SYNTH_CONFIG.ENVELOPE.SUSTAIN,
      release: INTERACTIVE_SYNTH.SYNTH_CONFIG.ENVELOPE.RELEASE,
    },
  }).toDestination();

  synth.volume.value = INTERACTIVE_SYNTH.SYNTH_CONFIG.VOLUME;

  const analyzer = new Tone.Analyser('waveform', 2048);
  synth.connect(analyzer);

  return { synth, analyzer };
}

export function triggerNote(synth: Tone.PolySynth, note: string): void {
  Tone.start();
  synth.triggerAttack(note);
}

export function releaseNoteFromSynth(synth: Tone.PolySynth, note: string): void {
  synth.triggerRelease([note]);
}

export function createNoteRecord(note: string): Note {
  return {
    note,
    time: Date.now(),
    velocity: 0.8,
    duration: 0,
  };
}

export function addToNoteHistory(history: Note[], newNote: Note): Note[] {
  return [...history.slice(-INTERACTIVE_SYNTH.HISTORY_LIMIT), newNote];
}

export function getKeyboardHints(): string {
  return 'ASDFGHJK';
}

export function calculateKeyWidth(width: number): number {
  const contentWidth = width - VISUALIZATION_CONFIG.MARGIN * 2;
  return contentWidth / INTERACTIVE_SYNTH.NOTES.length;
}

export function drawWaveform(
  vizGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  waveform: Float32Array,
  width: number
): void {
  const vizWidth = width - VISUALIZATION_CONFIG.MARGIN * 2;

  vizGroup.selectAll('path').remove();

  const xScale = d3.scaleLinear().domain([0, waveform.length]).range([0, vizWidth]);
  const yScale = d3.scaleLinear().domain([-1, 1]).range([VISUALIZATION_CONFIG.VIZ_HEIGHT, 0]);

  const line = d3
    .line<number>()
    .x((_d, i) => xScale(i))
    .y((d) => yScale(d))
    .curve(d3.curveBasis);

  vizGroup
    .append('path')
    .datum(Array.from(waveform))
    .attr('fill', 'none')
    .attr('stroke', VISUALIZATION_COLORS.NOTE_COLORS.B)
    .attr('stroke-width', 2)
    .attr('d', line)
    .attr('filter', 'url(#glow)');
}

type SvgRootSelection = d3.Selection<SVGSVGElement, unknown, null, undefined>;

export function createSVGStructure(
  svg: SvgRootSelection,
  width: number,
  playNote: (note: string) => void,
  releaseNote: (note: string) => void
): void {
  svg.selectAll('*').remove();

  const g = svg.append('g').attr('transform', `translate(${VISUALIZATION_CONFIG.MARGIN}, ${VISUALIZATION_CONFIG.MARGIN})`);

  addTitle(g);
  const vizGroup = addVisualizationArea(g, width);
  addGridLines(vizGroup, width);
  addPianoKeys(g, width, playNote, releaseNote);
  addGlowFilter(svg);
}

function addTitle(g: d3.Selection<SVGGElement, unknown, null, undefined>): void {
  g.append('text')
    .attr('x', 0)
    .attr('y', -5)
    .attr('fill', VISUALIZATION_COLORS.UI.TEXT_PRIMARY)
    .attr('font-size', VISUALIZATION_CONFIG.TITLE_FONT_SIZE)
    .attr('font-weight', 'bold')
    .text('Interactive Synth Visualizer');
}

function addVisualizationArea(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number
): d3.Selection<SVGGElement, unknown, null, undefined> {
  const vizGroup = g.append('g')
    .attr('class', 'visualization')
    .attr('transform', `translate(0, ${VISUALIZATION_CONFIG.VIZ_OFFSET_Y})`);

  const vizWidth = width - VISUALIZATION_CONFIG.MARGIN * 2;

  vizGroup
    .append('rect')
    .attr('width', vizWidth)
    .attr('height', VISUALIZATION_CONFIG.VIZ_HEIGHT)
    .attr('fill', VISUALIZATION_COLORS.UI.DARK_BG)
    .attr('rx', 8);

  return vizGroup;
}

function addGridLines(
  vizGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number
): void {
  const vizWidth = width - VISUALIZATION_CONFIG.MARGIN * 2;

  for (let i = 0; i <= VISUALIZATION_CONFIG.GRID_LINE_COUNT; i++) {
    vizGroup
      .append('line')
      .attr('x1', 0)
      .attr('x2', vizWidth)
      .attr('y1', (VISUALIZATION_CONFIG.VIZ_HEIGHT / VISUALIZATION_CONFIG.GRID_LINE_COUNT) * i)
      .attr('y2', (VISUALIZATION_CONFIG.VIZ_HEIGHT / VISUALIZATION_CONFIG.GRID_LINE_COUNT) * i)
      .attr('stroke', VISUALIZATION_COLORS.UI.BORDER)
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);
  }
}

function addPianoKeys(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  width: number,
  playNote: (note: string) => void,
  releaseNote: (note: string) => void
): void {
  const keyGroup = g.append('g')
    .attr('class', 'keys')
    .attr('transform', `translate(0, ${VISUALIZATION_CONFIG.PIANO_OFFSET_Y})`);

  const keyWidth = calculateKeyWidth(width);
  const hints = getKeyboardHints();

  INTERACTIVE_SYNTH.NOTES.forEach((note, i) => {
    const keyG = keyGroup.append('g').attr('transform', `translate(${i * keyWidth}, 0)`);

    addKeyBackground(keyG, note, keyWidth, playNote, releaseNote);
    addKeyLabel(keyG, note, keyWidth);
    const hint = hints[i];
    if (hint) {
      addKeyHint(keyG, hint, keyWidth);
    }
  });
}

function addKeyBackground(
  keyG: d3.Selection<SVGGElement, unknown, null, undefined>,
  note: string,
  keyWidth: number,
  playNote: (note: string) => void,
  releaseNote: (note: string) => void
): void {
  const color = VISUALIZATION_COLORS.NOTE_COLORS[note as keyof typeof VISUALIZATION_COLORS.NOTE_COLORS];

  keyG
    .append('rect')
    .attr('width', keyWidth - VISUALIZATION_CONFIG.KEY_SPACING)
    .attr('height', INTERACTIVE_SYNTH.KEY_DIMENSIONS.HEIGHT)
    .attr('rx', INTERACTIVE_SYNTH.KEY_DIMENSIONS.BORDER_RADIUS)
    .attr('fill', '#1f2937')
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('class', `key-${note}`)
    .style('cursor', 'pointer')
    .on('mousedown', () => playNote(note))
    .on('mouseup', () => releaseNote(note))
    .on('mouseleave', () => releaseNote(note));
}

function addKeyLabel(
  keyG: d3.Selection<SVGGElement, unknown, null, undefined>,
  note: string,
  keyWidth: number
): void {
  const color = VISUALIZATION_COLORS.NOTE_COLORS[note as keyof typeof VISUALIZATION_COLORS.NOTE_COLORS] || '#ffffff';

  keyG
    .append('text')
    .attr('x', keyWidth / 2 - 2)
    .attr('y', 50)
    .attr('text-anchor', 'middle')
    .attr('fill', color)
    .attr('font-size', VISUALIZATION_CONFIG.NOTE_FONT_SIZE)
    .attr('font-weight', 'bold')
    .style('pointer-events', 'none')
    .text(note);
}

function addKeyHint(
  keyG: d3.Selection<SVGGElement, unknown, null, undefined>,
  hint: string,
  keyWidth: number
): void {
  keyG
    .append('text')
    .attr('x', keyWidth / 2 - 2)
    .attr('y', 70)
    .attr('text-anchor', 'middle')
    .attr('fill', VISUALIZATION_COLORS.UI.TEXT_MUTED)
    .attr('font-size', VISUALIZATION_CONFIG.HINT_FONT_SIZE)
    .style('pointer-events', 'none')
    .text(hint);
}

function addGlowFilter(svg: SvgRootSelection): void {
  const defs = svg.append('defs');
  const filter = defs.append('filter').attr('id', 'glow');
  filter.append('feGaussianBlur')
    .attr('stdDeviation', VISUALIZATION_CONFIG.GLOW_STD_DEVIATION)
    .attr('result', 'coloredBlur');
  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
}

export function updateKeyStates(
  svgRef: SVGSVGElement | null,
  activeNotes: Set<string>
): void {
  if (!svgRef) {
    return;
  }
  const svg = d3.select<SVGSVGElement, unknown>(svgRef);

  INTERACTIVE_SYNTH.NOTES.forEach((note) => {
    const isActive = activeNotes.has(note);
    const color = VISUALIZATION_COLORS.NOTE_COLORS[note as keyof typeof VISUALIZATION_COLORS.NOTE_COLORS];

    svg
      .select(`.key-${note}`)
      .transition()
      .duration(100)
      .attr('fill', isActive ? color : '#1f2937')
      .attr('stroke-width', isActive ? 4 : 2);
  });
}
