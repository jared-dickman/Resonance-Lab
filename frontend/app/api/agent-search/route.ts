import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { UltimateGuitarSearchAgent } from '@/lib/agents/ultimate-guitar-search';

const searchAgent = new UltimateGuitarSearchAgent();

export async function POST(request: NextRequest) {
  try {
    const { artist, title } = await request.json();

    if (!artist || !title) {
      return NextResponse.json(
        { error: 'Missing artist or title' },
        { status: 400 }
      );
    }

    const result = await searchAgent.searchSongs(artist, title);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
