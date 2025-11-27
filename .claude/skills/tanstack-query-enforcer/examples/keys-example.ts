// Pattern: Centralized query key factory
// Source: tanstack-query-enforcer SKILL.md
// Location: lib/query-keys/{domain}-keys.ts

export const {domain}Keys = {
  all: ['{domain}s'] as const,
  lists: (companyId: string) => [...{domain}Keys.all, companyId, 'list'] as const,
  list: (companyId: string) => [...{domain}Keys.all, companyId, 'list'] as const,
  details: (companyId: string) => [...{domain}Keys.all, companyId, 'detail'] as const,
  detail: (companyId: string, {domain}Id: string) => [...{domain}Keys.all, companyId, 'detail', {domain}Id] as const,
} as const

// Pattern: Re-export in feature module
// Location: app/features/{domain}/keys.ts
export {{domain}Keys} from '@/lib/query-keys/{domain}-keys'
