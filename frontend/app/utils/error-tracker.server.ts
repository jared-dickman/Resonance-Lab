/**
 * Server-side error tracking for API routes
 *
 * Provides structured error capture with context for debugging
 * Designed to integrate with LogRocket or other monitoring services
 */

import { logger } from '@/lib/logger';

interface ErrorContext {
  service: string;
  requestId?: string;
  operation?: string;
  artist?: string;
  title?: string;
  [key: string]: unknown;
}

interface ApiErrorDetails {
  message: string;
  status?: number;
  context: ErrorContext;
  stack?: string;
}

/**
 * Server-side error tracker for API routes
 * Logs errors with structured context for easy debugging
 */
export const serverErrorTracker = {
  /**
   * Capture an API error with full context
   *
   * @example
   * serverErrorTracker.captureApiError(error, {
   *   service: 'agent-chat',
   *   requestId: '123',
   *   operation: 'claude-api-call',
   *   artist: 'Beatles',
   *   title: 'Yesterday'
   * })
   */
  captureApiError: (error: unknown, context: ErrorContext): ApiErrorDetails => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    const details: ApiErrorDetails = {
      message,
      context,
      stack,
    };

    // Structured logging for easy searching/filtering
    logger.error(`[${context.service}] ${context.operation || 'error'}`, {
      message,
      ...context,
      // Only include stack in dev for security
      ...(process.env.NODE_ENV === 'development' && { stack }),
    });

    return details;
  },

  /**
   * Capture a fetch/network error with response details
   *
   * @example
   * if (!response.ok) {
   *   serverErrorTracker.captureNetworkError(response, {
   *     service: 'songs-api',
   *     operation: 'fetch-song',
   *     artist: 'Beatles',
   *     title: 'Yesterday'
   *   })
   * }
   */
  captureNetworkError: async (
    response: Response,
    context: ErrorContext
  ): Promise<ApiErrorDetails> => {
    let responseBody: string | undefined;
    try {
      responseBody = await response.text();
    } catch {
      responseBody = undefined;
    }

    const details: ApiErrorDetails = {
      message: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status,
      context: {
        ...context,
        responseBody: responseBody?.slice(0, 500), // Truncate for logging
      },
    };

    logger.error(`[${context.service}] network error`, {
      status: response.status,
      statusText: response.statusText,
      ...context,
    });

    return details;
  },

  /**
   * Add a breadcrumb for debugging flow
   *
   * @example
   * serverErrorTracker.addBreadcrumb('agent-chat', 'Starting Claude API call', { model: 'haiku' })
   */
  addBreadcrumb: (service: string, message: string, data?: Record<string, unknown>): void => {
    logger.info(`[${service}] ${message}`, data);
  },
};

export type { ErrorContext, ApiErrorDetails };
