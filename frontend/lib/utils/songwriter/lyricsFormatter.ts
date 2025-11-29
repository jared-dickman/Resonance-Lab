/**
 * Lyrics Formatting Utilities
 * Pure functions for transforming lyrics data structures
 * Each function does ONE thing in under 5 lines
 */

import type { SectionLyrics, LyricLine } from '@/components/songwriter/types/song';

export function flattenLyricLines(lines: readonly LyricLine[]): string {
  return lines.map(line => line.text).join('\n');
}

export function flattenSongSections(sections: readonly SectionLyrics[]): string {
  return sections.map(section => flattenLyricLines(section.lines)).join('\n\n');
}

export function splitIntoLines(text: string): string[] {
  return text.split('\n').filter(line => line.trim().length > 0);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countLines(text: string): number {
  return splitIntoLines(text).length;
}
