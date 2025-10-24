export interface ChordElementInfo {
  element: HTMLSpanElement;
  chordName: string;
}

export function findClosestVisibleChord(
  chordElements: Map<string, ChordElementInfo>,
  containerRect: DOMRect,
  centerY: number
): string | null {
  let closestChordName: string | null = null;
  let minDistance = Infinity;

  chordElements.forEach(({ element, chordName }) => {
    const rect = element.getBoundingClientRect();
    const distance = Math.abs(rect.top - centerY);

    if (
      rect.top >= containerRect.top &&
      rect.bottom <= containerRect.bottom &&
      distance < minDistance
    ) {
      closestChordName = chordName;
      minDistance = distance;
    }
  });

  return closestChordName;
}
