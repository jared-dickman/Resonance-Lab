'use client';

import { useEffect, useRef } from 'react';
import { NOTATION } from '@/lib/constants/visualization.constants';
import {
  type Note,
  createVexFlowRenderer,
  createStave,
  createStaveNotes,
  formatAndRenderVoice,
  getDefaultNotes,
} from '@/lib/utils/notation/notation.utils';

interface NotationDisplayProps {
  notes?: Note[];
  width?: number;
  height?: number;
  clef?: 'treble' | 'bass';
  timeSignature?: string;
}

function renderNotation(
  container: HTMLDivElement,
  notes: Note[],
  config: { width: number; height: number; clef: 'treble' | 'bass'; timeSignature: string }
): void {
  const renderer = createVexFlowRenderer(container, config.width, config.height);
  const context = renderer.getContext();
  const stave = createStave(context, config.width, config.clef, config.timeSignature);
  const staveNotes = createStaveNotes(notes, config.clef);

  formatAndRenderVoice(context, stave, staveNotes, config.width);
}

function getClefLabel(clef: 'treble' | 'bass'): string {
  return NOTATION.CLEF_EMOJI[clef];
}

export const NotationDisplay: React.FC<NotationDisplayProps> = ({
  notes = getDefaultNotes(),
  width = NOTATION.DEFAULT_DIMENSIONS.WIDTH,
  height = NOTATION.DEFAULT_DIMENSIONS.HEIGHT,
  clef = NOTATION.DEFAULT_CLEF,
  timeSignature = NOTATION.DEFAULT_TIME_SIGNATURE,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    try {
      renderNotation(containerRef.current, notes, { width, height, clef, timeSignature });
    } catch (error) {
      console.error('VexFlow rendering error:', error);
    }
  }, [notes, width, height, clef, timeSignature]);

  return (
    <div className="bg-gray-950 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Sheet Music</h3>
        <div className="text-sm text-gray-400">
          {getClefLabel(clef)} • {timeSignature}
        </div>
      </div>
      <div
        ref={containerRef}
        className="bg-white rounded overflow-hidden"
        style={{ width, height }}
      />
    </div>
  );
};

export { chordToNotation } from '@/lib/utils/notation/notation.utils';
