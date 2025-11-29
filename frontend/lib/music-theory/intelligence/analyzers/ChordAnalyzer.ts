/**
 * ChordAnalyzer - Deep analysis of individual chords
 * Extracts musical properties for intelligent suggestions
 */

import { Chord, Note } from 'tonal';

export interface ChordAnalysis {
  /** Original chord symbol */
  symbol: string;
  /** Root note */
  root: string;
  /** Chord type (e.g., 'major', 'minor7', 'dominant7') */
  type: string;
  /** Component notes */
  notes: string[];
  /** Scale degrees in the key (if key provided) */
  degrees?: number[];
  /** Chord quality */
  quality: 'major' | 'minor' | 'diminished' | 'augmented' | 'suspended' | 'dominant' | 'unknown';
  /** Harmonic function (if key provided) */
  function?:
    | 'tonic'
    | 'subdominant'
    | 'dominant'
    | 'mediant'
    | 'submediant'
    | 'leading'
    | 'unknown';
  /** Tension level (0-1, higher = more tension) */
  tension: number;
  /** Confidence in analysis (0-1) */
  confidence: number;
}

export interface AnalysisContext {
  /** Musical key */
  key?: string;
  /** Previous chords for context */
  previousChords?: string[];
  /** Target genre */
  genre?: string;
}

export class ChordAnalyzer {
  /**
   * Analyze a single chord
   */
  analyze(chordSymbol: string, context: AnalysisContext = {}): ChordAnalysis {
    const chord = Chord.get(chordSymbol);

    if (chord.empty) {
      return {
        symbol: chordSymbol,
        root: '',
        type: '',
        notes: [],
        quality: 'unknown',
        tension: 0,
        confidence: 0,
      };
    }

    const quality = this.determineQuality(chord);
    const tension = this.calculateTension(chord, quality);
    const harmonicFunction = context.key
      ? this.determineFunction(chord.tonic ?? '', context.key)
      : undefined;

    return {
      symbol: chordSymbol,
      root: chord.tonic ?? '',
      type: chord.aliases[0] ?? chord.symbol,
      notes: chord.notes,
      quality,
      function: harmonicFunction,
      tension,
      confidence: 0.95,
    };
  }

  /**
   * Determine chord quality
   */
  private determineQuality(chord: ReturnType<typeof Chord.get>): ChordAnalysis['quality'] {
    const type = chord.aliases[0]?.toLowerCase() ?? '';

    if (type.includes('dim')) return 'diminished';
    if (type.includes('aug')) return 'augmented';
    if (type.includes('sus')) return 'suspended';
    if (type.includes('7') && !type.includes('maj7') && !type.includes('m7')) return 'dominant';
    if (type.includes('m') || type.includes('min')) return 'minor';
    if (type.includes('M') || type.includes('maj') || chord.quality === 'Major') return 'major';

    return 'unknown';
  }

  /**
   * Calculate tension level
   */
  private calculateTension(
    chord: ReturnType<typeof Chord.get>,
    quality: ChordAnalysis['quality']
  ): number {
    let tension = 0;

    // Base tension from quality
    switch (quality) {
      case 'major':
        tension = 0.2;
        break;
      case 'minor':
        tension = 0.4;
        break;
      case 'dominant':
        tension = 0.7;
        break;
      case 'diminished':
        tension = 0.9;
        break;
      case 'augmented':
        tension = 0.85;
        break;
      case 'suspended':
        tension = 0.5;
        break;
      default:
        tension = 0.5;
    }

    // Add tension for extensions
    if (chord.aliases[0]?.includes('9')) tension += 0.1;
    if (chord.aliases[0]?.includes('11')) tension += 0.15;
    if (chord.aliases[0]?.includes('13')) tension += 0.1;

    return Math.min(tension, 1);
  }

  /**
   * Determine harmonic function in key
   */
  private determineFunction(root: string, key: string): ChordAnalysis['function'] {
    const rootClass = Note.get(root).chroma;
    const keyClass = Note.get(key).chroma;

    if (rootClass === null || keyClass === null) return 'unknown';

    const degree = (rootClass - keyClass + 12) % 12;

    switch (degree) {
      case 0:
        return 'tonic';
      case 5:
        return 'subdominant';
      case 7:
        return 'dominant';
      case 4:
        return 'mediant';
      case 9:
        return 'submediant';
      case 11:
        return 'leading';
      default:
        return 'unknown';
    }
  }

  /**
   * Batch analyze multiple chords
   */
  analyzeProgression(chords: string[], context: AnalysisContext = {}): ChordAnalysis[] {
    return chords.map((chord, index) => {
      const previousChords = chords.slice(0, index);
      return this.analyze(chord, { ...context, previousChords });
    });
  }
}
