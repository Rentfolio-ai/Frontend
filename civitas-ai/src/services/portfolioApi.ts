/**
 * Portfolio Dashboard API
 * Fetches aggregated dashboard data from the DataLayer backend.
 */

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http'))
    ? envApiUrl
    : (import.meta.env.DEV ? '' : 'http://localhost:8001');
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

const jsonHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
};

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GrowthPoint {
    month: string;
    value: number;
}

export interface ActivityItem {
    type: 'bookmark' | 'report' | 'deal';
    description: string;
    timestamp: string;
}

export interface DashboardProperty {
    address: string;
    strategy: string;
    monthly_income: number;
    price: number;
    deal_status: string;
    image_url?: string | null;
}

export interface DealPipeline {
    active: number;
    under_contract: number;
    closed: number;
    lost: number;
}

export interface DashboardData {
    total_value: number;
    monthly_cashflow: number;
    blended_cap_rate: number;
    health_grade: string;
    active_deals: number;
    deal_pipeline: DealPipeline;
    properties: DashboardProperty[];
    property_count: number;
    reports_count: number;
    income_total: number;
    expenses_total: number;
    growth_history: GrowthPoint[];
    recent_activity: ActivityItem[];
}

// ── API ────────────────────────────────────────────────────────────────────────

export async function fetchDashboard(userId: string): Promise<DashboardData> {
    const response = await fetch(
        `${API_BASE}/api/portfolios/dashboard?user_id=${encodeURIComponent(userId)}`,
        { method: 'GET', headers: jsonHeaders },
    );

    if (!response.ok) {
        throw new Error(`Dashboard fetch failed (${response.status})`);
    }

    return response.json();
}
