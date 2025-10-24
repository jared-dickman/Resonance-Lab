import { apiClient } from '@/app/api/client';
import { apiRoutes } from '@/app/config/apiRoutes';
import type {
  SavedSongResponse,
  SongDetailResponse,
  SearchResponseData,
} from '@/app/features/songs/dto/song-response.schema';
import type { DownloadRequestInput, SearchRequestInput } from '@/app/features/songs/dto/song-request.schema';

/**
 * Raw API calls - pure data fetching, no transformations
 */

export async function fetchSongsList(): Promise<SavedSongResponse[]> {
  return apiClient.get<SavedSongResponse[]>(apiRoutes.songs);
}

export async function fetchSongDetail(
  artistSlug: string,
  songSlug: string
): Promise<SongDetailResponse> {
  return apiClient.get<SongDetailResponse>(apiRoutes.songDetail(artistSlug, songSlug));
}

export async function searchSongs(input: SearchRequestInput): Promise<SearchResponseData> {
  return apiClient.post<SearchResponseData>(apiRoutes.search, input);
}

export async function downloadSong(input: DownloadRequestInput): Promise<SongDetailResponse> {
  return apiClient.post<SongDetailResponse>(apiRoutes.songs, input);
}
