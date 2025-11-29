/**
 * Centralized error tracking abstraction
 *
 * Integrated with LogRocket for session replay and error tracking
 *
 * Features:
 * - Automatic error capture in LogRocket with full session context
 * - Breadcrumb tracking for debugging user flows
 * - User context enrichment for all errors
 * - Session replay URLs automatically attached to errors
 */

import { env } from '@/app/config/env';

interface ErrorContext {
  service?: string;
  userId?: string;
  [key: string]: unknown;
}

interface UserContext {
  id?: string;
  email?: string;
  name?: string;
}

interface TrackingProvider {
  captureError(error: unknown, context?: ErrorContext): void;
  captureException(exception: Error, context?: ErrorContext): void;
  setUserContext(user: UserContext | null): void;
  addBreadcrumb(message: string, data?: Record<string, unknown>): void;
}

class LoggerTrackingProvider implements TrackingProvider {
  private userContext: UserContext | null = null;
  private logRocketAvailable = false;

  constructor() {
    if (typeof window !== 'undefined' && env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      this.logRocketAvailable = true;
    }
  }

  captureError(error: unknown, context?: ErrorContext): void {
    const enrichedContext = this.enrichContext(context);

    if (this.logRocketAvailable) {
      import('logrocket')
        .then(LogRocket => {
          const sessionURL = LogRocket.default.sessionURL || undefined;
          const errorMessage = error instanceof Error ? error.message : String(error);

          LogRocket.default.captureMessage(errorMessage, {
            tags: {
              service: enrichedContext.service || 'unknown',
            },
            extra: {
              ...enrichedContext,
              ...(sessionURL ? { sessionURL } : {}),
            },
          });
        })
        .catch(() => {});
    }
  }

  captureException(exception: Error, context?: ErrorContext): void {
    const enrichedContext = this.enrichContext(context);

    if (this.logRocketAvailable) {
      import('logrocket')
        .then(LogRocket => {
          const sessionURL = LogRocket.default.sessionURL || undefined;

          LogRocket.default.captureException(exception, {
            tags: {
              service: enrichedContext.service || 'unknown',
            },
            extra: {
              ...enrichedContext,
              ...(sessionURL ? { sessionURL } : {}),
            },
          });
        })
        .catch(() => {});
    }
  }

  setUserContext(user: UserContext | null): void {
    this.userContext = user;

    if (this.logRocketAvailable && user) {
      import('logrocket')
        .then(LogRocket => {
          const traits: Record<string, string | number | boolean> = {};
          if (user.name) traits.name = user.name;
          if (user.email) traits.email = user.email;

          LogRocket.default.identify(user.id || 'unknown', traits);
        })
        .catch(() => {});
    }
  }

  addBreadcrumb(message: string, data?: Record<string, unknown>): void {
    if (this.logRocketAvailable) {
      import('logrocket')
        .then(LogRocket => {
          LogRocket.default.log(message, data);
        })
        .catch(() => {});
    }
  }

  private enrichContext(context?: ErrorContext): ErrorContext {
    const baseContext = context || {};

    if (this.userContext) {
      return {
        ...baseContext,
        userId: baseContext.userId || this.userContext.id,
      };
    }

    return baseContext;
  }
}

function createTrackingProvider(): TrackingProvider {
  return new LoggerTrackingProvider();
}

const provider = createTrackingProvider();

export const errorTracker = {
  /**
   * Capture an error with context
   * Use for known error states, validation failures, business logic errors
   *
   * @example
   * errorTracker.captureError('Song not found', {
   *   service: 'songs',
   *   userId: '123'
   * })
   */
  captureError: (error: unknown, context?: ErrorContext) => {
    provider.captureError(error, context);
  },

  /**
   * Capture an exception (Error instance) with context
   * Use for unexpected errors, caught exceptions, try/catch blocks
   *
   * @example
   * try {
   *   await dangerousOperation()
   * } catch (error) {
   *   errorTracker.captureException(error as Error, {
   *     service: 'audio',
   *     userId
   *   })
   * }
   */
  captureException: (exception: Error, context?: ErrorContext) => {
    provider.captureException(exception, context);
  },

  /**
   * Set user context for all subsequent error captures
   * Call this after authentication to enrich error reports
   *
   * @example
   * errorTracker.setUserContext({
   *   id: user.id,
   *   email: user.email
   * })
   *
   * // Clear context on logout
   * errorTracker.setUserContext(null)
   */
  setUserContext: (user: UserContext | null) => {
    provider.setUserContext(user);
  },

  /**
   * Add breadcrumb for debugging context
   * Useful for tracking user actions leading up to an error
   *
   * @example
   * errorTracker.addBreadcrumb('User played song', {
   *   songId: '123'
   * })
   */
  addBreadcrumb: (message: string, data?: Record<string, unknown>) => {
    provider.addBreadcrumb(message, data);
  },
};

export type { ErrorContext, UserContext };
