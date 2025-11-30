// FILE: src/services/ChatService.ts
import type { Message } from '../types/chat';
import { stripMarkdown } from '../utils/stripMarkdown';
import { logger } from '../utils/logger';
import { logApiResponse, summarizeToolResults } from '../utils/apiValidator';

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const CIVITAS_API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export class ChatService {
  /**
   * Generate STR-focused responses using ProphetAtlas backend
   * Returns both content and optional navigation action
   */
  static async generateSTRResponse(
    userMessage: string,
    userContext?: { name?: string; onboarding_completed?: boolean },
    _conversationHistory?: Message[],
    actionContext?: any,
    threadIdOverride?: string
  ): Promise<{ content: string; navigate?: string; toolCalls?: ToolCall[]; action?: any; tool_results?: any; tour?: any; threadId?: string }> {
    try {
      // Get current settings context for chat API
      const chatContext = buildChatContext();

      const threadId = threadIdOverride;
      // REMOVED localStorage fallback to prevent stuck state
      // const threadId = threadIdOverride || (
      //   typeof window !== 'undefined'
      //     ? window.localStorage.getItem('civitas-thread-id') || undefined
      //     : undefined
      // );

      // Prepare request body for backend ChatRequest schema
      const requestBody = {
        message: userMessage,
        thread_id: threadId,
        // Use conversation_history from args if needed, but backend might handle thread history separately
        context: {
          user_context: { ...userContext, ...chatContext },
          action_context: actionContext,
        },
      };

      // Call new ProphetAtlas agents API for chat
      const response = await fetch(`${CIVITAS_API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();

        // Log full response structure for debugging
        console.log('[ChatService] 📥 RAW API Response:', JSON.stringify(data, null, 2));
        logger.info('[ChatService] API Response received', {
          hasMessage: !!data.message,
          hasData: !!data.data,
          hasThreadId: !!data.thread_id,
          messageLength: data.message?.length || 0,
        });

        // Detailed API response validation
        logApiResponse('/api/chat', data);

        // Persist thread_id from backend if provided - REMOVED to prevent stuck state
        // if (typeof window !== 'undefined' && data.thread_id) {
        //   window.localStorage.setItem('civitas-thread-id', data.thread_id);
        // }

        // Check for navigation action from backend
        const navigate = data.data?.navigate;

        // Check for action buttons (report generation prompt, etc.)
        const action = data.data?.action;

        // Get result and strip markdown formatting
        let content = data.message || '';
        content = stripMarkdown(content);

        // Check for tool calls
        const toolCalls: ToolCall[] = data.data?.toolCalls || [];

        if (toolCalls.length > 0) {
          logger.info('[ChatService] Tool calls received', {
            count: toolCalls.length,
            tools: toolCalls.map(tc => tc.name),
          });
        }

        // Extract tool_results for conversation context (always array per backend schema)
        const toolResults = Array.isArray(data.data?.tool_results)
          ? data.data?.tool_results
          : [];

        if (toolResults.length > 0) {
          logger.info('[ChatService] Tool results found', {
            summary: summarizeToolResults(toolResults),
            count: toolResults.length,
          });

          // Log each tool result structure
          toolResults.forEach((tr: any, idx: number) => {
            logger.info(`[ChatService] Tool result [${idx}]`, {
              tool_name: tr.tool_name || tr.kind || 'unknown',
              hasData: !!tr.data,
              status: tr.status,
              dataKeys: tr.data ? Object.keys(tr.data) : [],
            });
          });
        } else {
          logger.info('[ChatService] No tool_results attached to response');
        }

        // Extract tour data if present
        const tour = data.data?.tour;

        // Return cleaned content with navigation, actions, tool_results, and tour data
        return {
          content,
          navigate,
          toolCalls,
          action,
          tool_results: toolResults,
          ...(tour && { tour }),
          threadId: data.thread_id || threadId
        };
      } else {
        // Log detailed error information
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch {
          errorBody = 'Could not read error body';
        }

        logger.error('[ChatService] ❌ API Error Response', {
          status: response.status,
          statusText: response.statusText,
          url: `${CIVITAS_API_BASE}/api/chat`,
          errorBody: errorBody.substring(0, 500), // Limit to 500 chars
          headers: {
            contentType: response.headers.get('content-type'),
            requestId: response.headers.get('x-request-id'),
          },
          userMessage: userMessage.substring(0, 100), // Truncate for logging
          threadId,
        });

        // Try to parse error details if JSON
        try {
          const errorJson = JSON.parse(errorBody);
          logger.error('[ChatService] ❌ Error Details', {
            errorType: errorJson.error || errorJson.type || 'unknown',
            errorMessage: errorJson.message || errorJson.detail || errorBody,
            errorCode: errorJson.code,
          });
        } catch {
          // Not JSON, already logged raw body above
        }

        return this.generateFallbackSTRResponse(userMessage, threadId);
      }
    } catch (error) {
      // Network error or other exception
      const err = error as Error;
      logger.error('[ChatService] ❌ Network/Exception Error', {
        name: err.name,
        message: err.message,
        stack: err.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines of stack
        userMessage: userMessage.substring(0, 100),
        threadId: threadIdOverride,
      });

      return this.generateFallbackSTRResponse(userMessage, threadIdOverride);
    }
  }

  /**
   * Check if message is a navigation intent (local fallback)
   */
  static detectNavigationIntent(message: string): string | null {
    const lower = message.toLowerCase();

    // Settings tab
    if (lower.match(/\b(go to|open|show|navigate to|take me to|view)\b.*(settings|preferences|account)/)) {
      return 'settings';
    }

    // Chat tab
    if (lower.match(/\b(go to|open|show|navigate to|take me to|back to)\b.*(chat|main|home)/)) {
      return null; // null = chat tab
    }

    return null;
  }

  /**
   * Format property data into a user-friendly message
   */
  static formatPropertyData(data: any, userMessage: string): string {
    try {
      if (data.location && typeof data.total_properties === 'number') {
        const location = data.location;
        const totalProperties = data.total_properties;

        let response = `📍 **Real Estate Analysis: ${location}**\n\n`;

        response += `I found ${totalProperties} investment properties in ${location}!\n\n`;

        if (data.reports && Array.isArray(data.reports) && data.reports.length > 0) {
          response += '**🏆 Top STR Investment Properties:**\n\n';

          data.reports.forEach((property: any, index: number) => {
            response += `**${index + 1}. ${property.description || property.address || 'Property'}**\n`;
            if (property.address) response += `📍 ${property.address}\n`;
            if (property.price) response += `💰 Purchase: $${Number(property.price).toLocaleString()}\n`;

            // Property details
            const beds = property.bedrooms || property.beds;
            const baths = property.bathrooms || property.baths;
            if (beds || baths) response += `🏠 ${beds || 0} bed, ${baths || 0} bath`;
            if (property.sqft) response += ` • ${property.sqft} sqft`;
            response += '\n';

            // STR-specific metrics
            if (property.nightly_price) response += `🌙 Nightly Rate: $${property.nightly_price}\n`;
            if (property.monthly_revenue_estimate) response += `📊 Monthly Revenue: $${Number(property.monthly_revenue_estimate).toLocaleString()}\n`;
            if (property.cash_on_cash_roi) response += `📈 Cash-on-Cash ROI: ${property.cash_on_cash_roi}%\n`;
            if (property.avg_occupancy_rate) response += `🎯 Occupancy: ${Math.round(property.avg_occupancy_rate * 100)}%\n`;

            // Amenities
            if (property.amenities && Array.isArray(property.amenities)) {
              response += `✨ Amenities: ${property.amenities.join(', ')}\n`;
            }

            response += '\n';
          });
        } else {
          response += "I'm working on gathering detailed information about specific properties.\n\n";
          response += "Would you like me to search for properties with specific criteria? For example:\n";
          response += "- Properties under a certain price\n";
          response += "- Minimum number of bedrooms/bathrooms\n";
          response += "- Properties with high ROI potential\n";
        }

        response += "\n*What specific property details would you like to know more about?*";
        return response;
      }

      // Fallback for other data formats
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error formatting property data:', error);
      return this.generateFallbackSTRResponse(userMessage).content;
    }
  }

  /**
   * Fallback STR responses when ProphetAtlas API is unavailable
   */
  static generateFallbackSTRResponse(userMessage: string, threadId?: string): { content: string; navigate?: string; threadId?: string } {
    const lower = userMessage.toLowerCase();

    // Property analysis questions
    if (lower.includes('property') || lower.includes('address') || lower.includes('location')) {
      return { content: "Great question! 🏡 For property analysis, I'd need the address or location you're considering. Once you share that, I can pull up:\n\n• Recent comparable STR listings and their revenue\n• Average occupancy rates in that area\n• Seasonal demand trends\n• Local regulations and permit requirements\n• Estimated startup costs and ROI projections\n\nJust drop the address or city you're interested in, and I'll get to work!", threadId };
    }

    // Market research questions
    if (lower.includes('market') || lower.includes('city') || lower.includes('where')) {
      return { content: "Love that you're thinking strategically! 📊 The best STR markets right now really depend on your investment goals. Are you looking for:\n\n• High cash flow with strong year-round demand?\n• Appreciation potential in emerging markets?\n• Low competition with underserved demand?\n• Specific regions or budget ranges?\n\nTell me more about your criteria, and I can recommend some markets that might be perfect for you.", threadId };
    }

    // Revenue/ROI questions
    if (lower.includes('revenue') || lower.includes('roi') || lower.includes('money') || lower.includes('profit')) {
      return { content: "Ah, the bottom line – my favorite topic! 💰 STR returns can vary wildly based on location, property type, and how well you manage it.\n\nTypically, I see successful STRs generating:\n• 8-15% cash-on-cash returns in good markets\n• 15-25%+ in exceptional locations with great management\n• Higher returns during peak seasons\n\nTo give you a specific analysis, I'd need to know more about the property you're considering. Want to share some details?", threadId };
    }

    // Regulations/legal questions
    if (lower.includes('regulation') || lower.includes('legal') || lower.includes('permit') || lower.includes('law')) {
      return { content: "Smart to think about regulations upfront – this trips up a lot of new investors! 📋\n\nSTR regulations vary dramatically by location. Some cities welcome them with open arms, others have strict caps or outright bans.\n\nWhich market are you looking at? I can check:\n• Registration/licensing requirements\n• Occupancy limits and rental restrictions\n• Tax obligations (TOT, sales tax, etc.)\n• HOA restrictions if applicable\n\nThis stuff matters way more than people think!", threadId };
    }

    // Pricing/occupancy optimization
    if (lower.includes('price') || lower.includes('pricing') || lower.includes('occupancy') || lower.includes('optimize')) {
      return { content: "Pricing is both an art and a science! 🎯 Get it right and you'll maximize revenue while keeping occupancy high.\n\nHere's what I typically recommend:\n• Dynamic pricing based on demand, seasonality, and local events\n• Competitive analysis against similar listings\n• Weekend vs. weekday pricing strategies\n• Minimum stay requirements for peak periods\n\nAre you managing an existing property or planning for a future one? I can give you more specific guidance based on your situation.", threadId };
    }

    // Check for navigation intent - only respond if explicitly matched (not just returning null)
    const hasExplicitNavigationKeywords = /\b(go to|open|show|navigate to|take me to|view|back to)\b/.test(lower);

    if (hasExplicitNavigationKeywords) {
      const deprecatedTabs = [
        { pattern: /(properties|property tab|saved properties)/, label: 'Properties' },
        { pattern: /(portfolio|my investments|my properties)/, label: 'Portfolio' },
        { pattern: /(market|trends|market trends|market data)/, label: 'Market' },
        { pattern: /(reports|report tab|my reports)/, label: 'Reports' }
      ];
      const deprecatedMatch = deprecatedTabs.find(entry => entry.pattern.test(lower));
      if (deprecatedMatch) {
        return {
          content: `The ${deprecatedMatch.label} tab isn't part of this build anymore, but I can still help you right here in chat. Try asking for insights directly and I'll guide you. 💬`
        };
      }

      const navigate = this.detectNavigationIntent(userMessage);
      const tabNames: Record<string, string> = {
        'settings': 'Settings'
      };
      const tabName = navigate ? tabNames[navigate] : 'Chat';
      return {
        content: `Sure! Taking you to the ${tabName} view now. 🎯`,
        navigate: navigate || undefined,
        threadId
      };
    }

    // General/other questions (including first message/greeting)
    return {
      content: "I'm here to help you find and evaluate short-term rental (STR) investment opportunities. Here's what I can do for you:\n\n• 🏠 **Property Analysis** - Evaluate specific properties for STR potential\n• 📊 **Market Research** - Identify the best markets for your investment goals\n• 💰 **Revenue Projections** - Estimate cash flow and ROI\n• 📋 **Regulatory Guidance** - Navigate local STR laws and requirements\n• 🎯 **Optimization Tips** - Maximize occupancy and pricing strategies\n\n*Tip: You can also ask me to navigate to different tabs, like \"Show me my properties\" or \"Take me to reports\"*\n\nWhat would you like to explore today?"
      ,
      threadId
    };
  }

  /**
   * Stream a response character by character
   * Returns the interval ID and stream ID
   */
  static streamResponse(
    fullResponse: string,
    onUpdate: (content: string, streamId: string) => void,
    onComplete: () => void
  ): { intervalId: ReturnType<typeof setInterval>; streamId: string } {
    let current = '';
    let i = 0;
    const streamId = `${Date.now() + 1}`;

    const interval = setInterval(() => {
      i++;
      current = fullResponse.slice(0, i);
      onUpdate(current, streamId);

      if (i >= fullResponse.length) {
        clearInterval(interval);
        onComplete();
      }
    }, 20);

    return { intervalId: interval, streamId };
  }

  /**
   * Get current time formatted for messages
   */
  static getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Create a user message object
   */
  static createUserMessage(
    content: string,
    attachment?: { name: string; type: string; url: string }
  ): Message {
    const message: Message = {
      id: `${Date.now()}`,
      content,
      role: 'user',
      type: 'user',
      timestamp: new Date()
    };

    if (attachment) {
      message.attachment = attachment;
    }

    return message;
  }

  /**
   * Create an assistant message object
   */
  static createAssistantMessage(content: string, id?: string): Message {
    return {
      id: id || `${Date.now() + 1}`,
      content,
      role: 'assistant',
      type: 'assistant',
      timestamp: new Date()
    };
  }
}

function buildChatContext() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const userStr = window.localStorage.getItem('civitas-user');
    if (!userStr) {
      return {};
    }

    const parsed = JSON.parse(userStr);
    return {
      user: {
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
      },
    };
  } catch (error) {
    console.error('Failed to read user context from localStorage:', error);
    return {};
  }
}
