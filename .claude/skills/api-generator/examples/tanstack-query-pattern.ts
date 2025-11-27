/**
 * CANONICAL TANSTACK QUERY PATTERNS
 *
 * Sources:
 * - app/features/blog-posts/keys.ts
 * - app/features/blog-posts/queries.ts
 * - app/features/blog-posts/options.ts
 * - app/features/blog-posts/hooks.ts
 *
 * Four files working together for data fetching.
 */

import {queryOptions, useSuspenseQuery} from '@tanstack/react-query'
import {useCurrentCompany} from '@/app/hooks/useCurrentCompany'
import {list{Domain}Action, get{Domain}ByIdAction} from '@/app/actions/{domain}'

// ============================================================================
// FILE 1: keys.ts - Query Key Factory
// ============================================================================

/**
 * CRITICAL: companyId MUST come BEFORE list/detail
 * This ensures proper invalidation and cache isolation
 */
export const {domain}Keys = {
  all: ['{domain}'] as const,
  lists: () => [...{domain}Keys.all, 'list'] as const,
  list: (companyId: string) => [...{domain}Keys.lists(), companyId] as const,
  details: () => [...{domain}Keys.all, 'detail'] as const,
  detail: (companyId: string, id: string) => [...{domain}Keys.details(), companyId, id] as const,
}

// ============================================================================
// FILE 2: queries.ts - Query Functions
// ============================================================================

/**
 * Query functions - call server actions
 * Server actions in: app/actions/{domain}/index.ts
 */
export const {domain}Queries = {
  list: (companyId: string) =>
    list{Domain}Action(companyId),

  detail: (companyId: string, id: string) =>
    get{Domain}ByIdAction(companyId, id),
}

// ============================================================================
// FILE 3: options.ts - Query Options (for prefetching/SSR)
// ============================================================================

/**
 * Query options for server-side prefetching
 */
export const {domain}Options = {
  list: (companyId: string) =>
    queryOptions({
      queryKey: {domain}Keys.list(companyId),
      queryFn: () => {domain}Queries.list(companyId),
    }),

  detail: (companyId: string, id: string) =>
    queryOptions({
      queryKey: {domain}Keys.detail(companyId, id),
      queryFn: () => {domain}Queries.detail(companyId, id),
    }),
}

// ============================================================================
// FILE 4: hooks.ts - React Hooks
// ============================================================================

/**
 * List hook - requires company context
 */
export function use{Domain}List() {
  const {companyId} = useCurrentCompany()

  return useSuspenseQuery({
    queryKey: {domain}Keys.list(companyId),
    queryFn: () => {domain}Queries.list(companyId),
  })
}

/**
 * Detail hook - requires company context + ID
 */
export function use{Domain}(id: string) {
  const {companyId} = useCurrentCompany()

  return useSuspenseQuery({
    queryKey: {domain}Keys.detail(companyId, id),
    queryFn: () => {domain}Queries.detail(companyId, id),
  })
}