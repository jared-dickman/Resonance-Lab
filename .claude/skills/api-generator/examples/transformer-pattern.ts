/**
 * CANONICAL TRANSFORMER PATTERNS
 *
 * Sources:
 * - app/features/blog-posts/transformers/blog-post.transformer.ts
 * - app/features/blog-posts/transformers/blog-post-view.transformer.ts
 *
 * Two transformers:
 * 1. Entity → API Response (for API routes)
 * 2. API Response → View Model (for UI components)
 */

import type {{Domain}Entity} from '../domain/{domain}'
import type {{Domain}Response} from '../dto/{domain}-response.schema'

// ============================================================================
// TRANSFORMER 1: Entity → API Response
// ============================================================================

/**
 * Transform database entity to API response DTO
 * Used in: API routes after fetching from service
 *
 * File: transformers/{domain}.transformer.ts
 */
export function to{Domain}Response(entity: {Domain}Entity): {Domain}Response {
  return {
    id: entity.id,
    companyId: entity.companyId,
    name: entity.name,
    description: entity.description ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    // Transform your domain-specific fields
    // Example: Convert enums, format dates, flatten nested objects
  }
}

// ============================================================================
// TRANSFORMER 2: API Response → View Model
// ============================================================================

/**
 * View model for UI components
 * Contains computed/derived fields for display
 */
export interface {Domain}ViewModel {
  id: string
  companyId: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  // Add computed fields for UI
  displayName: string  // e.g., formatted name
  isRecent: boolean    // e.g., created in last 24h
  // etc.
}

/**
 * Transform API response to view model
 * Used in: React components/hooks
 *
 * File: transformers/{domain}-view.transformer.ts
 */
export function to{Domain}ViewModel(response: {Domain}Response): {Domain}ViewModel {
  const createdAt = new Date(response.createdAt)
  const now = new Date()
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

  return {
    ...response,
    description: response.description || 'No description',
    displayName: response.name.toUpperCase(), // Example formatting
    isRecent: hoursSinceCreation < 24,
  }
}