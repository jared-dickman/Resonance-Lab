import { HIT_WINDOW, SCORE_POINTS } from '@/lib/constants/game.constants';
import { HitQuality } from '@/lib/enums/hitQuality.enum';

export interface HitResult {
  quality: HitQuality;
  points: number;
  distance: number;
}

export function calculateHitQuality(distance: number): HitQuality {
  if (distance < HIT_WINDOW.PERFECT) {
    return HitQuality.Perfect;
  }
  if (distance < HIT_WINDOW.GOOD) {
    return HitQuality.Good;
  }
  return HitQuality.Miss;
}

export function calculatePoints(quality: HitQuality): number {
  switch (quality) {
    case HitQuality.Perfect:
      return SCORE_POINTS.PERFECT;
    case HitQuality.Good:
      return SCORE_POINTS.GOOD;
    case HitQuality.Miss:
      return SCORE_POINTS.MISS;
    default:
      return SCORE_POINTS.MISS;
  }
}

export function processHit(distance: number): HitResult {
  const quality = calculateHitQuality(distance);
  const points = calculatePoints(quality);

  return {
    quality,
    points,
    distance,
  };
}

export function generateChordColor(chordName: string): string {
  const hash = chordName.charCodeAt(0) * 137;
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
