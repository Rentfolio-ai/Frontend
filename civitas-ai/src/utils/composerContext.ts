/**
 * Context-Aware Descriptions for InlineComposer
 * 
 * Based on where the user is in the app, show relevant context
 */

export type ComposerContext = 
  | 'chat'
  | 'property-detail'
  | 'portfolio'
  | 'market-analysis'
  | 'reports'
  | 'comparison';

export const getContextDescription = (context: ComposerContext, data?: any): string => {
  switch (context) {
    case 'chat':
      // Chat doesn't need InlineComposer - it has the main Composer
      return "Main chat interface";
    
    case 'property-detail':
      return `Ask me anything about ${data?.address || 'this property'}.`;
    
    case 'portfolio':
      return "Ask about your investment portfolio, performance, or specific properties.";
    
    case 'market-analysis':
      return `Ask about ${data?.market || 'this market'}'s trends, pricing, or opportunities.`;
    
    case 'reports':
      return "Ask questions about your saved reports and analyses.";
    
    case 'comparison':
      return "Ask me to compare these properties or analyze the differences.";
    
    default:
      return "Ask me anything about real estate investing.";
  }
};

export const getContextSuggestions = (context: ComposerContext, data?: any): Array<{ icon: string; text: string; query: string }> => {
  switch (context) {
    case 'chat':
      // Chat uses main Composer, not InlineComposer
      return [];
    
    case 'property-detail':
      return [
        { icon: '💵', text: 'Cash flow?', query: `What's the estimated cash flow for ${data?.address}?` },
        { icon: '🏘️', text: 'Nearby comps', query: `Show rental comps near ${data?.address}` },
        { icon: '⚖️', text: 'Compare', query: `Compare this to similar properties` },
        { icon: '📋', text: 'Full analysis', query: `Give me a complete investment analysis` },
      ];
    
    case 'portfolio':
      return [
        { icon: '🏆', text: 'Top performers', query: 'Which properties are performing best?' },
        { icon: '💰', text: 'Total cash flow', query: 'What\'s my total monthly cash flow?' },
        { icon: '📈', text: 'Growth', query: 'How has my portfolio grown this year?' },
        { icon: '⚠️', text: 'Risk check', query: 'Are there any risks in my portfolio?' },
      ];
    
    case 'market-analysis':
      return [
        { icon: '📍', text: 'Best neighborhoods', query: `What are the best neighborhoods in ${data?.market}?` },
        { icon: '💸', text: 'Price trends', query: `How are prices trending in ${data?.market}?` },
        { icon: '🎯', text: 'Opportunities', query: `What are the best opportunities right now?` },
        { icon: '📊', text: 'Market stats', query: `Show me market statistics for ${data?.market}` },
      ];
    
    case 'reports':
      return [
        { icon: '📋', text: 'Recent reports', query: 'Show my recent investment reports' },
        { icon: '🔍', text: 'Compare reports', query: 'Compare my last two property analyses' },
        { icon: '📤', text: 'Export', query: 'How do I export this report?' },
      ];
    
    case 'comparison':
      return [
        { icon: '⚖️', text: 'Which is better?', query: 'Which property is the better investment?' },
        { icon: '💰', text: 'Cash flow compare', query: 'Compare the cash flows' },
        { icon: '🎯', text: 'Best ROI', query: 'Which has the best ROI?' },
      ];
    
    default:
      return [
        { icon: '🏠', text: 'Find properties', query: 'Find properties for me' },
        { icon: '📊', text: 'Market trends', query: 'Show market trends' },
      ];
  }
};
