/**
 * Notion Integration Service - OAuth Flow
 * Simple "Connect to Notion" button for users
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export interface NotionStatus {
  connected: boolean;
  workspace_name?: string;
  connected_at?: string;
}

export interface NotionDatabaseInfo {
  database_id: string;
  url: string;
  message: string;
}

export interface NotionSyncResult {
  synced_count: number;
  failed_count: number;
  total_events: number;
  message: string;
}

export interface NotionEvent {
  notion_id: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
  event_type: string;
  description: string;
  is_recurring: boolean;
  last_edited: string;
}

/**
 * Connect to Notion (OAuth)
 * Opens OAuth popup/redirect for user to authorize
 */
export function connectToNotion(userId: string) {
  // Redirect to OAuth endpoint
  // Backend will redirect to Notion authorization page
  window.location.href = `${API_BASE}/api/notion/oauth/connect?user_id=${userId}`;
}

/**
 * Disconnect from Notion
 */
export async function disconnectFromNotion(userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/notion/disconnect?user_id=${userId}`,
    {
      method: 'POST',
      headers: {
        'X-Api-Key': localStorage.getItem('api_key') || '',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to disconnect');
  }
}

/**
 * Check if user has connected Notion
 */
export async function getNotionStatus(userId: string): Promise<NotionStatus> {
  const response = await fetch(
    `${API_BASE}/api/notion/status?user_id=${userId}`,
    {
      headers: {
        'X-Api-Key': localStorage.getItem('api_key') || '',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to check status');
  }

  return response.json();
}

/**
 * Create a calendar database in user's Notion workspace
 * User must be connected first
 */
export async function createCalendarDatabase(
  userId: string
): Promise<NotionDatabaseInfo> {
  const response = await fetch(
    `${API_BASE}/api/notion/create-calendar-database?user_id=${userId}`,
    {
      method: 'POST',
      headers: {
        'X-Api-Key': localStorage.getItem('api_key') || '',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create database');
  }

  return response.json();
}

/**
 * Sync a single event to Notion
 */
export async function syncEventToNotion(
  userId: string,
  databaseId: string,
  eventId: string
): Promise<{ notion_page_id: string; url: string; message: string }> {
  const response = await fetch(
    `${API_BASE}/api/notion/sync-event?user_id=${userId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': localStorage.getItem('api_key') || '',
      },
      body: JSON.stringify({
        database_id: databaseId,
        event_id: eventId,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to sync event');
  }

  return response.json();
}

/**
 * Sync all events to Notion
 */
export async function syncAllEventsToNotion(
  userId: string,
  databaseId: string
): Promise<NotionSyncResult> {
  const response = await fetch(
    `${API_BASE}/api/notion/sync-all-events?user_id=${userId}&database_id=${databaseId}`,
    {
      method: 'POST',
      headers: {
        'X-Api-Key': localStorage.getItem('api_key') || '',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to sync events');
  }

  return response.json();
}

/**
 * Get events from user's Notion
 */
export async function getNotionEvents(
  userId: string,
  databaseId: string,
  filterStatus?: string
): Promise<{ events: NotionEvent[]; count: number }> {
  const params = new URLSearchParams({
    user_id: userId,
    database_id: databaseId,
  });
  if (filterStatus) {
    params.append('filter_status', filterStatus);
  }

  const response = await fetch(
    `${API_BASE}/api/notion/get-notion-events?${params}`,
    {
      headers: {
        'X-Api-Key': localStorage.getItem('api_key') || '',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get events');
  }

  return response.json();
}
