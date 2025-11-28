import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { searchSongs } from '@/lib/agents/ultimate-guitar-search';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';

export async function POST(request: NextRequest) {
  let artist: string | undefined;
  let title: string | undefined;

  try {
    const body = await request.json();
    artist = body.artist;
    title = body.title;

    if (!artist || !title) {
      return NextResponse.json({ error: 'Missing artist or title' }, { status: 400 });
    }

    serverErrorTracker.addBreadcrumb('agent-search', 'Starting search', { artist, title });

    const result = await searchSongs(artist, title);
    return NextResponse.json(result);
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'agent-search',
      operation: 'search-songs',
      artist,
      title,
    });

    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
