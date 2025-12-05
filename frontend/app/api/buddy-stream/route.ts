import type { NextRequest } from 'next/server';
import { Sandbox } from '@vercel/sandbox';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { env } from '@/app/config/env';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';
import { validateApiAuth } from '@/lib/auth/apiAuth';
import { buildSystemPrompt, BUDDY_TOOL_NAMES } from '@/lib/agents/buddy';
import { escapeXmlForLlm } from '@/lib/utils/sanitize';
import { checkRateLimit, getRemainingRequests } from '@/app/utils/rate-limiter';

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
 * Generate the agent script that runs inside the Vercel Sandbox
 * This script uses the Claude Agent SDK with MCP tools
 */
function generateAgentScript(config: {
  systemPrompt: string;
  userPrompt: string;
  model: string;
  maxTurns: number;
  apiBaseUrl: string;
  toolNames: readonly string[];
}): string {
  // Escape strings for JavaScript
  const escapeJs = (s: string) => JSON.stringify(s);

  return `
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';

// Tool executors - make HTTP calls to backend
async function executeSearch(apiBaseUrl, artist, title) {
  const response = await fetch(\`\${apiBaseUrl}/api/search\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artist, title }),
  });
  if (!response.ok) throw new Error(\`Search failed: \${response.status}\`);
  const data = await response.json();
  const blocked = ['Official', 'Pro', 'Guitar Pro'];
  const filter = (r) => r.filter(x => !blocked.includes(x.type));
  return JSON.stringify({ query: data.query, chords: filter(data.chords || []), tabs: filter(data.tabs || []) });
}

async function executeDownload(apiBaseUrl, songUrl, artist, title) {
  const response = await fetch(\`\${apiBaseUrl}/api/songs\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ songUrl, artist, title }),
  });
  if (!response.ok) throw new Error(\`Download failed: \${response.status}\`);
  const data = await response.json();
  return JSON.stringify({ success: true, song: data, message: \`Downloaded "\${data.title}" by \${data.artist}\` });
}

async function executeListArtists(apiBaseUrl) {
  const response = await fetch(\`\${apiBaseUrl}/api/songs\`);
  if (!response.ok) throw new Error(\`Failed to fetch: \${response.status}\`);
  const songs = await response.json();
  const artistMap = new Map();
  for (const song of songs) {
    const existing = artistMap.get(song.artistSlug);
    if (existing) existing.songCount++;
    else artistMap.set(song.artistSlug, { name: song.artist, slug: song.artistSlug, songCount: 1 });
  }
  return JSON.stringify({ artists: Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name)), count: artistMap.size });
}

async function executeGetArtistSongs(apiBaseUrl, artist) {
  const response = await fetch(\`\${apiBaseUrl}/api/songs\`);
  if (!response.ok) throw new Error(\`Failed to fetch: \${response.status}\`);
  const songs = await response.json();
  const lower = artist.toLowerCase();
  const filtered = songs.filter(s => s.artist.toLowerCase() === lower || s.artistSlug.toLowerCase() === lower || s.artist.toLowerCase().includes(lower));
  return JSON.stringify({ artist, songs: filtered, count: filtered.length });
}

function executeNavigate(path, reason) {
  if (!path.startsWith('/')) return JSON.stringify({ error: 'Invalid path' });
  return JSON.stringify({ navigateTo: path, reason: reason || 'Navigating' });
}

// Create MCP server
const apiBaseUrl = ${escapeJs(config.apiBaseUrl)};
let pendingNavigation = null;

const mcpServer = createSdkMcpServer({
  name: 'buddy-tools',
  version: '1.0.0',
  tools: [
    tool('search_ultimate_guitar', 'Search for tabs/chords', { artist: { type: 'string' }, title: { type: 'string' } },
      async (args) => ({ content: [{ type: 'text', text: await executeSearch(apiBaseUrl, args.artist, args.title) }] })),
    tool('download_song', 'Download a song', { songUrl: { type: 'string' }, artist: { type: 'string', optional: true }, title: { type: 'string', optional: true } },
      async (args) => ({ content: [{ type: 'text', text: await executeDownload(apiBaseUrl, args.songUrl, args.artist, args.title) }] })),
    tool('list_artists', 'List all artists', {},
      async () => ({ content: [{ type: 'text', text: await executeListArtists(apiBaseUrl) }] })),
    tool('get_artist_songs', 'Get songs by artist', { artist: { type: 'string' } },
      async (args) => ({ content: [{ type: 'text', text: await executeGetArtistSongs(apiBaseUrl, args.artist) }] })),
    tool('navigate', 'Navigate to page', { path: { type: 'string' }, reason: { type: 'string', optional: true } },
      async (args) => {
        const result = executeNavigate(args.path, args.reason);
        const parsed = JSON.parse(result);
        if (parsed.navigateTo) pendingNavigation = { path: parsed.navigateTo, reason: parsed.reason };
        return { content: [{ type: 'text', text: result }] };
      }),
  ],
});

// Run agent
async function main() {
  const toolNames = ${JSON.stringify(config.toolNames)};

  async function* generateMessages() {
    yield { type: 'user', message: { role: 'user', content: ${escapeJs(config.userPrompt)} } };
  }

  const result = query({
    prompt: generateMessages(),
    options: {
      model: ${escapeJs(config.model)},
      systemPrompt: ${escapeJs(config.systemPrompt)},
      maxTurns: ${config.maxTurns},
      mcpServers: { buddy: mcpServer },
      allowedTools: toolNames.map(n => \`mcp__buddy__\${n}\`),
      permissionMode: 'acceptEdits',
      includePartialMessages: true,
    },
  });

  // Stream events as JSON lines
  for await (const message of result) {
    console.log(JSON.stringify({ type: message.type, data: message }));
  }

  // Output final navigation if any
  if (pendingNavigation) {
    console.log(JSON.stringify({ type: 'navigation', data: pendingNavigation }));
  }

  console.log(JSON.stringify({ type: 'done' }));
}

main().catch(err => {
  console.log(JSON.stringify({ type: 'error', data: { message: err.message } }));
  process.exit(1);
});
`;
}

