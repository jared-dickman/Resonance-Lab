/**
 * Mobile Detection Hook
 * Tracks viewport size and determines mobile state
 */

import { useState, useEffect } from 'react';

import { createResizeHandler, isMobileViewport } from '@/lib/utils/songwriter/viewportDetector';

export function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    setIsMobile(isMobileViewport());
    return createResizeHandler(setIsMobile);
  }, []);

  return isMobile;
}
