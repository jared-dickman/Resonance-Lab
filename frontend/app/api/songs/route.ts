import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '@/app/config/env';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';
import { downloadRequestSchema } from '@/app/features/songs/dto/song-request.schema';
import { savedSongSchema } from '@/app/features/songs/dto/song-response.schema';
import { z } from 'zod';

const API_BASE_URL = env.API_BASE_URL;

// Generic error messages (never expose backend details)
const GENERIC_ERRORS = {
  CONFIG: 'Service configuration error',
  FETCH: 'Failed to fetch songs',
  SAVE: 'Failed to save song',
  VALIDATION: 'Invalid request data',
} as const;

// GET list response validation
const songsListSchema = z.array(savedSongSchema);

export async function GET() {
  if (!API_BASE_URL) {
    serverErrorTracker.captureApiError(new Error('API_BASE_URL not configured'), {
      service: 'songs-api',
      operation: 'get-songs',
    });
    return NextResponse.json({ error: GENERIC_ERRORS.CONFIG }, { status: 500 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      await serverErrorTracker.captureNetworkError(response, {
        service: 'songs-api',
        operation: 'get-songs',
      });
      return NextResponse.json({ error: GENERIC_ERRORS.FETCH }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(songsListSchema.parse(data));
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'songs-api',
      operation: 'get-songs',
    });
    return NextResponse.json({ error: GENERIC_ERRORS.FETCH }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!API_BASE_URL) {
    serverErrorTracker.captureApiError(new Error('API_BASE_URL not configured'), {
      service: 'songs-api',
      operation: 'save-song',
    });
    return NextResponse.json({ error: GENERIC_ERRORS.CONFIG }, { status: 500 });
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = downloadRequestSchema.safeParse(body);

    if (!validationResult.success) {
      // Log validation errors with sanitized input metadata
      serverErrorTracker.captureApiError(
        new Error('Request validation failed'),
        {
          service: 'songs-api',
          operation: 'save-song',
          validationErrors: validationResult.error.flatten(),
          // Only log presence of fields, not values
          receivedFields: Object.keys(body),
        }
      );
      return NextResponse.json(
        { error: GENERIC_ERRORS.VALIDATION },
        { status: 400 }
      );
    }

    const validatedBody = validationResult.data;

    // Safe breadcrumb with sanitized data (limited length)
    serverErrorTracker.addBreadcrumb('songs-api', 'Saving song', {
      hasSongUrl: !!validatedBody.songUrl,
      hasArtist: !!validatedBody.artist,
      hasTitle: !!validatedBody.title,
    });

    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedBody),
    });

    if (!response.ok) {
      // Never expose backend error text to frontend
      await serverErrorTracker.captureNetworkError(response, {
        service: 'songs-api',
        operation: 'save-song',
        hasArtist: !!validatedBody.artist,
        hasTitle: !!validatedBody.title,
      });
      return NextResponse.json(
        { error: GENERIC_ERRORS.SAVE },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(savedSongSchema.parse(data));
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'songs-api',
      operation: 'save-song',
    });
    return NextResponse.json({ error: GENERIC_ERRORS.SAVE }, { status: 500 });
  }
}
