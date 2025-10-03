// FILE: src/utils/analytics.ts

// Browser environment detection
const isBrowser = typeof window !== "undefined" && 
                 typeof document !== "undefined" && 
                 typeof navigator !== "undefined";

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface UserSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  interactions: number;
  duration?: number;
}

// Mock analytics service for tracking user interactions
export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private currentSession: UserSession | null = null;
  
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private constructor() {
    // Only initialize browser-specific functionality in browser environments
    if (isBrowser) {
      this.startSession();
      
      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseSession();
        } else {
          this.resumeSession();
        }
      });
      
      // Track page unload
      window.addEventListener('beforeunload', () => {
        this.endSession();
      });
    }
  }

  // Session management
  startSession(): void {
    // Early return for non-browser environments
    if (!isBrowser) {
      return;
    }
    
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: new Date(),
      pageViews: 1,
      interactions: 0
    };
    
    this.track('session_start', {
      sessionId: this.currentSession.id,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  pauseSession(): void {
    // Early return for non-browser environments
    if (!isBrowser) {
      return;
    }
    
    if (this.currentSession) {
      this.track('session_pause', {
        sessionId: this.currentSession.id,
        duration: Date.now() - this.currentSession.startTime.getTime()
      });
    }
  }

  resumeSession(): void {
    // Early return for non-browser environments
    if (!isBrowser) {
      return;
    }
    
    if (this.currentSession) {
      this.track('session_resume', {
        sessionId: this.currentSession.id
      });
    }
  }

  endSession(): void {
    // Early return for non-browser environments
    if (!isBrowser) {
      return;
    }
    
    if (this.currentSession) {
      const endTime = new Date();
      this.currentSession.endTime = endTime;
      this.currentSession.duration = endTime.getTime() - this.currentSession.startTime.getTime();
      
      this.track('session_end', {
        sessionId: this.currentSession.id,
        duration: this.currentSession.duration,
        pageViews: this.currentSession.pageViews,
        interactions: this.currentSession.interactions
      });
      
      this.currentSession = null;
    }
  }

  // Event tracking
  track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: properties || {},
      timestamp: new Date(),
      sessionId: this.currentSession?.id
    };
    
    this.events.push(event);
    
    // In a real app, you'd send this to your analytics service
    console.log('Analytics Event:', event);
    
    // Update session interactions
    if (this.currentSession && this.isInteractionEvent(eventName)) {
      this.currentSession.interactions++;
    }
  }

  // Specific tracking methods for common UI interactions
  trackChatMessage(messageType: 'user' | 'assistant', messageLength: number): void {
    this.track('chat_message', {
      messageType,
      messageLength,
      timestamp: new Date().toISOString()
    });
  }

  trackToolUsage(toolType: string, executionTime: number, success: boolean): void {
    this.track('tool_usage', {
      toolType,
      executionTime,
      success,
      timestamp: new Date().toISOString()
    });
  }

  trackSearch(query: string, resultCount?: number): void {
    this.track('search', {
      query: query.length, // Track query length for privacy
      hasResults: resultCount !== undefined,
      resultCount,
      timestamp: new Date().toISOString()
    });
  }

  trackNavigation(from: string, to: string): void {
    this.track('navigation', {
      from,
      to,
      timestamp: new Date().toISOString()
    });
    
    // Update page views
    if (this.currentSession) {
      this.currentSession.pageViews++;
    }
  }

  trackFeatureUsage(feature: string, action: string, context?: Record<string, any>): void {
    this.track('feature_usage', {
      feature,
      action,
      context,
      timestamp: new Date().toISOString()
    });
  }

  trackError(error: string, context?: Record<string, any>): void {
    // Skip browser-specific properties in non-browser environments
    if (!isBrowser) {
      this.track('error', {
        error,
        context,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    this.track('error', {
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  trackPerformance(metric: string, value: number, context?: Record<string, any>): void {
    this.track('performance', {
      metric,
      value,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Analytics insights
  getSessionStats(): UserSession | null {
    return this.currentSession;
  }

  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter(event => event.name === eventType);
  }

  getEventsInTimeRange(startTime: Date, endTime: Date): AnalyticsEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  // Helper methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isInteractionEvent(eventName: string): boolean {
    const interactionEvents = [
      'chat_message',
      'tool_usage',
      'search',
      'navigation',
      'feature_usage'
    ];
    return interactionEvents.includes(eventName);
  }

  // Export analytics data (for debugging or reporting)
  exportEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

// Convenience functions for common tracking scenarios
export const trackChatInteraction = (type: 'send' | 'receive', content: string) => {
  // Skip analytics in non-browser environments
  if (!isBrowser) return;
  
  const analytics = AnalyticsService.getInstance();
  analytics.trackChatMessage(type === 'send' ? 'user' : 'assistant', content.length);
};

export const trackUIInteraction = (component: string, action: string, metadata?: any) => {
  // Skip analytics in non-browser environments
  if (!isBrowser) return;
  
  const analytics = AnalyticsService.getInstance();
  analytics.trackFeatureUsage(component, action, metadata);
};

export const trackToolExecution = (toolName: string, duration: number, successful: boolean) => {
  // Skip analytics in non-browser environments
  if (!isBrowser) return;
  
  const analytics = AnalyticsService.getInstance();
  analytics.trackToolUsage(toolName, duration, successful);
};

export const trackPageView = (pageName: string, previousPage?: string) => {
  // Skip analytics in non-browser environments
  if (!isBrowser) return;
  
  const analytics = AnalyticsService.getInstance();
  if (previousPage) {
    analytics.trackNavigation(previousPage, pageName);
  } else {
    analytics.track('page_view', { page: pageName });
  }
};

// Export singleton instance
// The service will internally handle browser detection
export const analytics = AnalyticsService.getInstance();