'use client';

// LLM Client for Frontend Integration
export interface LLMRequest {
  prompt: string;
  context?: Record<string, any>;
  systemMessage?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  confidence?: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface PropertyData {
  id: string;
  address: string;
  price: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  propertyType: string;
  neighborhood: string;
  zipCode: string;
  capRate?: number;
  cashOnCash?: number;
  imageUrls?: string[];
}

export interface MarketContext {
  avgPrice: number;
  medianCapRate: number;
  marketTrend: string;
  neighborhood: string;
  zipCode: string;
  comparableProperties?: PropertyData[];
}

export class LLMClient {
  private baseUrl: string;

  constructor() {
    // Use internal API routes instead of direct LLM backend calls
    this.baseUrl = '/api/ai';
  }

  // Generate comprehensive property reports
  async generatePropertyReport(propertyData: PropertyData, marketContext?: MarketContext): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate report');
      }

      return result.data;
    } catch (error) {
      console.error('Error generating property report:', error);
      throw error;
    }
  }

  // AI-powered property scouting
  async scoutProperties(criteria: {
    location: string;
    priceRange: { min: number; max: number };
    propertyType: string;
    investmentGoals: string[];
    riskTolerance: 'low' | 'medium' | 'high';
  }): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/scout-properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ criteria }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to scout properties');
      }

      return result.data;
    } catch (error) {
      console.error('Error scouting properties:', error);
      throw error;
    }
  }

  // AI property valuation
  async getPropertyValuation(property: PropertyData, marketContext?: MarketContext): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/property-valuation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ propertyData: property, marketContext }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get property valuation');
      }

      return result.data;
    } catch (error) {
      console.error('Error getting property valuation:', error);
      throw error;
    }
  }

  // General LLM chat for real estate questions
  async chatWithAI(message: string, context?: any): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context }),
      });

      if (!response.ok) {
        // Fallback for when chat API isn't implemented yet
        return this.generateMockChatResponse(message);
      }

      const result = await response.json();

      if (!result.success) {
        return this.generateMockChatResponse(message);
      }

      return result.data;
    } catch (error) {
      console.error('Error in chat:', error);
      return this.generateMockChatResponse(message);
    }
  }

  private generateMockChatResponse(message: string): LLMResponse {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('property') || lowerMessage.includes('real estate')) {
      return {
        content: `I can help you with property analysis! Based on your query "${message}", I'd recommend looking at properties in your target area. Would you like me to search for properties or provide valuations for specific addresses?`,
        confidence: 85,
      };
    }

    if (lowerMessage.includes('valuation') || lowerMessage.includes('price')) {
      return {
        content: `For property valuations, I can analyze market data, comparable sales, and rental income potential. Please provide a property address or tell me about the area you're interested in.`,
        confidence: 90,
      };
    }

    if (lowerMessage.includes('investment') || lowerMessage.includes('roi')) {
      return {
        content: `I can help analyze investment opportunities by looking at cap rates, cash-on-cash returns, and market trends. What type of investment strategy are you considering?`,
        confidence: 88,
      };
    }

    return {
      content: `I'm your AI real estate assistant. I can help you find properties, provide valuations, generate investment reports, and answer questions about real estate investing. How can I assist you today?`,
      confidence: 85,
    };
  }
}

export const llmClient = new LLMClient();
