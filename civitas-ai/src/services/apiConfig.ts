/**
 * Shared API configuration
 *
 * Single source of truth for backend URL and default headers.
 * All service files should import from here instead of reading env vars directly.
 */

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;

/** Base URL for the DataLayer backend */
export const API_BASE_URL: string =
    envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')
        ? envApiUrl
        : 'http://localhost:8001';

/** API key for authenticating with the backend */
export const API_KEY: string = import.meta.env.VITE_API_KEY ?? '';

/** Standard JSON headers with API key */
export const jsonHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
});

/** Convenience: JSON headers plus Bearer token */
export const authHeaders = (token?: string): HeadersInit => ({
    ...jsonHeaders(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
