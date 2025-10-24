import { HIT_WINDOW } from '@/lib/constants/game.constants';

interface FallingChord {
  chord: string;
  color: string;
  y: number;
  timestamp: number;
  hit: boolean;
  hitQuality?: string;
}

export function findBestHitChord(
  targetChord: string,
  fallingChords: FallingChord[],
  currentTime: number
): { chord: FallingChord; distance: number } | null {
  const hitWindowMs = HIT_WINDOW.GOOD;
  let bestHitChord: FallingChord | null = null;
  let bestDistance = Infinity;

  fallingChords.forEach(fc => {
    if (fc.chord === targetChord && !fc.hit) {
      const distance = Math.abs(fc.timestamp - currentTime);
      if (distance < bestDistance && distance < hitWindowMs) {
        bestDistance = distance;
        bestHitChord = fc;
      }
    }
  });

  return bestHitChord ? { chord: bestHitChord, distance: bestDistance } : null;
}
