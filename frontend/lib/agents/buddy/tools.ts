import type Anthropic from '@anthropic-ai/sdk';

export const searchTool: Anthropic.Tool = {
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

export const downloadSongTool: Anthropic.Tool = {
  name: 'download_song',
  description:
    'Download and save a song from Ultimate Guitar to the library. Use songUrl from search results.',
  input_schema: {
    type: 'object',
    properties: {
      songUrl: { type: 'string', description: 'The Ultimate Guitar URL for the song' },
      artist: { type: 'string', description: 'Artist name' },
      title: { type: 'string', description: 'Song title' },
    },
    required: ['songUrl'],
  },
};

export const listArtistsTool: Anthropic.Tool = {
  name: 'list_artists',
  description: 'List all artists in the song library',
  input_schema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const getArtistSongsTool: Anthropic.Tool = {
  name: 'get_artist_songs',
  description: 'Get all songs by a specific artist from the library',
  input_schema: {
    type: 'object',
    properties: {
      artist: { type: 'string', description: 'Artist name or slug' },
    },
    required: ['artist'],
  },
};

export const navigateTool: Anthropic.Tool = {
  name: 'navigate',
  description: `Navigate the user to a different page in the app. Available pages:
    - /songs - Browse all downloaded songs
    - /songs/{artistSlug} - View songs by a specific artist
    - /songs/{artistSlug}/{songSlug} - View a specific song
    - /artists - Browse all artists in library
    - /jam - Jam mode for practicing chord progressions
    - /composer - Compose and experiment with chord progressions
    - /metronome - Practice with metronome
    - /music-theory - Music theory tools and learning
    - /pedalboard - Virtual guitar pedalboard
    - /songwriter - AI-assisted songwriting

    IMPORTANT: Song URLs use Title_Case_With_Underscores for slugs.
    Examples: /songs/Red_Hot_Chili_Peppers/Californication, /songs/The_Beatles/Let_It_Be, /songs/Led_Zeppelin/Stairway_to_Heaven
    Use get_artist_songs tool first to get exact artistSlug and songSlug values.`,
  input_schema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description:
          'The path to navigate to. Song URLs use Title_Case_With_Underscores (e.g., "/songs/The_Beatles/Let_It_Be")',
      },
      reason: {
        type: 'string',
        description: 'Brief explanation of why navigating (shown to user)',
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
