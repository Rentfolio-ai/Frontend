// LLM Service for Real Estate AI Platform

// Types for LLM integration
export interface LLMRequest {
  prompt: string;
  context?: Record<string, any>;
  systemMessage?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  confidence?: number;
  reasoning?: string;
  metadata?: Record<string, any>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface PropertyAnalysisRequest {
  property: {
    id: string;
    address: string;
    price: number;
    sqft: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    propertyType: string;
    neighborhood: string;
    capRate?: number;
    cashOnCash?: number;
  };
  marketContext?: {
    avgPrice: number;
    medianCapRate: number;
    marketTrend: string;
  };
}

export interface MarketAnalysisRequest {
  location: string;
  timeframe: string;
  metrics: {
    avgPrice: number;
    medianCapRate: number;
    totalListings: number;
    priceGrowth: number;
  };
}

export class LLMService {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = process.env.LLM_API_URL || '';
    this.apiKey = process.env.LLM_API_KEY || '';
    this.timeout = parseInt(process.env.LLM_TIMEOUT || '30000');

    if (!this.baseUrl || !this.apiKey) {
      console.warn('LLM_API_URL or LLM_API_KEY not configured');
    }
  }

  private async makeRequest(payload: any): Promise<LLMResponse> {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('LLM service not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        content: data.choices?.[0]?.message?.content || '',
        confidence: data.confidence || 0.85,
        metadata: data.metadata || {},
        usage: data.usage,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('LLM request timeout');
      }
      throw error;
    }
  }

  async generateMarketInsights(marketData: MarketAnalysisRequest): Promise<LLMResponse> {
    const systemMessage = `You are an expert real estate investment analyst. Analyze market data and provide insights in JSON format with:
    - market_sentiment: "bullish" | "bearish" | "neutral"
    - key_insights: string[]
    - investment_recommendation: string
    - confidence_score: number (0-100)
    - risk_factors: string[]
    - opportunities: string[]`;

    const prompt = `Analyze this real estate market data for ${marketData.location}:

    Market Metrics:
    - Average Price: $${marketData.metrics.avgPrice.toLocaleString()}
    - Median Cap Rate: ${marketData.metrics.medianCapRate}%
    - Total Listings: ${marketData.metrics.totalListings}
    - Price Growth: ${marketData.metrics.priceGrowth}%
    - Timeframe: ${marketData.timeframe}

    Provide comprehensive market analysis and investment insights.`;

    return this.makeRequest({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });
  }

  async analyzeProperty(request: PropertyAnalysisRequest): Promise<LLMResponse> {
    const systemMessage = `You are a real estate investment expert. Analyze properties and provide insights in JSON format with:
    - investment_score: number (1-100)
    - key_strengths: string[]
    - concerns: string[]
    - valuation_assessment: string
    - rental_potential: string
    - roi_projection: string
    - recommendation: "strong_buy" | "buy" | "hold" | "avoid"`;

    const { property, marketContext } = request;

    const prompt = `Analyze this investment property:

    Property Details:
    - Address: ${property.address}
    - Price: $${property.price.toLocaleString()}
    - Size: ${property.sqft} sqft
    - Bedrooms: ${property.bedrooms}
    - Bathrooms: ${property.bathrooms}
    - Year Built: ${property.yearBuilt}
    - Type: ${property.propertyType}
    - Neighborhood: ${property.neighborhood}
    ${property.capRate ? `- Cap Rate: ${property.capRate}%` : ''}
    ${property.cashOnCash ? `- Cash-on-Cash: ${property.cashOnCash}%` : ''}

    ${marketContext ? `
    Market Context:
    - Market Avg Price: $${marketContext.avgPrice.toLocaleString()}
    - Market Median Cap Rate: ${marketContext.medianCapRate}%
    - Market Trend: ${marketContext.marketTrend}
    ` : ''}

    Provide detailed investment analysis and recommendations.`;

    return this.makeRequest({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800,
    });
  }

  async generateChatResponse(message: string, context?: string): Promise<LLMResponse> {
    const systemMessage = `You are an AI assistant specialized in real estate investment. You help users with:
    - Property analysis and valuation
    - Market insights and trends
    - Investment strategies
    - Risk assessment
    - Portfolio optimization

    Provide helpful, accurate, and actionable advice. Be conversational but professional.`;

    const contextPrompt = context ? `Context from previous conversation:\n${context}\n\n` : '';
    const fullPrompt = `${contextPrompt}User question: ${message}`;

    return this.makeRequest({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: fullPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
  }

  async generatePredictiveInsights(data: any): Promise<LLMResponse> {
    const systemMessage = `You are a real estate market forecasting expert. Generate predictive insights in JSON format with:
    - market_forecast: string
    - price_prediction: string
    - investment_timing: string
    - risk_level: "low" | "medium" | "high"
    - confidence: number (0-100)
    - key_drivers: string[]`;

    const prompt = `Based on current market data, generate predictive insights for real estate investment:

    ${JSON.stringify(data, null, 2)}

    Provide forward-looking analysis and predictions.`;

    return this.makeRequest({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 600,
    });
  }

  // Streaming response for real-time chat
  async *streamChatResponse(message: string, _context?: string) {
    const systemMessage = `You are an AI real estate investment assistant. Provide helpful responses in a conversational manner.`;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Health check for LLM service
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        messages: [{ role: 'user', content: 'Health check' }],
        max_tokens: 10,
      });
      return !!response.content;
    } catch (error) {
      console.error('LLM health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const llmService = new LLMService();
