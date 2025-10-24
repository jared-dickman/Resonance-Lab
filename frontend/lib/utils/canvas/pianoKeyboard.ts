export interface MidiNoteInfo {
  octave: number;
  keyIndex: number;
}

export function getMidiNote(octave: number, keyIndex: number): number {
  const baseNote = octave * 12 + 12;
  const offsets = [0, 2, 4, 5, 7, 9, 11];
  return baseNote + offsets[keyIndex];
}

export function getBlackKeyMidiOffset(keyIndex: number): number {
  const offsets = [1, 3, -1, 6, 8, 10, -1];
  return offsets[keyIndex] ?? -1;
}

export function isBlackKeyPresent(keyIndex: number): boolean {
  const pattern = [1, 1, 0, 1, 1, 1, 0];
  return pattern[keyIndex] === 1;
}
