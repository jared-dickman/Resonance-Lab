---
name: logrocket-raptor
description: Configure LogRocket tracking, privacy, performance monitoring, and integration with error/event tracking systems
auto_trigger: false
keywords: [logrocket, session replay, tracking, privacy, performance, monitoring]
---

# LogRocket Raptor

Configures and optimizes LogRocket integration with error tracking, event tracking, and privacy controls.

## Workflow

### Analyze Current Configuration
Read:
- `frontend/app/components/analytics/LogRocketInit.tsx` - initialization config
- `frontend/app/utils/error-tracker.ts` - error integration
- `frontend/app/utils/event-tracker.client.ts` - event integration
- `frontend/app/config/env.ts` - environment variables

### Configure Privacy & Security

**Input Sanitization:**
```typescript
dom: {
  inputSanitizer: true,  // Auto-blocks passwords, SSNs, credit cards
  textSanitizer: true,   // Blocks sensitive text patterns
  privateAttributeBlocklist: ['data-private', 'data-sensitive'],
}
```

**Network Sanitization:**
```typescript
network: {
  requestSanitizer: (request) => {
    // Remove auth headers
    if (request.headers.Authorization) {
      request.headers.Authorization = '[REDACTED]'
    }
    return request
  },
  responseSanitizer: (response) => {
    // Sanitize sensitive response data
    if (response.body?.apiKey) {
      response.body.apiKey = '[REDACTED]'
    }
    return response
  },
}
```

**URL Sanitization:**
```typescript
browser: {
  urlSanitizer: (url: string) => {
    const sanitized = new URL(url)
    sanitized.searchParams.delete('token')
    sanitized.searchParams.delete('key')
    sanitized.searchParams.delete('api_key')
    return sanitized.toString()
  },
}
```

### Enable Performance Monitoring
```typescript
performance: {
  capturePerformance: true,  // Core Web Vitals, LCP, FID, CLS
}
```

### Configure Console Capture
```typescript
console: {
  shouldAggregateConsoleErrors: true,
  isEnabled: {
    log: true,
    info: true,
    debug: process.env.NODE_ENV === 'development',
    warn: true,
    error: true,
  },
}
```

### Integrate with Error Tracker

Verify error tracker sends to LogRocket:
```typescript
captureException(exception: Error, context?: ErrorContext): void {
  if (this.logRocketAvailable) {
    import('logrocket').then((LogRocket) => {
      const sessionURL = LogRocket.default.sessionURL
      LogRocket.default.captureException(exception, {
        tags: {service: context?.service || 'unknown'},
        extra: {...context, sessionURL},
      })
    }).catch(() => {})
  }
}
```

### Integrate with Event Tracker

Verify events tracked in LogRocket:
```typescript
async trackEvent(eventName: string, properties?: BaseEventProperties): Promise<void> {
  if (this.logRocketAvailable) {
    import('logrocket').then((LogRocket) => {
      LogRocket.default.track(eventName, properties)
    }).catch(() => {})
  }
}
```

### Add User Identification

```typescript
identifyUser(user: UserProperties): void {
  if (this.logRocketAvailable && user.id) {
    import('logrocket').then((LogRocket) => {
      LogRocket.default.identify(user.id!, {
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        isSuperAdmin: user.isSuperAdmin,
      })
    }).catch(() => {})
  }
}
```

### Validate CSP Headers

Ensure `next.config.mjs` includes:
```javascript
'Content-Security-Policy': "script-src 'self' ... https://cdn.lgrckt-in.com; connect-src 'self' ... https://*.lgrckt-in.com; worker-src 'self' blob:;"
```

### Test in Browser
1. Check console for: `LogRocket initialized`
2. Verify network requests to `lgrckt-in.com`
3. Trigger test error - check LogRocket dashboard
4. Check session replay works
5. Verify sensitive data is sanitized

## Anti-Patterns

❌ Sending network requests to LogRocket without sanitization
```typescript
network: {}  // Leaks API keys, tokens
```

✅ Sanitize or disable network capture
```typescript
network: {
  requestSanitizer: () => null,  // Block all
}
```

❌ No input sanitization
```typescript
dom: {}  // Records passwords, SSNs, credit cards
```

✅ Enable input sanitization
```typescript
dom: {
  inputSanitizer: true,
  textSanitizer: true,
}
```

❌ Forgetting CSP headers
```typescript
// LogRocket blocked by CSP
```

✅ Add all LogRocket domains to CSP
```typescript
script-src https://cdn.lgrckt-in.com
connect-src https://*.lgrckt-in.com
worker-src blob:
```

## References

- `frontend/app/components/analytics/LogRocketInit.tsx` - Init configuration
- `frontend/app/utils/error-tracker.ts` - Error integration
- `frontend/app/utils/event-tracker.client.ts` - Event integration
- `frontend/app/config/env.ts` - Environment variables (NEXT_PUBLIC_LOGROCKET_APP_ID)
- `frontend/next.config.ts` - CSP headers
