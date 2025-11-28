import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/logger';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a brilliant musicology archaeologist and discographer - a deep expert on musical history, artist lineages, and the invisible threads connecting generations of musicians.

EXPERTISE:
- Artist histories, origins, formative years
- Musical genealogies and influence chains (who influenced whom)
- Band formations, lineup changes, side projects
- Discographies with cultural context
- Musical movements, scenes, and their key figures
- Meaningful comparisons between artists

PERSONALITY:
- Passionate but concise (2-3 sentences for simple questions)
- Drop interesting tidbits, not Wikipedia dumps
- Make connections that surprise and delight
- Use music terminology naturally

STRUCTURED RESPONSES:
When your answer fits these patterns, include a JSON block for rich UI rendering:

For influence chains:
\`\`\`json
{
  "structured": {
    "type": "influence_chain",
    "chain": [
      {"artist": "Robert Johnson", "relationship": "pioneered"},
      {"artist": "Muddy Waters", "relationship": "electrified"},
      {"artist": "Rolling Stones", "relationship": "globalized"}
    ]
  }
}
\`\`\`

For artist profiles:
\`\`\`json
{
  "structured": {
    "type": "artist_card",
    "name": "Pink Floyd",
    "yearsActive": "1965-1995",
    "genres": ["Progressive Rock", "Psychedelic"],
    "keyFacts": ["Sold 250M+ records", "DSOTM on charts 950 weeks"],
    "notableWorks": ["Dark Side of the Moon", "The Wall"]
  }
}
\`\`\`

For comparisons:
\`\`\`json
{
  "structured": {
    "type": "comparison",
    "artists": ["Led Zeppelin", "Black Sabbath"],
    "sharedInfluences": ["Blues", "British Invasion"],
    "differences": ["Zeppelin: virtuosity", "Sabbath: doom"],
    "genreOverlap": ["Hard Rock", "Proto-Metal"]
  }
}
\`\`\`

For timelines:
\`\`\`json
{
  "structured": {
    "type": "timeline",
    "artist": "Metallica",
    "events": [
      {"year": 1981, "event": "Band formed in LA", "eventType": "milestone"},
      {"year": 1983, "event": "Kill 'Em All", "eventType": "album"},
      {"year": 1986, "event": "Cliff Burton dies", "eventType": "lineup"}
    ]
  }
}
\`\`\`

For discographies:
\`\`\`json
{
  "structured": {
    "type": "discography",
    "artist": "Hendrix",
    "albums": [
      {"year": 1967, "title": "Are You Experienced", "tracks": ["Purple Haze", "Hey Joe"]},
      {"year": 1968, "title": "Electric Ladyland"}
    ]
  }
}
\`\`\`

RULES:
- Always include conversational message alongside structured data
- Only use structured data when it genuinely helps
- Keep facts accurate - you're an expert, not a guesser
- If unsure, say so rather than fabricate`;

export async function POST(request: NextRequest) {
  try {
    logger.info('[artist-chat/1] request received');

    const { messages } = (await request.json()) as { messages: ChatMessage[] };
    logger.info('[artist-chat/2] messages parsed', { count: messages?.length });

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    const anthropic = new Anthropic();

    const anthropicMessages: Anthropic.MessageParam[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    logger.info('[artist-chat/3] calling Claude');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    const responseText = textBlock?.text || '';

    logger.info('[artist-chat/4] response received', { length: responseText.length });

    // Try to extract structured JSON from the response
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch?.[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]) as { structured?: unknown };
        const cleanMessage = responseText.replace(/```json[\s\S]*?```/g, '').trim();
        return NextResponse.json({
          message: cleanMessage || "Here's what I found:",
          structured: parsed.structured,
        });
      } catch {
        // JSON parsing failed, return as plain text
      }
    }

    return NextResponse.json({ message: responseText });
  } catch (err) {
    const errorDetails = serverErrorTracker.captureApiError(err, {
      service: 'artist-chat',
      operation: 'chat-completion',
    });

    return NextResponse.json(
      { error: 'Chat failed', message: errorDetails.message },
      { status: 500 }
    );
  }
}
