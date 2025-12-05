import type { Song, Section, Line } from './types';

/**
 * Chord regex - matches standard chord notation
 */
const CHORD_REGEX = /([A-G][#b]?(?:maj|min|m|M|aug|dim|\+|°)?[0-9]*(?:[#b][0-9]+)*(?:sus[24])?(?:add[0-9]+)?(?:\/[A-G][#b]?)?)/g;
const SECTION_HEADER_REGEX = /^\[([^\]]+)\]$/;

interface ChordPosition {
  name: string;
  position: number;
}

/**
 * Parse UG markdown into Song JSON
 *
 * Each chord gets paired with its lyric segment.
 * Lines from the same source get the same `lineGroup` for rendering.
 */
export function parseUGMarkdown(markdown: string, sourceUrl?: string): Song {
  const lines = markdown.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let lineGroupCounter = 0;
  let inCodeBlock = false;
  let inContent = false;

  // Extract artist/title from URL
  let artist = 'Unknown Artist';
  let title = 'Unknown Title';
  let key: string | undefined;
  let capo: number | undefined;

  if (sourceUrl) {
    const urlMatch = sourceUrl.match(/\/tab\/([^\/]+)\/([^\/]+)-(?:chords|tabs)-/);
    if (urlMatch) {
      artist = urlMatch[1]?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? artist;
      title = urlMatch[2]?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? title;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Extract key from metadata
    if (!key && trimmed.match(/Key:\s*([A-G][#b]?(?:maj|min|m)?)/i)) {
      const keyMatch = trimmed.match(/Key:\s*([A-G][#b]?(?:maj|min|m)?)/i);
      if (keyMatch) key = keyMatch[1];
    }

    // Extract capo from metadata
    if (capo === undefined && trimmed.match(/Capo:\s*(?:fret\s*)?(\d+|no capo)/i)) {
      const capoMatch = trimmed.match(/Capo:\s*(?:fret\s*)?(\d+|no capo)/i);
      if (capoMatch && capoMatch[1] !== 'no capo') {
        capo = parseInt(capoMatch[1] ?? '0', 10);
      }
    }

    // Track code block boundaries - song content is inside ```
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Closing ``` - STOP parsing, we're done with song content
        break;
      }
      inCodeBlock = true;
      continue;
    }

    // Start content on first section header (must be inside code block)
    const sectionMatch = trimmed.match(SECTION_HEADER_REGEX);
    if (sectionMatch) {
      inContent = true;
      if (currentSection) sections.push(currentSection);
      currentSection = { name: sectionMatch[1] ?? 'Section', lines: [] };
      continue;
    }

    if (!inContent || !currentSection) continue;

    // Check if this line is a chord line
    const chords = extractChords(line);
    const isChordLine = chords.length > 0 && isLikelyChordLine(line, chords);

    if (isChordLine) {
      // Look ahead for lyric line
      const nextLine = lines[i + 1] ?? '';
      const nextTrimmed = nextLine.trim();
      const nextChords = extractChords(nextLine);
      const nextIsChordLine = nextChords.length > 0 && isLikelyChordLine(nextLine, nextChords);

      if (nextTrimmed && !nextIsChordLine && !nextTrimmed.match(SECTION_HEADER_REGEX)) {
        // Pair chords with lyrics
        lineGroupCounter++;
        const pairs = pairChordsWithLyrics(chords, nextLine, lineGroupCounter);
        currentSection.lines.push(...pairs);
        i++; // Skip the lyric line
      } else {
        // Chord-only line (instrumental)
        lineGroupCounter++;
        chords.forEach(chord => {
          currentSection!.lines.push({
            chord: { name: chord.name },
            lyric: '',
            lineGroup: lineGroupCounter,
          });
        });
      }
    } else {
      // Standalone lyric or other content
      currentSection.lines.push({
        chord: null,
        lyric: trimmed,
        lineGroup: ++lineGroupCounter,
      });
    }
  }

  if (currentSection) sections.push(currentSection);

  return { artist, title, key, capo, sections, sourceUrl };
}

/**
 * Extract chords with their character positions
 */
function extractChords(line: string): ChordPosition[] {
  const matches = Array.from(line.matchAll(CHORD_REGEX));
  return matches.map(m => ({
    name: m[1] ?? '',
    position: m.index ?? 0,
  }));
}

/**
 * Determine if a line is likely a chord line (not lyrics containing chord letters)
 */
function isLikelyChordLine(line: string, chords: ChordPosition[]): boolean {
  // Remove all chord matches and see what's left
  let remaining = line;
  // Sort by position descending to avoid index shifting
  const sortedChords = [...chords].sort((a, b) => b.position - a.position);
  for (const chord of sortedChords) {
    remaining = remaining.slice(0, chord.position) + remaining.slice(chord.position + chord.name.length);
  }
  const cleaned = remaining.trim();

  // Chord lines have mostly whitespace after removing chords
  // Lyric lines have lots of text, punctuation, etc.
  return cleaned.length < 5 && !line.includes(',') && !line.includes('.');
}

/**
 * Split lyrics at chord positions and pair each chord with its segment
 * Lyrics BEFORE first chord become a separate null-chord entry
 */
function pairChordsWithLyrics(chords: ChordPosition[], lyricLine: string, lineGroup: number): Line[] {
  const result: Line[] = [];

  // Sort chords by position
  const sorted = [...chords].sort((a, b) => a.position - b.position);

  // Handle lyrics BEFORE first chord (no chord above them)
  const firstChord = sorted[0];
  if (firstChord && firstChord.position > 0) {
    const prefix = lyricLine.slice(0, firstChord.position).trim();
    if (prefix) {
      result.push({
        chord: null,
        lyric: prefix,
        lineGroup,
      });
    }
  }

  // Pair each chord with its lyric segment
  for (let i = 0; i < sorted.length; i++) {
    const chord = sorted[i]!;
    const nextPosition = sorted[i + 1]?.position ?? lyricLine.length;

    // Get lyric segment from this chord to the next
    const segment = lyricLine.slice(chord.position, nextPosition).trim();

    result.push({
      chord: { name: chord.name },
      lyric: segment,
      lineGroup,
    });
  }

  return result;
}

/**
 * For backwards compatibility - export positioned version too
 */
export { parseUGMarkdown as parseUGMarkdownPositioned };
export function toSimpleSong(song: Song): Song {
  return song; // Already in simple format
}
