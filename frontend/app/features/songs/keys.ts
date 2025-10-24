/**
 * Hierarchical Query Key Factory for Songs
 *
 * Pattern: ['songs'] -> ['songs', 'list'] -> ['songs', 'detail', artistSlug, songSlug]
 */

export const songKeys = {
  all: ['songs'] as const,
  lists: () => [...songKeys.all, 'list'] as const,
  list: () => [...songKeys.lists()] as const,
  details: () => [...songKeys.all, 'detail'] as const,
  detail: (artistSlug: string, songSlug: string) =>
    [...songKeys.details(), artistSlug, songSlug] as const,
  search: (artist: string, title: string) =>
    [...songKeys.all, 'search', artist, title] as const,
} as const;
