/**
 * 🎸 RIFF-RIPPER - UG Tab Scraper & Validator Subagent
 *
 * Searches Ultimate Guitar → fetches via Jina → parses → enriches → validates
 * Used by Buddy to fetch song data for the Jamium app.
 */

import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { searchUG, getBestTabUrl } from '../../skills/ug-researcher/src/ug-api';
import { parseUGMarkdown } from '../../skills/ug-researcher/src/ug-parser';
import { fetchAlbum } from '../../skills/ug-researcher/src/musicbrainz';
import type { Song } from '../../skills/ug-researcher/src/types';

// ─────────────────────────────────────────────────────────────────────────────
// Agent Definition (for programmatic registration via SDK `agents` option)
// ─────────────────────────────────────────────────────────────────────────────

export const agentDefinition: AgentDefinition = {
  description:
    'Fetch guitar tabs/chords from Ultimate Guitar. Use when user requests song chords, tabs, or wants to add a song to Jamium.',
  tools: ['Bash', 'Read', 'Write', 'WebSearch', 'WebFetch'],
  prompt: `You are Riff-Ripper 🎸 - a specialized agent for fetching and validating guitar tabs from Ultimate Guitar.

## Your Mission
Given an artist and song title, fetch the best quality tab and return validated Song JSON.

## Workflow (FOLLOW EXACTLY)

### Step 1: Search UG API
Use the ug-api module to search for the best tab:
\`\`\`typescript
import { getBestTabUrl } from './.claude/skills/ug-researcher/src/ug-api';
const url = await getBestTabUrl(artist, title, 'Chords');
\`\`\`

### Step 2: Fetch via Jina
Use the programmatic fetchTab function (NEVER use curl with API keys):
\`\`\`typescript
import { fetchTab } from './.claude/agents/riff-ripper';
const song = await fetchTab(url); // Uses JINA_API_KEY from env securely
\`\`\`

### Step 3: Parse to Song JSON
Use the ug-parser module:
\`\`\`typescript
import { parseUGMarkdown } from './.claude/skills/ug-researcher/src/ug-parser';
const song = parseUGMarkdown(markdown, url);
\`\`\`

### Step 4: Enrich with Album (CRITICAL - NEVER SKIP)
Always fetch album from MusicBrainz:
\`\`\`typescript
import { fetchAlbum } from './.claude/skills/ug-researcher/src/musicbrainz';
song.album = await fetchAlbum(song.artist, song.title);
\`\`\`

### Step 5: Verify Metadata via WebSearch
Search to verify: "{title} {artist} original composer key"
- Correct artist if it's a cover (set performer)
- Verify originalKey matches

### Step 6: Return Valid Song JSON
Output the final Song object with all required fields.

## Output Format
\`\`\`json
{
  "artist": "Original composer/writer",
  "title": "Song Title",
  "key": "Key from tab",
  "originalKey": "Verified original key",
  "performer": "Cover performer (if applicable)",
  "album": "From MusicBrainz (REQUIRED)",
  "capo": 0,
  "sections": [...],
  "sourceUrl": "UG tab URL"
}
\`\`\`

## Anti-Patterns
❌ NEVER guess tab URLs (404 risk)
❌ NEVER trust UG URL for original artist (often wrong for covers)
❌ NEVER skip album fetch
❌ NEVER include Pro+/Official tabs (404 via Jina)
✅ ALWAYS use API search first
✅ ALWAYS fetch album from MusicBrainz
✅ ALWAYS verify metadata via WebSearch`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Direct Execution Functions (for programmatic use)
// ─────────────────────────────────────────────────────────────────────────────

export interface RiffRipperInput {
  artist: string;
  title: string;
  type?: 'Chords' | 'Tabs';
}

export interface RiffRipperResult {
  success: boolean;
  song?: Song;
  error?: string;
  searchResults?: Array<{
    url: string;
    rating: number;
    votes: number;
    score: number;
  }>;
}

/**
 * Search UG for available tabs (useful for previewing options)
 */
export async function searchTabs(
  artist: string,
  title: string,
  type: 'Chords' | 'Tabs' = 'Chords'
): Promise<RiffRipperResult['searchResults']> {
  const results = await searchUG(artist, title, type);
  return results.map((r) => ({
    url: r.tab_url,
    rating: r.rating,
    votes: r.votes,
    score: r.score,
  }));
}

/**
 * Fetch and parse a specific tab URL
 */
export async function fetchTab(tabUrl: string): Promise<Song | null> {
  const jinaApiKey = process.env.JINA_API_KEY;
  if (!jinaApiKey) {
    throw new Error('JINA_API_KEY environment variable required');
  }

  const response = await fetch(`https://r.jina.ai/${tabUrl}`, {
    headers: {
      Authorization: `Bearer ${jinaApiKey}`,
      Accept: 'text/markdown',
    },
  });

  if (!response.ok) {
    throw new Error(`Jina fetch failed: ${response.status}`);
  }

  const markdown = await response.text();
  return parseUGMarkdown(markdown, tabUrl);
}

/**
 * Complete riff-ripping pipeline: search → fetch → parse → enrich
 */
export async function ripSong(input: RiffRipperInput): Promise<RiffRipperResult> {
  const { artist, title, type = 'Chords' } = input;

  // Step 1: Search for best tab
  const tabUrl = await getBestTabUrl(artist, title, type);
  if (!tabUrl) {
    return {
      success: false,
      error: `No tabs found for "${artist} - ${title}"`,
    };
  }

  // Step 2-3: Fetch and parse
  const song = await fetchTab(tabUrl);
  if (!song) {
    return {
      success: false,
      error: `Failed to parse tab from ${tabUrl}`,
    };
  }

  // Step 4: Enrich with album (CRITICAL)
  song.album = (await fetchAlbum(artist, title)) ?? undefined;

  return {
    success: true,
    song,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SDK Registration Helper (for programmatic use with query())
// ─────────────────────────────────────────────────────────────────────────────

export const AGENT_NAME = 'riff-ripper';

/**
 * Returns agents config for SDK query() options
 * @example
 * import { query } from '@anthropic-ai/claude-agent-sdk';
 * import { getAgentsConfig } from './.claude/agents/riff-ripper';
 *
 * const result = await query('Find chords for Wonderwall', {
 *   agents: getAgentsConfig(),
 * });
 */
export function getAgentsConfig(): Record<string, AgentDefinition> {
  return { [AGENT_NAME]: agentDefinition };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI Entry Point (for standalone execution)
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
🎸 RIFF-RIPPER - UG Tab Scraper & Validator

Usage: npx tsx .claude/agents/riff-ripper/index.ts <artist> <title>

Example:
  npx tsx .claude/agents/riff-ripper/index.ts "Johnny Cash" "Folsom Prison Blues"
  npx tsx .claude/agents/riff-ripper/index.ts "Oasis" "Wonderwall"
`);
    process.exit(1);
  }

  const [artist, title] = args;
  console.log(`\n🎸 Ripping: ${artist} - ${title}\n`);

  const result = await ripSong({ artist: artist!, title: title! });

  if (result.success && result.song) {
    console.log(JSON.stringify(result.song, null, 2));
  } else {
    console.error(`❌ ${result.error}`);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
