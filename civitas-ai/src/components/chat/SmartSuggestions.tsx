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
        "Generate a detailed market report",
        "Show revenue projections",
        "Compare with nearby markets"
      ];
    }
    
    // Property specific context
    if (lowerMessage.includes('property') || lowerMessage.includes('listing') || lowerMessage.includes('rental')) {
      return [
        "Give insights on this property",
        "Calculate potential ROI",
        "Show comparable properties"
      ];
    }
    
    // Revenue/ROI context
    if (lowerMessage.includes('revenue') || lowerMessage.includes('roi') || lowerMessage.includes('income')) {
      return [
        "Generate an ROI report",
        "Break down the expenses",
        "Show seasonal variations"
      ];
    }
    
    // Location context
    if (lowerMessage.includes('location') || lowerMessage.includes('neighborhood') || lowerMessage.includes('area')) {
      return [
        "Give insights on this area",
        "Show nearby amenities",
        "Analyze local tourism activity"
      ];
    }
    
    // Regulations context
    if (lowerMessage.includes('regulation') || lowerMessage.includes('permit') || lowerMessage.includes('legal')) {
      return [
        "Generate a compliance report",
        "Show permit requirements",
        "Explain tax implications"
      ];
    }
    
    // Investment/strategy context
    if (lowerMessage.includes('invest') || lowerMessage.includes('strategy') || lowerMessage.includes('portfolio')) {
      return [
        "Generate an investment analysis",
        "Give insights on this strategy",
        "Show long-term growth projections"
      ];
    }
    
    // Default suggestions
    return [
      "Generate a market report",
      "Give insights on properties",
      "Calculate ROI for a property"
    ];
  };

  const suggestions = generateSuggestions(lastMessage);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-6 h-6 rounded-lg flex items-center justify-center animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
          }}
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          💡 AI Suggestions
        </span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)' }}></div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="group px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-xl relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(59, 130, 246, 0.25)',
              color: '#1e40af',
              boxShadow: '0px 3px 12px rgba(59, 130, 246, 0.18), 0px 1px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span className="relative z-10">{suggestion}</span>
            {/* Hover gradient overlay */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)'
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
