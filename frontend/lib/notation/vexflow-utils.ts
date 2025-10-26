/**
 * VexFlow Notation Utilities
 * Clean wrapper for music notation and tablature rendering
 */

import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';

/**
 * Initialize VexFlow renderer
 */
export function createRenderer(
  container: HTMLElement | string,
  width: number,
  height: number
) {
  const renderer = new Renderer(
    container as HTMLDivElement | string,
    Renderer.Backends.SVG
  );
  renderer.resize(width, height);
  const context = renderer.getContext();

  return { renderer, context };
}

/**
 * Create a music staff
 */
export function createStaff(
  context: ReturnType<typeof createRenderer>['context'],
  x: number,
  y: number,
  width: number
) {
  const stave = new Stave(x, y, width);
  stave.addClef('treble').addTimeSignature('4/4');
  stave.setContext(context).draw();

  return stave;
}

/**
 * Parse UG-style chord notation to VexFlow format
 * Example: "C" -> ["c/4"], "Cmaj7" -> ["c/4", "e/4", "g/4", "b/4"]
 */
export function parseChordToNotes(chordSymbol: string, octave = 4): string[] {
  // This is a simplified parser - you'll enhance based on Tonal.js integration
  const root = chordSymbol[0]?.toLowerCase() || 'c';
  return [`${root}/${octave}`];
}

/**
 * Create notes from chord symbols
 */
export function createNotesFromChords(
  chordSymbols: string[],
  duration: string = 'w'
): StaveNote[] {
  return chordSymbols.map((chord) => {
    const keys = parseChordToNotes(chord);

    const note = new StaveNote({
      keys,
      duration,
    });

    // Add accidentals if needed
    keys.forEach((key, index) => {
      if (key.includes('#')) {
        note.addModifier(new Accidental('#'), index);
      } else if (key.includes('b')) {
        note.addModifier(new Accidental('b'), index);
      }
    });

    return note;
  });
}

/**
 * Render chord progression as notation
 */
export function renderChordProgression(
  container: HTMLElement,
  chords: string[],
  options: {
    width?: number;
    height?: number;
    noteDuration?: string;
  } = {}
) {
  const { width = 800, height = 200, noteDuration = 'w' } = options;

  // Clear container
  container.innerHTML = '';

  const { context } = createRenderer(container, width, height);
  const stave = createStaff(context, 10, 40, width - 20);

  const notes = createNotesFromChords(chords, noteDuration);

  const voice = new Voice({
    numBeats: chords.length,
    beatValue: 4,
  });

  voice.addTickables(notes);

  new Formatter().joinVoices([voice]).format([voice], width - 50);

  voice.draw(context, stave);

  return { stave, notes, voice };
}

/**
 * Guitar tablature utilities
 */
export const tabUtils = {
  /**
   * Parse UG-style tab to VexFlow format
   * Example input:
   * e|---0---1---3---|
   * B|---1---1---0---|
   * G|---0---2---0---|
   * D|---2---3---0---|
   * A|---3---3---2---|
   * E|---x---x---3---|
   */
  parseUGTab: (tabString: string) => {
    const lines = tabString.trim().split('\n');
    const positions: Array<{
      string: number;
      fret: string;
      position: number;
    }> = [];

    lines.forEach((line, stringIndex) => {
      const frets = line.split('|')[1]?.match(/[0-9x-]/g) || [];
      frets.forEach((fret, position) => {
        if (fret !== '-') {
          positions.push({
            string: stringIndex + 1,
            fret,
            position,
          });
        }
      });
    });

    return positions;
  },

  /**
   * Create tablature notation
   * (VexFlow has TabStave and TabNote for this)
   */
  createTab: (
    container: HTMLElement,
    positions: Array<{ string: number; fret: string }>,
    options: { width?: number; height?: number } = {}
  ) => {
    const { width = 600, height = 150 } = options;
    container.innerHTML = '';

    // This is a placeholder - full tab rendering requires TabStave
    const { context } = createRenderer(container, width, height);

    // You'd use TabStave here for proper tab rendering
    // const tabStave = new TabStave(10, 40, width - 20);
    // tabStave.setContext(context).draw();

    return { context, positions };
  },
};

/**
 * Notation display options
 */
export interface NotationOptions {
  width?: number;
  height?: number;
  showTimeSignature?: boolean;
  showClef?: boolean;
  clefType?: 'treble' | 'bass' | 'alto' | 'tenor';
  timeSignature?: string;
  highlightCurrent?: boolean;
}

/**
 * Advanced notation renderer with highlighting
 */
export class NotationRenderer {
  private container: HTMLElement;
  private options: NotationOptions;

  constructor(container: HTMLElement, options: NotationOptions = {}) {
    this.container = container;
    this.options = {
      width: 800,
      height: 200,
      showTimeSignature: true,
      showClef: true,
      clefType: 'treble',
      timeSignature: '4/4',
      highlightCurrent: true,
      ...options,
    };
  }

  render(chords: string[], currentIndex?: number) {
    this.container.innerHTML = '';

    const { width = 800, height = 200 } = this.options;
    const { context } = createRenderer(this.container, width, height);

    const stave = new Stave(10, 40, width - 20);

    if (this.options.showClef) {
      stave.addClef(this.options.clefType || 'treble');
    }

    if (this.options.showTimeSignature) {
      stave.addTimeSignature(this.options.timeSignature || '4/4');
    }

    stave.setContext(context).draw();

    // Create and render notes
    const notes = createNotesFromChords(chords);

    // Highlight current note
    if (
      this.options.highlightCurrent &&
      currentIndex !== undefined &&
      notes[currentIndex]
    ) {
      notes[currentIndex]?.setStyle({
        fillStyle: '#8b5cf6',
        strokeStyle: '#8b5cf6',
      });
    }

    const voice = new Voice({
      numBeats: chords.length,
      beatValue: 4,
    });

    voice.addTickables(notes);

    new Formatter().joinVoices([voice]).format([voice], width - 50);

    voice.draw(context, stave);
  }

  clear() {
    this.container.innerHTML = '';
  }
}
