import type { SearchResponse, SearchResult } from '@/lib/types';
import { logger } from '@/lib/logger';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';

const BLOCKED_TYPES = ['Official', 'Pro', 'Guitar Pro'];

interface Song {
  artist: string;
  artistSlug: string;
  title: string;
  [key: string]: unknown;
}

interface NavigateResult {
  navigateTo?: string;
  reason?: string;
  error?: string;
}

export async function executeSearch(
  apiBaseUrl: string,
  artist: string,
  title: string
): Promise<string> {
  const searchUrl = `${apiBaseUrl}/api/search`;
  logger.info('[buddy/search] starting', { artist, title });

  try {
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artist, title }),
    });

    if (!response.ok) {
      throw new Error(`Search failed with status ${response.status}`);
    }

    const data: SearchResponse = await response.json();

    const filterResults = (results: SearchResult[]): SearchResult[] =>
      results.filter(result => !BLOCKED_TYPES.includes(result.type));

    return JSON.stringify({
      query: data.query,
      chords: filterResults(data.chords),
      tabs: filterResults(data.tabs),
      message: data.message,
    });
  } catch (error) {
    serverErrorTracker.captureApiError(error, {
      service: 'buddy',
      operation: 'execute-search',
      artist,
      title,
    });
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({
      error: errorMsg,
      query: { artist, title },
      chords: [],
      tabs: [],
    });
  }
}

export async function executeDownload(
  apiBaseUrl: string,
  songUrl: string,
  artist?: string,
  title?: string
): Promise<string> {
  logger.info('[buddy/download] starting', { songUrl, artist, title });

  try {
    const response = await fetch(`${apiBaseUrl}/api/songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ songUrl, artist, title }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Download failed: ${text || response.status}`);
    }

    const data = await response.json();
    return JSON.stringify({
      success: true,
      song: data,
      message: `Successfully downloaded "${data.title}" by ${data.artist}`,
    });
  } catch (error) {
    serverErrorTracker.captureApiError(error, {
      service: 'buddy',
      operation: 'download-song',
      songUrl,
    });
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({ success: false, error: errorMsg });
  }
}

export async function executeListArtists(apiBaseUrl: string): Promise<string> {
  logger.info('[buddy/list-artists] starting');

  try {
    const response = await fetch(`${apiBaseUrl}/api/songs`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.status}`);
    }

    const songs: Song[] = await response.json();
    const artistMap = new Map<string, { name: string; slug: string; songCount: number }>();

    for (const song of songs) {
      const existing = artistMap.get(song.artistSlug);
      if (existing) {
        existing.songCount++;
      } else {
        artistMap.set(song.artistSlug, {
          name: song.artist,
          slug: song.artistSlug,
          songCount: 1,
        });
      }
    }

    const artists = Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    return JSON.stringify({ artists, count: artists.length });
  } catch (error) {
    serverErrorTracker.captureApiError(error, {
      service: 'buddy',
      operation: 'list-artists',
    });
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({ error: errorMsg, artists: [] });
  }
}

export async function executeGetArtistSongs(apiBaseUrl: string, artist: string): Promise<string> {
  logger.info('[buddy/get-artist-songs] starting', { artist });

  try {
    const response = await fetch(`${apiBaseUrl}/api/songs`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch songs: ${response.status}`);
    }

    const allSongs: Song[] = await response.json();
    const artistLower = artist.toLowerCase();
    const artistSongs = allSongs.filter(
      (song: Song) =>
        song.artist.toLowerCase() === artistLower ||
        song.artistSlug.toLowerCase() === artistLower ||
        song.artist.toLowerCase().includes(artistLower)
    );

    return JSON.stringify({
      artist,
      songs: artistSongs,
      count: artistSongs.length,
    });
  } catch (error) {
    serverErrorTracker.captureApiError(error, {
      service: 'buddy',
      operation: 'get-artist-songs',
      artist,
    });
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({ error: errorMsg, songs: [] });
  }
}

export function executeNavigate(path: string, reason?: string): string {
  logger.info('[buddy/navigate]', { path, reason });

  if (!path.startsWith('/')) {
    return JSON.stringify({ error: 'Invalid path - must start with /', navigateTo: null });
  }

  return JSON.stringify({
    navigateTo: path,
    reason: reason || 'Navigating to requested page',
  });
}

export function parseNavigationResult(toolResult: string): NavigateResult | null {
  try {
    const result = JSON.parse(toolResult) as NavigateResult;
    return result.navigateTo ? result : null;
  } catch {
    return null;
  }
}
