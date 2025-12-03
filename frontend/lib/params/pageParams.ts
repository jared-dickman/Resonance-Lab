/**
 * Comprehensive URL Search Params Schema
 *
 * Single source of truth for all URL state parameters across the app.
 * Organized by route/feature with parser type references and descriptions.
 */

/** Parser types available from nuqs via useJamParams */
export type ParserType = 'string' | 'integer' | 'float' | 'boolean' | 'stringLiteral' | 'json';

/** Param definition shape */
export interface ParamDefinition<T extends ParserType = ParserType> {
  readonly key: string;
  readonly parser: T;
  readonly description: string;
}

/** Feature param group shape */
export type ParamGroup<K extends string = string> = Readonly<Record<K, ParamDefinition>>;

export const PageParams = {
  /** Songs catalog & browser */
  songs: {
    artist: {
      key: 'artist',
      parser: 'string',
      description: 'Artist slug for filtering/navigation',
    },
    song: {
      key: 'song',
      parser: 'string',
      description: 'Song slug for filtering/navigation',
    },
    tabType: {
      key: 'tab',
      parser: 'stringLiteral',
      description: 'Tab view type: chords, tab, or both',
    },
  },

  /** Jam session player */
  jam: {
    key: {
      key: 'key',
      parser: 'string',
      description: 'Musical key (e.g., C, Am, F#)',
    },
    bpm: {
      key: 'bpm',
      parser: 'integer',
      description: 'Tempo in beats per minute',
    },
    capo: {
      key: 'capo',
      parser: 'integer',
      description: 'Capo fret position (0-12)',
    },
    transpose: {
      key: 'transpose',
      parser: 'integer',
      description: 'Transpose semitones (-12 to +12)',
    },
    viewMode: {
      key: 'view',
      parser: 'stringLiteral',
      description: 'Player view mode: practice, perform, or edit',
    },
  },

  /** Search & discovery */
  search: {
    query: {
      key: 'q',
      parser: 'string',
      description: 'Search query string',
    },
    genre: {
      key: 'genre',
      parser: 'string',
      description: 'Genre filter',
    },
    difficulty: {
      key: 'difficulty',
      parser: 'stringLiteral',
      description: 'Difficulty filter: easy, medium, hard',
    },
    sort: {
      key: 'sort',
      parser: 'stringLiteral',
      description: 'Sort order: popular, recent, alphabetical',
    },
  },

  /** Buddy AI assistant */
  buddy: {
    context: {
      key: 'context',
      parser: 'string',
      description: 'Current page context for Buddy (page, artist, song)',
    },
    mode: {
      key: 'mode',
      parser: 'stringLiteral',
      description: 'Buddy interaction mode: chat, search, suggest',
    },
  },

  /** Repertoire management */
  repertoire: {
    filter: {
      key: 'filter',
      parser: 'string',
      description: 'Repertoire filter criteria',
    },
    listView: {
      key: 'listView',
      parser: 'stringLiteral',
      description: 'Repertoire view type: grid, list, setlist',
    },
  },
} as const;

/** Flat list of all param keys for discoverability */
export const AllParams = {
  // Songs
  artist: 'artist',
  song: 'song',
  tab: 'tab',

  // Jam
  key: 'key',
  bpm: 'bpm',
  capo: 'capo',
  transpose: 'transpose',
  view: 'view',

  // Search
  q: 'q',
  genre: 'genre',
  difficulty: 'difficulty',
  sort: 'sort',

  // Buddy
  context: 'context',
  mode: 'mode',

  // Repertoire
  filter: 'filter',
  listView: 'listView',
} as const;

/** Type-safe param keys */
export type ParamKey = keyof typeof AllParams;

/** Extract feature param types */
export type SongsParams = typeof PageParams.songs;
export type JamParams = typeof PageParams.jam;
export type SearchParams = typeof PageParams.search;
export type BuddyParams = typeof PageParams.buddy;
export type RepertoireParams = typeof PageParams.repertoire;

/** Union of all param definitions */
export type AnyParamDef =
  | SongsParams[keyof SongsParams]
  | JamParams[keyof JamParams]
  | SearchParams[keyof SearchParams]
  | BuddyParams[keyof BuddyParams]
  | RepertoireParams[keyof RepertoireParams];
