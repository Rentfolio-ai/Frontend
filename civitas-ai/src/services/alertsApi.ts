// FILE: src/services/alertsApi.ts
/**
 * API client for Alerts endpoints
 */

export interface Alert {
  alert_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  summary: string;
  is_read: boolean;
  created_at: string;
  property_address?: string;
  market?: string;
  impacts?: any;
  recommendations?: any;
}

export interface AlertsResponse {
  alerts: Alert[];
  unread_count: number;
  total_count: number;
}

// Environment-aware API base URL
const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
let baseUrl = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) 
  ? envApiUrl 
  : 'http://localhost:8001';

if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1);
}
if (baseUrl.endsWith('/api')) {
  baseUrl = baseUrl.slice(0, -4);
}

const API_BASE = baseUrl;
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

class AlertsAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get alerts for a user
   */
  async getAlerts(
    userId: string,
    unreadOnly: boolean = false,
    limit: number = 50
  ): Promise<AlertsResponse> {
    const params = new URLSearchParams({
      user_id: userId,
      unread_only: unreadOnly.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${this.baseURL}/api/alerts?${params}`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch alerts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get count of unread alerts
   */
  async getUnreadCount(userId: string): Promise<number> {
    const params = new URLSearchParams({
      user_id: userId,
    });

    const response = await fetch(`${this.baseURL}/api/alerts/unread-count?${params}`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.statusText}`);
    }

    const data = await response.json();
    return data.unread_count;
  }

  /**
   * Generate new alerts for a user
   */
  async generateAlerts(userId: string, force: boolean = false): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/alerts/generate`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        user_id: userId,
        force,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate alerts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Mark alerts as read
   */
  async markAlertsRead(userId: string, alertIds: string[]): Promise<any> {
    const params = new URLSearchParams({
      user_id: userId,
    });

    const response = await fetch(`${this.baseURL}/api/alerts/mark-read?${params}`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        alert_ids: alertIds,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark alerts as read: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get details for a specific alert
   */
  async getAlertDetails(userId: string, alertId: string): Promise<Alert> {
    const params = new URLSearchParams({
      user_id: userId,
    });

    const response = await fetch(`${this.baseURL}/api/alerts/${alertId}?${params}`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch alert details: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(userId: string, alertId: string): Promise<any> {
    const params = new URLSearchParams({
      user_id: userId,
    });

    const response = await fetch(`${this.baseURL}/api/alerts/${alertId}?${params}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to dismiss alert: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate sample alerts for testing
   */
  async generateSampleAlerts(userId: string): Promise<any> {
    const params = new URLSearchParams({
      user_id: userId,
    });

    const response = await fetch(`${this.baseURL}/api/alerts/test/generate-sample?${params}`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to generate sample alerts: ${response.statusText}`);
    }

    return response.json();
  }
}

export const alertsApi = new AlertsAPI(API_BASE);

