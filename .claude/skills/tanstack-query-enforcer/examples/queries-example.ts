// Pattern: Fetch functions using apiClient with typed responses
// Source: tanstack-query-enforcer SKILL.md
// Location: app/features/{domain}/queries.ts

'use client'

import {apiClient} from '@/app/api/client'
import {apiRoutes} from '@/app/config/apiRoutes'

export async function fetch{Domain}List(companyId?: string | null) {
  const search = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ''
  return apiClient.get(`${apiRoutes.{domain}s}${search}`)
}

export async function fetch{Domain}Detail({domain}Id: string) {
  return apiClient.get(apiRoutes.{domain}Detail({domain}Id))
}