import { apiLogger } from '@/utils/logger';

export interface AnalyzeFileResponse {
  analysis: string;
  highlights?: string[];
  metadata?: Record<string, unknown>;
  thread_id?: string;
  file_name?: string;
}

export interface AskFileResponse {
  analysis: string;
  thread_id: string;
  file_name?: string;
  metadata?: Record<string, unknown>;
}

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

export const analyzeFile = async (
  file: File,
  prompt: string,
  temperature: number = 0.35
): Promise<AnalyzeFileResponse> => {
  const endpoint = `${API_BASE}/api/analyze/file`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('prompt', prompt || 'Analyze this file');
  formData.append('temperature', temperature.toString());

  const headers: HeadersInit = {
    ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
  };

  const startedAt = performance.now();
  apiLogger.request({ method: 'POST', url: endpoint, service: 'file-analysis', payloadPreview: `${file.name} (${file.type})` });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
  });

  const durationMs = performance.now() - startedAt;

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'File analysis failed');
    apiLogger.error({ method: 'POST', url: endpoint, service: 'file-analysis', status: response.status, durationMs, error: errorText });
    throw new Error(errorText || `File analysis failed (${response.status})`);
  }

  const data = (await response.json()) as AnalyzeFileResponse;
  apiLogger.response({ method: 'POST', url: endpoint, service: 'file-analysis', status: response.status, durationMs });
  return data;
};

export const askAboutFile = async (
  prompt: string,
  threadId: string,
  temperature: number = 0.35
): Promise<AskFileResponse> => {
  const endpoint = `${API_BASE}/api/ask`;
  const formData = new FormData();
  formData.append('prompt', prompt);
  formData.append('thread_id', threadId);
  formData.append('temperature', temperature.toString());

  const headers: HeadersInit = {
    ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
  };

  const startedAt = performance.now();
  apiLogger.request({ method: 'POST', url: endpoint, service: 'file-followup', payloadPreview: prompt.slice(0, 120) });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
  });

  const durationMs = performance.now() - startedAt;

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'File follow-up failed');
    apiLogger.error({ method: 'POST', url: endpoint, service: 'file-followup', status: response.status, durationMs, error: errorText });
    throw new Error(errorText || `File follow-up failed (${response.status})`);
  }

  const data = (await response.json()) as AskFileResponse;
  apiLogger.response({ method: 'POST', url: endpoint, service: 'file-followup', status: response.status, durationMs });
  return data;
};
