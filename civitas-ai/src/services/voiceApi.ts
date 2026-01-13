import { apiLogger } from '@/utils/logger';

const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

export const getBackendUrl = () => {
  const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
  let baseUrl =
    envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')
      ? envApiUrl
      : 'http://localhost:8001';
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
  if (baseUrl.endsWith('/api')) baseUrl = baseUrl.slice(0, -4);
  return baseUrl;
};

export interface TranscribePayload {
  language: string;
  voice?: string;
  audio_b64?: string;
}

export interface TranscribeResult {
  transcript: string;
  language: string;
  detected_language: string;
  confidence: number;
  mock?: boolean;
}

export const transcribeVoice = async (payload: TranscribePayload): Promise<TranscribeResult> => {
  const BACKEND_URL = getBackendUrl();
  const url = `${BACKEND_URL}/api/voice/transcribe`;
  const startedAt = performance.now();

  try {
    apiLogger.request({ method: 'POST', url, service: 'voice', payloadPreview: payload.language });
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const durationMs = performance.now() - startedAt;
      apiLogger.error({ method: 'POST', url, service: 'voice', status: response.status, durationMs, error: `HTTP ${response.status}` });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    apiLogger.response({ method: 'POST', url, service: 'voice', status: 200, durationMs: performance.now() - startedAt });
    return data;
  } catch (error) {
    apiLogger.error({ method: 'POST', url, service: 'voice', error });
    throw error;
  }
};

export interface TranscribeUploadResult {
  transcript: string;
  language: string;
  detected_language: string;
  confidence: number;
  mock?: boolean;
}

export const transcribeUpload = async (
  file: Blob,
  language: string,
  voice?: string
): Promise<TranscribeUploadResult> => {
  const BACKEND_URL = getBackendUrl();
  const url = `${BACKEND_URL}/api/voice/transcribe-upload`;
  const startedAt = performance.now();

  const formData = new FormData();
  formData.append('file', file, 'audio.webm');
  formData.append('language', language);
  if (voice) formData.append('voice', voice);

  try {
    apiLogger.request({ method: 'POST', url, service: 'voice', payloadPreview: `upload:${language}` });
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const durationMs = performance.now() - startedAt;
      apiLogger.error({ method: 'POST', url, service: 'voice', status: response.status, durationMs, error: `HTTP ${response.status}` });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    apiLogger.response({ method: 'POST', url, service: 'voice', status: 200, durationMs: performance.now() - startedAt });
    return data;
  } catch (error) {
    apiLogger.error({ method: 'POST', url, service: 'voice', error });
    throw error;
  }
};

export interface SynthesizePayload {
  text: string;
  language: string;
  voice?: string;
}

export interface SynthesizeResult {
  audio_url: string;
  language: string;
  voice?: string;
  mock?: boolean;
}

export const synthesizeSpeech = async (payload: SynthesizePayload): Promise<SynthesizeResult> => {
  const BACKEND_URL = getBackendUrl();
  const url = `${BACKEND_URL}/api/voice/synthesize`;
  const startedAt = performance.now();

  try {
    apiLogger.request({ method: 'POST', url, service: 'voice', payloadPreview: payload.text.slice(0, 80) });
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const durationMs = performance.now() - startedAt;
      apiLogger.error({ method: 'POST', url, service: 'voice', status: response.status, durationMs, error: `HTTP ${response.status}` });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    apiLogger.response({ method: 'POST', url, service: 'voice', status: 200, durationMs: performance.now() - startedAt });
    return data;
  } catch (error) {
    apiLogger.error({ method: 'POST', url, service: 'voice', error });
    throw error;
  }
};

/**
 * Phase 2: Streaming TTS for lower latency
 * Returns a blob URL that can be played immediately as audio streams in
 */
export const synthesizeSpeechStreaming = async (payload: SynthesizePayload): Promise<string> => {
  const BACKEND_URL = getBackendUrl();
  const params = new URLSearchParams({
    text: payload.text,
    language: payload.language,
    ...(payload.voice ? { voice: payload.voice } : {}),
    ...(CIVITAS_API_KEY ? { api_key: CIVITAS_API_KEY } : {}),
  });
  const url = `${BACKEND_URL}/api/voice/synthesize-stream?${params.toString()}`;
  const startedAt = performance.now();

  try {
    apiLogger.request({ method: 'GET', url, service: 'voice', payloadPreview: `stream:${payload.text.slice(0, 80)}` });
    const response = await fetch(url);

    if (!response.ok) {
      const durationMs = performance.now() - startedAt;
      apiLogger.error({ method: 'GET', url, service: 'voice', status: response.status, durationMs, error: `HTTP ${response.status}` });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Collect streaming audio chunks
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks into a single blob
    const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
    const blobUrl = URL.createObjectURL(audioBlob);

    apiLogger.response({ method: 'GET', url, service: 'voice', status: 200, durationMs: performance.now() - startedAt });
    return blobUrl;
  } catch (error) {
    apiLogger.error({ method: 'GET', url, service: 'voice', error });
    // Fallback to regular synthesis
    console.warn('[Voice] Streaming failed, falling back to regular synthesis:', error);
    const result = await synthesizeSpeech(payload);
    return result.audio_url;
  }
};

