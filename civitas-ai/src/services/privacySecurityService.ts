/**
 * Privacy & Security Service
 *
 * Talks to /api/privacy/* and /api/security/* endpoints on the DataLayer backend.
 */

import { API_BASE_URL, API_KEY as CIVITAS_API_KEY } from './apiConfig';

const getAuthHeaders = (): Record<string, string> => {
    const token =
        localStorage.getItem('civitas-token') ||
        sessionStorage.getItem('civitas-token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (CIVITAS_API_KEY) headers['X-API-Key'] = CIVITAS_API_KEY;

    try {
        const userStr = localStorage.getItem('civitas-user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.id) headers['X-User-ID'] = user.id;
        }
    } catch { /* ignore */ }

    return headers;
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PrivacyPreferences {
    chat_history_enabled: boolean;
    analytics_enabled: boolean;
    model_training_opt_out: boolean;
    show_online_status: boolean;
}

export interface SessionInfo {
    id: string;
    device_info: string;
    device_type: 'desktop' | 'mobile' | 'tablet';
    location?: string;
    ip_address?: string;
    is_current: boolean;
    last_active_at?: string;
    created_at?: string;
}

export interface DataExportResult {
    status: string;
    export_id: string;
    data?: Record<string, unknown>;
    message: string;
}

export interface AccountDeletionResult {
    status: string;
    deletion_id?: string;
    scheduled_deletion_at?: string;
    message: string;
}

// ─── Privacy Service ─────────────────────────────────────────────────────────

export const privacyService = {
    /** Get current privacy preferences */
    getPreferences: async (): Promise<PrivacyPreferences> => {
        const res = await fetch(`${API_BASE_URL}/api/privacy/preferences`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch privacy preferences');
        return res.json();
    },

    /** Update one or more privacy preferences */
    updatePreferences: async (prefs: Partial<PrivacyPreferences>): Promise<PrivacyPreferences> => {
        const res = await fetch(`${API_BASE_URL}/api/privacy/preferences`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(prefs),
        });
        if (!res.ok) throw new Error('Failed to update privacy preferences');
        return res.json();
    },

    /** Request a full data export */
    exportData: async (): Promise<DataExportResult> => {
        const res = await fetch(`${API_BASE_URL}/api/privacy/export-data`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to export data');
        return res.json();
    },

    /** Clear all chat history */
    clearChatHistory: async (): Promise<{ success: boolean; threads_deleted: number; message: string }> => {
        const res = await fetch(`${API_BASE_URL}/api/privacy/chat-history`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to clear chat history');
        return res.json();
    },

    /** Delete account. If immediate=true, deletes all data now. Otherwise 30-day grace period. */
    deleteAccount: async (reason?: string, immediate = true): Promise<AccountDeletionResult> => {
        const res = await fetch(`${API_BASE_URL}/api/privacy/account`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            body: JSON.stringify({ reason, immediate }),
        });
        if (!res.ok) throw new Error('Failed to delete account');
        return res.json();
    },

    /** Cancel a pending account deletion */
    cancelDeletion: async (): Promise<{ status: string; message: string }> => {
        const res = await fetch(`${API_BASE_URL}/api/privacy/cancel-deletion`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to cancel account deletion');
        return res.json();
    },
};

// ─── Security Service ────────────────────────────────────────────────────────

export const securityService = {
    /** Send password reset email via Firebase */
    requestPasswordReset: async (): Promise<{ success: boolean; message: string }> => {
        const res = await fetch(`${API_BASE_URL}/api/security/password-reset`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to send password reset email');
        return res.json();
    },

    /** Toggle two-factor authentication */
    updateTwoFactor: async (enabled: boolean): Promise<{ success: boolean; two_factor_enabled: boolean; message: string }> => {
        const res = await fetch(`${API_BASE_URL}/api/security/2fa`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ enabled }),
        });
        if (!res.ok) throw new Error('Failed to update 2FA');
        return res.json();
    },

    /** List active sessions */
    getSessions: async (): Promise<SessionInfo[]> => {
        const res = await fetch(`${API_BASE_URL}/api/security/sessions`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch sessions');
        return res.json();
    },

    /** Register a new session (call on login) */
    registerSession: async (): Promise<{ success: boolean; session_id: string }> => {
        const res = await fetch(`${API_BASE_URL}/api/security/sessions`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to register session');
        return res.json();
    },

    /** Revoke a specific session */
    revokeSession: async (sessionId: string): Promise<{ success: boolean; message: string }> => {
        const res = await fetch(`${API_BASE_URL}/api/security/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to revoke session');
        return res.json();
    },

    /** Revoke all sessions except current */
    revokeAllOtherSessions: async (): Promise<{ success: boolean; sessions_revoked: number; message: string }> => {
        const res = await fetch(`${API_BASE_URL}/api/security/sessions`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to revoke sessions');
        return res.json();
    },
};
