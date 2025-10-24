import type { StorageKey, StorageQuota, StorageAdapter } from '../types/persistence'

export function createLocalStorageAdapter(): StorageAdapter {
  return {
    save: saveToLocalStorage,
    load: loadFromLocalStorage,
    delete: deleteFromLocalStorage,
    clear: clearAllLocalStorage,
    getQuota: calculateStorageQuota,
  }
}

async function saveToLocalStorage<T>(key: StorageKey, value: T): Promise<void> {
  try {
    const serialized = JSON.stringify(value, dateReplacer)
    localStorage.setItem(key, serialized)
  } catch (error) {
    if (isQuotaExceededError(error)) {
      throw new Error('Storage quota exceeded. Please delete old drafts.')
    }
    throw error
  }
}

async function loadFromLocalStorage<T>(key: StorageKey): Promise<T | null> {
  try {
    const serialized = localStorage.getItem(key)
    if (!serialized) return null

    return JSON.parse(serialized, dateReviver)
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error)
    return null
  }
}

async function deleteFromLocalStorage(key: StorageKey): Promise<void> {
  localStorage.removeItem(key)
}

async function clearAllLocalStorage(): Promise<void> {
  const songwriterKeys = Object.keys(localStorage).filter(key =>
    key.startsWith('songwriter')
  )

  songwriterKeys.forEach(key => localStorage.removeItem(key))
}

async function calculateStorageQuota(): Promise<StorageQuota> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    const total = estimate.quota || 0
    const used = estimate.usage || 0

    return {
      totalBytes: total,
      usedBytes: used,
      availableBytes: total - used,
      percentageUsed: total > 0 ? (used / total) * 100 : 0,
      quotaExceeded: used >= total,
    }
  }

  return {
    totalBytes: 5242880,
    usedBytes: 0,
    availableBytes: 5242880,
    percentageUsed: 0,
    quotaExceeded: false,
  }
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}

function dateReplacer(key: string, value: unknown): unknown {
  if (value instanceof Date) {
    return { __type: 'Date', value: value.toISOString() }
  }
  if (value instanceof Map) {
    return { __type: 'Map', value: Array.from(value.entries()) }
  }
  if (value instanceof Set) {
    return { __type: 'Set', value: Array.from(value) }
  }
  return value
}

function dateReviver(key: string, value: unknown): unknown {
  if (typeof value === 'object' && value !== null && '__type' in value) {
    const typed = value as { __type: string; value: unknown }

    if (typed.__type === 'Date' && typeof typed.value === 'string') {
      return new Date(typed.value)
    }
    if (typed.__type === 'Map' && Array.isArray(typed.value)) {
      return new Map(typed.value as [unknown, unknown][])
    }
    if (typed.__type === 'Set' && Array.isArray(typed.value)) {
      return new Set(typed.value)
    }
  }
  return value
}

export function generateChecksum(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(36)
}

export function compressString(input: string): string {
  return input
}

export function decompressString(input: string): string {
  return input
}
