/**
 * Generic API Service
 * Provides centralized HTTP client for making API requests
 */

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) 
  ? envApiUrl 
  : (import.meta.env.DEV ? '' : 'http://localhost:8001');

const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

interface RequestOptions {
  headers?: HeadersInit;
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<{ data: T; status: number }> {
    const url = new URL(endpoint, this.baseURL);

    // Add query parameters
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const headers = {
      ...this.defaultHeaders,
      ...options?.headers,
    };

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include', // Include cookies for auth
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error(`[API] ${method} ${endpoint} failed:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request<T>('PATCH', endpoint, data, options);
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE);

// Export class for testing or custom instances
export { ApiClient };
