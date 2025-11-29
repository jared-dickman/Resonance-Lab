import { NextResponse } from 'next/server';
import { env } from '@/app/config/env';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';

const API_BASE_URL = env.API_BASE_URL;

interface Song {
  artist: string;
  artistSlug: string;
}

interface ArtistResponse {
  name: string;
  slug: string;
  songCount: number;
}

export async function GET() {
  if (!API_BASE_URL) {
    serverErrorTracker.captureApiError(new Error('API_BASE_URL not configured'), {
      service: 'artists-api',
      operation: 'list-artists',
    });
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  try {
    // Fetch songs and derive artists from them
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      await serverErrorTracker.captureNetworkError(response, {
        service: 'artists-api',
        operation: 'list-artists',
      });
      return NextResponse.json({ error: 'Failed to fetch artists' }, { status: response.status });
    }

    const songs: Song[] = await response.json();

    // Group songs by artist
    const artistMap = new Map<string, { name: string; slug: string; count: number }>();
    for (const song of songs) {
      const existing = artistMap.get(song.artistSlug);
      if (existing) {
        existing.count++;
      } else {
        artistMap.set(song.artistSlug, {
          name: song.artist,
          slug: song.artistSlug,
          count: 1,
        });
      }
    }

    // Convert to array and sort by name
    const artists: ArtistResponse[] = Array.from(artistMap.values())
      .map(a => ({ name: a.name, slug: a.slug, songCount: a.count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(artists);
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'artists-api',
      operation: 'list-artists',
    });
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
}
