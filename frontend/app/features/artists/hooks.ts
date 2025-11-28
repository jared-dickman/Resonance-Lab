'use client';

import { useApiQuery } from '@/app/hooks/query-hooks';
import { artistOptions } from '@/app/features/artists/options';
import { toArtistsListView } from '@/app/features/artists/transformers/artist-view.transformer';
import type { ArtistResponse } from '@/app/features/artists/dto/artist-response.schema';
import type { ArtistView } from '@/app/features/artists/transformers/artist-view.transformer';

/**
 * Component API - Feature hooks that components import
 * These are the ONLY hooks that components should use for artists data
 */

/**
 * Fetch list of all artists in the library
 *
 * @example
 * const { data: artists, isLoading, error } = useArtists();
 */
export function useArtists() {
  const options = artistOptions.list();

  return useApiQuery<ArtistResponse[], Error, ArtistView[]>(options.queryKey, options.queryFn, {
    select: toArtistsListView,
    staleTime: 5 * 60 * 1000, // 5 minutes - matches backend cache
  });
}
