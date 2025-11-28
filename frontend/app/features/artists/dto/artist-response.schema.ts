/**
 * Artist Response Types
 * Matches backend /api/artists response shape
 */

export interface ArtistResponse {
  slug: string;
  name: string;
  songCount: number;
}
