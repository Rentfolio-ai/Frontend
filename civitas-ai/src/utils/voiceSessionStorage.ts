/**
 * Phase 3: Voice Session Persistence
 * Stores and retrieves voice sessions for history and replay
 */

export interface VoiceSessionData {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration: number;
  transcript: string[];
  aiResponses: string[];
  language: string;
  voice: string;
  detectedLanguage?: string;
  conversationHistory: Array<{ user: string; ai: string }>;
  metrics: {
    turns: number;
    errors: number;
    interrupts: number;
    totalDuration: number;
  };
  voiceCommands?: string[];
  createdAt: string;
}

const STORAGE_KEY = 'vasthu_voice_sessions';
const MAX_SESSIONS = 50; // Keep last 50 sessions

/**
 * Save a voice session to local storage
 */
export const saveVoiceSession = (session: VoiceSessionData): void => {
  try {
    const sessions = getVoiceSessions();
    sessions.unshift(session); // Add to beginning
    
    // Keep only last MAX_SESSIONS
    const trimmedSessions = sessions.slice(0, MAX_SESSIONS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedSessions));
    console.log('[VoiceSession] Saved session:', session.id);
  } catch (error) {
    console.error('[VoiceSession] Failed to save session:', error);
  }
};

/**
 * Get all voice sessions from storage
 */
export const getVoiceSessions = (): VoiceSessionData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const sessions = JSON.parse(data) as VoiceSessionData[];
    return sessions;
  } catch (error) {
    console.error('[VoiceSession] Failed to get sessions:', error);
    return [];
  }
};

/**
 * Get a specific session by ID
 */
export const getVoiceSession = (id: string): VoiceSessionData | null => {
  const sessions = getVoiceSessions();
  return sessions.find(s => s.id === id) || null;
};

/**
 * Delete a session by ID
 */
export const deleteVoiceSession = (id: string): void => {
  try {
    const sessions = getVoiceSessions();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('[VoiceSession] Deleted session:', id);
  } catch (error) {
    console.error('[VoiceSession] Failed to delete session:', error);
  }
};

/**
 * Clear all voice sessions
 */
export const clearVoiceSessions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[VoiceSession] Cleared all sessions');
  } catch (error) {
    console.error('[VoiceSession] Failed to clear sessions:', error);
  }
};

/**
 * Get session statistics
 */
export const getSessionStats = () => {
  const sessions = getVoiceSessions();
  
  if (sessions.length === 0) {
    return {
      total: 0,
      totalDuration: 0,
      averageDuration: 0,
      totalTurns: 0,
      averageTurns: 0,
      totalErrors: 0,
      totalInterrupts: 0,
      languages: {},
      voices: {},
    };
  }
  
  const stats = sessions.reduce(
    (acc, session) => {
      acc.totalDuration += session.duration;
      acc.totalTurns += session.metrics.turns;
      acc.totalErrors += session.metrics.errors;
      acc.totalInterrupts += session.metrics.interrupts;
      
      // Count languages
      acc.languages[session.language] = (acc.languages[session.language] || 0) + 1;
      
      // Count voices
      acc.voices[session.voice] = (acc.voices[session.voice] || 0) + 1;
      
      return acc;
    },
    {
      totalDuration: 0,
      totalTurns: 0,
      totalErrors: 0,
      totalInterrupts: 0,
      languages: {} as Record<string, number>,
      voices: {} as Record<string, number>,
    }
  );
  
  return {
    total: sessions.length,
    totalDuration: stats.totalDuration,
    averageDuration: Math.round(stats.totalDuration / sessions.length),
    totalTurns: stats.totalTurns,
    averageTurns: Math.round(stats.totalTurns / sessions.length),
    totalErrors: stats.totalErrors,
    totalInterrupts: stats.totalInterrupts,
    languages: stats.languages,
    voices: stats.voices,
    successRate: Math.round(((stats.totalTurns - stats.totalErrors) / stats.totalTurns) * 100),
  };
};

/**
 * Export sessions as JSON file
 */
export const exportSessions = (): void => {
  try {
    const sessions = getVoiceSessions();
    const json = JSON.stringify(sessions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `vasthu-voice-sessions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('[VoiceSession] Exported sessions');
  } catch (error) {
    console.error('[VoiceSession] Failed to export sessions:', error);
  }
};

