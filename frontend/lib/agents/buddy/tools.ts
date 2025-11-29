import type Anthropic from '@anthropic-ai/sdk';

// =============================================================================
// TOOL DEFINITIONS
// Following Anthropic's ACI (Agent-Computer Interface) best practices:
// - Clear descriptions like docstrings for a junior dev
// - Examples for every tool
// - Edge cases documented
// - Poka-yoke: make wrong thing impossible
// =============================================================================

export const searchTool: Anthropic.Tool = {
  name: 'search_ultimate_guitar',
  description: `Search Ultimate Guitar for tabs and chords.

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
- If no results, try simpler title (drop "The", parentheticals)`,
  input_schema: {
    type: 'object',
    properties: {
      artist: {
        type: 'string',
        description: 'Full artist/band name. Fix typos. Expand abbreviations.',
      },
      title: {
        type: 'string',
        description: 'Song title. Drop unnecessary words if search fails.',
      },
    },
    required: ['artist', 'title'],
  },
};

export const downloadSongTool: Anthropic.Tool = {
  name: 'download_song',
  description: `Download a song to the user's library.

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
- Empty songUrl → You must search first to get valid URLs`,
  input_schema: {
    type: 'object',
    properties: {
      songUrl: {
        type: 'string',
        description:
          'The Ultimate Guitar URL from search results. Format: https://tabs.ultimate-guitar.com/...',
      },
      artist: {
        type: 'string',
        description: 'Artist name (optional, for logging)',
      },
      title: {
        type: 'string',
        description: 'Song title (optional, for logging)',
      },
    },
    required: ['songUrl'],
  },
};

export const listArtistsTool: Anthropic.Tool = {
  name: 'list_artists',
  description: `List all artists in the user's library.

WHEN TO USE:
- "What songs do I have?"
- "Show me my library"
- "What artists are in here?"

RETURNS: { artists: [{ name, slug, songCount }], count: number }

TIP: Use this to answer library questions without needing specifics.`,
  input_schema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const getArtistSongsTool: Anthropic.Tool = {
  name: 'get_artist_songs',
  description: `Get all songs by a specific artist from the library.

WHEN TO USE:
- "What Beatles songs do I have?"
- "Show me my Hendrix collection"
- Before navigating to a specific song (to get exact slugs)

RETURNS: { artist, songs: [{ title, artist, artistSlug, songSlug }], count }

IMPORTANT: Use artistSlug and songSlug from results for navigate tool.`,
  input_schema: {
    type: 'object',
    properties: {
      artist: {
        type: 'string',
        description: 'Artist name or slug. Case-insensitive. Partial matches work.',
      },
    },
    required: ['artist'],
  },
};

export const navigateTool: Anthropic.Tool = {
  name: 'navigate',
  description: `Navigate the user to a page in the app.

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

TIP: After download, use the artistSlug/songSlug from the response.`,
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'URL path. Use Title_Case_With_Underscores for slugs.',
      },
      reason: {
        type: 'string',
        description: 'Brief reason shown to user. Keep it casual.',
      },
    },
    required: ['path'],
  },
};

export const ALL_BUDDY_TOOLS = [
  searchTool,
  downloadSongTool,
  listArtistsTool,
  getArtistSongsTool,
  navigateTool,
] as const;
