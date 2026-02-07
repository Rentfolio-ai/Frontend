// FILE: src/services/analytics.ts
/**
 * Feature Analytics Service
 * 
 * Tracks user interactions to understand feature usage.
 * Helps make data-driven product decisions.
 */

interface AnalyticsEvent {
  event_name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  session_id?: string;
}

class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;
  private enabled: boolean = true;

  constructor() {
    // Generate session ID
    this.sessionId = this.generateSessionId();
    
    // Check if analytics is enabled (respect user privacy)
    const analyticsDisabled = localStorage.getItem('analytics_disabled');
    this.enabled = analyticsDisabled !== 'true';
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Set user ID after authentication
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Track a feature usage event
   */
  async track(eventName: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      event_name: eventName,
      properties: {
        ...properties,
        user_id: this.userId,
        session_id: this.sessionId,
        url: window.location.pathname,
        user_agent: navigator.userAgent,
        screen_width: window.innerWidth,
        screen_height: window.innerHeight,
      },
      timestamp: new Date().toISOString(),
    };

    // Send to backend (fire-and-forget; endpoint may not exist yet)
    try {
      const { API_BASE_URL: baseUrl, jsonHeaders: getHeaders } = await import('./apiConfig');
      await fetch(`${baseUrl}/api/analytics/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(event),
      });

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics:', eventName, properties);
      }
    } catch (error) {
      console.error('Analytics error:', error);
      // Fail silently - don't impact user experience
    }
  }

  /**
   * Track composer action
   */
  trackComposerAction(action: 'star_opened' | 'star_closed' | 'attach_file' | 'preferences' | 'integrations' | 'message_sent') {
    this.track('composer_action', { action });
  }

  /**
   * Track integration modal
   */
  trackIntegrationAction(action: 'modal_opened' | 'modal_closed' | 'integration_clicked', integration?: string) {
    this.track('integration_action', { action, integration });
  }

  /**
   * Track portfolio actions
   */
  trackPortfolioAction(action: string, properties?: Record<string, any>) {
    this.track('portfolio_action', { action, ...properties });
  }

  /**
   * Track chat interactions
   */
  trackChatAction(action: string, properties?: Record<string, any>) {
    this.track('chat_action', { action, ...properties });
  }

  /**
   * Track page views
   */
  trackPageView(page: string) {
    this.track('page_view', { page });
  }

  /**
   * Track feature discovery
   */
  trackFeatureDiscovery(feature: string, method: 'click' | 'tooltip' | 'onboarding' | 'search') {
    this.track('feature_discovered', { feature, method });
  }

  /**
   * Track errors
   */
  trackError(error: string, context?: Record<string, any>) {
    this.track('error_occurred', { error, ...context });
  }

  /**
   * Disable analytics (respect user privacy)
   */
  disable() {
    this.enabled = false;
    localStorage.setItem('analytics_disabled', 'true');
  }

  /**
   * Enable analytics
   */
  enable() {
    this.enabled = true;
    localStorage.removeItem('analytics_disabled');
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Convenience exports
export const trackComposerAction = analytics.trackComposerAction.bind(analytics);
export const trackIntegrationAction = analytics.trackIntegrationAction.bind(analytics);
export const trackPortfolioAction = analytics.trackPortfolioAction.bind(analytics);
export const trackChatAction = analytics.trackChatAction.bind(analytics);
export const trackPageView = analytics.trackPageView.bind(analytics);
export const trackFeatureDiscovery = analytics.trackFeatureDiscovery.bind(analytics);
export const trackError = analytics.trackError.bind(analytics);
