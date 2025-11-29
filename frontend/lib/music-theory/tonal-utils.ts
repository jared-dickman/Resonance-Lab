/**
 * Tonal.js Music Theory Utilities
 * Clean wrapper for music theory operations using Tonal.js
 */

import { Chord, Scale, Note, Key, Interval } from 'tonal';

/**
 * Chord analysis and manipulation
 */
export const chordUtils = {
  /**
   * Get detailed chord information
   */
  analyze: (chordSymbol: string) => {
    const chord = Chord.get(chordSymbol);
    return {
      symbol: chord.symbol,
      tonic: chord.tonic,
      notes: chord.notes,
      intervals: chord.intervals,
      quality: chord.quality,
      aliases: chord.aliases,
    };
  },

  /**
   * Get all notes in a chord
   */
  getNotes: (chordSymbol: string): string[] => {
    return Chord.get(chordSymbol).notes;
  },

  /**
   * Transpose a chord
   */
  transpose: (chordSymbol: string, interval: string): string => {
    const chord = Chord.get(chordSymbol);
    if (!chord.tonic) return chordSymbol;

    const newTonic = Note.transpose(chord.tonic, interval);
    return `${newTonic}${chord.aliases[0] || ''}`;
  },

  /**
   * Detect chord from notes
   */
  detect: (notes: string[]): string[] => {
    return Chord.detect(notes);
  },
};

/**
 * Scale analysis and generation
 */
export const scaleUtils = {
  /**
   * Get scale notes
   */
  getNotes: (scaleName: string): string[] => {
    return Scale.get(scaleName).notes;
  },

  /**
   * Get scale information
   */
  analyze: (scaleName: string) => {
    const scale = Scale.get(scaleName);
    return {
      name: scale.name,
      tonic: scale.tonic,
      notes: scale.notes,
      intervals: scale.intervals,
      type: scale.type,
    };
  },

  /**
   * Check if a note is in a scale
   */
  contains: (scaleName: string, note: string): boolean => {
    const scale = Scale.get(scaleName);
    return scale.notes.includes(Note.get(note).pc || '');
  },
};

/**
 * Key and harmony utilities
 */
export const keyUtils = {
  /**
   * Get major key information
   */
  majorKey: (tonic: string) => {
    const key = Key.majorKey(tonic);
    return {
      tonic: key.tonic,
      scale: [...key.scale],
      chords: [...key.chords],
      minorRelative: key.minorRelative,
    };
  },

  /**
   * Get minor key information
   */
  minorKey: (tonic: string) => {
    const key = Key.minorKey(tonic);
    return {
      tonic: key.tonic,
    };
  },

  /**
   * Suggest next chords based on music theory
   */
  suggestNextChords: (currentChord: string, keySignature: string): string[] => {
    const key = Key.majorKey(keySignature);
    const chordIndex = key.chords.indexOf(currentChord);

    if (chordIndex === -1) return [];

    // Common progressions: I-IV-V, I-vi-IV-V, etc.
    const suggestions: string[] = [];

    // Add V chord (dominant)
    if (key.chords[4]) suggestions.push(key.chords[4]);

    // Add IV chord (subdominant)
    if (key.chords[3]) suggestions.push(key.chords[3]);

    // Add vi chord (relative minor)
    if (key.chords[5]) suggestions.push(key.chords[5]);

    return [...new Set(suggestions)]; // Remove duplicates
  },
};

/**
 * Note manipulation utilities
 */
export const noteUtils = {
  /**
   * Transpose a note
   */
  transpose: (note: string, interval: string): string => {
    return Note.transpose(note, interval);
  },

  /**
   * Get frequency of a note
   */
  frequency: (note: string): number => {
    return Note.freq(note) || 0;
  },

  /**
   * Get MIDI number of a note
   */
  midi: (note: string): number => {
    return Note.midi(note) || 0;
  },

  /**
   * Simplify note (remove octave)
   */
  pitchClass: (note: string): string => {
    return Note.get(note).pc || '';
  },
};

/**
 * Interval utilities
 */
export const intervalUtils = {
  /**
   * Get interval between two notes
   */
  distance: (from: string, to: string): string => {
    return Interval.distance(from, to);
  },

  /**
   * Get semitones in an interval
   */
  semitones: (interval: string): number => {
    return Interval.semitones(interval) || 0;
  },
};

/**
 * Circle of Fifths utilities
 */
export const circleOfFifths = {
  /**
   * Get circle of fifths in order
   */
  getCircle: (): string[] => {
    return ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  },

  /**
   * Get related keys (adjacent in circle of fifths)
   */
  getRelatedKeys: (key: string): string[] => {
    const circle = circleOfFifths.getCircle();
    const index = circle.indexOf(key);
    if (index === -1) return [];

    const prev = circle[(index - 1 + circle.length) % circle.length];
    const next = circle[(index + 1) % circle.length];

    return [prev || '', next || ''];
  },
};

/**
 * Chord progression analysis
 */
export const progressionUtils = {
  /**
   * Analyze chord progression
   */
  analyze: (chords: string[], key: string) => {
    const keyInfo = Key.majorKey(key);
    const romanNumerals = chords.map(chord => {
      const index = keyInfo.chords.indexOf(chord);
      const numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
      return index !== -1 ? numerals[index] : '?';
    });

    return {
      chords,
      romanNumerals,
      key: keyInfo.tonic,
      scale: keyInfo.scale,
    };
  },

  /**
   * Transpose entire progression
   */
  transpose: (chords: string[], interval: string): string[] => {
    return chords.map(chord => chordUtils.transpose(chord, interval));
  },
};
