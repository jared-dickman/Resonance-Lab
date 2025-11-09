/**
 * Application Health Check System
 * Monitors critical services and dependencies
 * Provides real-time health status for diagnostics
 */

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  error?: string;
  timestamp: number;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: HealthStatus[];
  timestamp: number;
}

class HealthCheckSystem {
  private healthChecks: Map<string, () => Promise<HealthStatus>> = new Map();
  private lastCheck: SystemHealth | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Register a health check for a service
   */
  register(serviceName: string, checkFn: () => Promise<HealthStatus>): void {
    this.healthChecks.set(serviceName, checkFn);
  }

  /**
   * Start automatic health monitoring
   */
  start(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      this.stop();
    }

    // Run initial check
    this.check().catch(console.error);

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.check().catch(console.error);
    }, intervalMs);
  }

  /**
   * Stop automatic health monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Run all health checks
   */
  async check(): Promise<SystemHealth> {
    const checks = Array.from(this.healthChecks.values());
    const results = await Promise.allSettled(checks.map(check => check()));

    const services: HealthStatus[] = results.map((result, index) => {
      const serviceName = Array.from(this.healthChecks.keys())[index] || 'unknown';

      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          service: serviceName,
          status: 'unhealthy',
          error: result.reason?.message || 'Health check failed',
          timestamp: Date.now(),
        };
      }
    });

    // Determine overall health
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    this.lastCheck = {
      overall,
      services,
      timestamp: Date.now(),
    };

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Health Check]', this.lastCheck);
    }

    return this.lastCheck;
  }

  /**
   * Get last health check result
   */
  getStatus(): SystemHealth | null {
    return this.lastCheck;
  }

  /**
   * Check if system is healthy
   */
  isHealthy(): boolean {
    return this.lastCheck?.overall === 'healthy';
  }
}

export const healthCheck = new HealthCheckSystem();

/**
 * Register default health checks
 */
export function registerDefaultHealthChecks(apiBaseUrl: string): void {
  // API Health Check with dev-friendly logging
  let consecutiveFailures = 0;
  let hasLoggedDevTip = false;

  healthCheck.register('api', async () => {
    const startTime = Date.now();
    try {
      const response = await fetch(`${apiBaseUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        consecutiveFailures++;
        return {
          service: 'api',
          status: 'unhealthy',
          latency,
          error: `HTTP ${response.status}`,
          timestamp: Date.now(),
        };
      }

      // Reset on success
      consecutiveFailures = 0;
      hasLoggedDevTip = false;

      return {
        service: 'api',
        status: latency < 1000 ? 'healthy' : 'degraded',
        latency,
        timestamp: Date.now(),
      };
    } catch (error) {
      consecutiveFailures++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // In development, show helpful tip on first connection failure
      if (process.env.NODE_ENV === 'development' && !hasLoggedDevTip && errorMessage.includes('fetch')) {
        console.info(
          '💡 Backend API unavailable. To enable full features, start the server:\n' +
          '   cd scraper && go run cmd/server/main.go'
        );
        hasLoggedDevTip = true;
      }

      return {
        service: 'api',
        status: 'unhealthy',
        latency: Date.now() - startTime,
        error: errorMessage,
        timestamp: Date.now(),
      };
    }
  });

  // Local Storage Check
  healthCheck.register('localStorage', async () => {
    try {
      const testKey = '__health_check__';
      const testValue = 'test';

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        throw new Error('localStorage read/write mismatch');
      }

      return {
        service: 'localStorage',
        status: 'healthy',
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        service: 'localStorage',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  });

  // Browser Support Check
  healthCheck.register('browserSupport', async () => {
    const requiredFeatures = [
      'fetch',
      'Promise',
      'localStorage',
      'requestAnimationFrame',
      'AudioContext',
    ];

    const missingFeatures = requiredFeatures.filter(feature => {
      if (feature === 'AudioContext') {
        return !(window.AudioContext || (window as Window & { webkitAudioContext?: unknown }).webkitAudioContext);
      }
      return !(feature in window);
    });

    if (missingFeatures.length > 0) {
      return {
        service: 'browserSupport',
        status: 'degraded',
        error: `Missing: ${missingFeatures.join(', ')}`,
        timestamp: Date.now(),
      };
    }

    return {
      service: 'browserSupport',
      status: 'healthy',
      timestamp: Date.now(),
    };
  });

  // Memory Usage Check (if available)
  if ('memory' in performance && (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory) {
    healthCheck.register('memory', async () => {
      const memory = (performance as Performance & { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (usagePercent < 75) {
        status = 'healthy';
      } else if (usagePercent < 90) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        service: 'memory',
        status,
        error: status !== 'healthy' ? `${usagePercent.toFixed(1)}% used` : undefined,
        timestamp: Date.now(),
      };
    });
  }
}
