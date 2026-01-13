/**
 * Phase 3: Voice Analytics Tracking
 * Tracks voice session metrics for analysis and improvement
 */

export interface VoiceAnalyticsEvent {
  eventType: 'session_start' | 'session_end' | 'turn_complete' | 'error' | 'interrupt' | 'voice_command';
  timestamp: number;
  sessionId: string;
  userId?: string;
  data?: Record<string, any>;
}

export interface VoiceSessionMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  language: string;
  voice: string;
  detectedLanguage?: string;
  turnCount: number;
  errorCount: number;
  interruptCount: number;
  voiceCommands: string[];
  avgResponseTime?: number;
  transcriptLength: number;
  costEstimate?: number;
}

// In-memory event buffer (could be sent to backend periodically)
const eventBuffer: VoiceAnalyticsEvent[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Track a voice analytics event
 */
export const trackVoiceEvent = (
  eventType: VoiceAnalyticsEvent['eventType'],
  sessionId: string,
  data?: Record<string, any>,
  userId?: string
): void => {
  const event: VoiceAnalyticsEvent = {
    eventType,
    timestamp: Date.now(),
    sessionId,
    userId,
    data,
  };

  eventBuffer.push(event);
  
  // Keep buffer size manageable
  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.shift();
  }

  console.log('[Analytics]', eventType, data);
  
  // Could send to backend here
  // sendToBackend(event);
};

/**
 * Track session start
 */
export const trackSessionStart = (sessionId: string, language: string, voice: string): void => {
  trackVoiceEvent('session_start', sessionId, {
    language,
    voice,
    timestamp: Date.now(),
  });
};

/**
 * Track session end with full metrics
 */
export const trackSessionEnd = (metrics: VoiceSessionMetrics): void => {
  trackVoiceEvent('session_end', metrics.sessionId, {
    duration: metrics.duration,
    turnCount: metrics.turnCount,
    errorCount: metrics.errorCount,
    interruptCount: metrics.interruptCount,
    language: metrics.language,
    voice: metrics.voice,
    detectedLanguage: metrics.detectedLanguage,
    voiceCommands: metrics.voiceCommands,
    transcriptLength: metrics.transcriptLength,
    successRate: metrics.turnCount > 0 
      ? ((metrics.turnCount - metrics.errorCount) / metrics.turnCount) * 100 
      : 100,
  });
  
  // Send to backend analytics
  sendMetricsToBackend(metrics);
};

/**
 * Track conversation turn completion
 */
export const trackTurnComplete = (
  sessionId: string,
  turnNumber: number,
  responseTime: number,
  transcriptLength: number
): void => {
  trackVoiceEvent('turn_complete', sessionId, {
    turnNumber,
    responseTime,
    transcriptLength,
  });
};

/**
 * Track voice error
 */
export const trackVoiceError = (
  sessionId: string,
  errorType: string,
  errorMessage: string
): void => {
  trackVoiceEvent('error', sessionId, {
    errorType,
    errorMessage,
    timestamp: Date.now(),
  });
};

/**
 * Track interrupt event
 */
export const trackInterrupt = (sessionId: string, atTimestamp: number): void => {
  trackVoiceEvent('interrupt', sessionId, {
    atTimestamp,
  });
};

/**
 * Track voice command detection
 */
export const trackVoiceCommand = (
  sessionId: string,
  command: string,
  transcript: string
): void => {
  trackVoiceEvent('voice_command', sessionId, {
    command,
    transcript,
  });
};

/**
 * Get analytics summary
 */
export const getAnalyticsSummary = () => {
  const sessionStarts = eventBuffer.filter(e => e.eventType === 'session_start');
  const sessionEnds = eventBuffer.filter(e => e.eventType === 'session_end');
  const errors = eventBuffer.filter(e => e.eventType === 'error');
  const interrupts = eventBuffer.filter(e => e.eventType === 'interrupt');
  const voiceCommands = eventBuffer.filter(e => e.eventType === 'voice_command');
  
  return {
    totalSessions: sessionStarts.length,
    completedSessions: sessionEnds.length,
    totalErrors: errors.length,
    totalInterrupts: interrupts.length,
    totalVoiceCommands: voiceCommands.length,
    errorRate: sessionStarts.length > 0 ? (errors.length / sessionStarts.length) * 100 : 0,
    averageDuration: sessionEnds.length > 0
      ? sessionEnds.reduce((sum, e) => sum + (e.data?.duration || 0), 0) / sessionEnds.length
      : 0,
    languages: [...new Set(sessionStarts.map(e => e.data?.language).filter(Boolean))],
    voices: [...new Set(sessionStarts.map(e => e.data?.voice).filter(Boolean))],
  };
};

/**
 * Send metrics to backend for persistent storage
 */
const sendMetricsToBackend = async (metrics: VoiceSessionMetrics): Promise<void> => {
  try {
    // Get backend URL
    const backendUrl = import.meta.env.VITE_DATALAYER_API_URL || 'http://localhost:8001';
    const apiKey = import.meta.env.VITE_API_KEY;
    
    const response = await fetch(`${backendUrl}/api/voice/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      },
      body: JSON.stringify(metrics),
    });
    
    if (!response.ok) {
      console.warn('[Analytics] Failed to send metrics to backend:', response.status);
    } else {
      console.log('[Analytics] Metrics sent to backend successfully');
    }
  } catch (error) {
    console.error('[Analytics] Error sending metrics to backend:', error);
    // Non-blocking - analytics failure shouldn't affect user experience
  }
};

/**
 * Clear analytics buffer
 */
export const clearAnalyticsBuffer = (): void => {
  eventBuffer.length = 0;
  console.log('[Analytics] Buffer cleared');
};

/**
 * Get all events (for debugging)
 */
export const getAnalyticsEvents = (): VoiceAnalyticsEvent[] => {
  return [...eventBuffer];
};

