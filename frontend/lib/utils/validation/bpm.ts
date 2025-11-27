/**
 * BPM Validation Utilities
 * Validates and constrains BPM (Beats Per Minute) values
 */

import { PRACTICE_MODE } from '@/lib/constants/game.constants';

/**
 * Constrains BPM value within valid range
 *
 * @param bpm - Proposed BPM value
 * @returns Clamped BPM within MIN_BPM and MAX_BPM range
 */
export function clampBpm(bpm: number): number {
  return Math.max(PRACTICE_MODE.MIN_BPM, Math.min(PRACTICE_MODE.MAX_BPM, bpm));
}

/**
 * Adjusts BPM by a delta and clamps result
 *
 * @param currentBpm - Current BPM value
 * @param delta - Amount to adjust (positive or negative)
 * @returns New clamped BPM value
 */
export function adjustBpm(currentBpm: number, delta: number): number {
  return clampBpm(currentBpm + delta);
}
