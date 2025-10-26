'use client';

import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Chord, Note } from 'tonal';
import * as d3 from 'd3';

import {
  CANVAS_DIMENSIONS,
  AUDIO_ANALYSIS,
  VISUALIZATION_COLORS,
} from '@/lib/constants/visualization.constants';
import { createConnectedFFTAnalyzer } from '@/lib/utils/audio/analyzer.utils';

interface ChordAnalyzerProps {
  audioNode?: Tone.ToneAudioNode;
  width?: number;
  height?: number;
}

interface DetectedChord {
  name: string;
  notes: string[];
  timestamp: number;
  confidence: number;
}

interface Peak {
  index: number;
  value: number;
}

const CHORD_CONFIG = {
  HISTORY_LENGTH: 10,
  MIN_NOTES_FOR_CHORD: AUDIO_ANALYSIS.CHORD_DETECTION.MIN_NOTES_FOR_CHORD,
  PEAK_COUNT: AUDIO_ANALYSIS.CHORD_DETECTION.PEAK_COUNT,
  CONFIDENCE_DIVISOR: 6,
  PERCENTAGE_MULTIPLIER: 100,
} as const;

const CHART_CONFIG = {
  MARGIN: {
    TOP: 20,
    RIGHT: 20,
    BOTTOM: 40,
    LEFT: 60,
  },
  BAR_GAP: 2,
  GRID_TICKS: 5,
  Y_AXIS_TICKS: 5,
  GRID_OPACITY: 0.2,
  BAR_OPACITY: 0.8,
  LABEL_OFFSET: 20,
  LABEL_FONT_SIZE: 10,
  AXIS_LABEL_FONT_SIZE: 12,
  Y_AXIS_LABEL_OFFSET: -40,
  COLOR_SATURATION: 70,
  COLOR_LIGHTNESS: 50,
} as const;

const CONFIDENCE_DISPLAY = {
  OUTER_SIZE: 12,
  INNER_SIZE: 10,
  DEGREES_PER_UNIT: 360,
} as const;

const SAMPLE_RATE = 44100;

function findPeaksInFFTData(fftData: Float32Array, numPeaks: number): number[] {
  const peaks: Peak[] = [];

  for (let i = 1; i < fftData.length - 1; i++) {
    const current = fftData[i];
    const prev = fftData[i - 1];
    const next = fftData[i + 1];

    if (current > prev && current > next) {
      peaks.push({ index: i, value: current });
    }
  }

  return peaks
    .sort((a, b) => b.value - a.value)
    .slice(0, numPeaks)
    .map((peak) => peak.index);
}

function convertBinToFrequency(bin: number, fftSize: number, sampleRate: number): number {
  return (bin * sampleRate) / fftSize;
}

function convertFrequencyToNote(frequency: number): string | null {
  const { MIN, MAX } = AUDIO_ANALYSIS.CHORD_DETECTION.FREQUENCY_RANGE;

  if (frequency < MIN || frequency > MAX) {
    return null;
  }

  const A4_FREQUENCY = 440;
  const A4_MIDI = 69;
  const SEMITONES_PER_OCTAVE = 12;

  const noteNum = SEMITONES_PER_OCTAVE * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI;
  const rounded = Math.round(noteNum);

  return Note.fromMidi(rounded);
}

function extractNotesFromFFT(fftValues: Float32Array, fftSize: number): string[] {
  const peaks = findPeaksInFFTData(fftValues, CHORD_CONFIG.PEAK_COUNT);

  const frequencies = peaks.map((binIndex) =>
    convertBinToFrequency(binIndex, fftSize, SAMPLE_RATE)
  );

  const notes = frequencies
    .map(convertFrequencyToNote)
    .filter((note): note is string => note !== null);

  return notes;
}

function calculateChordConfidence(noteCount: number): number {
  return noteCount / CHORD_CONFIG.CONFIDENCE_DIVISOR;
}

function createDetectedChord(chordName: string, notes: string[]): DetectedChord {
  return {
    name: chordName,
    notes,
    timestamp: Date.now(),
    confidence: calculateChordConfidence(notes.length),
  };
}

