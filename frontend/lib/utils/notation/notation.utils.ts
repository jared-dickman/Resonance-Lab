/**
 * Notation Utilities
 * Helper functions for VexFlow music notation rendering
 */

import { Formatter, Renderer, Stave, StaveNote, Voice, Beam } from 'vexflow';
import {
  NOTATION,
  CHORD_TO_NOTES_MAP,
  DEFAULT_NOTATION_NOTES,
} from '@/lib/constants/visualization.constants';

export interface Note {
  keys: string[];
  duration: string;
}

export interface NotationConfig {
  width: number;
  height: number;
  clef: 'treble' | 'bass';
  timeSignature: string;
}

export interface RenderContext {
  context: any;
  stave: Stave;
  width: number;
}

export function createVexFlowRenderer(container: HTMLDivElement, width: number, height: number): Renderer {
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(width, height);
  return renderer;
}

export function createStave(
  context: any,
  width: number,
  clef: 'treble' | 'bass',
  timeSignature: string
): Stave {
  const staveWidth = width - NOTATION.STAVE.PADDING_HORIZONTAL;
  const stave = new Stave(NOTATION.STAVE.MARGIN_X, NOTATION.STAVE.MARGIN_TOP, staveWidth);

  stave.addClef(clef);
  stave.addTimeSignature(timeSignature);
  stave.setContext(context).draw();

  return stave;
}

export function createStaveNotes(notes: readonly Note[], clef: 'treble' | 'bass'): StaveNote[] {
  return notes.map(
    (note) =>
      new StaveNote({
        keys: [...note.keys],
        duration: note.duration,
        clef,
      })
  );
}

export function formatAndRenderVoice(
  context: any,
  stave: Stave,
  staveNotes: StaveNote[],
  width: number
): void {
  const voice = new Voice({
    numBeats: NOTATION.VOICE.NUM_BEATS,
    beatValue: NOTATION.VOICE.BEAT_VALUE,
  });

  voice.addTickables(staveNotes);

  const formatWidth = width - NOTATION.FORMAT.MARGIN_HORIZONTAL;
  new Formatter().joinVoices([voice]).format([voice], formatWidth);

  voice.draw(context, stave);

  renderBeams(context, staveNotes);
}

export function renderBeams(context: any, staveNotes: StaveNote[]): void {
  const beams = Beam.generateBeams(staveNotes);
  beams.forEach((beam) => beam.setContext(context).draw());
}

export function chordToNotation(chordName: string): Note[] {
  const keys = CHORD_TO_NOTES_MAP[chordName as keyof typeof CHORD_TO_NOTES_MAP] || CHORD_TO_NOTES_MAP.C;
  return [{ keys: [...keys], duration: 'w' }];
}

export function getDefaultNotes(): Note[] {
  return DEFAULT_NOTATION_NOTES.map((note) => ({
    keys: [...note.keys],
    duration: note.duration,
  }));
}
