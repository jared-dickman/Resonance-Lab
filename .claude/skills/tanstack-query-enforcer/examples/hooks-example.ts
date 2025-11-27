// Pattern: Wrapper hooks with useApiQuery/useApiMutation and company context
// Source: tanstack-query-enforcer SKILL.md
// Location: app/features/{domain}/hooks.ts

'use client'

import {{domain}Keys} from '@/app/features/{domain}/keys'
import {{domain}Mutations, {domain}Options} from '@/app/features/{domain}/options'
import {useApiMutation, useApiQuery} from '@/app/hooks/query-hooks'
import {useSession} from 'next-auth/react'
import {useMemo} from 'react'

function useCurrentCompany() {
  const { data: session, status } = useSession()

  return useMemo(
    () => ({
      companyId: session?.currentCompanyId ?? null,
      isReady: status !== 'loading',
    }),
    [session?.currentCompanyId, status]
  )
}

export function use{Domain}List() {
  const { companyId, isReady } = useCurrentCompany()
  const options = companyId ? {domain}Options.list(companyId) : null

  return useApiQuery(
    options?.queryKey ?? ['{domain}s', 'disabled'],
    options?.queryFn ?? (() => Promise.reject(new Error('No company selected'))),
    {
      enabled: isReady && companyId !== null && options !== null,
      staleTime: 30 * 1000,
    }
  )
}

export function use{Domain}Detail({domain}Id: string) {
  const { companyId } = useCurrentCompany()
  const queryOptions = companyId ? {domain}Options.detail(companyId, {domain}Id) : null

  return useApiQuery(
    queryOptions?.queryKey ?? ['{domain}s', 'disabled', 'detail'],
    queryOptions?.queryFn ?? (() => Promise.reject(new Error('No company selected'))),
    {
      enabled: {domain}Id.length > 0 && companyId !== null && queryOptions !== null,
    }
  )
}

export function useCreate{Domain}() {
  const { companyId } = useCurrentCompany()

  return useApiMutation(
    (data) => {domain}Mutations.create(data),
    {
      invalidationKeys: companyId ? [{domain}Keys.lists(companyId)] : [],
    }
  )
}

export function useUpdate{Domain}() {
  const { companyId } = useCurrentCompany()

  return useApiMutation(
    ({ {domain}Id, data }) => {domain}Mutations.update({domain}Id, data),
    {
      invalidationKeys: companyId ? [{domain}Keys.lists(companyId), {domain}Keys.details(companyId)] : [],
    }
  )
}

export function useDelete{Domain}() {
  const { companyId } = useCurrentCompany()

  return useApiMutation(
    ({domain}Id: string) => {domain}Mutations.delete({domain}Id),
    {
      invalidationKeys: companyId ? [{domain}Keys.lists(companyId)] : [],
    }
  )
}