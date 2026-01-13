// FILE: src/services/faqApi.ts
/**
 * API service for FAQ
 */

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
let baseUrl = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
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

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    tags: string[];
    helpful_count?: number;
    not_helpful_count?: number;
}

export interface FAQCategory {
    name: string;
    icon: string;
    description: string;
}

export interface FAQsResponse {
    faqs: Record<string, FAQ[]>;
    categories: Record<string, FAQCategory>;
    total: number;
}

/**
 * Get FAQs with optional filtering
 */
export const getFAQs = async (
    category?: string,
    search?: string,
    limit: number = 20
): Promise<FAQsResponse> => {
    try {
        const url = new URL(`${API_BASE}/api/faq`);
        if (category) url.searchParams.append('category', category);
        if (search) url.searchParams.append('search', search);
        url.searchParams.append('limit', limit.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch FAQs:', error);
        return { faqs: {}, categories: {}, total: 0 };
    }
};

/**
 * Get FAQ categories
 */
export const getFAQCategories = async (): Promise<Record<string, FAQCategory>> => {
    try {
        const response = await fetch(`${API_BASE}/api/faq/categories`, {
            method: 'GET',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.categories;
    } catch (error) {
        console.error('Failed to fetch FAQ categories:', error);
        return {};
    }
};

/**
 * Mark FAQ as helpful or not
 */
export const markFAQHelpful = async (faqId: string, helpful: boolean): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/api/faq/${faqId}/helpful?helpful=${helpful}`, {
            method: 'POST',
            headers: defaultHeaders,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Failed to mark FAQ as helpful:', error);
        return false;
    }
};
