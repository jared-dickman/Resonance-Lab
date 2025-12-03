import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/app/config/env';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';
import { songDetailSchema } from '@/app/features/songs/dto/song-response.schema';

const API_BASE_URL = env.API_BASE_URL;

// Security: Validate path parameters with strict bounds
const PathParamsSchema = z.object({
  artist: z.string().min(1).max(200),
  song: z.string().min(1).max(300),
}).strict();

interface RouteParams {
  params: Promise<{ artist: string; song: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  let artist: string | undefined;
  let song: string | undefined;

  if (!API_BASE_URL) {
    serverErrorTracker.captureApiError(new Error('API_BASE_URL not configured'), {
      service: 'songs-api',
      operation: 'get-song-detail',
    });
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  try {
    const resolvedParams = await params;

    // Security: Validate params before URL construction (prevents path traversal)
    const parseResult = PathParamsSchema.safeParse(resolvedParams);
    if (!parseResult.success) {
      serverErrorTracker.captureApiError(
        new Error('Invalid path parameters'),
        {
          service: 'songs-api',
          operation: 'get-song-detail',
          validationErrors: parseResult.error.flatten(),
        }
      );
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    artist = parseResult.data.artist;
    song = parseResult.data.song;

    const response = await fetch(`${API_BASE_URL}/api/songs/${artist}/${song}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      await serverErrorTracker.captureNetworkError(response, {
        service: 'songs-api',
        operation: 'get-song-detail',
        artist,
        title: song,
      });
      return NextResponse.json({ error: 'Song not found' }, { status: response.status });
    }

    const rawData = await response.json();
    return NextResponse.json(songDetailSchema.parse(rawData));
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'songs-api',
      operation: 'get-song-detail',
      artist,
      title: song,
    });
    return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  let artist: string | undefined;
  let song: string | undefined;

  if (!API_BASE_URL) {
    serverErrorTracker.captureApiError(new Error('API_BASE_URL not configured'), {
      service: 'songs-api',
      operation: 'delete-song',
    });
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  try {
    const resolvedParams = await params;

    // Security: Validate params before URL construction (prevents path traversal)
    const parseResult = PathParamsSchema.safeParse(resolvedParams);
    if (!parseResult.success) {
      serverErrorTracker.captureApiError(
        new Error('Invalid path parameters'),
        {
          service: 'songs-api',
          operation: 'delete-song',
          validationErrors: parseResult.error.flatten(),
        }
      );
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    artist = parseResult.data.artist;
    song = parseResult.data.song;

    serverErrorTracker.addBreadcrumb('songs-api', 'Deleting song', { artist, title: song });

    const response = await fetch(`${API_BASE_URL}/api/songs/${artist}/${song}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      await serverErrorTracker.captureNetworkError(response, {
        service: 'songs-api',
        operation: 'delete-song',
        artist,
        title: song,
      });
      return NextResponse.json({ error: 'Failed to delete song' }, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'songs-api',
      operation: 'delete-song',
      artist,
      title: song,
    });
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
  }
}
