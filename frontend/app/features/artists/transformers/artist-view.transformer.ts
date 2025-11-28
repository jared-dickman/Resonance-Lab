import type { ArtistResponse } from '@/app/features/artists/dto/artist-response.schema';

/**
 * Artist View Types
 * Transformed for UI consumption
 */
export interface ArtistView {
  slug: string;
  name: string;
  songCount: number;
  songsUrl: string;
}

/**
 * Transform API response to view model
 */
export function toArtistsListView(artists: ArtistResponse[]): ArtistView[] {
  return artists.map(artist => ({
    slug: artist.slug,
    name: artist.name,
    songCount: artist.songCount,
    songsUrl: `/songs/${artist.slug}`,
  }));
}
