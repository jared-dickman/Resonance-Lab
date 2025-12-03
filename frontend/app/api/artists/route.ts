import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/app/config/env';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';

const API_BASE_URL = env.API_BASE_URL;
const REQUEST_TIMEOUT_MS = 5000;
const MAX_SONGS = 10000;

// Backend response validation schema
const songItemSchema = z.object({
  artist: z.string().max(200),
  artistSlug: z.string().max(300),
}).passthrough(); // Allow other fields but validate required ones

const songsResponseSchema = z.array(songItemSchema).max(MAX_SONGS);

const artistResponseSchema = z.object({
  name: z.string(),
  slug: z.string(),
  songCount: z.number(),
});
const artistsResponseSchema = z.array(artistResponseSchema);
type ArtistResponse = z.infer<typeof artistResponseSchema>;

export async function GET() {
  if (!API_BASE_URL) {
    serverErrorTracker.captureApiError(new Error('API_BASE_URL not configured'), {
      service: 'artists-api',
      operation: 'list-artists',
    });
    return NextResponse.json({ error: 'Service configuration error' }, { status: 500 });
  }

  try {
    // Fetch songs with timeout
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      await serverErrorTracker.captureNetworkError(response, {
        service: 'artists-api',
        operation: 'list-artists',
      });
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }

    const rawData = await response.json();

    // Validate backend response
    const parseResult = songsResponseSchema.safeParse(rawData);
    if (!parseResult.success) {
      serverErrorTracker.captureApiError(
        new Error('Invalid backend response schema'),
        {
          service: 'artists-api',
          operation: 'list-artists',
          zodError: parseResult.error,
        }
      );
      return NextResponse.json({ error: 'Invalid data format' }, { status: 500 });
    }

    const songs = parseResult.data;

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

    return NextResponse.json(artistsResponseSchema.parse(artists));
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'artists-api',
      operation: 'list-artists',
    });

    // Generic error message - specifics only in logs
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }

    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
