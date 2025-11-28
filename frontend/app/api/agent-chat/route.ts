import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { SearchResponse, SearchResult } from '@/lib/types';
import { BLOCKED_TYPES } from '@/lib/agents/ultimate-guitar-search/types';
import { logger } from '@/lib/logger';
import { env } from '@/app/config/env';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const API_BASE_URL = env.API_BASE_URL;

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

DEDUPE SIMILAR TITLES:
- "Can't Stop" vs "Cant Stop" = SAME SONG - only show ONE
- When you see spelling variants of the same song, pick the CHORDS version with HIGHEST rating/hits
- Never present near-duplicate titles as separate options
- Compare normalized titles (lowercase, no apostrophes/special chars) to detect dupes

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
  const searchUrl = `${API_BASE_URL}/api/search`;
  logger.info('[SEARCH/1] starting search', { searchUrl, artist, title });

  try {
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artist, title }),
    });
    logger.info('[SEARCH/2] fetch complete', { status: response.status, ok: response.ok });

    if (!response.ok) {
      throw new Error(`Search failed with status ${response.status}`);
    }

    const data: SearchResponse = await response.json();
    logger.info('[SEARCH/3] data parsed', { chordsCount: data.chords?.length, tabsCount: data.tabs?.length });

    const filterResults = (results: SearchResult[]): SearchResult[] =>
      results.filter((result) => !BLOCKED_TYPES.includes(result.type));

    return JSON.stringify({
      query: data.query,
      chords: filterResults(data.chords),
      tabs: filterResults(data.tabs),
      message: data.message,
    });
  } catch (error) {
    serverErrorTracker.captureApiError(error, {
      service: 'agent-chat',
      operation: 'execute-search',
      artist,
      title,
      searchUrl,
    });
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({
      error: errorMsg,
      query: { artist, title },
      chords: [],
      tabs: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.info('[1/START] agent-chat request received', { API_BASE_URL });

    const { messages } = (await request.json()) as { messages: ChatMessage[] };
    logger.info('[2/INPUT] messages parsed', { count: messages?.length });

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    logger.info('[3/INIT] creating Anthropic client');
    const anthropic = new Anthropic();

    const anthropicMessages: Anthropic.MessageParam[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    logger.info('[4/CALL] calling Claude API');
    let response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [searchTool],
      messages: anthropicMessages,
    });
    logger.info('[5/RESP] Claude response received', { stopReason: response.stop_reason });

    // Agentic tool use loop (max 5 iterations)
    let iterations = 0;
    while (response.stop_reason === 'tool_use' && iterations < 5) {
      iterations++;
      logger.info(`[6/LOOP] tool use iteration ${iterations}`);

      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      if (!toolUseBlock) {
        logger.info('[6/LOOP] no tool block found, breaking');
        break;
      }

      logger.info('[7/TOOL] executing tool', { name: toolUseBlock.name, input: toolUseBlock.input });

      const input = toolUseBlock.input as { artist: string; title: string };
      const toolResult = await executeSearch(input.artist, input.title);
      logger.info('[8/RESULT] tool result received', { length: toolResult.length });

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

    logger.info('[9/FINAL] response extracted', { length: responseText.length, stopReason: response.stop_reason });

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
    // Capture error with full context for debugging
    const errorDetails = serverErrorTracker.captureApiError(err, {
      service: 'agent-chat',
      operation: 'chat-completion',
    });

    // Return safe error to client (NO stack trace)
    return NextResponse.json(
      { error: 'Chat failed', message: errorDetails.message },
      { status: 500 }
    );
  }
}
