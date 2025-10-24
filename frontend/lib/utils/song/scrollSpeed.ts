import type { Song } from '@/lib/types';

const BEATS_PER_CHORD_CHANGE = 2;
const SECONDS_PER_MINUTE = 60;

export function countChordChanges(sections: Song['sections']): number {
  return sections.reduce((total, section) => {
    return total + section.lines.filter(line => line.chord?.name).length;
  }, 0);
}

export function calculateScrollSpeed(
  containerElement: HTMLDivElement,
  sections: Song['sections'],
  bpm: number
): number {
  if (bpm <= 0) return 0;

  const totalChordChanges = countChordChanges(sections);
  if (totalChordChanges === 0) return 0;

  const totalScrollableHeight = containerElement.scrollHeight - containerElement.clientHeight;
  if (totalScrollableHeight <= 0) return 0;

  const pixelsPerChordChange = totalScrollableHeight / totalChordChanges;
  const beatsPerSecond = bpm / SECONDS_PER_MINUTE;
  const chordChangesPerSecond = beatsPerSecond / BEATS_PER_CHORD_CHANGE;
  const pixelsPerSecond = pixelsPerChordChange * chordChangesPerSecond;

  return pixelsPerSecond;
}
