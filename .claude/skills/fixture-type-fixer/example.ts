import type {FeatureResponse} from '@/app/features/domain/dto/feature-response.schema'
import {FixtureIds, TestDates} from '@/app/testing/fixtures/constants'

export const FeatureText = {
  planName: 'Pro',
} as const

export const mockActiveFeatureApiResponse = {
  feature: {
    id: 'feat_123',
    company_id: FixtureIds.company,
    plan: {
      slug: 'pro' as const,
      name: FeatureText.planName,
      price_monthly: 45000,
    },
    status: 'active' as const,
    currentPeriodEnd: new Date('2025-11-22'),
  },
  features: {
    maxClusters: 100,
    maxKeywords: 1000,
  },
} satisfies FeatureResponse
