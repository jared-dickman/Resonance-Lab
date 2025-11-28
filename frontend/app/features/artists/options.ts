import { artistKeys } from '@/app/features/artists/keys';
import { fetchArtistsList } from '@/app/features/artists/queries';

/**
 * Query options definitions
 * Separates query configuration from hook implementation
 */

export const artistOptions = {
  list: () => ({
    queryKey: artistKeys.list(),
    queryFn: fetchArtistsList,
  }),
};
