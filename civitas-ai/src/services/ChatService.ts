// FILE: src/services/ChatService.ts
import type { Message } from '../types/chat';

export class ChatService {
  /**
   * Generate human-like STR-focused responses based on user message
   */
  static generateSTRResponse(userMessage: string): string {
    const lower = userMessage.toLowerCase();
    
    // Property analysis questions
    if (lower.includes('property') || lower.includes('address') || lower.includes('location')) {
      return "Great question! 🏡 For property analysis, I'd need the address or location you're considering. Once you share that, I can pull up:\n\n• Recent comparable STR listings and their revenue\n• Average occupancy rates in that area\n• Seasonal demand trends\n• Local regulations and permit requirements\n• Estimated startup costs and ROI projections\n\nJust drop the address or city you're interested in, and I'll get to work!";
    }
    
    // Market research questions
    if (lower.includes('market') || lower.includes('city') || lower.includes('where')) {
      return "Love that you're thinking strategically! 📊 The best STR markets right now really depend on your investment goals. Are you looking for:\n\n• High cash flow with strong year-round demand?\n• Appreciation potential in emerging markets?\n• Low competition with underserved demand?\n• Specific regions or budget ranges?\n\nTell me more about your criteria, and I can recommend some markets that might be perfect for you.";
    }
    
    // Revenue/ROI questions
    if (lower.includes('revenue') || lower.includes('roi') || lower.includes('money') || lower.includes('profit')) {
      return "Ah, the bottom line – my favorite topic! 💰 STR returns can vary wildly based on location, property type, and how well you manage it.\n\nTypically, I see successful STRs generating:\n• 8-15% cash-on-cash returns in good markets\n• 15-25%+ in exceptional locations with great management\n• Higher returns during peak seasons\n\nTo give you a specific analysis, I'd need to know more about the property you're considering. Want to share some details?";
    }
    
    // Regulations/legal questions
    if (lower.includes('regulation') || lower.includes('legal') || lower.includes('permit') || lower.includes('law')) {
      return "Smart to think about regulations upfront – this trips up a lot of new investors! 📋\n\nSTR regulations vary dramatically by location. Some cities welcome them with open arms, others have strict caps or outright bans.\n\nWhich market are you looking at? I can check:\n• Registration/licensing requirements\n• Occupancy limits and rental restrictions\n• Tax obligations (TOT, sales tax, etc.)\n• HOA restrictions if applicable\n\nThis stuff matters way more than people think!";
    }
    
    // Pricing/occupancy optimization
    if (lower.includes('price') || lower.includes('pricing') || lower.includes('occupancy') || lower.includes('optimize')) {
      return "Pricing is both an art and a science! 🎯 Get it right and you'll maximize revenue while keeping occupancy high.\n\nHere's what I typically recommend:\n• Dynamic pricing based on demand, seasonality, and local events\n• Competitive analysis against similar listings\n• Weekend vs. weekday pricing strategies\n• Minimum stay requirements for peak periods\n\nAre you managing an existing property or planning for a future one? I can give you more specific guidance based on your situation.";
    }
    
    // General/other questions
    return "That's a great question! 🤔 I'm here to help you navigate the STR investment world.\n\nTo give you the most useful answer, could you tell me a bit more about:\n• What stage you're at (researching, analyzing, or already managing properties?)\n• Any specific markets or properties you're interested in?\n• Your main goals (cash flow, appreciation, portfolio growth?)\n\nThe more context you share, the better I can tailor my advice to your situation!";
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
      type: 'assistant',
      timestamp: new Date()
    };
  }
}
