// FILE: src/services/onboardingApi.ts
/**
 * API service for ProphetAtlas onboarding tour
 */

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

export interface OnboardingStep {
  id: string;
  tab: 'chat' | 'reports' | 'settings';
  title: string;
  description: string;
  duration: number; // in seconds
  order: number;
  enabled: boolean;
}

export interface OnboardingTourResponse {
  steps: OnboardingStep[];
  version?: string;
}

export interface OnboardingCompletionRequest {
  completed: boolean;
  steps_completed?: number;
  skipped?: boolean;
  duration_seconds?: number;
}

export interface OnboardingCompletionResponse {
  success: boolean;
  message?: string;
  redirect_to_tab?: 'chat' | 'reports' | 'settings';
}

export interface OnboardingStatusResult {
  completed: boolean;
  backendAvailable: boolean;
}

/**
 * Fetch onboarding tour steps from backend
 */
export const getOnboardingSteps = async (): Promise<OnboardingStep[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/onboarding/steps`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OnboardingTourResponse = await response.json();

    // Filter and sort enabled steps by order
    return (data.steps || [])
      .filter(step => step.enabled !== false)
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Failed to fetch onboarding steps:', error);
    return [];
  }
};

/**
 * Mark onboarding as completed
 */
export const completeOnboarding = async (
  data: OnboardingCompletionRequest
): Promise<OnboardingCompletionResponse> => {
  try {
    const response = await fetch(`${API_BASE}/api/onboarding/complete`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to complete onboarding:', error);

    // Still return success for graceful degradation
    return { success: true };
  }
};

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (userId?: string): Promise<OnboardingStatusResult> => {
  try {
    const url = new URL(`${API_BASE}/api/onboarding/status`);
    if (userId) {
      url.searchParams.append('user_id', userId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      return { completed: true, backendAvailable: false };
    }

    const data = await response.json();
    return {
      completed: data.completed === true,
      backendAvailable: true,
    };
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return { completed: true, backendAvailable: false };
  }
};
