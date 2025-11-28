/**
 * Intelligence Engine - Composable AI for music
 *
 * @example
 * ```ts
 * import { ChordAnalyzer, ChordSuggester, BassLineGenerator } from '@/lib/music-theory/intelligence';
 *
 * const analyzer = new ChordAnalyzer();
 * const suggester = new ChordSuggester();
 * const bassGen = new BassLineGenerator();
 *
 * const analysis = analyzer.analyze('Cmaj7', { key: 'C' });
 * const suggestions = suggester.suggest('Cmaj7', { key: 'C', genre: 'jazz' });
 * const bassLine = bassGen.generate(['Cmaj7', 'Am7'], { style: 'walking' });
 * ```
 */

// Analyzers
export { ChordAnalyzer } from '@/lib/music-theory/intelligence/analyzers';
export type { ChordAnalysis, AnalysisContext } from '@/lib/music-theory/intelligence/analyzers';

// Generators
export { ChordSuggester, BassLineGenerator, DrumPatternGenerator } from '@/lib/music-theory/intelligence/generators';
export type {
  ChordSuggestion,
  SuggestionContext,
  BassNote,
  BassLineOptions,
  DrumEvent,
  DrumPatternOptions,
} from '@/lib/music-theory/intelligence/generators';
