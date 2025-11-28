/**
 * Safe logging utility that only logs in development mode
 * Prevents sensitive data and debug logs from appearing in production
 *
 * Uses process.env.NODE_ENV for consistent server/client behavior (no hydration mismatch)
 */
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      try {
        console.log(...args)
      } catch {
        logger.error(...args)
      }
    }
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (...args: unknown[]) => {
    if (isDevelopment) {

      console.warn(...args)
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {

      console.debug(...args)
    }
  },

  /**
   * Log error messages (always logged, but sanitized in production)
   */
  error: (...args: unknown[]) => {
    if (isDevelopment) {

      console.error(...args)
    } else {
      // In production, only log the error message without sensitive details
      const sanitizedArgs = args.map(arg => {
        if (arg instanceof Error) {
          return arg.message
        }
        if (typeof arg === 'object') {
          return '[Object]'
        }
        return arg
      })

      console.error(...sanitizedArgs)
    }
  },
}
