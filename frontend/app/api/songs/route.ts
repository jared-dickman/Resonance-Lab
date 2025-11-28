import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { env } from '@/app/config/env';

const API_BASE_URL = env.API_BASE_URL;

export async function GET() {
  if (!API_BASE_URL) {
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch songs' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    logger.error('[api/songs] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: text || 'Failed to save song' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    logger.error('[api/songs] POST error:', err);
    return NextResponse.json({ error: 'Failed to save song' }, { status: 500 });
  }
}
