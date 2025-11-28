/**
 * Music generation tools
 */

export { ChordSuggester } from '@/lib/music-theory/intelligence/generators/ChordSuggester';
export type { ChordSuggestion, SuggestionContext } from '@/lib/music-theory/intelligence/generators/ChordSuggester';

export { BassLineGenerator } from '@/lib/music-theory/intelligence/generators/BassLineGenerator';
export type { BassNote, BassLineOptions } from '@/lib/music-theory/intelligence/generators/BassLineGenerator';

export { DrumPatternGenerator } from '@/lib/music-theory/intelligence/generators/DrumPatternGenerator';
export type { DrumEvent, DrumPatternOptions } from '@/lib/music-theory/intelligence/generators/DrumPatternGenerator';
