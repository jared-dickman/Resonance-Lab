import { logger } from '@/lib/logger';
/**
 * Performance Monitoring System
 * Tracks Web Vitals and custom metrics for world-class performance
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitalsThresholds {
  LCP: { good: number; poor: number }; // Largest Contentful Paint
  FID: { good: number; poor: number }; // First Input Delay
  CLS: { good: number; poor: number }; // Cumulative Layout Shift
  FCP: { good: number; poor: number }; // First Contentful Paint
  TTFB: { good: number; poor: number }; // Time to First Byte
}

const WEB_VITALS_THRESHOLDS: WebVitalsThresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private listeners: ((metric: PerformanceMetric) => void)[] = [];

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Monitor Web Vitals
    this.initWebVitals();

    // Monitor custom metrics
    this.initCustomMetrics();

    // Monitor resource timing
    this.initResourceTiming();
  }

  private getRating(
    name: keyof WebVitalsThresholds,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = WEB_VITALS_THRESHOLDS[name];
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.listeners.forEach(listener => listener(metric));

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[Performance] ${metric.name}:`, {
        value: `${metric.value.toFixed(2)}ms`,
        rating: metric.rating,
      });
    }
  }

  private initWebVitals(): void {
    // Use Next.js web vitals if available
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // LCP - Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            renderTime: number;
            loadTime: number;
          };
          const value = lastEntry.renderTime || lastEntry.loadTime;
          this.recordMetric({
            name: 'LCP',
            value,
            rating: this.getRating('LCP', value),
            timestamp: Date.now(),
          });
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        logger.warn('LCP monitoring not supported');
      }

      // FID - First Input Delay
      try {
        const fidObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            const fidEntry = entry as PerformanceEntry & { processingStart: number };
            const value = fidEntry.processingStart - entry.startTime;
            this.recordMetric({
              name: 'FID',
              value,
              rating: this.getRating('FID', value),
              timestamp: Date.now(),
            });
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        logger.warn('FID monitoring not supported');
      }

      // CLS - Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            const layoutShiftEntry = entry as PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
            };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // Report CLS on page unload
        window.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            this.recordMetric({
              name: 'CLS',
              value: clsValue,
              rating: this.getRating('CLS', clsValue),
              timestamp: Date.now(),
            });
          }
        });
      } catch (e) {
        logger.warn('CLS monitoring not supported');
      }
    }
  }

  private initCustomMetrics(): void {
    if (typeof window === 'undefined') return;

    // Track page load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.recordMetric({
          name: 'Page Load Time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          rating: 'good',
          timestamp: Date.now(),
        });
      }
    });
  }

  private initResourceTiming(): void {
    if (typeof window === 'undefined') return;

    // Monitor slow resources
    const resourceObserver = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        const resourceEntry = entry as PerformanceResourceTiming;
        const duration = resourceEntry.duration;

        // Flag slow resources (> 1s)
        if (duration > 1000) {
          logger.warn(`Slow resource detected: ${entry.name} (${duration.toFixed(0)}ms)`);
        }
      });
    });

    try {
      resourceObserver.observe({ type: 'resource', buffered: true });
    } catch (e) {
      logger.warn('Resource timing monitoring not supported');
    }
  }

  /**
   * Track custom metric
   */
  measure(name: string, startMark: string, endMark: string): void {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        this.recordMetric({
          name,
          value: measure.duration,
          rating: 'good',
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      logger.warn(`Failed to measure ${name}:`, e);
    }
  }

  /**
   * Mark a performance point
   */
  mark(name: string): void {
    try {
      performance.mark(name);
    } catch (e) {
      logger.warn(`Failed to mark ${name}:`, e);
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Subscribe to metric updates
   */
  subscribe(callback: (metric: PerformanceMetric) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    good: number;
    needsImprovement: number;
    poor: number;
    total: number;
  } {
    const summary = {
      good: 0,
      needsImprovement: 0,
      poor: 0,
      total: this.metrics.length,
    };

    this.metrics.forEach(metric => {
      if (metric.rating === 'good') summary.good++;
      else if (metric.rating === 'needs-improvement') summary.needsImprovement++;
      else summary.poor++;
    });

    return summary;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}
