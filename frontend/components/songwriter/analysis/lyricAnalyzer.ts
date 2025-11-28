import type {
  LyricLine,
  SectionLyrics,
  SyllableStress,
} from '@/components/songwriter/types/song';

export function extractSyllableCountFromLyricLine(text: string): number {
  const cleaned = text.trim().toLowerCase();

  if (cleaned.length === 0) {
    return 0;
  }

  const vowelGroups = cleaned.match(/[aeiouy]+/g);

  if (!vowelGroups) {
    return 0;
  }

  let count = vowelGroups.length;

  if (cleaned.endsWith('e') && count > 1) {
    count -= 1;
  }

  return Math.max(count, 1);
}

export function extractStressPatternFromLine(text: string): SyllableStress[] {
  const words = text.trim().split(/\s+/);
  const stresses: SyllableStress[] = [];

  let syllableIndex = 0;

  for (const word of words) {
    const syllables = splitWordIntoSyllables(word);

    for (let i = 0; i < syllables.length; i++) {
      const syllable = syllables[i];
      if (!syllable) continue;

      const isStressed = determineStress(syllables, i);

      stresses.push({
        syllableIndex,
        isStressed,
        syllableText: syllable,
      });

      syllableIndex += 1;
    }
  }

  return stresses;
}

export function analyzeRhymeSchemeConsistency(lines: LyricLine[]): number {
  if (lines.length < 2) {
    return 1.0;
  }

  const schemePositions = lines.map((line) => line.rhymeSchemePosition);

  const expectedPattern = determineExpectedPattern(schemePositions);

  let matches = 0;

  for (let i = 0; i < schemePositions.length; i++) {
    const expected = expectedPattern[i % expectedPattern.length];
    if (schemePositions[i] === expected) {
      matches += 1;
    }
  }

  return matches / schemePositions.length;
}

export function findRhymingLines(
  targetLine: LyricLine,
  allLines: LyricLine[]
): number[] {
  const rhymingLines: number[] = [];

  const targetEnding = extractRhymeEnding(targetLine.text);

  for (const line of allLines) {
    if (line.lineNumber === targetLine.lineNumber) {
      continue;
    }

    const lineEnding = extractRhymeEnding(line.text);

    if (doEndingsRhyme(targetEnding, lineEnding)) {
      rhymingLines.push(line.lineNumber);
    }
  }

  return rhymingLines;
}

export function calculateThematicCoherence(sections: SectionLyrics[]): number {
  if (sections.length === 0) {
    return 0;
  }

  const allWords = new Set<string>();
  const sectionWords: Set<string>[] = [];

  for (const section of sections) {
    const words = new Set<string>();

    for (const line of section.lines) {
      const lineWords = extractSignificantWords(line.text);

      for (const word of lineWords) {
        words.add(word);
        allWords.add(word);
      }
    }

    sectionWords.push(words);
  }

  let overlapSum = 0;
  let comparisons = 0;

  for (let i = 0; i < sectionWords.length; i++) {
    const set1 = sectionWords[i];
    if (!set1) continue;

    for (let j = i + 1; j < sectionWords.length; j++) {
      const set2 = sectionWords[j];
      if (!set2) continue;

      const overlap = calculateSetOverlap(set1, set2);
      overlapSum += overlap;
      comparisons += 1;
    }
  }

  if (comparisons === 0) {
    return 1.0;
  }

  return overlapSum / comparisons;
}

function splitWordIntoSyllables(word: string): string[] {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');

  if (cleaned.length === 0) {
    return [];
  }

  const vowelPattern = /[aeiouy]+/g;
  const matches = cleaned.match(vowelPattern);

  if (!matches) {
    return [cleaned];
  }

  const syllables: string[] = [];
  let remaining = cleaned;

  for (const match of matches) {
    const index = remaining.indexOf(match);
    const beforeVowel = remaining.slice(0, index);
    const vowelGroup = match;

    const consonantAfter = remaining.slice(index + vowelGroup.length).match(/^[^aeiouy]*/)?.[0] || '';

    const syllable = beforeVowel + vowelGroup + consonantAfter;
    syllables.push(syllable);

    remaining = remaining.slice(syllable.length);
  }

  if (remaining.length > 0) {
    syllables[syllables.length - 1] += remaining;
  }

  return syllables;
}

function determineStress(syllables: string[], index: number): boolean {
  if (syllables.length === 1) {
    return true;
  }

  if (index === syllables.length - 2) {
    return true;
  }

  return index % 2 === 0;
}

function determineExpectedPattern(positions: string[]): string[] {
  const patternLength = 4;

  const firstPattern = positions.slice(0, patternLength);

  return firstPattern.length > 0 ? firstPattern : ['A', 'B', 'A', 'B'];
}

function extractRhymeEnding(text: string): string {
  const cleaned = text.trim().toLowerCase();

  const lastWord = cleaned.split(/\s+/).pop() || '';

  const endingPattern = lastWord.match(/[aeiouy][a-z]*$/);

  return endingPattern?.[0] ?? lastWord.slice(-3);
}

function doEndingsRhyme(ending1: string, ending2: string): boolean {
  if (ending1.length < 2 || ending2.length < 2) {
    return false;
  }

  const minLength = Math.min(ending1.length, ending2.length);

  const suffix1 = ending1.slice(-minLength);
  const suffix2 = ending2.slice(-minLength);

  if (suffix1 === suffix2) {
    return true;
  }

  const vowels1 = suffix1.match(/[aeiouy]/g)?.join('') || '';
  const vowels2 = suffix2.match(/[aeiouy]/g)?.join('') || '';

  return vowels1.length > 0 && vowels1 === vowels2;
}

function extractSignificantWords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  return words;
}

function calculateSetOverlap(set1: Set<string>, set2: Set<string>): number {
  const intersection = new Set([...set1].filter((item) => set2.has(item)));

  const union = new Set([...set1, ...set2]);

  if (union.size === 0) {
    return 0;
  }

  return intersection.size / union.size;
}
