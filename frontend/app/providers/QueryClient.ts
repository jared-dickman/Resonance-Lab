import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

// Global error handling at cache level
const queryCache = new QueryCache({
  onError: (error, query) => {
    // Log error for monitoring
    logger.error('Query Error:', {
      queryKey: String(query.queryKey),
      error: error instanceof Error ? error.message : String(error),
    });

    // Note: Toast notifications would go here if we add a toast library
    // For now, errors are handled at the component level via error states
  },
});

const mutationCache = new MutationCache({
  onError: error => {
    logger.error('Mutation Error:', error instanceof Error ? error.message : String(error));

    // Note: Toast notifications would go here if we add a toast library
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Disable for music app (less disruptive)
    },
    mutations: {
      retry: (failureCount, error) => {
        // Retry network errors and 5xx, not 4xx client errors
        const status = (error as { status?: number }).status;
        if (status && status >= 400 && status < 500) {
          return false; // Don't retry client errors
        }
        return failureCount < 1; // Retry once for network/server errors
      },
    },
  },
});