function detectChordFromNotes(notes: string[]): string | null {
  if (notes.length < CHORD_CONFIG.MIN_NOTES_FOR_CHORD) {
    return null;
  }

  const detectedChords = Chord.detect(notes);
  return detectedChords.length > 0 ? detectedChords[0] ?? null : null;
}

function updateChordHistory(
  previousHistory: DetectedChord[],
  newChord: DetectedChord
): DetectedChord[] {
  const maxHistory = CHORD_CONFIG.HISTORY_LENGTH - 1;
  return [...previousHistory.slice(-maxHistory), newChord];
}

function calculateChartDimensions(
  width: number,
  height: number
): { width: number; height: number } {
  const { TOP, RIGHT, BOTTOM, LEFT } = CHART_CONFIG.MARGIN;

  return {
    width: width - LEFT - RIGHT,
    height: height - TOP - BOTTOM,
  };
}

function createXScale(historyLength: number, chartWidth: number): d3.ScaleLinear<number, number> {
  return d3.scaleLinear().domain([0, historyLength - 1]).range([0, chartWidth]);
}

function createYScale(chartHeight: number): d3.ScaleLinear<number, number> {
  return d3.scaleLinear().domain([0, 1]).range([chartHeight, 0]);
}

function drawGridLines(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleLinear<number, number>,
  chartHeight: number
): void {
  group
    .append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScale).ticks(CHART_CONFIG.GRID_TICKS).tickSize(-chartHeight).tickFormat(() => ''))
    .attr('stroke', VISUALIZATION_COLORS.UI.BORDER)
    .attr('stroke-opacity', CHART_CONFIG.GRID_OPACITY);
}

function calculateBarColor(index: number, historyLength: number): string {
  const { COLOR_SATURATION, COLOR_LIGHTNESS } = CHART_CONFIG;
  const hue = (index / historyLength) * CONFIDENCE_DISPLAY.DEGREES_PER_UNIT;
  return `hsl(${hue}, ${COLOR_SATURATION}%, ${COLOR_LIGHTNESS}%)`;
}

function drawChordBars(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  chordHistory: DetectedChord[],
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  chartWidth: number,
  chartHeight: number
): void {
  const barWidth = chartWidth / chordHistory.length - CHART_CONFIG.BAR_GAP;

  group
    .selectAll('.chord-bar')
    .data(chordHistory)
    .enter()
    .append('rect')
    .attr('class', 'chord-bar')
    .attr('x', (_d, i) => xScale(i) ?? 0)
    .attr('y', (d) => yScale(d.confidence) ?? 0)
    .attr('width', barWidth)
    .attr('height', (d) => chartHeight - (yScale(d.confidence) ?? 0))
    .attr('fill', (_d, i) => calculateBarColor(i, chordHistory.length))
    .attr('opacity', CHART_CONFIG.BAR_OPACITY);
}

function drawChordLabels(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  chordHistory: DetectedChord[],
  xScale: d3.ScaleLinear<number, number>,
  chartWidth: number,
  chartHeight: number
): void {
  const labelX = (index: number) =>
    (xScale(index) ?? 0) + chartWidth / chordHistory.length / 2;

  group
    .selectAll('.chord-label')
    .data(chordHistory)
    .enter()
    .append('text')
    .attr('class', 'chord-label')
    .attr('x', (_d, i) => labelX(i))
    .attr('y', chartHeight + CHART_CONFIG.LABEL_OFFSET)
    .attr('text-anchor', 'middle')
    .attr('fill', VISUALIZATION_COLORS.UI.TEXT_SECONDARY)
    .attr('font-size', CHART_CONFIG.LABEL_FONT_SIZE)
    .text((d) => d.name);
}

function drawYAxis(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  yScale: d3.ScaleLinear<number, number>
): void {
  group
    .append('g')
    .call(d3.axisLeft(yScale).ticks(CHART_CONFIG.Y_AXIS_TICKS))
    .attr('stroke', VISUALIZATION_COLORS.UI.TEXT_MUTED)
    .selectAll('text')
    .attr('fill', VISUALIZATION_COLORS.UI.TEXT_SECONDARY);
}

