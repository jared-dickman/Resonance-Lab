/**
 * Data Validation Layer
 * Ensures all data entering the application is valid and type-safe
 * Prevents XSS, injection attacks, and data corruption
 */

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate and sanitize chord name
 */
export function validateChordName(chord: string): string | null {
  if (typeof chord !== 'string') return null;

  // Valid chord format: Root + optional accidental + optional quality + optional extension
  const chordRegex = /^[A-G][#b]?(m|maj|min|aug|dim|sus2|sus4)?[0-9]?$/;

  if (!chordRegex.test(chord)) {
    console.warn(`Invalid chord name: ${chord}`);
    return null;
  }

  return chord;
}

/**
 * Validate BPM value
 */
export function validateBPM(bpm: number): number {
  const MIN_BPM = 40;
  const MAX_BPM = 300;

  if (typeof bpm !== 'number' || isNaN(bpm)) {
    return 120; // Default safe value
  }

  return Math.max(MIN_BPM, Math.min(MAX_BPM, Math.floor(bpm)));
}

/**
 * Validate and sanitize song title
 */
export function validateSongTitle(title: string): string | null {
  if (typeof title !== 'string') return null;

  const sanitized = sanitizeString(title);

  if (sanitized.length === 0) return null;
  if (sanitized.length > 200) return sanitized.substring(0, 200);

  return sanitized;
}

/**
 * Validate and sanitize artist name
 */
export function validateArtistName(artist: string): string | null {
  if (typeof artist !== 'string') return null;

  const sanitized = sanitizeString(artist);

  if (sanitized.length === 0) return null;
  if (sanitized.length > 100) return sanitized.substring(0, 100);

  return sanitized;
}

/**
 * Validate number within range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  defaultValue: number
): number {
  if (typeof value !== 'number' || isNaN(value)) {
    return defaultValue;
  }

  return Math.max(min, Math.min(max, value));
}

/**
 * Deep freeze object to prevent mutation
 * Useful for configuration objects and constants
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as Record<string, unknown>)[prop];
    if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
      deepFreeze(value);
    }
  });

  return obj;
}

/**
 * Validate array of items with validator function
 */
export function validateArray<T>(
  arr: unknown,
  validator: (item: unknown) => item is T
): T[] | null {
  if (!Array.isArray(arr)) return null;

  const validated: T[] = [];

  for (const item of arr) {
    if (validator(item)) {
      validated.push(item);
    } else {
      console.warn('Invalid array item:', item);
    }
  }

  return validated;
}

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.warn('JSON parse failed, using fallback:', e);
    return fallback;
  }
}

/**
 * Rate limiter for user actions
 * Prevents abuse and excessive API calls
 */
export class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  /**
   * Check if action is allowed based on rate limit
   * @param key - Unique identifier for the action
   * @param maxAttempts - Maximum number of attempts allowed
   * @param windowMs - Time window in milliseconds
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.timestamps.get(key) || [];

    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

    if (validTimestamps.length >= maxAttempts) {
      console.warn(`Rate limit exceeded for ${key}`);
      return false;
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.timestamps.set(key, validTimestamps);

    return true;
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.timestamps.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.timestamps.clear();
  }
}

export const rateLimiter = new RateLimiter();
