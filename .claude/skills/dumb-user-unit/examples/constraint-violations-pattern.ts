/**
 * Type Violations & Constraint Patterns
 * Invalid enums, business rule violations, type narrowing edge cases
 */

import { describe, it, expect } from 'vitest'
import { buildBlogPost, expectValidationError } from '@/app/testing/utils'
import { BlogPostTypeEnum, BlogPostStatusEnum } from '@/app/features/blog-posts/constants/blog-post.constants'

// Pattern 1: Invalid Enum Values
describe('updateStatus(post: BlogPost, status: BlogPostStatus)', () => {
  it('should reject invalid status enum', async () => {
    const post = buildBlogPost().build()
    // @ts-expect-error Testing runtime validation
    await expectValidationError(
      () => updateBlogPost(post.id, { status: 'INVALID_STATUS' }),
      'status'
    )
  })

  it('should accept all valid status values', async () => {
    const post = buildBlogPost().build()
    const statuses = Object.values(BlogPostStatusEnum)

    for (const status of statuses) {
      await expect(
        updateBlogPost(post.id, { status })
      ).resolves.toBeDefined()
    }
  })
})

// Pattern 2: Business Rule Constraints
describe('assignToCluster(post: BlogPost, clusterId: string)', () => {
  it('should prevent assigning pillars to clusters', async () => {
    const post = buildBlogPost().asPillar().build()
    await expect(
      assignToCluster(post, 'cluster-123')
    ).rejects.toThrow('Pillars cannot be assigned to clusters')
  })

  it('should allow assigning cluster posts to clusters', async () => {
    const post = buildBlogPost().asCluster().build()
    await expect(
      assignToCluster(post, 'cluster-123')
    ).resolves.toBeDefined()
  })
})

// Pattern 3: Status Transition Constraints
describe('publishPost(post: BlogPost)', () => {
  it('should prevent publishing without content', async () => {
    const post = buildBlogPost().withContent(null).build()
    await expectValidationError(
      () => updateBlogPost(post.id, { status: BlogPostStatusEnum.PUBLISHED }),
      'content'
    )
  })

  it('should prevent publishing from archived', async () => {
    const post = buildBlogPost().archived().build()
    await expect(
      updateBlogPost(post.id, { status: BlogPostStatusEnum.PUBLISHED })
    ).rejects.toThrow('Cannot publish archived posts')
  })

  it('should allow publishing with valid content', async () => {
    const post = buildBlogPost()
      .withContent('Valid content here')
      .asReview()
      .build()

    await expect(
      updateBlogPost(post.id, { status: BlogPostStatusEnum.PUBLISHED })
    ).resolves.toBeDefined()
  })
})

// Pattern 4: Type Narrowing Edge Cases
describe('processBlogPost(post: Pillar | Cluster)', () => {
  it('should handle pillar-specific logic', () => {
    const pillar = buildBlogPost().asPillar().build()
    const result = processBlogPost(pillar)
    expect(result.isPillar).toBe(true)
  })

  it('should handle cluster-specific logic', () => {
    const cluster = buildBlogPost().asCluster().build()
    const result = processBlogPost(cluster)
    expect(result.isCluster).toBe(true)
  })
})

// Pattern 5: Discriminated Union Boundaries
describe('handlePostAction(action: CreateAction | UpdateAction)', () => {
  it('should handle create action without id', () => {
    const action = { type: 'create', data: { title: 'New' } }
    expect(() => handlePostAction(action)).not.toThrow()
  })

  it('should reject update action without id', () => {
    const action = { type: 'update', data: { title: 'Updated' } }
    expect(() => handlePostAction(action)).toThrow('Update requires id')
  })
})