import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const apiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
}

const SHARP_SCALE = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const FLAT_SCALE = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];

export function transposeChord(chordName: string, steps: number): string {
  const match = chordName.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chordName;

  const [, root, quality] = match;
  const scale = root.includes('b') ? FLAT_SCALE : SHARP_SCALE;
  const index = scale.indexOf(root);

  if (index === -1) return chordName;

  const newIndex = (index + steps + 12) % 12;
  const newRoot = scale[newIndex];

  return newRoot + quality;
}
