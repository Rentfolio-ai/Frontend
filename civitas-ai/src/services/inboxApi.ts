const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http'))
  ? envApiUrl
  : (import.meta.env.DEV ? '' : 'http://localhost:8001');
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
  };
}

// ── Types ────────────────────────────────────────────────────────────

export interface InboxSummary {
  total_unread: number;
  channels: { email: number; sms: number; whatsapp: number };
  conversations: InboxConversationPreview[];
}

export interface InboxConversationPreview {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'whatsapp';
  unread: number;
  last_message_at: string | null;
}

export interface Conversation {
  id: string;
  professional_id: string | null;
  professional_name: string | null;
  channel: 'email' | 'sms' | 'whatsapp';
  unread_count: number;
  last_message_at: string | null;
  created_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// ── Service ──────────────────────────────────────────────────────────

export const inboxService = {
  async getSummary(token: string): Promise<InboxSummary> {
    const res = await fetch(`${API_BASE}/v2/communications/inbox/summary`, {
      headers: { ...headers(), Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to get inbox summary');
    return res.json();
  },

  async listConversations(token: string, page = 1, pageSize = 50): Promise<{ conversations: Conversation[]; page: number }> {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    const res = await fetch(`${API_BASE}/v2/communications/conversations?${params}`, {
      headers: { ...headers(), Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to list conversations');
    return res.json();
  },

  async getMessages(token: string, conversationId: string, page = 1): Promise<{ messages: ConversationMessage[] }> {
    const params = new URLSearchParams({ page: String(page) });
    const res = await fetch(`${API_BASE}/v2/communications/conversations/${conversationId}/messages?${params}`, {
      headers: { ...headers(), Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to get messages');
    return res.json();
  },

  async markRead(token: string, conversationId: string): Promise<void> {
    await fetch(`${API_BASE}/v2/communications/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: { ...headers(), Authorization: `Bearer ${token}` },
    });
  },

  async sendEmail(token: string, professionalId: string, toEmail: string, subject: string, body: string): Promise<any> {
    const res = await fetch(`${API_BASE}/v2/communications/email`, {
      method: 'POST',
      headers: { ...headers(), Authorization: `Bearer ${token}` },
      body: JSON.stringify({ professional_id: professionalId, to_email: toEmail, subject, body }),
    });
    if (!res.ok) throw new Error('Failed to send email');
    return res.json();
  },

  async sendText(token: string, professionalId: string, toPhone: string, body: string, channel: 'sms' | 'whatsapp' = 'sms'): Promise<any> {
    const res = await fetch(`${API_BASE}/v2/communications/text`, {
      method: 'POST',
      headers: { ...headers(), Authorization: `Bearer ${token}` },
      body: JSON.stringify({ professional_id: professionalId, to_phone: toPhone, body, channel }),
    });
    if (!res.ok) throw new Error('Failed to send text');
    return res.json();
  },

  createSSEStream(): EventSource {
    const url = `${API_BASE}/v2/communications/inbound/stream`;
    return new EventSource(url, { withCredentials: true } as any);
  },
};
