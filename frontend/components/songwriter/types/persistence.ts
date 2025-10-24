import type { CompleteSongState, DraftSnapshot } from './song'
import type { PanelLayoutState } from './ui'

export type StorageKey = 'songwriterDrafts' | 'panelLayout' | 'userPreferences' | 'conversationHistory' | 'autosaveSnapshots' | 'songwriter-panel-layout'

export type SerializationFormat = 'json' | 'compressed'

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error'

export interface StorageMetadata {
  readonly storageVersion: number
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly schemaVersion: string
  readonly migrationsApplied: ReadonlyArray<string>
}

export interface SerializedDraft {
  readonly draftId: string
  readonly songState: CompleteSongState
  readonly metadata: StorageMetadata
  readonly checksum: string
  readonly compressedSize: number
  readonly uncompressedSize: number
}

export interface DraftCollection {
  readonly drafts: ReadonlyArray<SerializedDraft>
  readonly totalDrafts: number
  readonly totalStorageBytes: number
  readonly oldestDraft: Date | null
  readonly newestDraft: Date | null
}

export interface PanelLayoutPreferences {
  readonly layout: PanelLayoutState
  readonly metadata: StorageMetadata
}

export interface AutosaveSnapshot {
  readonly snapshotId: string
  readonly draftId: string
  readonly snapshot: DraftSnapshot
  readonly autoDeleteAt: Date
  readonly retentionDays: number
}

export interface StorageQuota {
  readonly totalBytes: number
  readonly usedBytes: number
  readonly availableBytes: number
  readonly percentageUsed: number
  readonly quotaExceeded: boolean
}

export interface MigrationRecord {
  readonly migrationId: string
  readonly fromVersion: string
  readonly toVersion: string
  readonly appliedAt: Date
  readonly affectedRecords: number
  readonly success: boolean
  readonly errorMessage: string | null
}

export interface BackupMetadata {
  readonly backupId: string
  readonly backupTime: Date
  readonly backupSize: number
  readonly includesConversations: boolean
  readonly includesDrafts: boolean
  readonly includesPreferences: boolean
}

export interface ExportFormat {
  readonly formatType: 'json' | 'pdf' | 'txt' | 'docx' | 'musicxml' | 'midi'
  readonly includesLyrics: boolean
  readonly includesChords: boolean
  readonly includesMetadata: boolean
  readonly fileExtension: string
}

export interface ExportOptions {
  readonly format: ExportFormat
  readonly includeTimestamps: boolean
  readonly includeComments: boolean
  readonly prettyPrint: boolean
  readonly fileName: string
}

export interface ImportResult {
  readonly success: boolean
  readonly importedDraft: SerializedDraft | null
  readonly errorMessage: string | null
  readonly warnings: ReadonlyArray<string>
  readonly migrationRequired: boolean
}

export interface ValidationResult {
  readonly isValid: boolean
  readonly errors: ReadonlyArray<string>
  readonly warnings: ReadonlyArray<string>
  readonly schemaVersion: string
  readonly requiresMigration: boolean
}

export interface StorageAdapter {
  readonly save: <T>(key: StorageKey, value: T) => Promise<void>
  readonly load: <T>(key: StorageKey) => Promise<T | null>
  readonly delete: (key: StorageKey) => Promise<void>
  readonly clear: () => Promise<void>
  readonly getQuota: () => Promise<StorageQuota>
}

export interface VersionControl {
  readonly currentVersion: number
  readonly versionHistory: ReadonlyArray<DraftSnapshot>
  readonly canRollback: boolean
  readonly maxVersionsRetained: number
}

export interface ConflictResolution {
  readonly conflictType: 'localNewer' | 'remoteNewer' | 'divergent'
  readonly localVersion: CompleteSongState
  readonly remoteVersion: CompleteSongState
  readonly suggestedResolution: 'keepLocal' | 'keepRemote' | 'merge' | 'manual'
  readonly canAutoResolve: boolean
}

export interface SyncState {
  readonly syncStatus: SyncStatus
  readonly lastSyncAt: Date | null
  readonly pendingChanges: number
  readonly conflicts: ReadonlyArray<ConflictResolution>
  readonly syncInProgress: boolean
  readonly nextSyncAt: Date | null
}

export interface CacheEntry<T> {
  readonly key: string
  readonly value: T
  readonly cachedAt: Date
  readonly expiresAt: Date
  readonly isStale: boolean
}

export interface CacheManager {
  readonly get: <T>(key: string) => CacheEntry<T> | null
  readonly set: <T>(key: string, value: T, ttlSeconds: number) => void
  readonly invalidate: (key: string) => void
  readonly clear: () => void
  readonly size: number
}
