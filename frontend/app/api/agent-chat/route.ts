import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { SearchResponse, SearchResult } from '@/lib/types';
import { BLOCKED_TYPES } from '@/lib/agents/ultimate-guitar-search/types';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8080';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Guitar sidekick. Rockstar casual, music slang natural. 1-2 sentences max.

UNDERSTAND MUSIC CONTEXT:
- "in Em/Am/G/etc" = key signature, NOT song title
- The search tool only works with artist + song title
- You DON'T reliably know keys - search UG and use real data!

WHEN USER ASKS FOR SONGS IN A KEY:
- Be honest: UG search doesn't return key info until song is downloaded
- Just search for popular songs by that artist and present options
- DON'T claim to know keys - say "here are popular [Artist] songs, download to check the key"
- NEVER put fake keys in the response

Prefer CHORDS unless user asks for tabs. Fix typos automatically.

NEVER GIVE UP:
- If search fails, try different spelling/variation
- If no exact match, search for just the artist and pick popular songs
- If still nothing, suggest similar artists
- ALWAYS return something useful - never just say "couldn't complete"

Return JSON (use suggestions OR chords/tabs, not both):
\`\`\`json
{
  "suggestions": [{"artist": "...", "title": "..."}],
  "chords": [], "tabs": [],
  "autoDownload": false,
  "message": "Pick one to check its key!"
}
\`\`\`
OR after searching a specific song:
\`\`\`json
{
  "query": { "artist": "Artist", "title": "Title" },
  "chords": [<FULL array>], "tabs": [<FULL array>],
  "autoDownload": true/false,
  "message": "Brief message"
}
\`\`\`

SET autoDownload: true WHEN:
- All results are clearly the same song (just different versions/ratings)
- User asked for a specific song and you found it

SET autoDownload: false WHEN:
- Multiple different songs in results
- You're suggesting alternatives or asking for clarification
- Ambiguous request needs user choice

No results? Try variations, suggest similar songs, or ask what mood they want.`;

const searchTool: Anthropic.Tool = {
  name: 'search_ultimate_guitar',
  description: 'Search Ultimate Guitar for tabs and chords by artist and song title',
  input_schema: {
    type: 'object',
    properties: {
      artist: { type: 'string', description: 'Artist name' },
      title: { type: 'string', description: 'Song title' },
    },
    required: ['artist', 'title'],
  },
};

async function executeSearch(artist: string, title: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artist, title }),
    });

    if (!response.ok) {
      throw new Error(`Search failed with status ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    const filterResults = (results: SearchResult[]): SearchResult[] =>
      results.filter((result) => !BLOCKED_TYPES.includes(result.type));

    return JSON.stringify({
      query: data.query,
      chords: filterResults(data.chords),
      tabs: filterResults(data.tabs),
      message: data.message,
    });
  } catch (error) {
    return JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      query: { artist, title },
      chords: [],
      tabs: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    const anthropic = new Anthropic();

    const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    let response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [searchTool],
      messages: anthropicMessages,
    });

    // Handle tool use loop (max 5 iterations)
    let iterations = 0;
    while (response.stop_reason === 'tool_use' && iterations < 5) {
      iterations++;
      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      if (!toolUseBlock) break;

      logger.info('[agent-chat] Tool call:', { name: toolUseBlock.name, input: toolUseBlock.input });

      const input = toolUseBlock.input as { artist: string; title: string };
      const toolResult = await executeSearch(input.artist, input.title);

      anthropicMessages.push({
        role: 'assistant',
        content: response.content,
      });
      anthropicMessages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUseBlock.id,
            content: toolResult,
          },
        ],
      });

      response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [searchTool],
        messages: anthropicMessages,
      });
    }

    // Extract final text response
    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    const responseText = textBlock?.text || '';

    logger.info('[agent-chat] Response:', { length: responseText.length });

    // Helper to inject artist/title from query into results if missing
    const injectArtistTitle = <T extends { id: number; artist?: string; title?: string }>(
      results: T[],
      query?: { artist: string; title: string }
    ): T[] => {
      if (!query) return results;
      return results.map((r) => ({
        ...r,
        artist: r.artist || query.artist,
        title: r.title || query.title,
      }));
    };

    // Try to extract JSON with search results
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch?.[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]) as {
          query?: { artist: string; title: string };
          chords?: SearchResult[];
          tabs?: SearchResult[];
          message?: string;
          autoDownload?: boolean;
          suggestions?: Array<{ artist: string; title: string; key?: string }>;
        };
        return NextResponse.json({
          message: parsed.message || 'Search complete',
          autoDownload: parsed.autoDownload ?? false,
          suggestions: parsed.suggestions || [],
          results: {
            chords: injectArtistTitle(parsed.chords || [], parsed.query),
            tabs: injectArtistTitle(parsed.tabs || [], parsed.query),
          },
        });
      } catch {
        // Fall through to text response
      }
    }

    // Try direct JSON parse
    try {
      const parsed = JSON.parse(responseText) as {
        query?: { artist: string; title: string };
        chords?: SearchResult[];
        tabs?: SearchResult[];
        message?: string;
        autoDownload?: boolean;
        suggestions?: Array<{ artist: string; title: string; key?: string }>;
      };
      return NextResponse.json({
        message: parsed.message || 'Search complete',
        autoDownload: parsed.autoDownload ?? false,
        suggestions: parsed.suggestions || [],
        results: {
          chords: injectArtistTitle(parsed.chords || [], parsed.query),
          tabs: injectArtistTitle(parsed.tabs || [], parsed.query),
        },
      });
    } catch {
      // Return as conversational response
      return NextResponse.json({
        message: responseText,
        results: { chords: [], tabs: [] },
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    logger.error('[agent-chat] Error:', { message: errorMessage, stack: errorStack });
    return NextResponse.json(
      { error: 'Chat failed', message: errorMessage, stack: errorStack },
      { status: 500 }
    );
  }
}
