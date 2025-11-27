import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { UltimateGuitarSearchAgent } from '@/lib/agents/ultimate-guitar-search';

export async function POST(request: NextRequest) {
  console.log('[agent-search] API key present:', !!process.env.ANTHROPIC_API_KEY);

  try {
    const { artist, title } = await request.json();

    if (!artist || !title) {
      return NextResponse.json(
        { error: 'Missing artist or title' },
        { status: 400 }
      );
    }

    const searchAgent = new UltimateGuitarSearchAgent();
    const result = await searchAgent.searchSongs(artist, title);
    // Debug: add env info to response
    return NextResponse.json({
      ...result,
      _debug: {
        hasApiKey: !!process.env.ANTHROPIC_API_KEY,
        apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
      },
    });
  } catch (err) {
    console.error('[agent-search] Error:', err);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
