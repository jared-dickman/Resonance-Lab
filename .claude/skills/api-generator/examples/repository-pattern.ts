/**
 * CANONICAL REPOSITORY PATTERN
 *
 * Source: app/features/blog-posts/repository/drizzle-blog-post.repository.ts
 *
 * Repository layer: Pure data access, NO business logic or auth checks.
 * Always filters by companyId for multi-tenant isolation.
 */

import type {DrizzleD1Database} from 'drizzle-orm/d1'
import {eq, and, isNull, desc} from 'drizzle-orm'
import {{domain}} from '@/db/drizzle/schema/{domain}.schema'
import type {{Domain}Entity} from '../domain/{domain}'
import type {{Domain}Repository} from './{domain}-repository.interface'

export class Drizzle{Domain}Repository implements {Domain}Repository {
  constructor(private readonly db: DrizzleD1Database) {}

  async findAll(companyId: string): Promise<{Domain}Entity[]> {
    return await this.db
      .select()
      .from({domain})
      .where(
        and(
          eq({domain}.companyId, companyId),
          isNull({domain}.deletedAt)
        )
      )
      .orderBy(desc({domain}.createdAt))
  }

  async findById(id: string): Promise<{Domain}Entity | null> {
    const [entity] = await this.db
      .select()
      .from({domain})
      .where(
        and(
          eq({domain}.id, id),
          isNull({domain}.deletedAt)
        )
      )
      .limit(1)

    return entity || null
  }

  async create(data: Omit<{Domain}Entity, 'id' | 'createdAt' | 'updatedAt'>): Promise<{Domain}Entity> {
    const [created] = await this.db
      .insert({domain})
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return created
  }

  async update(id: string, data: Partial<{Domain}Entity>): Promise<{Domain}Entity> {
    const [updated] = await this.db
      .update({domain})
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq({domain}.id, id))
      .returning()

    return updated
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    await this.db
      .update({domain})
      .set({
        deletedAt: new Date(),
      })
      .where(eq({domain}.id, id))
  }
}