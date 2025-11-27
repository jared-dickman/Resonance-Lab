import type {
  SavedSongResponse,
  SongDetailResponse,
  SearchResponseData,
} from '@/app/features/songs/dto/song-response.schema';
import type {
  DownloadRequestInput,
  SearchRequestInput,
} from '@/app/features/songs/dto/song-request.schema';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
  return response.json() as Promise<T>;
}

export async function fetchSongsList(): Promise<SavedSongResponse[]> {
  const response = await fetch('/api/songs', { cache: 'no-store' });
  return handleResponse<SavedSongResponse[]>(response);
}

export async function fetchSongDetail(
  artistSlug: string,
  songSlug: string
): Promise<SongDetailResponse> {
  const response = await fetch(`/api/songs/${artistSlug}/${songSlug}`, { cache: 'no-store' });
  return handleResponse<SongDetailResponse>(response);
}

export async function searchSongs(input: SearchRequestInput): Promise<SearchResponseData> {
  const response = await fetch('/api/agent-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<SearchResponseData>(response);
}

export async function downloadSong(input: DownloadRequestInput): Promise<SongDetailResponse> {
  const response = await fetch('/api/songs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<SongDetailResponse>(response);
}

export async function deleteSong(artistSlug: string, songSlug: string): Promise<void> {
  const response = await fetch(`/api/songs/${artistSlug}/${songSlug}`, { method: 'DELETE' });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
}
