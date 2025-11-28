import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '@/app/config/env';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';

const API_BASE_URL = env.API_BASE_URL;

export async function GET() {
  if (!API_BASE_URL) {
    serverErrorTracker.captureApiError(new Error('API_BASE_URL not configured'), {
      service: 'songs-api',
      operation: 'get-songs',
    });
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
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
      return NextResponse.json({ error: 'Failed to fetch songs' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'songs-api',
      operation: 'get-songs',
    });
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!API_BASE_URL) {
    serverErrorTracker.captureApiError(new Error('API_BASE_URL not configured'), {
      service: 'songs-api',
      operation: 'save-song',
    });
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    serverErrorTracker.addBreadcrumb('songs-api', 'Saving song', {
      artist: body.artist,
      title: body.title,
    });

    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      await serverErrorTracker.captureNetworkError(response, {
        service: 'songs-api',
        operation: 'save-song',
        artist: body.artist,
        title: body.title,
      });
      return NextResponse.json({ error: text || 'Failed to save song' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'songs-api',
      operation: 'save-song',
    });
    return NextResponse.json({ error: 'Failed to save song' }, { status: 500 });
  }
}
