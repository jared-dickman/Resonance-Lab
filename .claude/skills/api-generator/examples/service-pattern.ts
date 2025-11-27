/**
 * CANONICAL SERVICE PATTERN
 *
 * Source: app/features/blog-posts/service.ts
 *
 * ALL service functions MUST use withServiceErrorHandling wrapper.
 * Enforced by: rules/service-functions-must-use-error-handler.yml
 */

import {repositoryFactory} from '@/app/core/repository/repository-factory'
import {withServiceErrorHandling} from '@/app/utils/service-error-handler'
import type {{Domain}Entity} from './domain/{domain}'
import type {{Domain}CreateInput, {Domain}UpdateInput} from './dto/{domain}-request.schema'

/**
 * List all {domain}
 */
export async function list{Domain}s(companyId: string): Promise<{Domain}Entity[]> {
  return withServiceErrorHandling(
    async () => {
      const repository = repositoryFactory.get{Domain}Repository()
      return repository.findAll(companyId)
    },
    {
      service: '{domain}s',
      companyId,
    }
  )
}

/**
 * Get single {domain} by ID
 */
export async function get{Domain}ById(
  id: string,
  companyId: string
): Promise<{Domain}Entity | undefined> {
  return withServiceErrorHandling(
    async () => {
      const repository = repositoryFactory.get{Domain}Repository()
      const entity = await repository.findById(id)

      // Verify entity belongs to requested company
      if (entity && entity.companyId !== companyId) {
        throw new Error('Access denied')
      }

      return entity
    },
    {
      service: '{domain}s',
      companyId,
      {domain}Id: id,
    }
  )
}

/**
 * Create new {domain}
 */
export async function create{Domain}(
  input: {Domain}CreateInput,
  companyId: string
): Promise<{Domain}Entity> {
  return withServiceErrorHandling(
    async () => {
      const repository = repositoryFactory.get{Domain}Repository()

      // Force companyId from auth, never trust input
      const entityData = {
        ...input,
        companyId,
      }

      return repository.create(entityData)
    },
    {
      service: '{domain}s',
      companyId,
    }
  )
}

/**
 * Update existing {domain}
 */
export async function update{Domain}(
  id: string,
  input: {Domain}UpdateInput,
  companyId: string
): Promise<{Domain}Entity | undefined> {
  return withServiceErrorHandling(
    async () => {
      const repository = repositoryFactory.get{Domain}Repository()

      const existing = await repository.findById(id)
      if (!existing || existing.companyId !== companyId) {
        throw new Error('Not found')
      }

      return repository.update(id, input)
    },
    {
      service: '{domain}s',
      companyId,
      {domain}Id: id,
    }
  )
}

/**
 * Delete {domain}
 */
export async function delete{Domain}(
  id: string,
  companyId: string
): Promise<boolean> {
  return withServiceErrorHandling(
    async () => {
      const repository = repositoryFactory.get{Domain}Repository()

      const existing = await repository.findById(id)
      if (!existing || existing.companyId !== companyId) {
        throw new Error('Not found')
      }

      const result = await repository.softDelete(id)
      return result !== undefined
    },
    {
      service: '{domain}s',
      companyId,
      {domain}Id: id,
    }
  )
}