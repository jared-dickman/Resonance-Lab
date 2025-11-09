import { songKeys } from '@/app/features/songs/keys';
import {
  fetchSongsList,
  fetchSongDetail,
  searchSongs,
  downloadSong,
  deleteSong,
} from '@/app/features/songs/queries';
import type {
  SearchRequestInput,
  DownloadRequestInput,
} from '@/app/features/songs/dto/song-request.schema';

/**
 * Query options definitions
 * Separates query configuration from hook implementation
 */

export const songOptions = {
  list: () => ({
    queryKey: songKeys.list(),
    queryFn: fetchSongsList,
  }),

  detail: (artistSlug: string, songSlug: string) => ({
    queryKey: songKeys.detail(artistSlug, songSlug),
    queryFn: () => fetchSongDetail(artistSlug, songSlug),
  }),

  search: (input: SearchRequestInput) => ({
    queryKey: songKeys.search(input.artist, input.title),
    queryFn: () => searchSongs(input),
  }),
};

export const songMutations = {
  download: (input: DownloadRequestInput) => downloadSong(input),
  delete: (artistSlug: string, songSlug: string) => deleteSong(artistSlug, songSlug),
};
