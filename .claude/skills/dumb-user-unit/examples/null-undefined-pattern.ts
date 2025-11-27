/**
 * Null/Undefined Handling Patterns
 * #1 cause of runtime errors - optional parameters, nullable types, array operations
 */

import { describe, it, expect } from 'vitest'
import { buildUser, buildBlogPost } from '@/app/testing/utils'

// Pattern 1: Optional Parameters
describe('processUser(user?: User)', () => {
  it('should handle undefined user parameter', () => {
    const result = processUser(undefined)
    expect(result).toBeNull()
  })

  it('should handle user with missing optional fields', () => {
    const user = buildUser().withImage(null).build()
    expect(() => processUser(user)).not.toThrow()
  })
})

// Pattern 2: Nullable Types (Type | null)
describe('updateContent(content?: string | null)', () => {
  it('should handle null content explicitly', async () => {
    const post = buildBlogPost().withContent('existing').build()
    const result = await updateBlogPost(post.id, { content: null })
    expect(result.content).toBeNull()
  })

  it('should handle undefined content (no change)', async () => {
    const post = buildBlogPost().withContent('existing').build()
    const result = await updateBlogPost(post.id, { content: undefined })
    expect(result.content).toBe('existing')
  })
})

// Pattern 3: Array Operations (.find(), .filter()[0])
describe('getUserByEmail(email: string)', () => {
  it('should return null when user not found', async () => {
    const result = await getUserByEmail('nonexistent@example.com')
    expect(result).toBeNull()
  })

  it('should handle empty result set', async () => {
    const results = await searchUsers({ query: 'nonexistent' })
    expect(results).toEqual([])
    expect(results[0]).toBeUndefined()
  })
})

// Pattern 4: Object Property Access with Optionals
describe('getNestedProperty(obj: { user?: { email?: string } })', () => {
  it('should handle missing nested properties', () => {
    const result = getNestedProperty({ user: undefined })
    expect(result).toBeNull()
  })

  it('should handle partially missing nested properties', () => {
    const result = getNestedProperty({ user: { email: undefined } })
    expect(result).toBeNull()
  })
})