/**
 * CANONICAL DTO SCHEMA PATTERNS
 *
 * Sources:
 * - app/features/blog-posts/dto/blog-post-request.schema.ts
 * - app/features/blog-posts/dto/blog-post-response.schema.ts
 *
 * Zod schemas for API input/output validation.
 */

import {z} from 'zod'

// ============================================================================
// REQUEST SCHEMAS (Input Validation)
// ============================================================================

/**
 * Create request - no ID, server generates timestamps
 */
export const create{Domain}RequestSchema = z.object({
  // Never accept companyId from client - use session
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  // Add your domain-specific fields
})

export type Create{Domain}Request = z.infer<typeof create{Domain}RequestSchema>

/**
 * Update request - all fields optional except what's required
 */
export const update{Domain}RequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  // Add your domain-specific fields
})

export type Update{Domain}Request = z.infer<typeof update{Domain}RequestSchema>

// ============================================================================
// RESPONSE SCHEMAS (Output Validation)
// ============================================================================

/**
 * Single {domain} response - transformed from entity
 */
export const {domain}ResponseSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(), // ISO 8601 string
  updatedAt: z.string().datetime(),
  // Add your domain-specific fields
})

export type {Domain}Response = z.infer<typeof {domain}ResponseSchema>

/**
 * List response - array wrapper
 */
export const {domain}ListResponseSchema = z.object({
  {domain}: z.array({domain}ResponseSchema),
})

export type {Domain}ListResponse = z.infer<typeof {domain}ListResponseSchema>

/**
 * Create/Update response - single item wrapper
 */
export const {domain}CreateResponseSchema = z.object({
  {domain}: {domain}ResponseSchema,
})

export type {Domain}CreateResponse = z.infer<typeof {domain}CreateResponseSchema>