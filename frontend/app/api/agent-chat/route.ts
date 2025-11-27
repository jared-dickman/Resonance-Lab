import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { resonanceServer } from '@/lib/agents/tools/resonance-server';
import type { AgentSearchResponse } from '@/lib/agents/ultimate-guitar-search/types';
import { logger } from '@/lib/logger';

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


function buildPromptString(messages: ChatMessage[]): string {
  return messages.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n');
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    const results = query({
      prompt: buildPromptString(messages),
      options: {
        model: 'haiku' as const,
        maxTurns: 5,
        mcpServers: { resonance: resonanceServer },
        allowedTools: ['mcp__resonance__search_ultimate_guitar'],
        systemPrompt: SYSTEM_PROMPT,
      },
    });

    interface ResultMessage {
      type: string;
      subtype: string;
      result?: string;
      structured_output?: AgentSearchResponse;
      errors?: string[];
    }

    let finalResult: ResultMessage | null = null;

    for await (const message of results) {
      if (message.type === 'result') {
        finalResult = message as ResultMessage;
        break;
      }
    }

    // Parse results from agent response
    if (finalResult?.subtype === 'success') {
      const responseText = finalResult.result || '';

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
          const parsed = JSON.parse(jsonMatch[1]) as AgentSearchResponse & {
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
        const parsed = JSON.parse(responseText) as AgentSearchResponse & {
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
    }

    return NextResponse.json({
      message: 'I couldn\'t complete that search. Please try again.',
      results: { chords: [], tabs: [] },
    });
  } catch (err) {
    logger.error('[agent-chat] Error:', err);
    return NextResponse.json(
      { error: 'Chat failed', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
