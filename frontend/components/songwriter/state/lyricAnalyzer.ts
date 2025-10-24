import type {
  LyricLine,
  SyllableStress,
  RhymeScheme,
  SectionLyrics,
  SectionType,
  EmotionalTone,
  NarrativePerspective,
  VerbTense,
} from '../types/song';

export function extractSyllableCountFromLyricLine(lineText: string): number {
  const cleaned = lineText.toLowerCase().replace(/[^a-z\s]/g, '');
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);

  return words.reduce((total, word) => total + countSyllablesInWord(word), 0);
}

export function countSyllablesInWord(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  const vowelGroups = word.match(/[aeiouy]+/g);
  if (!vowelGroups) return 1;

  let count = vowelGroups.length;

  if (word.endsWith('e')) count -= 1;
  if (word.endsWith('le') && word.length > 2) count += 1;

  return Math.max(1, count);
}

export function detectStressPatternInLine(lineText: string): ReadonlyArray<SyllableStress> {
  const words = lineText.split(/\s+/).filter(w => w.length > 0);
  const stresses: SyllableStress[] = [];
  let syllableIndex = 0;

  for (const word of words) {
    const syllableCount = countSyllablesInWord(word);
    const wordStresses = generateWordStressPattern(word, syllableCount);

    for (let i = 0; i < syllableCount; i++) {
      stresses.push({
        syllableIndex,
        isStressed: wordStresses[i] ?? false,
        syllableText: word,
      });
      syllableIndex++;
    }
  }

  return stresses;
}

function generateWordStressPattern(_word: string, syllableCount: number): boolean[] {
  if (syllableCount === 1) return [true];
  if (syllableCount === 2) return [true, false];

  const pattern: boolean[] = new Array(syllableCount).fill(false);
  pattern[0] = true;

  return pattern;
}

export function extractRhymeFromLineEnd(lineText: string): string {
  const words = lineText.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return '';

  const lastWord = (words[words.length - 1] ?? '').toLowerCase().replace(/[^a-z]/g, '');

  if (lastWord.length < 2) return lastWord;

  const vowelIndex = lastWord.search(/[aeiouy]/);
  if (vowelIndex === -1) return lastWord;

  return lastWord.substring(vowelIndex);
}

export function determineIfLinesRhyme(line1: string, line2: string): boolean {
  const rhyme1 = extractRhymeFromLineEnd(line1);
  const rhyme2 = extractRhymeFromLineEnd(line2);

  if (rhyme1.length < 2 || rhyme2.length < 2) return false;

  return rhyme1 === rhyme2;
}

export function analyzeRhymeSchemeForSection(lines: ReadonlyArray<string>): RhymeScheme {
  if (lines.length === 0) return 'none';
  if (lines.length === 1) return 'none';

  const rhymeEndings = lines.map(extractRhymeFromLineEnd);
  const pattern = buildRhymePattern(rhymeEndings);

  return classifyRhymePattern(pattern, lines.length);
}

function buildRhymePattern(rhymeEndings: ReadonlyArray<string>): string {
  const rhymeMap = new Map<string, string>();
  let currentLetter = 65;
  const pattern: string[] = [];

  for (const ending of rhymeEndings) {
    if (!rhymeMap.has(ending)) {
      rhymeMap.set(ending, String.fromCharCode(currentLetter++));
    }
    pattern.push(rhymeMap.get(ending)!);
  }

  return pattern.join('');
}

function classifyRhymePattern(pattern: string, lineCount: number): RhymeScheme {
  const schemes: Record<string, RhymeScheme> = {
    AABB: 'AABB',
    ABAB: 'ABAB',
    ABCB: 'ABCB',
    AAAA: 'AAAA',
    ABBA: 'ABBA',
    ABABCC: 'ABABCC',
    AABCCB: 'AABCCB',
  };

  if (pattern in schemes) {
    return schemes[pattern] ?? 'free';
  }

  const uniqueLetters = new Set(pattern.split(''));
  if (uniqueLetters.size === lineCount) {
    return 'free';
  }

  return 'free';
}

export function parseLyricLineWithAnalysis(
  lineText: string,
  lineNumber: number,
  allLines: ReadonlyArray<string>
): LyricLine {
  const syllableCount = extractSyllableCountFromLyricLine(lineText);
  const stressPattern = detectStressPatternInLine(lineText);
  const rhymeEnding = extractRhymeFromLineEnd(lineText);
  const rhymesWith = findRhymingLines(lineNumber, rhymeEnding, allLines);

  return {
    text: lineText,
    syllableCount,
    stressPattern,
    rhymeSchemePosition: '',
    endsWithRhyme: rhymesWith.length > 0,
    rhymesWith,
    lineNumber,
  };
}

function findRhymingLines(
  currentLine: number,
  rhymeEnding: string,
  allLines: ReadonlyArray<string>
): ReadonlyArray<number> {
  const rhyming: number[] = [];

  allLines.forEach((line, index) => {
    if (index !== currentLine) {
      const otherRhyme = extractRhymeFromLineEnd(line);
      if (otherRhyme === rhymeEnding && rhymeEnding.length >= 2) {
        rhyming.push(index);
      }
    }
  });

  return rhyming;
}

