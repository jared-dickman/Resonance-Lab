'use client';

import { useEffect, useState } from 'react';

/**
 * useReducedMotion - Detects user's motion preference for accessibility
 *
 * Respects WCAG 2.1 Level A requirement for motion sensitivity.
 * Components should disable animations when this returns true.
 *
 * @returns boolean - true if user prefers reduced motion
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 *
 * <motion.div
 *   animate={prefersReducedMotion ? {} : {scale: [1, 1.2, 1]}}
 *   transition={prefersReducedMotion ? {duration: 0} : {duration: 0.3}}
 * />
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
