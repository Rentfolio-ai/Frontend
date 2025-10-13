import React from 'react';

interface SmartSuggestionsProps {
  lastMessage: string;
  onSuggestionClick: (suggestion: string) => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ lastMessage, onSuggestionClick }) => {
  const generateSuggestions = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();
    
    // Market analysis context
    if (lowerMessage.includes('market') || lowerMessage.includes('analysis') || lowerMessage.includes('trends')) {
      return [
        "What's the average occupancy rate?",
        "Show me revenue projections",
        "Compare with nearby markets"
      ];
    }
    
    // Property specific context
    if (lowerMessage.includes('property') || lowerMessage.includes('listing') || lowerMessage.includes('rental')) {
      return [
        "What's the estimated ROI?",
        "Show comparable properties",
        "What are the local STR regulations?"
      ];
    }
    
    // Revenue/ROI context
    if (lowerMessage.includes('revenue') || lowerMessage.includes('roi') || lowerMessage.includes('income')) {
      return [
        "Break down the expenses",
        "Show seasonal variations",
        "What's the cap rate?"
      ];
    }
    
    // Location context
    if (lowerMessage.includes('location') || lowerMessage.includes('neighborhood') || lowerMessage.includes('area')) {
      return [
        "What amenities are nearby?",
        "Show crime statistics",
        "What's the tourism activity?"
      ];
    }
    
    // Regulations context
    if (lowerMessage.includes('regulation') || lowerMessage.includes('permit') || lowerMessage.includes('legal')) {
      return [
        "What are the permit requirements?",
        "Are there occupancy limits?",
        "What are the tax implications?"
      ];
    }
    
    // Investment/strategy context
    if (lowerMessage.includes('invest') || lowerMessage.includes('strategy') || lowerMessage.includes('portfolio')) {
      return [
        "What's my best market entry point?",
        "Show long-term growth projections",
        "Compare investment strategies"
      ];
    }
    
    // Default suggestions
    return [
      "Show me top-performing properties",
      "Analyze a specific market",
      "What should I know about STR investing?"
    ];
  };

  const suggestions = generateSuggestions(lastMessage);

  return (
    <div className="px-6 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Suggested Follow-ups</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400/50 text-white text-sm transition-all duration-200 backdrop-blur-sm hover:shadow-lg hover:shadow-cyan-500/20"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
