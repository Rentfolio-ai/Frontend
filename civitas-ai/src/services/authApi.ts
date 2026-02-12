// FILE: src/services/authApi.ts
/**
 * API client for Authentication endpoints
 */

// IMPORTANT: Always use environment variables for API URL
const API_BASE = import.meta.env.VITE_CIVITAS_API_URL || import.meta.env.VITE_API_URL;
if (!API_BASE) {
  console.error('API URL must be configured via environment variable (VITE_CIVITAS_API_URL or VITE_API_URL)');
  if (import.meta.env.DEV) {
    console.warn('Using localhost fallback for development');
  }
}

const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

// ============================================================================
// Types
// ============================================================================

export interface SignInRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface SignUpRequest {
  id_token: string;
  email?: string;
  name?: string;
}

export interface VerifyTokenRequest {
  id_token: string;
  email?: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  user: {
    user_id: string;
    email: string;
    full_name?: string;
    name?: string;
    created_at: string;
    last_login?: string;
    onboarding_completed?: boolean;
    subscription_tier?: string;
  };
  firebase_uid: string;
  token?: string;
  thread_id?: string;
  expires_at?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export interface GetCurrentUserResponse {
  user_id: string;
  email: string;
  name?: string;
  created_at: string;
  last_login?: string;
}

export interface SignOutResponse {
  message: string;
  success: boolean;
}

// ============================================================================
// Auth API Class
// ============================================================================

class AuthAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    // Ensure baseURL doesn't end with /api to avoid double prefixing
    this.baseURL = baseURL.replace(/\/api\/?$/, '');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('[AuthAPI] Making request to:', url);
    const headers: any = {
      ...defaultHeaders,
      ...options.headers,
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Unknown error',
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('civitas-token') || sessionStorage.getItem('civitas-token');
  }

  private setToken(token: string, rememberMe: boolean = false): void {
    if (typeof window === 'undefined') return;
    if (rememberMe) {
      localStorage.setItem('civitas-token', token);
    } else {
      sessionStorage.setItem('civitas-token', token);
    }
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('civitas-token');
    sessionStorage.removeItem('civitas-token');
  }

  /**
   * Sign in — verify Firebase ID token with backend
   */
  async signIn(data: SignInRequest & { id_token?: string }): Promise<AuthResponse> {
    // If we have a Firebase ID token, use verify-token
    if (data.id_token) {
      return this.verifyToken({
        id_token: data.id_token,
        email: data.email,
      });
    }
    // Fallback: try direct signin (dev mode compat)
    const response = await this.request<AuthResponse>('/api/auth/verify-token', {
      method: 'POST',
      body: JSON.stringify({
        id_token: 'dev-token',
        email: data.email,
      }),
    });

    if (response.token) {
      this.setToken(response.token, data.remember_me || false);
    }

    return response;
  }

  /**
   * Sign up — verify Firebase ID token with backend (creates user if new)
   */
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    return this.verifyToken(data);
  }

  /**
   * Verify a Firebase ID token with the backend.
   * This creates/updates the user in the database and returns user info.
   */
  async verifyToken(data: VerifyTokenRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/verify-token', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store token if provided
    if (response.token) {
      this.setToken(response.token, false);
    }

    return response;
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<void> {
    // Redirect to Google OAuth endpoint
    const url = `${this.baseURL}/api/auth/google`;
    window.location.href = url;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<GetCurrentUserResponse> {
    return this.request<GetCurrentUserResponse>('/api/auth/me');
  }

  /**
   * Sign out
   */
  async signOut(): Promise<SignOutResponse> {
    try {
      const response = await this.request<SignOutResponse>('/api/auth/logout', {
        method: 'POST',
      });
      this.removeToken();
      return response;
    } catch (error) {
      // Even if API call fails, remove token locally
      this.removeToken();
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.request<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.request<ResetPasswordResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

const apiBaseUrl = API_BASE || (import.meta.env.DEV ? 'http://localhost:8001' : '');

if (!apiBaseUrl && !import.meta.env.DEV) {
  console.error('CRITICAL: API URL missing (VITE_CIVITAS_API_URL). Auth services will fail.');
}

export const authAPI = new AuthAPI(apiBaseUrl || '');
