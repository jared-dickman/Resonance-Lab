/**
 * ChordSuggester - AI-powered chord progression suggestions
 * Suggests musically intelligent next chords with confidence scores
 */

import { Chord, Progression, Scale, Note } from 'tonal';
import type { ChordAnalysis } from '@/lib/music-theory/intelligence/analyzers/ChordAnalyzer';

export interface ChordSuggestion {
  /** Suggested chord symbol */
  chord: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Why this chord was suggested */
  reasoning: string;
  /** Harmonic relationship to previous chord */
  relationship: 'resolution' | 'progression' | 'substitution' | 'chromatic' | 'parallel';
  /** Estimated tension change (-1 to 1) */
  tensionChange: number;
}

export interface SuggestionContext {
  /** Musical key */
  key?: string;
  /** Previous chord analysis */
  previousAnalysis?: ChordAnalysis;
  /** Genre preference */
  genre?: 'pop' | 'jazz' | 'rock' | 'classical' | 'blues';
  /** Maximum number of suggestions */
  maxSuggestions?: number;
}

export class ChordSuggester {
  /**
   * Suggest next chords based on current chord
   */
  suggest(currentChord: string, context: SuggestionContext = {}): ChordSuggestion[] {
    const { key = 'C', genre = 'pop', maxSuggestions = 3 } = context;

    const suggestions: ChordSuggestion[] = [];

    // Get scale chords for the key
    const scale = Scale.get(`${key} major`);
    const scaleChords = Progression.fromRomanNumerals(key, [
      'I',
      'ii',
      'iii',
      'IV',
      'V',
      'vi',
      'vii',
    ]);

    // Analyze current chord
    const currentChordData = Chord.get(currentChord);
    const currentRoot = currentChordData.tonic ?? '';

    // Strategy 1: Common progressions (genre-specific)
    const commonProgressions = this.getCommonProgressions(currentChord, key, genre);
    suggestions.push(...commonProgressions);

    // Strategy 2: Circle of fifths movement
    const fifthMovement = this.getFifthMovement(currentRoot, key);
    suggestions.push(...fifthMovement);

    // Strategy 3: Parallel/relative movements
    const parallelMovement = this.getParallelMovement(currentChord, key);
    suggestions.push(...parallelMovement);

    // Strategy 4: Jazz substitutions (if jazz genre)
    if (genre === 'jazz') {
      const jazzSubs = this.getJazzSubstitutions(currentChord, key);
      suggestions.push(...jazzSubs);
    }

    // Sort by confidence and return top N
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSuggestions)
      .map((s, i) => ({
        ...s,
        confidence: Math.max(0.6, s.confidence - i * 0.05), // Slight decay for lower ranked
      }));
  }

  /**
   * Get common progressions for genre
   */
  private getCommonProgressions(
    currentChord: string,
    key: string,
    genre: string
  ): ChordSuggestion[] {
    const suggestions: ChordSuggestion[] = [];
    const currentData = Chord.get(currentChord);
    const currentRoot = currentData.tonic ?? '';

    // Pop: I-V-vi-IV style progressions
    if (genre === 'pop') {
      if (currentRoot === key) {
        // I -> V or vi
        suggestions.push({
          chord: `${Note.transpose(key, '7M')}`, // V
          confidence: 0.9,
          reasoning: 'Strong tonic to dominant movement (I→V)',
          relationship: 'progression',
          tensionChange: 0.5,
        });
        suggestions.push({
          chord: `${Note.transpose(key, '9m')}m`, // vi
          confidence: 0.85,
          reasoning: 'Common pop progression (I→vi)',
          relationship: 'progression',
          tensionChange: 0.2,
        });
      }
    }

    // Jazz: ii-V-I progressions
    if (genre === 'jazz') {
      const fifth = Note.transpose(currentRoot, '7M');
      suggestions.push({
        chord: `${fifth}7`,
        confidence: 0.9,
        reasoning: 'Classic ii-V or V-I jazz movement',
        relationship: 'progression',
        tensionChange: -0.3,
      });
    }

    // Blues: I-IV-V patterns
    if (genre === 'blues') {
      const fourth = Note.transpose(currentRoot, '5P');
      const fifth = Note.transpose(currentRoot, '7M');
      suggestions.push(
        {
          chord: `${fourth}7`,
          confidence: 0.88,
          reasoning: 'Blues I→IV progression',
          relationship: 'progression',
          tensionChange: 0.3,
        },
        {
          chord: `${fifth}7`,
          confidence: 0.87,
          reasoning: 'Blues I→V progression',
          relationship: 'progression',
          tensionChange: 0.4,
        }
      );
    }

    return suggestions;
  }

  /**
   * Get fifth movement suggestions (circle of fifths)
   */
  private getFifthMovement(currentRoot: string, key: string): ChordSuggestion[] {
    if (!currentRoot) return [];

    const fifth = Note.transpose(currentRoot, '7M'); // Up a fifth
    const fourth = Note.transpose(currentRoot, '5P'); // Up a fourth (down a fifth)

    return [
      {
        chord: fifth,
        confidence: 0.82,
        reasoning: 'Strong fifth relationship (circle of fifths)',
        relationship: 'progression',
        tensionChange: 0.3,
      },
      {
        chord: `${fourth}`,
        confidence: 0.75,
        reasoning: 'Subdominant movement',
        relationship: 'progression',
        tensionChange: -0.2,
      },
    ];
  }

  /**
   * Get parallel movement (major/minor switches)
   */
  private getParallelMovement(currentChord: string, key: string): ChordSuggestion[] {
    const chordData = Chord.get(currentChord);
    const root = chordData.tonic ?? '';

    if (!root) return [];

    const isMajor = chordData.quality === 'Major';
    const parallel = isMajor ? `${root}m` : root;

    return [
      {
        chord: parallel,
        confidence: 0.7,
        reasoning: `Parallel ${isMajor ? 'minor' : 'major'} for color variation`,
        relationship: 'parallel',
        tensionChange: isMajor ? 0.2 : -0.2,
      },
    ];
  }

  /**
   * Get jazz substitutions
   */
  private getJazzSubstitutions(currentChord: string, key: string): ChordSuggestion[] {
    const chordData = Chord.get(currentChord);
    const root = chordData.tonic ?? '';

    if (!root) return [];

    // Tritone substitution
    const tritone = Note.transpose(root, '3A');

    return [
      {
        chord: `${tritone}7`,
        confidence: 0.75,
        reasoning: 'Tritone substitution for sophisticated jazz sound',
        relationship: 'substitution',
        tensionChange: 0.4,
      },
    ];
  }

  /**
   * Explain why a chord works in context
   */
  explainSuggestion(suggestion: ChordSuggestion, context: SuggestionContext): string {
    const { key = 'C', genre = 'pop' } = context;

    return `${suggestion.chord} - ${suggestion.reasoning} (${Math.round(suggestion.confidence * 100)}% confidence). This creates a ${suggestion.tensionChange > 0 ? 'more tense' : 'resolving'} sound in the key of ${key}.`;
  }
}
