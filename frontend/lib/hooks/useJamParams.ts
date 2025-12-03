'use client';
/**
 * useJamParams - Type-safe URL search params for Jamium
 *
 * Single source of truth for URL state. Never import nuqs directly elsewhere.
 *
 * @example
 * // Read a param
 * const [song] = useJamParams('song', jamParsers.song);
 *
 * // Write a param
 * const [, setSong] = useJamParams('song', jamParsers.song);
 * setSong('hotel-california');
 *
 * // Multiple params
 * const params = useJamParamsMap({
 *   song: jamParsers.song,
 *   tab: jamParsers.tabType,
 *   bpm: jamParsers.bpm,
 * });
 */

// Re-export everything from nuqs through this single file
export {
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsFloat,
  parseAsBoolean,
  parseAsArrayOf,
  parseAsJson,
  parseAsStringLiteral,
  parseAsStringEnum,
  parseAsNumberLiteral,
  parseAsIsoDateTime,
  parseAsTimestamp,
  createParser,
  createSerializer,
  type ParserBuilder,
  type UseQueryStateReturn,
  type UseQueryStatesReturn,
  type UrlKeys,
  type Values,
} from 'nuqs';

// Alias for codebase consistency
export { useQueryState as useJamParams } from 'nuqs';
export { useQueryStates as useJamParamsMap } from 'nuqs';

// App-specific parser presets
import { parseAsString, parseAsInteger, parseAsStringLiteral } from 'nuqs';

export const jamParsers = {
  /** Song slug: ?song=hotel-california */
  song: parseAsString.withDefault(''),

  /** Artist slug: ?artist=the-eagles */
  artist: parseAsString.withDefault(''),

  /** Tab type: ?tab=chords|tab|both */
  tabType: parseAsStringLiteral(['chords', 'tab', 'both'] as const).withDefault('chords'),

  /** BPM: ?bpm=120 */
  bpm: parseAsInteger.withDefault(120),

  /** Capo position: ?capo=2 */
  capo: parseAsInteger.withDefault(0),

  /** Transpose semitones: ?transpose=-2 */
  transpose: parseAsInteger.withDefault(0),

  /** View mode: ?view=practice|perform|edit */
  viewMode: parseAsStringLiteral(['practice', 'perform', 'edit'] as const).withDefault('practice'),

  /** Search query: ?q=wonder */
  query: parseAsString.withDefault(''),
} as const;
