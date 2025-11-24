import { apiLogger } from '@/utils/logger';

export interface AnalyzeFileResponse {
  analysis: string;
  highlights?: string[];
  metadata?: Record<string, unknown>;
}

const API_BASE = import.meta.env.VITE_CIVITAS_API_URL || 'http://localhost:8000';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

export const analyzeFile = async (
  file: File,
  prompt: string,
  temperature: number = 0.35
): Promise<AnalyzeFileResponse> => {
  const endpoint = `${API_BASE}/analyze/file`;
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
