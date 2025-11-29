import { useEffect, useRef } from 'react';

/**
 * Hook that runs a callback at a specified interval
 * Automatically cleans up on unmount or when dependencies change
 */
export function useIntervalEffect(callback: () => void, intervalMs: number, enabled = true) {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => savedCallback.current();
    const id = setInterval(tick, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
