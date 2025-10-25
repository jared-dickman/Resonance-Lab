/**
 * Application Initialization
 * Bootstraps all monitoring, health checks, and resilience systems
 * CRITICAL: Keep this file small and focused
 */

import { performanceMonitor } from '@/lib/monitoring/performance-monitor';
import { healthCheck, registerDefaultHealthChecks } from '@/lib/monitoring/health-check';
import { requestCache } from '@/lib/utils/api-resilience';
import { apiBaseUrl } from '@/lib/utils';

let initialized = false;

/**
 * Initialize application systems
 * Call once on app bootstrap
 */
export function initializeApp(): void {
  if (initialized || typeof window === 'undefined') return;

  // Start performance monitoring
  performanceMonitor.init();

  // Register health checks
  registerDefaultHealthChecks(apiBaseUrl());

  // Start health monitoring (check every 2 minutes)
  healthCheck.start(120000);

  // Start cache cleanup (every minute)
  requestCache.startCleanup(60000);

  initialized = true;

  console.log('[Init] Application systems initialized');
}

/**
 * Cleanup on app unmount
 */
export function cleanupApp(): void {
  if (!initialized) return;

  healthCheck.stop();
  requestCache.clear();

  initialized = false;

  console.log('[Init] Application systems cleaned up');
}
