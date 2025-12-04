/**
 * DEPRECATED: Client-side auth removed for security
 * Client requests are authenticated via server-side validation only
 * No credentials should be exposed in client bundle
 */
export function getAuthHeaders(): HeadersInit {
  // No client-side credentials - server handles auth
  return {};
}
