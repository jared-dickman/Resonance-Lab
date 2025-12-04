import { apiRoutes } from '@/app/config/apiRoutes';
import type { ArtistResponse } from '@/app/features/artists/dto/artist-response.schema';
import { getAuthHeaders } from '@/lib/auth/clientAuth';

/**
 * Fetch all artists from the library
 */
export async function fetchArtistsList(): Promise<ArtistResponse[]> {
  const response = await fetch(apiRoutes.artists, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch artists: ${response.statusText}`);
  }

  return response.json();
}
