import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z, type ZodRawShape } from 'zod';
import {
  executeSearch,
  executeDownload,
  executeListArtists,
  executeGetArtistSongs,
  executeNavigate,
} from './executors';

// =============================================================================
// TOOL DEFINITIONS
// Following Anthropic's ACI (Agent-Computer Interface) best practices:
// - Clear descriptions like docstrings for a junior dev
// - Examples for every tool
// - Edge cases documented
// - Poka-yoke: make wrong thing impossible
// =============================================================================

// Tool input schemas (Zod) - cast to ZodRawShape for SDK compatibility
export const SearchInputSchema = {
  artist: z
    .string()
    .describe('Full artist/band name. Fix typos. Expand abbreviations.'),
  title: z.string().describe('Song title. Drop unnecessary words if search fails.'),
} as ZodRawShape;

export const DownloadInputSchema = {
  songUrl: z
    .string()
    .describe(
      'The Ultimate Guitar URL from search results. Format: https://tabs.ultimate-guitar.com/...'
    ),
  artist: z.string().optional().describe('Artist name (optional, for logging)'),
  title: z.string().optional().describe('Song title (optional, for logging)'),
} as ZodRawShape;

export const GetArtistSongsInputSchema = {
  artist: z
    .string()
    .describe('Artist name or slug. Case-insensitive. Partial matches work.'),
} as ZodRawShape;

export const NavigateInputSchema = {
  path: z.string().describe('URL path. Use Title_Case_With_Underscores for slugs.'),
  reason: z.string().optional().describe('Brief reason shown to user. Keep it casual.'),
} as ZodRawShape;

// Tool descriptions
const SEARCH_DESCRIPTION = `Search Ultimate Guitar for tabs and chords.

WHEN TO USE: User wants to find a song they don't have yet.

RETURNS: Array of results with songUrl, artist, title, type, rating.
- Use the songUrl from results to download
- Results include both "Chords" and "Tab" types
- Prefer "Chords" type unless user specifically asks for tabs

EXAMPLES:
- "Find Wonderwall" → artist: "Oasis", title: "Wonderwall"
- "Get me some Hendrix Purple Haze" → artist: "Jimi Hendrix", title: "Purple Haze"
- "Beatles yesterday" → artist: "The Beatles", title: "Yesterday"

TIPS:
- Fix obvious typos: "Nirvan" → "Nirvana"
- Use full artist names: "RHCP" → "Red Hot Chili Peppers"
- If no results, try simpler title (drop "The", parentheticals)`;

const DOWNLOAD_DESCRIPTION = `Download a song to the user's library.

WHEN TO USE: After search_ultimate_guitar returns results, use songUrl to download.

CRITICAL: songUrl MUST come from search results. Never guess or construct URLs.

WORKFLOW:
1. search_ultimate_guitar → get results with songUrl
2. Pick best result (prefer "Chords" type, highest rating)
3. download_song with that songUrl

RETURNS: { success: true, song: { artist, title, artistSlug, songSlug } }
- Use artistSlug/songSlug for navigation after download

COMMON ERRORS:
- "Download failed" → URL might be invalid, try different search result
- Empty songUrl → You must search first to get valid URLs`;

const LIST_ARTISTS_DESCRIPTION = `List all artists in the user's library.

WHEN TO USE:
- "What songs do I have?"
- "Show me my library"
- "What artists are in here?"

RETURNS: { artists: [{ name, slug, songCount }], count: number }

TIP: Use this to answer library questions without needing specifics.`;

const GET_ARTIST_SONGS_DESCRIPTION = `Get all songs by a specific artist from the library.

WHEN TO USE:
- "What Beatles songs do I have?"
- "Show me my Hendrix collection"
- Before navigating to a specific song (to get exact slugs)

RETURNS: { artist, songs: [{ title, artist, artistSlug, songSlug }], count }

IMPORTANT: Use artistSlug and songSlug from results for navigate tool.`;

const NAVIGATE_DESCRIPTION = `Navigate the user to a page in the app.

WHEN TO USE:
- After downloading a song: offer to navigate to it
- User asks to go somewhere: "take me to jam mode"
- User wants to see a specific song/artist

PAGES:
- /songs → Full library
- /songs/{artistSlug}/{songSlug} → Specific song
- /jam → Practice mode with looping
- /composer → Build chord progressions
- /metronome → Timing practice
- /music-theory → Theory tools

SLUG FORMAT: Title_Case_With_Underscores
- "The Beatles" → "The_Beatles"
- "Let It Be" → "Let_It_Be"

EXAMPLES:
- path: "/songs/The_Beatles/Let_It_Be"
- path: "/songs/Led_Zeppelin/Stairway_to_Heaven"
- path: "/jam"

TIP: After download, use the artistSlug/songSlug from the response.`;

/**
 * Create buddy MCP server with all tools
 * @param apiBaseUrl - The base URL for API calls (passed at runtime)
 */
export function createBuddyMcpServer(apiBaseUrl: string) {
  // Type casting needed due to Zod version mismatch between project and SDK
  const createTool = tool as unknown as (
    name: string,
    description: string,
    schema: Record<string, unknown>,
    handler: (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[] }>
  ) => unknown;

  return createSdkMcpServer({
    name: 'buddy-tools',
    version: '1.0.0',
    tools: [
      createTool('search_ultimate_guitar', SEARCH_DESCRIPTION, SearchInputSchema, async args => ({
        content: [{ type: 'text', text: await executeSearch(apiBaseUrl, args.artist as string, args.title as string) }],
      })),
      createTool('download_song', DOWNLOAD_DESCRIPTION, DownloadInputSchema, async args => ({
        content: [
          {
            type: 'text',
            text: await executeDownload(apiBaseUrl, args.songUrl as string, args.artist as string | undefined, args.title as string | undefined),
          },
        ],
      })),
      createTool('list_artists', LIST_ARTISTS_DESCRIPTION, {}, async () => ({
        content: [{ type: 'text', text: await executeListArtists(apiBaseUrl) }],
      })),
      createTool('get_artist_songs', GET_ARTIST_SONGS_DESCRIPTION, GetArtistSongsInputSchema, async args => ({
        content: [{ type: 'text', text: await executeGetArtistSongs(apiBaseUrl, args.artist as string) }],
      })),
      createTool('navigate', NAVIGATE_DESCRIPTION, NavigateInputSchema, async args => ({
        content: [{ type: 'text', text: executeNavigate(args.path as string, args.reason as string | undefined) }],
      })),
    ] as Parameters<typeof createSdkMcpServer>[0]['tools'],
  });
}

// Export tool names for reference
export const BUDDY_TOOL_NAMES = [
  'search_ultimate_guitar',
  'download_song',
  'list_artists',
  'get_artist_songs',
  'navigate',
] as const;

// Export input types
export interface SearchToolInput {
  artist: string;
  title: string;
}
export interface DownloadSongToolInput {
  songUrl: string;
  artist?: string;
  title?: string;
}
export interface GetArtistSongsToolInput {
  artist: string;
}
export interface NavigateToolInput {
  path: string;
  reason?: string;
}
