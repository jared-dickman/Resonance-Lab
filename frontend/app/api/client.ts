import { apiBaseUrl } from '@/lib/utils';

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

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: await this.buildHeaders(options?.headers as Record<string, string>),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: await this.buildHeaders(options?.headers as Record<string, string>),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: await this.buildHeaders(options?.headers as Record<string, string>),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: await this.buildHeaders(options?.headers as Record<string, string>),
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
