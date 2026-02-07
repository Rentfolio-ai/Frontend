/**
 * Support Ticket API Service
 *
 * Talks to /api/support/* endpoints on the DataLayer backend.
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TicketCategory = 'bug' | 'feature' | 'general' | 'billing';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SupportTicket {
    id: string;
    user_id: string;
    category: TicketCategory;
    subject: string;
    description: string;
    priority: TicketPriority;
    status: string;
    created_at: string;
    updated_at?: string;
}

export interface CreateTicketRequest {
    category: TicketCategory;
    subject: string;
    description: string;
    priority: TicketPriority;
    page_url?: string;
    browser_info?: string;
    metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const supportApi = {
    createTicket: async (data: CreateTicketRequest): Promise<SupportTicket> => {
        const response = await fetch(`${API_BASE_URL}/api/support/tickets`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                ...data,
                browser_info: navigator.userAgent,
                page_url: window.location.href,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(err.detail || 'Failed to submit ticket');
        }

        return response.json();
    },

    listTickets: async (status?: string): Promise<{ tickets: SupportTicket[]; total: number }> => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);

        const response = await fetch(
            `${API_BASE_URL}/api/support/tickets?${params.toString()}`,
            { headers: getAuthHeaders() },
        );

        if (!response.ok) throw new Error('Failed to fetch tickets');
        return response.json();
    },
};
