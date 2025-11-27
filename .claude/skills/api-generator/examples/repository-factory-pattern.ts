/**
 * CANONICAL REPOSITORY FACTORY PATTERN
 *
 * Source: app/core/repository/repository-factory.ts
 *
 * Add your new repository to the factory singleton.
 * This allows services to get repository instances without direct dependencies.
 */

import {Drizzle{Domain}Repository} from '@/app/features/{domain}/repository/drizzle-{domain}.repository'
import type {{Domain}Repository} from '@/app/features/{domain}/repository/{domain}-repository.interface'
import {getDbConnection} from '@/db/drizzle/connection'

export class RepositoryFactory {
  private static instance: RepositoryFactory

  // Add your repository property
  private {domain}Repository: {Domain}Repository | null = null

  private constructor() {}

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory()
    }
    return RepositoryFactory.instance
  }

  // Add your repository getter
  get{Domain}Repository(): {Domain}Repository {
    if (!this.{domain}Repository) {
      this.{domain}Repository = new Drizzle{Domain}Repository(getDbConnection())
    }
    return this.{domain}Repository
  }

  // Add reset in resetForTesting()
  resetForTesting(): void {
    // ... other repositories ...
    this.{domain}Repository = null
  }
}