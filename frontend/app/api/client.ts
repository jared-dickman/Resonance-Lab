import { apiBaseUrl } from '@/lib/utils';
import { withRetry, withTimeout, requestDeduplicator } from '@/lib/utils/api-resilience';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends RequestInit {
  retry?: boolean;
  timeout?: number;
  deduplicate?: boolean;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor() {
    this.baseURL = apiBaseUrl();
  }

  /**
   * Future: Add authentication token injection here
   * For now, this app doesn't have auth
   */
  private async getAuthToken(): Promise<string | null> {
    // const session = await getSession()
    // return session?.accessToken || null
    return null;
  }

  private async buildHeaders(custom?: Record<string, string>): Promise<Record<string, string>> {
    const headers = { ...this.defaultHeaders, ...custom };
    const token = await this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const message = await response.text();
      throw new ApiClientError(
        message || response.statusText,
        response.status,
        response.statusText,
        message
      );
    }
    return response.json() as Promise<T>;
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const { retry = true, timeout = 30000, deduplicate = true, ...fetchOptions } = options || {};
    const url = `${this.baseURL}${endpoint}`;

    const makeRequest = async () => {
      const response = await fetch(url, {
        ...fetchOptions,
        method: 'GET',
        headers: await this.buildHeaders(fetchOptions?.headers as Record<string, string>),
      });
      return this.handleResponse<T>(response);
    };

    let requestPromise: Promise<T>;

    // Apply request deduplication for GET requests
    if (deduplicate) {
      requestPromise = requestDeduplicator.deduplicate(url, makeRequest);
    } else {
      requestPromise = makeRequest();
    }

    // Apply retry logic if enabled
    if (retry) {
      requestPromise = withRetry(() => requestPromise);
    }

    // Apply timeout
    return withTimeout(requestPromise, timeout, `Request to ${endpoint} timed out`);
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const { retry = true, timeout = 30000, ...fetchOptions } = options || {};

    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        method: 'POST',
        headers: await this.buildHeaders(fetchOptions?.headers as Record<string, string>),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    };

    const requestPromise = retry ? withRetry(makeRequest) : makeRequest();
    return withTimeout(requestPromise, timeout, `Request to ${endpoint} timed out`);
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const { retry = true, timeout = 30000, ...fetchOptions } = options || {};

    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        method: 'PUT',
        headers: await this.buildHeaders(fetchOptions?.headers as Record<string, string>),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    };

    const requestPromise = retry ? withRetry(makeRequest) : makeRequest();
    return withTimeout(requestPromise, timeout, `Request to ${endpoint} timed out`);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const { retry = false, timeout = 30000, ...fetchOptions } = options || {};

    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        method: 'DELETE',
        headers: await this.buildHeaders(fetchOptions?.headers as Record<string, string>),
      });
      return this.handleResponse<T>(response);
    };

    const requestPromise = retry ? withRetry(makeRequest) : makeRequest();
    return withTimeout(requestPromise, timeout, `Request to ${endpoint} timed out`);
  }
}

export const apiClient = new ApiClient();
