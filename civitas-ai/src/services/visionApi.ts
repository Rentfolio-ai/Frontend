// FILE: src/services/visionApi.ts
// API service for property image analysis

import { logger } from '../utils/logger';
import type {
  AnalyzePropertyImageInput,
  AnalyzePropertyImageOutput,
  VisionAnalysisType,
  VisionRoomType,
} from '../types/backendTools';

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const CIVITAS_API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

// ═══════════════════════════════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════════════════════════════

function getHeaders(isJson = false): HeadersInit {
  const headers: HeadersInit = {};
  if (CIVITAS_API_KEY) {
    headers['X-API-Key'] = CIVITAS_API_KEY;
  }
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface VisionAnalysisOptions {
  analysis_type?: VisionAnalysisType;
  room_type?: VisionRoomType;
  property_address?: string;
  context?: string;
  thread_id?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════════════════════════════════

export const visionService = {
  /**
   * Analyze image via file upload
   */
  analyzeFromFile: async (
    file: File,
    options: VisionAnalysisOptions = {}
  ): Promise<AnalyzePropertyImageOutput> => {
    logger.info('[visionApi] Analyzing image from file', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      options,
    });

    const formData = new FormData();
    formData.append('file', file);

    if (options.analysis_type) formData.append('analysis_type', options.analysis_type);
    if (options.room_type) formData.append('room_type', options.room_type);
    if (options.property_address) formData.append('property_address', options.property_address);
    if (options.context) formData.append('context', options.context);
    if (options.thread_id) formData.append('thread_id', options.thread_id);

    const response = await fetch(`${CIVITAS_API_BASE}/api/vision/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });

    if (!response.ok) {
      logger.error('[visionApi] Image analysis failed', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Image analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('[visionApi] Image analysis complete', {
      success: data.success,
      analysisType: data.analysis_type,
      roomType: data.room_type,
    });

    return data;
  },

  /**
   * Analyze image via base64 (JSON endpoint)
   */
  analyzeFromBase64: async (
    base64: string,
    options: VisionAnalysisOptions = {}
  ): Promise<AnalyzePropertyImageOutput> => {
    logger.info('[visionApi] Analyzing image from base64', {
      base64Length: base64.length,
      options,
    });

    const body: AnalyzePropertyImageInput = {
      image_base64: base64,
      ...options,
    };

    const response = await fetch(`${CIVITAS_API_BASE}/api/vision/analyze/json`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      logger.error('[visionApi] Image analysis failed', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Image analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('[visionApi] Image analysis complete', {
      success: data.success,
      analysisType: data.analysis_type,
      roomType: data.room_type,
    });

    return data;
  },

  /**
   * Analyze image via URL
   */
  analyzeFromUrl: async (
    imageUrl: string,
    options: VisionAnalysisOptions = {}
  ): Promise<AnalyzePropertyImageOutput> => {
    logger.info('[visionApi] Analyzing image from URL', {
      imageUrl,
      options,
    });

    const body = {
      image_url: imageUrl,
      ...options,
    };

    const response = await fetch(`${CIVITAS_API_BASE}/api/vision/analyze/json`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      logger.error('[visionApi] Image analysis failed', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Image analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('[visionApi] Image analysis complete', {
      success: data.success,
      analysisType: data.analysis_type,
      roomType: data.room_type,
    });

    return data;
  },

  /**
   * Convert File to base64 string
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Chat Response Handler
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract vision analysis from chat tool results
 */
export function extractVisionAnalysisFromToolResults(
  toolResults: Array<{ tool_name: string; data: unknown }>
): AnalyzePropertyImageOutput | null {
  // Check for new enhanced tool
  const enhancedResult = toolResults.find(t => t.tool_name === 'analyze_property_image');
  if (enhancedResult && enhancedResult.data) {
    return enhancedResult.data as AnalyzePropertyImageOutput;
  }

  // Check for legacy tool
  const legacyResult = toolResults.find(t => t.tool_name === 'analyze_renovation_from_image');
  if (legacyResult && legacyResult.data) {
    // Convert legacy format to new format for consistent handling
    const legacy = legacyResult.data as Record<string, unknown>;
    return {
      success: legacy['success'] as boolean ?? true,
      analysis_type: 'renovation',
      room_type: legacy['room_type'] as string ?? 'auto',
      timestamp: new Date().toISOString(),
      condition: {
        overall: legacy['overall_condition'] as 'excellent' | 'good' | 'fair' | 'poor' | 'critical' ?? 'fair',
        structural_issues: [],
        cosmetic_issues: [],
        safety_concerns: [],
      },
      summary: legacy['message'] as string ?? 'Legacy renovation analysis',
      recommendations: (legacy['recommendations'] as string[] || []).map((rec) => ({
        priority: 'medium' as const,
        action: rec,
        estimated_cost: 0,
      })),
    };
  }

  return null;
}

