import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const API_BASE_URL = process.env.API_BASE_URL;

interface RouteParams {
  params: Promise<{ artist: string; song: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  if (!API_BASE_URL) {
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  try {
    const { artist, song } = await params;
    const response = await fetch(`${API_BASE_URL}/api/songs/${artist}/${song}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    logger.error('[api/songs/[artist]/[song]] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  if (!API_BASE_URL) {
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  try {
    const { artist, song } = await params;
    const response = await fetch(`${API_BASE_URL}/api/songs/${artist}/${song}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete song' },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    logger.error('[api/songs/[artist]/[song]] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
  }
}
