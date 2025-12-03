import type { NextRequest } from 'next/server';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { env } from '@/app/config/env';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';
import {
  createBuddyMcpServer,
  BUDDY_TOOL_NAMES,
  buildSystemPrompt,
  parseNavigationResult,
  type BuddyContext,
} from '@/lib/agents/buddy';

export const runtime = 'nodejs';
export const maxDuration = 60;

const API_BASE_URL = env.API_BASE_URL ?? '';
const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES = 50;
const MAX_TURNS = 5;

// Zod schemas for runtime validation
const ChatMessageSchema = z
  .object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  })
  .strict();

const BuddyContextSchema = z
  .object({
    page: z.string().max(50),
    artist: z.string().max(200).optional(),
    song: z.string().max(200).optional(),
    chords: z.array(z.string().max(20)).max(50).optional(),
    key: z.string().max(20).optional(),
  })
  .strict();

const RequestBodySchema = z
  .object({
    messages: z.array(ChatMessageSchema).min(1).max(MAX_MESSAGES),
    context: BuddyContextSchema.optional(),
  })
  .strict();

interface UsageStats {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
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
 * State-of-the-art streaming agent endpoint using Claude Agent SDK
 * - Real-time SSE streaming via query()
 * - MCP server for tool execution
 * - Usage tracking
 * - Graceful error recovery
 */
export async function POST(request: NextRequest): Promise<Response> {
  const abortController = new AbortController();

  // Handle client disconnect
  request.signal.addEventListener('abort', () => {
    logger.info('[buddy-stream/abort] Client disconnected');
    abortController.abort();
  });

  const { readable, writable } = new TransformStream();
  const sseStream = createSSEStream();
  const writer = sseStream.writable.getWriter();

  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(JSON.stringify({ event, data }));
  };

  // Process in background, stream results
  (async () => {
    const usage: UsageStats = {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    };
    let pendingNavigation: { path: string; reason?: string } | null = null;

    try {
      // Runtime validation with Zod
      const rawBody = await request.json();
      const parseResult = RequestBodySchema.safeParse(rawBody);

      if (!parseResult.success) {
        logger.warn('[buddy-stream/validation]', { errors: parseResult.error.flatten() });
        await sendEvent('error', { message: 'Invalid request format' });
        await writer.close();
        return;
      }

      const { messages, context } = parseResult.data;
      logger.info('[buddy-stream/request]', { context, messageCount: messages.length });

      // Create MCP server with tools bound to API
      const buddyMcpServer = createBuddyMcpServer(API_BASE_URL);
      const systemPrompt = buildSystemPrompt(context || { page: 'home' });

      // Build conversation prompt from messages
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (!lastUserMessage) {
        await sendEvent('error', { message: 'No user message found' });
        await writer.close();
        return;
      }

      await sendEvent('start', { model: MODEL, tools: BUDDY_TOOL_NAMES });

      // Use agent-sdk query() for streaming
      const result = query({
        prompt: lastUserMessage.content,
        options: {
          model: MODEL,
          systemPrompt,
          maxTurns: MAX_TURNS,
          abortController,
          mcpServers: {
            buddy: buddyMcpServer,
          },
          allowedTools: BUDDY_TOOL_NAMES.map(name => `mcp__buddy__${name}`),
          permissionMode: 'acceptEdits',
          includePartialMessages: true,
        },
      });

      // Stream messages as they arrive (SDK yields single SDKMessage per iteration)
      for await (const message of result) {
        switch (message.type) {
          case 'assistant': {
            // Full assistant message - skip text blocks (already streamed via stream_event)
            // Only process tool_use and tool_result blocks here
            const assistantMsg = message as { type: 'assistant'; message: { content: unknown } };
            if (Array.isArray(assistantMsg.message.content)) {
              for (const block of assistantMsg.message.content) {
                const b = block as { type: string; text?: string; name?: string; id?: string; tool_use_id?: string; content?: string };
                if (b.type === 'tool_use') {
                  await sendEvent('tool_start', { tool: b.name, id: b.id });
                } else if (b.type === 'tool_result') {
                  await sendEvent('tool_result', { id: b.tool_use_id });

                  // Parse navigation from tool result
                  if (typeof b.content === 'string') {
                    const navResult = parseNavigationResult(b.content);
                    if (navResult?.navigateTo) {
                      pendingNavigation = { path: navResult.navigateTo, reason: navResult.reason };
                    }
                  }
                }
              }
            }
            break;
          }
          case 'stream_event': {
            // Streaming partial message (SDK uses 'stream_event' not 'partial')
            const streamMsg = message as { type: 'stream_event'; event?: { type: string; delta?: { type: string; text?: string } } };
            if (streamMsg.event?.type === 'content_block_delta' && streamMsg.event.delta?.type === 'text_delta' && streamMsg.event.delta.text) {
              await sendEvent('text', { text: streamMsg.event.delta.text });
            }
            break;
          }
          case 'result': {
            // Final result with usage
            const resultMsg = message as { type: 'result'; usage?: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number } };
            if (resultMsg.usage) {
              usage.inputTokens = resultMsg.usage.input_tokens ?? 0;
              usage.outputTokens = resultMsg.usage.output_tokens ?? 0;
              usage.cacheReadTokens = resultMsg.usage.cache_read_input_tokens ?? 0;
              usage.cacheWriteTokens = resultMsg.usage.cache_creation_input_tokens ?? 0;
            }
            break;
          }
        }
      }

      // Calculate cost savings
      const totalInput = usage.inputTokens + usage.cacheWriteTokens;
      const cacheHitRate =
        totalInput > 0 ? ((usage.cacheReadTokens / totalInput) * 100).toFixed(1) : '0.0';
      const estimatedSavings =
        totalInput > 0 ? ((usage.cacheReadTokens * 0.9) / totalInput * 100).toFixed(1) : '0.0';

      // Send final response
      await sendEvent('complete', {
        usage,
        cacheHitRate: `${cacheHitRate}%`,
        estimatedSavings: `${estimatedSavings}%`,
        ...(pendingNavigation && { navigateTo: pendingNavigation.path }),
      });

      logger.info('[buddy-stream/done]', {
        usage,
        cacheHitRate: `${cacheHitRate}%`,
        estimatedSavings: `${estimatedSavings}%`,
      });
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
