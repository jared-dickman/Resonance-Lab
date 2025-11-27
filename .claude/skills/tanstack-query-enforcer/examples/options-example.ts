// Pattern: Query options and mutation definitions
// Source: tanstack-query-enforcer SKILL.md
// Location: app/features/{domain}/options.ts

'use client'

import {create{Domain}Action, update{Domain}Action, delete{Domain}Action} from '@/app/actions/{domain}s'
import {{domain}Keys} from '@/app/features/{domain}/keys'
import {fetch{Domain}Detail, fetch{Domain}List} from '@/app/features/{domain}/queries'

export const {domain}Options = {
  list: (companyId: string) => ({
    queryKey: {domain}Keys.list(companyId),
    queryFn: () => fetch{Domain}List(companyId),
  }),

  detail: (companyId: string, {domain}Id: string) => ({
    queryKey: {domain}Keys.detail(companyId, {domain}Id),
    queryFn: () => fetch{Domain}Detail({domain}Id),
  }),
}

export const {domain}Mutations = {
  create: create{Domain}Action,
  update: update{Domain}Action,
  delete: delete{Domain}Action,
} as const