/**
 * Enterprise-grade streaming agent endpoint using Vercel Sandbox
 * - Runs Claude Agent SDK in isolated sandbox environment
 * - Real-time SSE streaming
 * - MCP tools for song search, download, navigation
 */
export async function POST(request: NextRequest): Promise<Response> {
  // Enterprise security: validate API key
  const authResult = validateApiAuth(request);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  // Rate limiting: 10 requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (!checkRateLimit(ip, 10, 60000)) {
    const remaining = getRemainingRequests(ip, 10);
    logger.warn('[buddy-stream/rate-limit]', { ip, remaining });
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait before retrying.',
        retryAfter: 60
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      }
    );
  }

  const { readable, writable } = new TransformStream();
  const sseStream = createSSEStream();
  const writer = sseStream.writable.getWriter();

  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(JSON.stringify({ event, data }));
  };

  // Process in background, stream results
  (async () => {
    let sandbox: Sandbox | null = null;

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

      // Build prompts
      const systemPrompt = buildSystemPrompt(context || { page: 'home' });
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();

      if (!lastUserMessage) {
        await sendEvent('error', { message: 'No user message found' });
        await writer.close();
        return;
      }

      const historyMessages = messages.slice(0, -1);
      const conversationHistory = historyMessages.length > 0
        ? historyMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${escapeXmlForLlm(m.content)}`).join('\n\n')
        : '';

      const fullPrompt = conversationHistory
        ? `<conversation_history>\n${conversationHistory}\n</conversation_history>\n\nUser: ${escapeXmlForLlm(lastUserMessage.content)}`
        : escapeXmlForLlm(lastUserMessage.content);

      await sendEvent('start', { model: MODEL, tools: BUDDY_TOOL_NAMES });

      // Create Vercel Sandbox
      logger.info('[buddy-stream] Creating sandbox...');
      sandbox = await Sandbox.create({
        timeout: 120_000, // 2 minutes
        runtime: 'node22',
      });
      logger.info('[buddy-stream] Sandbox created', { sandboxId: sandbox.sandboxId });

      // Install dependencies in sandbox
      logger.info('[buddy-stream] Installing dependencies...');
      const installResult = await sandbox.runCommand({
        cmd: 'npm',
        args: ['install', '@anthropic-ai/claude-agent-sdk'],
      });

      if (installResult.exitCode !== 0) {
        throw new Error(`Failed to install dependencies: exit code ${installResult.exitCode}`);
      }
      logger.info('[buddy-stream] Dependencies installed');

      // Generate and write agent script
      const agentScript = generateAgentScript({
        systemPrompt,
        userPrompt: fullPrompt,
        model: MODEL,
        maxTurns: MAX_TURNS,
        apiBaseUrl: API_BASE_URL,
        toolNames: BUDDY_TOOL_NAMES,
      });

      await sandbox.writeFiles([
        { path: '/vercel/sandbox/agent.mjs', content: Buffer.from(agentScript) },
      ]);
      logger.info('[buddy-stream] Agent script written');

      // Run agent with ANTHROPIC_API_KEY
      logger.info('[buddy-stream] Running agent...');

      // Collect output
      let output = '';
      const runResult = await sandbox.runCommand({
        cmd: 'node',
        args: ['agent.mjs'],
        env: {
          ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
        },
        stdout: {
          write: (chunk: Buffer) => {
            output += chunk.toString();
            return true;
          }
        } as unknown as NodeJS.WriteStream,
      });

      logger.info('[buddy-stream] Agent finished', { exitCode: runResult.exitCode });

      // Parse and stream output
      const lines = output.trim().split('\n').filter(Boolean);
      let navigationResult: { path: string; reason?: string } | null = null;

      for (const line of lines) {
        try {
          const event = JSON.parse(line);

          switch (event.type) {
            case 'stream_event':
              if (event.data?.event?.type === 'content_block_delta' &&
                  event.data?.event?.delta?.type === 'text_delta' &&
                  event.data?.event?.delta?.text) {
                await sendEvent('text', { text: event.data.event.delta.text });
              }
              break;
            case 'assistant':
              // Check for tool_use
              if (Array.isArray(event.data?.message?.content)) {
                for (const block of event.data.message.content) {
                  if (block.type === 'tool_use') {
                    await sendEvent('tool_start', { tool: block.name, id: block.id });
                    await sendEvent('thinking', {});
                  }
                }
              }
              break;
            case 'navigation':
              navigationResult = event.data;
              break;
            case 'error':
              await sendEvent('error', { message: event.data?.message || 'Agent error' });
              break;
            case 'done':
              // Complete
              break;
          }
        } catch {
          // Skip malformed lines
          logger.warn('[buddy-stream] Malformed output line', { line });
        }
      }

      // Send completion event
      await sendEvent('complete', {
        usage: { inputTokens: 0, outputTokens: 0 },
        ...(navigationResult ? { navigateTo: navigationResult.path } : {}),
      });

      logger.info('[buddy-stream/done]');

    } catch (err) {
      const errorDetails = serverErrorTracker.captureApiError(err, {
        service: 'buddy-stream',
        operation: 'chat',
      });
      logger.error('[buddy-stream/error]', { error: errorDetails.message });
      await sendEvent('error', { message: errorDetails.message });
    } finally {
      // Always clean up sandbox
      if (sandbox) {
        try {
          await sandbox.stop();
          logger.info('[buddy-stream] Sandbox stopped');
        } catch (stopErr) {
          logger.warn('[buddy-stream] Failed to stop sandbox', { error: stopErr });
        }
      }
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
