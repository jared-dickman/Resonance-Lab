import { NextResponse } from 'next/server';
import { env } from '@/app/config/env';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';

const API_BASE_URL = env.API_BASE_URL;

export async function GET() {
  if (!API_BASE_URL) {
    serverErrorTracker.captureApiError(new Error('API_BASE_URL not configured'), {
      service: 'artists-api',
      operation: 'list-artists',
    });
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/artists`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      await serverErrorTracker.captureNetworkError(response, {
        service: 'artists-api',
        operation: 'list-artists',
      });
      return NextResponse.json({ error: 'Failed to fetch artists' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'artists-api',
      operation: 'list-artists',
    });
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
}
