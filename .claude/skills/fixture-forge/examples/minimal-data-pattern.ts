// Pattern: Minimal data principle - one request/response pair
// Source: fixture-forge SKILL.md lines 289-313

import type {{Domain}Request, {Domain}Response} from '@/app/features/{domain}/dto/{domain}-response.schema'

// ✅ CORRECT: One request/response pair - full API shape, minimal data
export const {Domain}Text = {
  title: 'The Testing Manifesto',
  content: 'Write tests like your users depend on them. Because they do.',
} as const

export const mock{Domain}Request = {
  title: {Domain}Text.title,
  content: {Domain}Text.content
} as const satisfies {Domain}Request

export const mock{Domain}Response = {
  id: '{domain}-test-1',
  title: {Domain}Text.title,
  content: {Domain}Text.content,
  status: 'draft' as const,
  createdAt: '2025-01-15T00:00:00Z'
} as const satisfies {Domain}Response

// ❌ WRONG: Too many fixtures - creates confusion
export const mockSuccessResponse = {
  id: '{domain}-1',
  title: 'Success Title',
  content: 'Success Content',
  status: 'published' as const,
  createdAt: '2025-01-15T00:00:00Z'
} satisfies {Domain}Response

export const mockDemoResponse = {
  id: '{domain}-2',
  title: 'Demo Title',
  content: 'Demo Content',
  status: 'draft' as const,
  createdAt: '2025-01-15T00:00:00Z'
} satisfies {Domain}Response

export const mockTestResponse = {
  id: '{domain}-3',
  title: 'Test Title',
  content: 'Test Content',
  status: 'draft' as const,
  createdAt: '2025-01-15T00:00:00Z'
} satisfies {Domain}Response

// ❌ ANTI-PATTERN: Keep it minimal - ONE fixture per endpoint!