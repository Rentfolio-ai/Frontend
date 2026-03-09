import { jsonHeaders } from './apiConfig';

const API_BASE = import.meta.env.DEV ? '' : 'http://localhost:8001';
const headers = jsonHeaders;

// ── Types ────────────────────────────────────────────────────────────

export type TaskStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled';
export type AgentMode = 'hunter' | 'research' | 'strategist';
export type TaskType = 'market_scan' | 'deal_monitor' | 'email_draft' | 'report' | 'custom';

export interface AutopilotTask {
  id: string;
  user_id: string;
  task_type: TaskType;
  mode: AgentMode;
  description: string;
  parameters: Record<string, any>;
  status: TaskStatus;
  result: Record<string, any> | null;
  error: string | null;
  schedule: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface AutopilotSettings {
  enabled: boolean;
  mode: AgentMode;
  max_concurrent_tasks: number;
  auto_scan_enabled: boolean;
  auto_scan_markets: string[];
  auto_scan_budget_min: number | null;
  auto_scan_budget_max: number | null;
  auto_email_drafts: boolean;
  notifications_enabled: boolean;
}

export interface CreateTaskParams {
  task_type: TaskType;
  mode?: AgentMode;
  description: string;
  parameters?: Record<string, any>;
  schedule?: string | null;
}

// ── Service ──────────────────────────────────────────────────────────

export const autopilotService = {
  // Tasks
  async createTask(userId: string, params: CreateTaskParams): Promise<AutopilotTask> {
    const res = await fetch(`${API_BASE}/api/autopilot/tasks?user_id=${userId}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Failed to create task');
    }
    return res.json();
  },

  async listTasks(userId: string, status?: TaskStatus, limit = 20): Promise<{ tasks: AutopilotTask[]; total: number }> {
    const params = new URLSearchParams({ user_id: userId, limit: String(limit) });
    if (status) params.set('status', status);
    const res = await fetch(`${API_BASE}/api/autopilot/tasks?${params}`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to list tasks');
    return res.json();
  },

  async getTask(userId: string, taskId: string): Promise<AutopilotTask> {
    const res = await fetch(`${API_BASE}/api/autopilot/tasks/${taskId}?user_id=${userId}`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to get task');
    return res.json();
  },

  async cancelTask(userId: string, taskId: string): Promise<AutopilotTask> {
    const res = await fetch(`${API_BASE}/api/autopilot/tasks/${taskId}/cancel?user_id=${userId}`, {
      method: 'POST',
      headers: headers(),
    });
    if (!res.ok) throw new Error('Failed to cancel task');
    return res.json();
  },

  // Settings
  async getSettings(userId: string): Promise<AutopilotSettings> {
    const res = await fetch(`${API_BASE}/api/autopilot/settings?user_id=${userId}`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to get settings');
    return res.json();
  },

  async createPlan(userId: string, goal: string, mode: string = 'hunter', context: Record<string, any> = {}): Promise<{ goal: string; mode: string; steps: any[]; learnings_applied: number }> {
    const res = await fetch(`${API_BASE}/api/autopilot/plan?user_id=${userId}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ goal, mode, context }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Failed to create plan');
    }
    return res.json();
  },

  async getNextAction(
    userId: string,
    goal: string,
    stepNumber: number,
    appState: Record<string, any>,
    actionHistory: Record<string, any>[],
    userPreferences: Record<string, any> = {},
  ): Promise<{
    action: string;
    params: Record<string, any>;
    reason: string;
    target_element_id: string | null;
    confidence: number;
    done: boolean;
    estimated_remaining: number;
  }> {
    const res = await fetch(`${API_BASE}/api/autopilot/next-action?user_id=${userId}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        goal,
        step_number: stepNumber,
        app_state: appState,
        action_history: actionHistory,
        user_preferences: userPreferences,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Failed to get next action');
    }
    return res.json();
  },

  async recordLearning(
    userId: string,
    category: string,
    lesson: string,
    outcome: string = 'success',
    context: Record<string, any> = {},
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/api/autopilot/learnings?user_id=${userId}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ category, lesson, outcome, context }),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async updateSettings(userId: string, settings: Partial<AutopilotSettings>): Promise<AutopilotSettings> {
    const current = await autopilotService.getSettings(userId);
    const merged = { ...current, ...settings };
    const res = await fetch(`${API_BASE}/api/autopilot/settings?user_id=${userId}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(merged),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },
};
