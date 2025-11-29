/**
 * Unified API Client
 * Provides a consistent, centralized way to communicate with the Laravel backend
 * 
 * Features:
 * - Automatic authentication token management
 * - Token refresh on 401 errors
 * - Centralized error handling
 * - Request/response interceptors
 * - Support for Next.js proxy routes (default) and direct API calls
 */

import { handleApiError, handleNetworkError, logError, ErrorType, type AppError } from './errorHandler';
import { authStorage } from './authClient';

// Configuration
const USE_DIRECT_API = process.env.NEXT_PUBLIC_AUTH_DIRECT === 'true' || process.env.NEXT_PUBLIC_AUTH_DIRECT === '1';
const API_BASE = USE_DIRECT_API ? (process.env.NEXT_PUBLIC_API_BASE ?? '') : '';

// Request interceptor type
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
type ErrorInterceptor = (error: AppError) => AppError | Promise<AppError>;

// Request configuration
export interface RequestConfig extends RequestInit {
  path: string;
  params?: Record<string, string | number | boolean>;
  includeAuth?: boolean;
  retryOn401?: boolean;
  skipErrorLogging?: boolean;
}

// Response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

// Interceptors storage
const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];

/**
 * Add request interceptor
 */
export function addRequestInterceptor(interceptor: RequestInterceptor): () => void {
  requestInterceptors.push(interceptor);
  return () => {
    const index = requestInterceptors.indexOf(interceptor);
    if (index > -1) {
      requestInterceptors.splice(index, 1);
    }
  };
}

/**
 * Add response interceptor
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
  responseInterceptors.push(interceptor);
  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index > -1) {
      responseInterceptors.splice(index, 1);
    }
  };
}

/**
 * Add error interceptor
 */
export function addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
  errorInterceptors.push(interceptor);
  return () => {
    const index = errorInterceptors.indexOf(interceptor);
    if (index > -1) {
      errorInterceptors.splice(index, 1);
    }
  };
}

/**
 * Build URL with query parameters
 */
function buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
  // If path already starts with http, use it as-is (direct API call)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    const url = new URL(path);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }
    return url.toString();
  }

  // Use Next.js proxy route (default)
  const base = API_BASE || '';
  const url = `${base}${path}`;
  
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });
  
  return `${url}?${searchParams.toString()}`;
}

/**
 * Build headers with authentication
 */
