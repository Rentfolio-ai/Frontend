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

export interface ActivityItem {
  type: 'bookmark' | 'report' | 'communication' | string;
  title: string;
  timestamp: string | null;
  metadata: Record<string, unknown>;
}

export interface ActivityFeedResponse {
  items: ActivityItem[];
  total: number;
}

export const activityService = {
  async getFeed(userId: string, limit = 20, offset = 0): Promise<ActivityFeedResponse> {
    const params = new URLSearchParams({
      user_id: userId,
      limit: String(limit),
      offset: String(offset),
    });
    const res = await fetch(`${API_BASE}/api/activity/feed?${params}`, { headers: headers() });
    if (!res.ok) {
      console.error('[activityApi] Failed to fetch feed', res.status);
      return { items: [], total: 0 };
    }
    return res.json();
  },
};
