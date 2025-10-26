/**
 * Time Formatting Utilities
 * Functions for displaying time in human-readable formats
 */

const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;

/**
 * Formats seconds as MM:SS
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "3:45")
 */
export function formatSecondsAsMinutesAndSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = Math.floor(seconds % SECONDS_PER_MINUTE);
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

  return `${minutes}:${paddedSeconds}`;
}

/**
 * Formats milliseconds as seconds with decimal places
 * @param milliseconds - Time in milliseconds
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Formatted time string (e.g., "3.45s")
 */
export function formatMillisecondsAsSeconds(
  milliseconds: number,
  decimalPlaces: number = 2
): string {
  const seconds = milliseconds / MILLISECONDS_PER_SECOND;
  return `${seconds.toFixed(decimalPlaces)}s`;
}

/**
 * Formats duration in milliseconds as human-readable string
 * @param durationMs - Duration in milliseconds
 * @returns Human-readable duration (e.g., "2m 30s", "45s", "1.5s")
 */
export function formatDuration(durationMs: number): string {
  const seconds = durationMs / MILLISECONDS_PER_SECOND;

  if (seconds < 1) {
    return `${durationMs}ms`;
  }

  if (seconds < SECONDS_PER_MINUTE) {
    return `${seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = Math.floor(seconds % SECONDS_PER_MINUTE);

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}
