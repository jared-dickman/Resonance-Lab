import type { DownloadRequest, SavedSong, SearchResponse, SongDetail } from '@/lib/types';
import { apiRoutes } from '@/app/config/apiRoutes';
import { getAuthHeaders } from '@/lib/auth/clientAuth';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
  return response.json() as Promise<T>;
}

export async function listSavedSongs(): Promise<SavedSong[]> {
  const response = await fetch(apiRoutes.songs, {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });
  return handleResponse<SavedSong[]>(response);
}

export async function fetchSongDetail(artistSlug: string, songSlug: string): Promise<SongDetail> {
  const response = await fetch(apiRoutes.songDetail(artistSlug, songSlug), {
    cache: 'no-store',
    headers: getAuthHeaders(),
  });
  return handleResponse<SongDetail>(response);
}

export async function searchLibrary(artist: string, title: string): Promise<SearchResponse> {
  const response = await fetch(apiRoutes.search, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ artist, title }),
  });
  return handleResponse<SearchResponse>(response);
}

export async function downloadSong(payload: DownloadRequest): Promise<SongDetail> {
  const response = await fetch(apiRoutes.songs, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<SongDetail>(response);
}
