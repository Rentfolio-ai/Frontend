// FILE: src/services/newsService.ts
/**
 * News Service - API client for real estate news feed
 */

const API_BASE = import.meta.env.VITE_DATALAYER_API_URL || 'http://localhost:8001';
const API_KEY = import.meta.env.VITE_API_KEY;

export interface NewsArticle {
  id: string;
  title: string;
  snippet: string;
  url: string;
  source: string;
  category: string;
  published_at: string;
  image_url?: string;
  relevance_score: number;
  tags: string[];
  priority: number;
}

export interface NewsFeedResponse {
  articles: NewsArticle[];
  total: number;
  cached: boolean;
  cached_at?: string;
  fetched_at?: string;
  view: 'list';
}

export interface NewsSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  articles: NewsArticle[];
}

export interface OrganizedNewsFeedResponse {
  featured: NewsArticle | null;
  sections: NewsSection[];
  total: number;
  cached: boolean;
  cached_at?: string;
  fetched_at?: string;
  view: 'organized';
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

/**
 * Fetch personalized news feed (flat list)
 */
export async function fetchNewsFeed(
  userId?: string,
  category?: string,
  limit: number = 20,
  forceRefresh: boolean = false
): Promise<NewsFeedResponse> {
  const params = new URLSearchParams();
  
  if (userId) params.append('user_id', userId);
  if (category) params.append('category', category);
  params.append('limit', limit.toString());
  if (forceRefresh) params.append('force_refresh', 'true');
  params.append('organize', 'false');

  const response = await fetch(`${API_BASE}/api/news/feed?${params}`, {
    headers: {
      'X-Api-Key': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch organized news feed (Google-style sections)
 */
export async function fetchOrganizedNewsFeed(
  userId?: string,
  category?: string,
  forceRefresh: boolean = false
): Promise<OrganizedNewsFeedResponse> {
  const params = new URLSearchParams();
  
  if (userId) params.append('user_id', userId);
  if (category) params.append('category', category);
  if (forceRefresh) params.append('force_refresh', 'true');
  params.append('organize', 'true');

  const response = await fetch(`${API_BASE}/api/news/feed?${params}`, {
    headers: {
      'X-Api-Key': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get available news categories
 */
export async function fetchNewsCategories(): Promise<{ categories: NewsCategory[] }> {
  const response = await fetch(`${API_BASE}/api/news/categories`, {
    headers: {
      'X-Api-Key': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Force refresh news feed
 */
export async function refreshNewsFeed(
  userId?: string,
  category?: string,
  limit: number = 20
): Promise<NewsFeedResponse> {
  const response = await fetch(`${API_BASE}/api/news/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      user_id: userId,
      category,
      limit,
      force_refresh: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh news: ${response.statusText}`);
  }

  return response.json();
}