export function analyzeSectionLyrics(
  sectionType: SectionType,
  sectionIndex: number,
  linesText: ReadonlyArray<string>
): SectionLyrics {
  const lines = linesText.map((text, index) => parseLyricLineWithAnalysis(text, index, linesText));

  return {
    sectionType,
    sectionIndex,
    lines,
    theme: extractThemeFromLines(linesText),
    narrativePerspective: detectNarrativePerspective(linesText),
    verbTense: detectVerbTense(linesText),
    emotionalTone: detectEmotionalTone(linesText),
    narrativeBeat: '',
    rhymeScheme: analyzeRhymeSchemeForSection(linesText),
  };
}

function extractThemeFromLines(_lines: ReadonlyArray<string>): string {
  return 'General theme';
}

function detectNarrativePerspective(lines: ReadonlyArray<string>): NarrativePerspective {
  const text = lines.join(' ').toLowerCase();

  const firstPersonWords = ['i', 'me', 'my', 'mine', 'we', 'us', 'our'];
  const secondPersonWords = ['you', 'your', 'yours'];

  const firstPersonCount = firstPersonWords.reduce(
    (count, word) => count + (text.match(new RegExp(`\\b${word}\\b`, 'g'))?.length || 0),
    0
  );

  const secondPersonCount = secondPersonWords.reduce(
    (count, word) => count + (text.match(new RegExp(`\\b${word}\\b`, 'g'))?.length || 0),
    0
  );

  if (firstPersonCount > secondPersonCount) return 'first-person';
  if (secondPersonCount > 0) return 'second-person';

  return 'third-person';
}

function detectVerbTense(lines: ReadonlyArray<string>): VerbTense {
  const text = lines.join(' ').toLowerCase();

  const pastIndicators = ['was', 'were', 'had', 'did', 'been'];
  const presentIndicators = ['is', 'are', 'am', 'do', 'does'];
  const futureIndicators = ['will', 'shall', 'going to'];

  const pastCount = pastIndicators.reduce(
    (count, word) => count + (text.match(new RegExp(`\\b${word}\\b`, 'g'))?.length || 0),
    0
  );

  const presentCount = presentIndicators.reduce(
    (count, word) => count + (text.match(new RegExp(`\\b${word}\\b`, 'g'))?.length || 0),
    0
  );

  const futureCount = futureIndicators.reduce(
    (count, word) => count + (text.match(new RegExp(`\\b${word}\\b`, 'g'))?.length || 0),
    0
  );

  if (pastCount > presentCount && pastCount > futureCount) return 'past';
  if (futureCount > presentCount && futureCount > pastCount) return 'future';
  if (presentCount > 0) return 'present';

  return 'mixed';
}

function detectEmotionalTone(lines: ReadonlyArray<string>): EmotionalTone {
  const text = lines.join(' ').toLowerCase();

  const emotionalKeywords: Record<EmotionalTone, string[]> = {
    joyful: ['happy', 'joy', 'smile', 'laugh', 'bright', 'sun'],
    melancholic: ['sad', 'tears', 'cry', 'pain', 'lonely', 'dark'],
    angry: ['mad', 'hate', 'fury', 'rage', 'fight'],
    peaceful: ['calm', 'peace', 'quiet', 'still', 'gentle'],
    anxious: ['worry', 'fear', 'scared', 'nervous', 'afraid'],
    hopeful: ['hope', 'dream', 'wish', 'believe', 'tomorrow'],
    nostalgic: ['remember', 'past', 'memory', 'used to', 'once'],
    romantic: ['love', 'heart', 'kiss', 'forever', 'together'],
    defiant: ['never', 'fight', 'stand', 'rebel', 'break'],
    bittersweet: ['sweet', 'bitter', 'both', 'mixed'],
    triumphant: ['win', 'victory', 'champion', 'rise', 'conquer'],
    introspective: ['think', 'wonder', 'question', 'soul', 'mind'],
    energetic: ['run', 'fast', 'energy', 'power', 'move'],
    somber: ['grey', 'heavy', 'weight', 'burden', 'solemn'],
    playful: ['play', 'fun', 'game', 'tease', 'silly'],
  };

  let maxScore = 0;
  let detectedTone: EmotionalTone = 'introspective';

  for (const [tone, keywords] of Object.entries(emotionalKeywords)) {
    const score = keywords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);

    if (score > maxScore) {
      maxScore = score;
      detectedTone = tone as EmotionalTone;
    }
  }

  return detectedTone;
}

export function calculateRhymeDensity(lines: ReadonlyArray<LyricLine>): number {
  if (lines.length === 0) return 0;

  const rhymingLines = lines.filter(line => line.endsWithRhyme).length;
  return rhymingLines / lines.length;
}

export function countUniqueWordsInLyrics(lines: ReadonlyArray<string>): number {
  const allWords = lines
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0);

  return new Set(allWords).size;
}

export function calculateAverageWordLength(lines: ReadonlyArray<string>): number {
  const allWords = lines
    .join(' ')
    .replace(/[^a-z\s]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 0);

  if (allWords.length === 0) return 0;

  const totalLength = allWords.reduce((sum, word) => sum + word.length, 0);
  return totalLength / allWords.length;
}
