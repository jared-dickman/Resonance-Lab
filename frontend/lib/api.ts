import { apiBaseUrl } from '@/lib/utils';
import type { DownloadRequest, SavedSong, SearchResponse, SongDetail } from '@/lib/types';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
  return response.json() as Promise<T>;
}

export async function listSavedSongs(): Promise<SavedSong[]> {
  const response = await fetch(`${apiBaseUrl()}/api/songs`, {
    cache: 'no-store',
  });
  return handleResponse<SavedSong[]>(response);
}

export async function fetchSongDetail(artistSlug: string, songSlug: string): Promise<SongDetail> {
  const response = await fetch(`${apiBaseUrl()}/api/songs/${artistSlug}/${songSlug}`, {
    cache: 'no-store',
  });
  return handleResponse<SongDetail>(response);
}

export async function searchLibrary(artist: string, title: string): Promise<SearchResponse> {
  const response = await fetch('/api/agent-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artist, title }),
  });
  return handleResponse<SearchResponse>(response);
}

export async function downloadSong(payload: DownloadRequest): Promise<SongDetail> {
  const response = await fetch(`${apiBaseUrl()}/api/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<SongDetail>(response);
}