function buildHeaders(config: RequestConfig): HeadersInit {
  const headers = new Headers(config.headers);
  
  // Set default Content-Type for JSON requests
  if (!headers.has('Content-Type') && config.body && typeof config.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  
  // Set Accept header
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Add authentication token
  if (config.includeAuth !== false) {
    const token = authStorage.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return headers;
}

/**
 * Handle token refresh on 401 errors
 */
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      // Try to refresh token via Laravel Sanctum
      // Note: This assumes Laravel has a token refresh endpoint
      // If not available, we'll just return null and force re-login
      const token = authStorage.getToken();
      if (!token) {
        return null;
      }

      // For now, we'll just return the existing token
      // In the future, implement actual token refresh if Laravel supports it
      // const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token}` },
      // });
      // if (response.ok) {
      //   const data = await response.json();
      //   authStorage.setToken(data.token);
      //   return data.token;
      // }
      
      return token;
    } catch (error) {
      logError(handleNetworkError(error));
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Handle 401 errors - attempt token refresh or clear auth
 */
async function handle401Error(config: RequestConfig): Promise<boolean> {
  // If retry is disabled, don't attempt refresh
  if (config.retryOn401 === false) {
    return false;
  }

  // Try to refresh token
  const newToken = await refreshToken();
  if (newToken) {
    return true; // Token refreshed, retry request
  }

  // Token refresh failed, clear auth and redirect to login
  authStorage.setToken(null);
  if (typeof window !== 'undefined') {
    // Only redirect if we're in the browser
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
      window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
    }
  }

  return false;
}

/**
 * Execute request with interceptors and error handling
 */
async function executeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
  // Apply request interceptors
  let finalConfig = { ...config };
  for (const interceptor of requestInterceptors) {
    finalConfig = await interceptor(finalConfig);
  }

  // Build URL and headers
  const url = buildUrl(finalConfig.path, finalConfig.params);
  const headers = buildHeaders(finalConfig);

  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${finalConfig.method || 'GET'} ${url}`, {
      headers: Object.fromEntries(headers.entries()),
      body: finalConfig.body,
    });
  }

  // Make request
  let response: Response;
  try {
    response = await fetch(url, {
      ...finalConfig,
      headers,
    });
  } catch (error) {
    const networkError = handleNetworkError(error);
    if (!finalConfig.skipErrorLogging) {
      logError(networkError);
    }
    throw networkError;
  }

  // Apply response interceptors
  for (const interceptor of responseInterceptors) {
    response = await interceptor(response);
  }

  // Handle 401 Unauthorized - attempt token refresh
  if (response.status === 401 && finalConfig.retryOn401 !== false) {
    const retried = await handle401Error(finalConfig);
    if (retried) {
      // Retry request with new token
      const retryHeaders = buildHeaders({ ...finalConfig, includeAuth: true });
      response = await fetch(url, {
        ...finalConfig,
        headers: retryHeaders,
      });
    }
  }

  // Handle errors
  if (!response.ok) {
    const error = await handleApiError(response);
    
    // Apply error interceptors
    let finalError = error;
    for (const interceptor of errorInterceptors) {
      finalError = await interceptor(finalError);
    }

    if (!finalConfig.skipErrorLogging) {
      logError(finalError);
    }
    
    throw finalError;
  }

  // Parse response
  let data: T;
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    data = {} as T;
  } else {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text as unknown as T;
    }
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
}

/**
 * Unified API Client
 */
export const api = {
  /**
   * GET request
   */
  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
    config?: Omit<RequestConfig, 'path' | 'params' | 'method'>
  ): Promise<T> {
    const response = await executeRequest<T>({
      ...config,
      path,
      params,
      method: 'GET',
      cache: 'no-store',
    });
    return response.data;
  },

  /**
   * POST request
   */
  async post<T>(
    path: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'path' | 'body' | 'method'>
  ): Promise<T> {
    const response = await executeRequest<T>({
      ...config,
      path,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      method: 'POST',
    });
    return response.data;
  },

  /**
   * PATCH request
   */
  async patch<T>(
    path: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'path' | 'body' | 'method'>
  ): Promise<T> {
    const response = await executeRequest<T>({
      ...config,
      path,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      method: 'PATCH',
    });
    return response.data;
  },

  /**
   * PUT request
   */
  async put<T>(
    path: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'path' | 'body' | 'method'>
  ): Promise<T> {
    const response = await executeRequest<T>({
      ...config,
      path,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      method: 'PUT',
    });
    return response.data;
  },

  /**
   * DELETE request
   */
  async delete<T>(
    path: string,
    config?: Omit<RequestConfig, 'path' | 'method'>
  ): Promise<T> {
    const response = await executeRequest<T>({
      ...config,
      path,
      method: 'DELETE',
    });
    return response.data;
  },

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T>(
    path: string,
    formData: FormData,
    config?: Omit<RequestConfig, 'path' | 'body' | 'method'>
  ): Promise<T> {
    const headers = new Headers();
    
    // Add auth token if needed
    if (config?.includeAuth !== false) {
      const token = authStorage.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const response = await executeRequest<T>({
      ...config,
      path,
      body: formData,
      method: 'POST',
      headers,
    });
    return response.data;
  },

  /**
   * Get full response (with status, headers)
   */
  async getResponse<T>(
    path: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return executeRequest<T>({
      ...config,
      path,
      method: config?.method || 'GET',
    });
  },
};

/**
 * Public API client (no authentication)
 */
export const publicApi = {
  get: <T>(path: string, params?: Record<string, string | number | boolean>) =>
    api.get<T>(path, params, { includeAuth: false }),
  
  post: <T>(path: string, body?: unknown) =>
    api.post<T>(path, body, { includeAuth: false }),
};

/**
 * Admin API client (requires admin role - validated on backend)
 */
export const adminApi = {
  get: <T>(path: string, params?: Record<string, string | number | boolean>) =>
    api.get<T>(`/api/admin${path}`, params),
  
  post: <T>(path: string, body?: unknown) =>
    api.post<T>(`/api/admin${path}`, body),
  
  patch: <T>(path: string, body?: unknown) =>
    api.patch<T>(`/api/admin${path}`, body),
  
  put: <T>(path: string, body?: unknown) =>
    api.put<T>(`/api/admin${path}`, body),
  
  delete: <T>(path: string) =>
    api.delete<T>(`/api/admin${path}`),
};

// Add development request interceptor for logging
if (process.env.NODE_ENV === 'development') {
  addRequestInterceptor((config) => {
    console.log(`[API Request] ${config.method || 'GET'} ${config.path}`);
    return config;
  });

  addResponseInterceptor((response) => {
    console.log(`[API Response] ${response.status} ${response.statusText}`);
    return response;
  });
}

