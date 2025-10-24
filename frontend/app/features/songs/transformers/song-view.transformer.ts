import type {
  SavedSongResponse,
  SongDetailResponse,
  SearchResponseData,
  SearchResultResponse,
} from '@/app/features/songs/dto/song-response.schema';

/**
 * View models - optimized for UI rendering
 * These types strip away API metadata and add UI-specific properties
 */

export interface SavedSongView {
  artist: string;
  artistSlug: string;
  title: string;
  songSlug: string;
  key: string;
  hasChords: boolean;
  hasTab: boolean;
  updatedAt: string;
  // UI-specific computed properties
  displayTitle: string;
  detailUrl: string;
}

export interface SongDetailView {
  artist: string;
  artistSlug: string;
  title: string;
  songSlug: string;
  key?: string;
  sections: Array<{
    name: string;
    lines: Array<{
      chord?: { name: string };
      lyric: string;
    }>;
  }>;
  chordsHtml?: string;
  tabHtml?: string;
}

export interface SearchResultView {
  id: number;
  title: string;
  artist: string;
  rating: number;
  votes: number;
  score: number;
  type: 'chord' | 'tab';
  displayScore: string;
}

export interface SearchView {
  query: {
    artist: string;
    title: string;
  };
  chords: SearchResultView[];
  tabs: SearchResultView[];
  hasResults: boolean;
}

/**
 * Transform API response to view model for song list
 */
export function toSongsListView(songs: SavedSongResponse[]): SavedSongView[] {
  return songs.map(song => ({
    ...song,
    displayTitle: `${song.artist} - ${song.title}`,
    detailUrl: `/songs/${song.artistSlug}/${song.songSlug}`,
  }));
}

/**
 * Transform API response to view model for song detail
 */
export function toSongDetailView(response: SongDetailResponse): SongDetailView | null {
  if (!response.songJson) {
    return null;
  }

  return {
    artist: response.summary.artist,
    artistSlug: response.summary.artistSlug,
    title: response.summary.title,
    songSlug: response.summary.songSlug,
    key: response.songJson.key,
    sections: response.songJson.sections,
    chordsHtml: response.chordsHtml,
    tabHtml: response.tabHtml,
  };
}

/**
 * Transform search result to view model
 */
function toSearchResultView(result: SearchResultResponse, type: 'chord' | 'tab'): SearchResultView {
  return {
    ...result,
    type,
    displayScore: `${result.rating.toFixed(1)} (${result.votes} votes)`,
  };
}

/**
 * Transform search response to view model
 */
export function toSearchView(response: SearchResponseData): SearchView {
  const chords = response.chords.map(r => toSearchResultView(r, 'chord'));
  const tabs = response.tabs.map(r => toSearchResultView(r, 'tab'));

  return {
    query: response.query,
    chords,
    tabs,
    hasResults: chords.length > 0 || tabs.length > 0,
  };
}
