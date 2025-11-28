/**
 * API Route Registry
 *
 * IMPORTANT: DO NOT add '/api' prefix - Next.js adds it automatically
 * All routes should be relative to the API base URL
 */

export const apiRoutes = {
  // Songs
  songs: '/api/songs',
  songDetail: (artistSlug: string, songSlug: string) => `/api/songs/${artistSlug}/${songSlug}`,

  // Search
  search: '/api/search',
  agentSearch: '/api/agent-search',

  // Agent Chat
  agentChat: '/api/agent-chat',

  // Lab
  lab: '/api/lab',

  // Artists
  artists: '/api/artists',
} as const;
