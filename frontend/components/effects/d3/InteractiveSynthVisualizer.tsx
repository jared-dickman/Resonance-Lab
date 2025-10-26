'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  CANVAS_DIMENSIONS,
  INTERACTIVE_SYNTH,
  VISUALIZATION_COLORS,
} from '@/lib/constants/visualization.constants';
import {
  type Note,
  createSynth,
  triggerNote,
  releaseNoteFromSynth,
  createNoteRecord,
  addToNoteHistory,
  drawWaveform,
  createSVGStructure,
  updateKeyStates,
} from '@/lib/utils/audio/synth.utils';

interface InteractiveSynthVisualizerProps {
  width?: number;
  height?: number;
}

function useKeyboardControls(
  playNote: (note: string) => void,
  releaseNote: (note: string) => void,
  activeNotes: Set<string>
): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const note = INTERACTIVE_SYNTH.KEYBOARD_MAPPING[e.key.toLowerCase() as keyof typeof INTERACTIVE_SYNTH.KEYBOARD_MAPPING];
      if (note && !activeNotes.has(note)) {
        playNote(note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent): void => {
      const note = INTERACTIVE_SYNTH.KEYBOARD_MAPPING[e.key.toLowerCase() as keyof typeof INTERACTIVE_SYNTH.KEYBOARD_MAPPING];
      if (note) {
        releaseNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playNote, releaseNote, activeNotes]);
}

export const InteractiveSynthVisualizer: React.FC<InteractiveSynthVisualizerProps> = ({
  width = CANVAS_DIMENSIONS.INTERACTIVE_SYNTH.WIDTH,
  height = CANVAS_DIMENSIONS.INTERACTIVE_SYNTH.HEIGHT,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const synthRef = useRef<ReturnType<typeof createSynth> | null>(null);
  const animationRef = useRef<number>();
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [noteHistory, setNoteHistory] = useState<Note[]>([]);

  const playNote = (note: string): void => {
    if (!synthRef.current) return;

    triggerNote(synthRef.current.synth, note);
    setActiveNotes((prev) => new Set(prev).add(note));

    const newNote = createNoteRecord(note);
    setNoteHistory((prev) => addToNoteHistory(prev, newNote));
  };

  const releaseNote = (note: string): void => {
    if (!synthRef.current) return;

    releaseNoteFromSynth(synthRef.current.synth, note);
    setActiveNotes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  useKeyboardControls(playNote, releaseNote, activeNotes);

  useEffect(() => {
    const resources = createSynth();
    synthRef.current = resources;

    const visualize = (): void => {
      if (!svgRef.current || !synthRef.current) return;

      const waveform = synthRef.current.analyzer.getValue() as Float32Array;
      const svg = d3.select(svgRef.current);
      const vizGroup = svg.select<SVGGElement>('.visualization');

      if (!vizGroup.empty()) {
        drawWaveform(vizGroup, waveform, width);
      }

      animationRef.current = requestAnimationFrame(visualize);
    };

    visualize();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resources.synth.dispose();
      resources.analyzer.dispose();
    };
  }, [width]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    createSVGStructure(svg, width, playNote, releaseNote);
  }, [width, height]);

  useEffect(() => {
    updateKeyStates(svgRef.current, activeNotes);
  }, [activeNotes]);

  return (
    <div className="bg-gray-950 rounded-lg p-6 border border-gray-800">
      <svg ref={svgRef} width={width} height={height} />

      <div className="mt-4 p-3 bg-gray-900 rounded">
        <div className="text-sm font-semibold text-gray-400 mb-2">Recent Notes</div>
        <div className="flex flex-wrap gap-2">
          {noteHistory.slice(-INTERACTIVE_SYNTH.DISPLAY_LIMIT).map((note, i) => {
            const color = VISUALIZATION_COLORS.NOTE_COLORS[note.note as keyof typeof VISUALIZATION_COLORS.NOTE_COLORS];
            return (
              <div
                key={`${note.note}-${note.time}-${i}`}
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{
                  backgroundColor: color + '40',
                  color: color,
                  border: `1px solid ${color}`,
                }}
              >
                {note.note}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-900 rounded text-xs text-gray-400">
        <div className="font-semibold mb-1">How to Play:</div>
        <ul className="space-y-1">
          <li>• Click the colored keys to play notes</li>
          <li>• Use keyboard keys A-S-D-F-G-H-J-K for C4-C5 scale</li>
          <li>• Watch the waveform visualization react to your playing</li>
        </ul>
      </div>
    </div>
  );
};
