import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { SearchResult } from '@/lib/types';
import { logger } from '@/lib/logger';
import { env } from '@/app/config/env';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';
import {
  ALL_BUDDY_TOOLS,
  buildSystemPrompt,
  executeSearch,
  executeDownload,
  executeListArtists,
  executeGetArtistSongs,
  executeNavigate,
  parseNavigationResult,
  type BuddyContext,
} from '@/lib/agents/buddy';

export const runtime = 'nodejs';
export const maxDuration = 60;

const API_BASE_URL = env.API_BASE_URL ?? '';
const MODEL = 'claude-3-5-haiku-latest';
const MAX_TOKENS = 2048;
const MAX_TOOL_ITERATIONS = 5;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  context?: BuddyContext;
}

async function executeToolCall(
  toolName: string,
  input: Record<string, unknown>
): Promise<{ result: string; navigation?: { path: string; reason?: string } }> {
  let result: string;
  let navigation: { path: string; reason?: string } | undefined;

  switch (toolName) {
    case 'search_ultimate_guitar': {
      const { artist, title } = input as { artist: string; title: string };
      result = await executeSearch(API_BASE_URL, artist, title);
      break;
    }
    case 'download_song': {
      const { songUrl, artist, title } = input as {
        songUrl: string;
        artist?: string;
        title?: string;
      };
      result = await executeDownload(API_BASE_URL, songUrl, artist, title);
      break;
    }
    case 'list_artists': {
      result = await executeListArtists(API_BASE_URL);
      break;
    }
    case 'get_artist_songs': {
      const { artist } = input as { artist: string };
      result = await executeGetArtistSongs(API_BASE_URL, artist);
      break;
    }
    case 'navigate': {
      const { path, reason } = input as { path: string; reason?: string };
      result = executeNavigate(path, reason);
      const navResult = parseNavigationResult(result);
      if (navResult?.navigateTo) {
        navigation = { path: navResult.navigateTo, reason: navResult.reason };
      }
      break;
    }
    default:
      result = JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }

  return { result, navigation };
}

function injectArtistTitle<T extends { id: number; artist?: string; title?: string }>(
  results: T[],
  query?: { artist: string; title: string }
): T[] {
  if (!query) return results;
  return results.map(r => ({
    ...r,
    artist: r.artist || query.artist,
    title: r.title || query.title,
  }));
}

function buildResponse(
  responseText: string,
  pendingNavigation: { path: string } | null
): NextResponse {
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);

  if (jsonMatch?.[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]) as {
        query?: { artist: string; title: string };
        chords?: SearchResult[];
        tabs?: SearchResult[];
        message?: string;
        autoDownload?: boolean;
        suggestions?: Array<{ artist: string; title: string }>;
        structured?: unknown;
      };

      const cleanMessage = responseText.replace(/```json[\s\S]*?```/g, '').trim();

      if (parsed.chords || parsed.tabs) {
        return NextResponse.json({
          message: parsed.message || cleanMessage || 'Search complete',
          autoDownload: parsed.autoDownload ?? false,
          suggestions: parsed.suggestions || [],
          results: {
            chords: injectArtistTitle(parsed.chords || [], parsed.query),
            tabs: injectArtistTitle(parsed.tabs || [], parsed.query),
          },
          ...(pendingNavigation && { navigateTo: pendingNavigation.path }),
        });
      }

      if (parsed.structured) {
        return NextResponse.json({
          message: cleanMessage || "Here's what I found:",
          structured: parsed.structured,
          ...(pendingNavigation && { navigateTo: pendingNavigation.path }),
        });
      }
    } catch {
      // Fall through to plain text
    }
  }

  return NextResponse.json({
    message: responseText,
    ...(pendingNavigation && { navigateTo: pendingNavigation.path }),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { messages, context } = (await request.json()) as RequestBody;
    logger.info('[buddy/request]', { context, messageCount: messages?.length });

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    const anthropic = new Anthropic();
    const systemPrompt = buildSystemPrompt(context || { page: 'home' });

    const anthropicMessages: Anthropic.MessageParam[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    let response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: [...ALL_BUDDY_TOOLS],
      messages: anthropicMessages,
    });

    let pendingNavigation: { path: string; reason?: string } | null = null;
    let iterations = 0;

    while (response.stop_reason === 'tool_use' && iterations < MAX_TOOL_ITERATIONS) {
      iterations++;
      logger.info(`[buddy/tool-loop] iteration ${iterations}`);

      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      if (!toolUseBlock) break;

      const { result, navigation } = await executeToolCall(
        toolUseBlock.name,
        toolUseBlock.input as Record<string, unknown>
      );

      if (navigation) {
        pendingNavigation = navigation;
      }

      anthropicMessages.push({ role: 'assistant', content: response.content });
      anthropicMessages.push({
        role: 'user',
        content: [{ type: 'tool_result', tool_use_id: toolUseBlock.id, content: result }],
      });

      response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        tools: [...ALL_BUDDY_TOOLS],
        messages: anthropicMessages,
      });
    }

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    const responseText = textBlock?.text || '';

    logger.info('[buddy/done]', { responseLength: responseText.length });

    return buildResponse(responseText, pendingNavigation);
  } catch (err) {
    const errorDetails = serverErrorTracker.captureApiError(err, {
      service: 'buddy',
      operation: 'chat',
    });

    return NextResponse.json({ error: 'Chat failed', message: errorDetails.message }, { status: 500 });
  }
}
