/**
 * API Utility Functions
 * Provides reusable HTTP methods for making API calls
 */

import { handleApiError, handleNetworkError, logError } from './errorHandler';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''; // For direct API calls, otherwise uses Next.js API routes

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Build headers with optional authentication
 */
function buildHeaders(includeAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Build URL with query parameters
 */
function buildUrl(path: string, params?: Record<string, string>): string {
  const url = `${API_BASE}${path}`;
  if (!params || Object.keys(params).length === 0) return url;

  const searchParams = new URLSearchParams(params);
  return `${url}?${searchParams.toString()}`;
}

/**
 * Handle API response with centralized error handling
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await handleApiError(response);
    logError(error);
    throw error;
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/**
 * GET request
 */
export async function get<T>(
  path: string,
  params?: Record<string, string>,
  includeAuth: boolean = true
): Promise<T> {
  try {
    const url = buildUrl(path, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(includeAuth),
      cache: 'no-store',
    });

    return handleResponse<T>(response);
  } catch (error) {
    const appError = handleNetworkError(error);
    logError(appError);
    throw appError;
  }
}

/**
 * POST request
 */
export async function post<T>(
  path: string,
  body?: unknown,
  includeAuth: boolean = true
): Promise<T> {
  try {
    const url = `${API_BASE}${path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(includeAuth),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  } catch (error) {
    const appError = handleNetworkError(error);
    logError(appError);
    throw appError;
  }
}

/**
 * PATCH request
 */
export async function patch<T>(
  path: string,
  body?: unknown,
  includeAuth: boolean = true
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: buildHeaders(includeAuth),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * PUT request
 */
export async function put<T>(
  path: string,
  body?: unknown,
  includeAuth: boolean = true
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: buildHeaders(includeAuth),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * DELETE request
 */
export async function del<T>(
  path: string,
  includeAuth: boolean = true
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: buildHeaders(includeAuth),
  });

  return handleResponse<T>(response);
}

/**
 * Upload file with multipart/form-data
 */
export async function upload<T>(
  path: string,
  formData: FormData,
  includeAuth: boolean = true
): Promise<T> {
  const headers: HeadersInit = {};

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  return handleResponse<T>(response);
}

