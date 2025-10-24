import { songKeys } from './keys';
import { fetchSongsList, fetchSongDetail, searchSongs, downloadSong } from './queries';
import type { SearchRequestInput, DownloadRequestInput } from './dto/song-request.schema';

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
};
