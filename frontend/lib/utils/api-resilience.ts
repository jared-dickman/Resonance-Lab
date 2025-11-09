/**
 * API Resilience Utilities
 * Implements retry logic, exponential backoff, and request caching
 * for robust API interactions
 */

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Implements exponential backoff with jitter
 * Prevents thundering herd problem
 */
function calculateBackoff(attempt: number, config: Required<RetryConfig>): number {
  const exponentialDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay);
  // Add jitter (random 0-20% of delay)
  const jitter = cappedDelay * 0.2 * Math.random();
  return cappedDelay + jitter;
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: unknown, config: Required<RetryConfig>): boolean {
  if (error instanceof Response) {
    return config.retryableStatuses.includes(error.status);
  }
  if (error instanceof Error) {
    // Network errors are retryable
    return error.name === 'TypeError' || error.message.includes('fetch');
  }
  return false;
}

/**
 * Retry wrapper for async functions
 * Automatically retries failed requests with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === finalConfig.maxRetries || !isRetryableError(error, finalConfig)) {
        throw error;
      }

      // Wait before retrying
      const delay = calculateBackoff(attempt, finalConfig);

      // Suppress retry logs in development for connection errors (backend not running)
      // to reduce console noise during development
      const shouldLog = process.env.NODE_ENV !== 'development' ||
        !(error instanceof Error && error.message.includes('fetch'));

      if (shouldLog) {
        console.warn(`Request failed (attempt ${attempt + 1}/${finalConfig.maxRetries}). Retrying in ${delay}ms...`);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * In-memory cache for API responses
 * Reduces redundant network requests
 */
class RequestCache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries periodically
  startCleanup(interval: number = 60000): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.timestamp) {
          this.cache.delete(key);
        }
      }
    }, interval);
  }
}

export const requestCache = new RequestCache();

/**
 * Cached fetch with retry logic
 * Combines caching and retry for optimal resilience
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  config: {
    cacheKey?: string;
    cacheTTL?: number;
    retry?: RetryConfig;
  } = {}
): Promise<T> {
  const cacheKey = config.cacheKey || url;

  // Check cache first
  const cached = requestCache.get<T>(cacheKey);
  if (cached) {
    console.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }

  // Fetch with retry
  const data = await withRetry(async () => {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw response;
    }
    return response.json() as Promise<T>;
  }, config.retry);

  // Cache the result
  requestCache.set(cacheKey, data, config.cacheTTL);

  return data;
}

/**
 * Request deduplication
 * Prevents multiple identical in-flight requests
 */
class RequestDeduplicator {
  private pending = new Map<string, Promise<unknown>>();

  async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // If request is already in flight, return existing promise
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    // Start new request
    const promise = fn()
      .finally(() => {
        // Remove from pending once complete
        this.pending.delete(key);
      });

    this.pending.set(key, promise);
    return promise;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

/**
 * Timeout wrapper
 * Prevents requests from hanging indefinitely
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  timeoutMessage: string = 'Request timeout'
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}
