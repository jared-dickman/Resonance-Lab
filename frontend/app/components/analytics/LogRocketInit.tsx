'use client';

import { env } from '@/app/config/env';
import { useEffect, useRef } from 'react';

export function LogRocketInit() {
  const hasInitialized = useRef(false);

  useEffect(() => {
    const appId = env.NEXT_PUBLIC_LOGROCKET_APP_ID;

    if (!hasInitialized.current && typeof window !== 'undefined' && appId) {
      import('logrocket').then(LogRocket => {
        LogRocket.default.init(appId, {
          network: {
            requestSanitizer: request => {
              if (request.headers?.Authorization) {
                request.headers.Authorization = '[REDACTED]';
              }
              if (request.headers?.['x-api-key']) {
                request.headers['x-api-key'] = '[REDACTED]';
              }
              return request;
            },
            responseSanitizer: response => response,
          },
          dom: {
            privateAttributeBlocklist: ['data-private', 'data-sensitive'],
          },
          console: {
            shouldAggregateConsoleErrors: true,
          },
          browser: {
            urlSanitizer: (url: string) => {
              try {
                const sanitized = new URL(url);
                sanitized.searchParams.delete('token');
                sanitized.searchParams.delete('key');
                sanitized.searchParams.delete('api_key');
                return sanitized.toString();
              } catch {
                return url;
              }
            },
          },
        });
        hasInitialized.current = true;
      });
    }
  }, []);

  return null;
}
