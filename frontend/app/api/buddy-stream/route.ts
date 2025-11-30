import type { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
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

interface UsageStats {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

/**
 * Execute a single tool call
 */
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
      const { songUrl, artist, title } = input as { songUrl: string; artist?: string; title?: string };
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

/**
 * Execute multiple tool calls in parallel when possible
 */
async function executeToolCallsParallel(
  toolUseBlocks: Anthropic.ToolUseBlock[]
): Promise<Map<string, { result: string; navigation?: { path: string; reason?: string } }>> {
  const results = new Map<string, { result: string; navigation?: { path: string; reason?: string } }>();

  // Execute all tools in parallel
  const executions = toolUseBlocks.map(async block => {
    const { result, navigation } = await executeToolCall(block.name, block.input as Record<string, unknown>);
    return { id: block.id, result, navigation };
  });

  const completed = await Promise.all(executions);
  for (const { id, result, navigation } of completed) {
    results.set(id, { result, navigation });
  }

  return results;
}

/**
 * Create SSE encoder for streaming responses
 */
function createSSEStream() {
  const encoder = new TextEncoder();

  return new TransformStream({
    transform(chunk: string, controller) {
      controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
    },
  });
}

/**
 * State-of-the-art streaming agent endpoint
 * - Real-time SSE streaming
 * - Parallel tool execution
 * - Usage tracking
 * - Graceful error recovery
 */
export async function POST(request: NextRequest): Promise<Response> {
  const { readable, writable } = new TransformStream();
  const sseStream = createSSEStream();
  const writer = sseStream.writable.getWriter();

  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(JSON.stringify({ event, data }));
  };

  // Process in background, stream results
  (async () => {
    const usage: UsageStats = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
    let pendingNavigation: { path: string; reason?: string } | null = null;

    try {
      const { messages, context } = (await request.json()) as RequestBody;
      logger.info('[buddy-stream/request]', { context, messageCount: messages?.length });

      if (!messages || messages.length === 0) {
        await sendEvent('error', { message: 'Messages required' });
        await writer.close();
        return;
      }

      const anthropic = new Anthropic();
      const systemPrompt = buildSystemPrompt(context || { page: 'home' });

      const anthropicMessages: Anthropic.MessageParam[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      await sendEvent('start', { model: MODEL, tools: ALL_BUDDY_TOOLS.map(t => t.name) });

      let iterations = 0;
      let continueLoop = true;

      while (continueLoop && iterations < MAX_TOOL_ITERATIONS) {
        iterations++;

        // Stream the response
        const stream = await anthropic.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          tools: [...ALL_BUDDY_TOOLS],
          messages: anthropicMessages,
        });

        let currentText = '';
        const toolUseBlocks: Anthropic.ToolUseBlock[] = [];

        // Stream tokens as they arrive
        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              currentText += event.delta.text;
              await sendEvent('text', { text: event.delta.text });
            }
          } else if (event.type === 'content_block_start') {
            if (event.content_block.type === 'tool_use') {
              await sendEvent('tool_start', { tool: event.content_block.name, id: event.content_block.id });
            }
          } else if (event.type === 'message_delta') {
            if (event.usage) {
              usage.outputTokens += event.usage.output_tokens;
            }
          }
        }

        // Get final message
        const finalMessage = await stream.finalMessage();

        // Track usage
        if (finalMessage.usage) {
          usage.inputTokens += finalMessage.usage.input_tokens;
          usage.outputTokens += finalMessage.usage.output_tokens;
          if ('cache_read_input_tokens' in finalMessage.usage) {
            usage.cacheReadTokens += (finalMessage.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens || 0;
          }
          if ('cache_creation_input_tokens' in finalMessage.usage) {
            usage.cacheWriteTokens += (finalMessage.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens || 0;
          }
        }

        // Collect tool use blocks
        for (const block of finalMessage.content) {
          if (block.type === 'tool_use') {
            toolUseBlocks.push(block);
          }
        }

        // If no tool calls, we're done
        if (finalMessage.stop_reason !== 'tool_use' || toolUseBlocks.length === 0) {
          continueLoop = false;
          break;
        }

        // Execute tools in parallel
        logger.info(`[buddy-stream/tools] executing ${toolUseBlocks.length} tools in parallel`);
        await sendEvent('tools_executing', { count: toolUseBlocks.length });

        const toolResults = await executeToolCallsParallel(toolUseBlocks);

        // Check for navigation
        for (const [, { navigation }] of toolResults) {
          if (navigation) {
            pendingNavigation = navigation;
          }
        }

        // Build tool results for next iteration
        const toolResultContents: Anthropic.ToolResultBlockParam[] = [];
        for (const block of toolUseBlocks) {
          const result = toolResults.get(block.id);
          toolResultContents.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result?.result || JSON.stringify({ error: 'Tool execution failed' }),
          });
          await sendEvent('tool_result', { id: block.id, tool: block.name });
        }

        // Add assistant message and tool results for next iteration
        anthropicMessages.push({ role: 'assistant', content: finalMessage.content });
        anthropicMessages.push({ role: 'user', content: toolResultContents });
      }

      // Send final response
      await sendEvent('complete', {
        usage,
        iterations,
        ...(pendingNavigation && { navigateTo: pendingNavigation.path }),
      });

      logger.info('[buddy-stream/done]', { usage, iterations });
    } catch (err) {
      const errorDetails = serverErrorTracker.captureApiError(err, {
        service: 'buddy-stream',
        operation: 'chat',
      });
      await sendEvent('error', { message: errorDetails.message });
    } finally {
      await writer.close();
    }
  })();

  // Pipe through SSE transform
  sseStream.readable.pipeTo(writable);

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
