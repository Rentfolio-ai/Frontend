/**
 * Marketplace API service
 *
 * Calls /v2/marketplace endpoints through the Civitas gateway.
 * Falls back to local mock data when the backend is unreachable.
 */

import { API_BASE_URL, jsonHeaders } from './apiConfig';
import type { ProfessionalCategory } from '../components/marketplace/marketplaceData';

export interface ProfessionalDTO {
  id: string;
  name: string;
  category: ProfessionalCategory;
  description: string | null;
  specialties: string[];
  rating: number;
  review_count: number;
  featured: boolean;
  image_url: string | null;
  accent_color: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website_url: string | null;
  service_areas: string[];
  created_at: string | null;
}

export interface ProfessionalListDTO {
  professionals: ProfessionalDTO[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FetchProfessionalsParams {
  category?: ProfessionalCategory;
  location?: string;
  featured_only?: boolean;
  min_rating?: number;
  sort_by?: 'rating_desc' | 'review_count_desc' | 'name_asc';
  page?: number;
  page_size?: number;
}

const BASE = `${API_BASE_URL}/v2/marketplace`;

export async function fetchProfessionals(
  params: FetchProfessionalsParams = {},
): Promise<ProfessionalListDTO> {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.location) qs.set('location', params.location);
  if (params.featured_only) qs.set('featured_only', 'true');
  if (params.min_rating !== undefined) qs.set('min_rating', String(params.min_rating));
  if (params.sort_by) qs.set('sort_by', params.sort_by);
  if (params.page) qs.set('page', String(params.page));
  if (params.page_size) qs.set('page_size', String(params.page_size));

  const url = `${BASE}/professionals${qs.toString() ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: jsonHeaders() });

  if (!res.ok) {
    throw new Error(`fetchProfessionals failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchProfessional(id: string): Promise<ProfessionalDTO> {
  const res = await fetch(`${BASE}/professionals/${id}`, {
    headers: jsonHeaders(),
  });

  if (!res.ok) {
    throw new Error(`fetchProfessional failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function connectProfessional(
  id: string,
  method: 'chat' | 'voice',
): Promise<void> {
  const res = await fetch(`${BASE}/professionals/${id}/connect`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ method }),
  });

  if (!res.ok) {
    throw new Error(`connectProfessional failed: ${res.status} ${res.statusText}`);
  }
}
