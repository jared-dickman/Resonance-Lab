/**
 * Viewport Detection Utilities
 * Responsive breakpoint detection
 */

import { PANEL_CONFIG } from '@/lib/constants/songwriter.constants';

export function isMobileViewport(): boolean {
  return window.innerWidth < PANEL_CONFIG.MOBILE_BREAKPOINT;
}

export function createResizeHandler(callback: (isMobile: boolean) => void): () => void {
  const handler = (): void => callback(isMobileViewport());
  window.addEventListener('resize', handler);
  return (): void => window.removeEventListener('resize', handler);
}
