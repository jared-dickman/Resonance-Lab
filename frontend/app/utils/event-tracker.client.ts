/**
 * Client-side event tracking
 *
 * Tracks user events with automatic browser context enrichment
 * Integrates with LogRocket for session replay correlation
 */

import { errorTracker } from '@/app/utils/error-tracker';
import { env } from '@/app/config/env';

interface UserProperties {
  id?: string;
  email?: string;
  name?: string;
}

interface BaseEventProperties {
  [key: string]: unknown;
}

class ClientEventTracker {
  private logRocketAvailable = false;
  private userContext: UserProperties | null = null;

  constructor() {
    if (typeof window !== 'undefined' && env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      this.logRocketAvailable = true;
    }
  }

  private getBrowserContext(): Record<string, unknown> {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      return {
        platform: window.navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      };
    } catch {
      return {};
    }
  }

  trackEvent(eventName: string, properties?: BaseEventProperties): void {
    try {
      const browserContext = this.getBrowserContext();
      const enrichedProperties = {
        ...properties,
        ...browserContext,
      };

      if (this.logRocketAvailable) {
        import('logrocket')
          .then((LogRocket) => {
            // Filter out unknown types for LogRocket
            const logRocketProps: Record<
              string,
              string | number | boolean | string[] | number[] | boolean[] | null
            > = {};
            Object.entries(enrichedProperties).forEach(([key, value]) => {
              if (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean' ||
                value === null
              ) {
                logRocketProps[key] = value;
              } else if (
                Array.isArray(value) &&
                value.every(
                  (v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
                )
              ) {
                logRocketProps[key] = value as string[] | number[] | boolean[];
              }
            });
            LogRocket.default.track(eventName, logRocketProps);
          })
          .catch(() => {});
      }
    } catch (error) {
      errorTracker.captureException(error as Error, {
        service: 'event-tracker',
        eventName,
      });
    }
  }

  identifyUser(user: UserProperties): void {
    this.userContext = user;
    errorTracker.addBreadcrumb('User identified', {
      userId: user.id,
    });

    if (this.logRocketAvailable && user.id) {
      import('logrocket')
        .then((LogRocket) => {
          LogRocket.default.identify(user.id!, {
            ...(user.name && { name: user.name }),
            ...(user.email && { email: user.email }),
          });
        })
        .catch(() => {});
    }
  }

  resetUser(): void {
    this.userContext = null;
    errorTracker.addBreadcrumb('User reset');
  }
}

export const clientEventTracker = new ClientEventTracker();
export type { UserProperties, BaseEventProperties };
