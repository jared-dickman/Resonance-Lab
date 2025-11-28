/**
 * Hierarchical Query Key Factory for Artists
 *
 * Pattern: ['artists'] -> ['artists', 'list'] -> ['artists', 'detail', slug]
 */

export const artistKeys = {
  all: ['artists'] as const,
  list: () => [...artistKeys.all, 'list'] as const,
  details: () => [...artistKeys.all, 'detail'] as const,
  detail: (slug: string) => [...artistKeys.details(), slug] as const,
} as const;
