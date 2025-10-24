/**
 * Hit Quality Enumeration
 * Type-safe enumeration for rhythm game hit quality
 */

export enum HitQuality {
  Perfect = 'perfect',
  Good = 'good',
  Miss = 'miss',
}

export type HitQualityType = HitQuality.Perfect | HitQuality.Good | HitQuality.Miss;