function drawYAxisLabel(
  group: d3.Selection<SVGGElement, unknown, null, undefined>,
  chartHeight: number
): void {
  group
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', CHART_CONFIG.Y_AXIS_LABEL_OFFSET)
    .attr('x', -chartHeight / 2)
    .attr('text-anchor', 'middle')
    .attr('fill', VISUALIZATION_COLORS.UI.TEXT_SECONDARY)
    .attr('font-size', CHART_CONFIG.AXIS_LABEL_FONT_SIZE)
    .text('Confidence');
}

function renderConfidenceIndicator(chord: DetectedChord): JSX.Element {
  const confidencePercentage = Math.round(
    chord.confidence * CHORD_CONFIG.PERCENTAGE_MULTIPLIER
  );

  const confidenceDegrees = chord.confidence * CONFIDENCE_DISPLAY.DEGREES_PER_UNIT;

  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center"
      style={{
        background: `conic-gradient(from 0deg, ${VISUALIZATION_COLORS.KEY_TYPES.MAJOR} ${confidenceDegrees}deg, ${VISUALIZATION_COLORS.UI.DARK_BG} ${confidenceDegrees}deg)`,
      }}
    >
      <div className="w-10 h-10 bg-gray-950 rounded-full flex items-center justify-center">
        <span className="text-xs text-gray-400">{confidencePercentage}%</span>
      </div>
    </div>
  );
}

function renderDetectedChordDisplay(chord: DetectedChord): JSX.Element {
  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <div className="text-2xl font-bold text-blue-400">{chord.name}</div>
        <div className="text-xs text-gray-500">{chord.notes.join(' - ')}</div>
      </div>
      {renderConfidenceIndicator(chord)}
    </div>
  );
}

export const ChordAnalyzer: React.FC<ChordAnalyzerProps> = ({
  audioNode,
  width = CANVAS_DIMENSIONS.CHORD_ANALYZER.WIDTH,
  height = CANVAS_DIMENSIONS.CHORD_ANALYZER.HEIGHT,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [detectedChord, setDetectedChord] = useState<DetectedChord | null>(null);
  const [chordHistory, setChordHistory] = useState<DetectedChord[]>([]);
  const analyzerRef = useRef<Tone.FFT | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const analyzer = createConnectedFFTAnalyzer(
      AUDIO_ANALYSIS.FFT_SIZE.LARGE,
      audioNode
    );
    analyzerRef.current = analyzer;

    const detectChord = (): void => {
      const fftValues = analyzer.getValue() as Float32Array;
      const notes = extractNotesFromFFT(fftValues, AUDIO_ANALYSIS.FFT_SIZE.LARGE);
      const chordName = detectChordFromNotes(notes);

      if (chordName) {
        const newChord = createDetectedChord(chordName, notes);
        setDetectedChord(newChord);
        setChordHistory((prev) => updateChordHistory(prev, newChord));
      }

      animationRef.current = requestAnimationFrame(detectChord);
    };

    detectChord();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      analyzer.dispose();
    };
  }, [audioNode]);

  useEffect(() => {
    if (!svgRef.current || chordHistory.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chartDimensions = calculateChartDimensions(width, height);
    const { TOP, LEFT } = CHART_CONFIG.MARGIN;

    const mainGroup = svg
      .append('g')
      .attr('transform', `translate(${LEFT},${TOP})`);

    const xScale = createXScale(chordHistory.length, chartDimensions.width);
    const yScale = createYScale(chartDimensions.height);

    drawGridLines(mainGroup, xScale, chartDimensions.height);
    drawChordBars(mainGroup, chordHistory, xScale, yScale, chartDimensions.width, chartDimensions.height);
    drawChordLabels(mainGroup, chordHistory, xScale, chartDimensions.width, chartDimensions.height);
    drawYAxis(mainGroup, yScale);
    drawYAxisLabel(mainGroup, chartDimensions.height);
  }, [chordHistory, width, height]);

  return (
    <div className="bg-gray-950 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Chord Analyzer</h3>
        {detectedChord && renderDetectedChordDisplay(detectedChord)}
      </div>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
