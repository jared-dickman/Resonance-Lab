import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';
import { validateApiAuth } from '@/lib/auth/apiAuth';
import { toArtistsListView } from '@/app/features/artists/transformers/artist-view.transformer';
import { artistsListViewSchema } from '@/app/features/artists/dto/artist-view.schema';
import { findAllSongs } from '@/lib/supabase/songs.repository';

export async function GET(request: NextRequest) {
  const authResult = validateApiAuth(request);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  try {
    const songs = await findAllSongs();

    // Group songs by artist
    const artistMap = new Map<string, { name: string; slug: string; count: number }>();
    for (const song of songs) {
      const existing = artistMap.get(song.artist_slug);
      if (existing) {
        existing.count++;
      } else {
        artistMap.set(song.artist_slug, {
          name: song.artist,
          slug: song.artist_slug,
          count: 1,
        });
      }
    }

    // Convert to array and sort by name
    const artists = Array.from(artistMap.values())
      .map(a => ({ name: a.name, slug: a.slug, songCount: a.count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const viewData = toArtistsListView(artists);
    return NextResponse.json(artistsListViewSchema.parse(viewData));
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'artists-api',
      operation: 'list-artists',
    });
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
