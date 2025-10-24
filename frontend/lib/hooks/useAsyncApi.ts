import { useCallback, useState } from 'react';
import { logger } from '@/lib/logger';

interface AsyncApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface AsyncApiResult<T> extends AsyncApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useAsyncApi<T>(
  apiFunc: (...args: any[]) => Promise<T>,
  errorMessage = 'Operation failed'
): AsyncApiResult<T> {
  const [state, setState] = useState<AsyncApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await apiFunc(...args);
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : errorMessage;
        logger.error(`${errorMessage}:`, err);
        setState(prev => ({ ...prev, isLoading: false, error: message }));
        return null;
      }
    },
    [apiFunc, errorMessage]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
