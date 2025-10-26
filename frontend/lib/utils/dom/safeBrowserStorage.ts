type StorageCallback<T> = (storage: Storage) => T;
type Fallback<T> = T | (() => T);

const TEST_KEY = '__resonance_storage_test__';

/**
 * Detects whether `localStorage` is available in the current runtime.
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.setItem(TEST_KEY, TEST_KEY);
    window.localStorage.removeItem(TEST_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Provides safe access to `localStorage`, falling back to the supplied fallback when unavailable.
 */
export function withLocalStorage<T>(
  operation: StorageCallback<T>,
  fallback?: Fallback<T>
): T | undefined {
  if (!isLocalStorageAvailable()) {
    return evaluateFallback(fallback);
  }

  try {
    return operation(window.localStorage);
  } catch {
    return evaluateFallback(fallback);
  }
}

function evaluateFallback<T>(fallback?: Fallback<T>): T | undefined {
  if (typeof fallback === 'function') {
    return (fallback as () => T)();
  }

  return fallback;
}
