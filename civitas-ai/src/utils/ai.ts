// FILE: src/utils/ai.ts
import { mockApiDelay, sampleProperties, type ToolResult } from '../data/seed';

export interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  isStreaming?: boolean;
}

export interface AIResponse {
  message?: AIMessage;
  toolResult?: ToolResult;
  error?: string;
}

// Mock AI service for demonstration
export class AIService {
  private static instance: AIService;
  
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Simulate sending a message to AI and getting a response
  async sendMessage(message: string): Promise<AIResponse> {
    await mockApiDelay(1500);
    
    // Simple keyword-based responses for demo
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('roi') || lowerMessage.includes('return')) {
      return {
        toolResult: {
          type: 'roi_analysis',
          title: 'ROI Analysis Results',
          status: 'success',
          data: {
            roi: Math.random() * 5 + 6, // 6-11%
            capRate: Math.random() * 2 + 5, // 5-7%
            cashFlow: Math.floor(Math.random() * 1000 + 800), // $800-1800
            breakEven: Math.random() * 3 + 6 // 6-9 years
          }
        }
      };
    }
    
    if (lowerMessage.includes('market') || lowerMessage.includes('price')) {
      return {
        toolResult: {
          type: 'market_data',
          title: 'Market Analysis',
          status: 'success',
          data: {
            location: 'Austin, TX',
            medianPrice: Math.floor(Math.random() * 200 + 400) + 'K', // 400-600K
            priceGrowth: Math.random() * 10 + 5, // 5-15%
            inventory: Math.floor(Math.random() * 20 + 20), // 20-40 days
            date: new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })
          }
        }
      };
    }
    
    if (lowerMessage.includes('compare') || lowerMessage.includes('properties')) {
      const selectedProperties = sampleProperties
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
        
      return {
        toolResult: {
          type: 'property_comparison',
          title: 'Property Comparison',
          status: 'success',
          data: {
            properties: selectedProperties
          }
        }
      };
    }
    
    if (lowerMessage.includes('alert') || lowerMessage.includes('warning')) {
      return {
        toolResult: {
          type: 'alert',
          title: 'Market Alert',
          status: 'warning',
          data: {
            title: 'Price Increase Detected',
            message: 'Property prices in your target area have increased 8% this month.',
            action: 'Review Strategy'
          }
        }
      };
    }
    
    // Default conversational response
    const responses = [
      "I'd be happy to help you with that real estate analysis. What specific information are you looking for?",
      "Based on current market data, I can provide insights on property valuation, ROI calculations, or market trends. What would you like to explore?",
      "I can assist with property analysis, market research, or investment calculations. What's your main focus today?",
      "Let me help you with that. I have access to comprehensive real estate data and analysis tools. What would you like to know?",
      "I understand you're looking for real estate insights. I can analyze properties, compare markets, or generate detailed reports. How can I assist?"
    ];
    
    return {
      message: {
        id: Date.now().toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      }
    };
  }

  // Simulate streaming response
  async *streamMessage(message: string): AsyncGenerator<string, void, unknown> {
    await mockApiDelay(500);
    
    const response = await this.sendMessage(message);
    if (response.message) {
      const words = response.message.content.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        await mockApiDelay(50); // Delay between words
        yield words.slice(0, i + 1).join(' ');
      }
    }
  }

  // Execute tool calls
  async executeTool(toolName: string, parameters: any): Promise<ToolResult> {
    await mockApiDelay(2000);
    
    switch (toolName) {
      case 'analyze_roi':
        return {
          type: 'roi_analysis',
          title: 'ROI Analysis',
          status: 'success',
          data: {
            roi: parameters.expectedRoi || 8.4,
            capRate: parameters.capRate || 6.2,
            cashFlow: parameters.cashFlow || 1240,
            breakEven: parameters.breakEven || 7.2
          }
        };
        
      case 'get_market_data':
        return {
          type: 'market_data',
          title: 'Market Data',
          status: 'success',
          data: {
            location: parameters.location || 'Austin, TX',
            medianPrice: parameters.medianPrice || '485K',
            priceGrowth: parameters.priceGrowth || 12.3,
            inventory: parameters.inventory || 28,
            date: new Date().toLocaleDateString()
          }
        };
        
      case 'compare_properties':
        return {
          type: 'property_comparison',
          title: 'Property Comparison',
          status: 'success',
          data: {
            properties: parameters.properties || sampleProperties.slice(0, 2)
          }
        };
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  // Get suggested actions based on conversation context
  getSuggestedActions(_conversationHistory: AIMessage[]): string[] {
    const suggestions = [
      'Analyze ROI for this property',
      'Compare with similar properties',
      'Get market trend analysis',
      'Generate investment report',
      'Calculate cash flow projections',
      'Find comparable sales'
    ];
    
    return suggestions.slice(0, 3);
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();