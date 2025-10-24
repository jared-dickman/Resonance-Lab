import { HitQuality } from '@/lib/enums/hitQuality.enum';

export function calculateCombo(
  currentCombo: number,
  hitQuality: HitQuality
): number {
  return hitQuality !== HitQuality.Miss ? currentCombo + 1 : 0;
}

export function calculateScoreMultiplier(combo: number): number {
  const comboThreshold = 10;
  return Math.floor(combo / comboThreshold) + 1;
}
