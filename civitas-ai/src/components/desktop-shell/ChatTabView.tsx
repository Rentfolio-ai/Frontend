// FILE: src/components/desktop-shell/ChatTabView.tsx
import React from 'react';
import { MessageList } from '../chat/MessageList';
import { Composer } from '../chat/Composer';
import { SmartSuggestions } from '../chat/SmartSuggestions';
import { AgentAvatar } from '../common/AgentAvatar';
import type { Message } from '../../types/chat';

interface ChatTabViewProps {
  messages: Message[];
  isLoading: boolean;
  showSuggestions: boolean;
  userName?: string;
  selectedState?: string;
  onSendMessage: (message: string) => void;
}

export const ChatTabView: React.FC<ChatTabViewProps> = ({
  messages,
  isLoading,
  showSuggestions,
  userName,
  selectedState,
  onSendMessage
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <AgentAvatar size="lg" />
          <div>
            <h1 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Civitas AI
            </h1>
            <p 
              className="text-xs text-white/75"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              Real Estate Advisor
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          /* Empty State */
          <div className="max-w-4xl mx-auto px-4 md:px-8 pt-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <AgentAvatar />
              </div>
              <div className="flex-1">
                <div 
                  className="rounded-2xl rounded-tl-sm p-6 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <div className="space-y-4">
                    <p className="text-gray-800 leading-relaxed text-[15px]">
                      <span className="font-semibold">Hi {userName || 'there'}, I'm really glad you're here.</span>
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed text-[15px]">
                      {selectedState 
                        ? `I'm here to help you find and evaluate short-term rental properties in ${selectedState}. Here's what I can do for you:`
                        : `I'm here to help you find and evaluate short-term rental properties. Here's what I can do for you:`
                      }
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed text-[15px]">
                      <span className="font-medium">🏡 Find Properties:</span> Tell me your criteria (location, price range, number of bedrooms) and I'll help you discover investment-worthy short-term rental properties.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed text-[15px]">
                      <span className="font-medium">📊 Generate ROI Scores:</span> I'll analyze each property and provide an ROI grade (A, B, C, or D) based on potential returns, market demand, occupancy rates, and investment viability.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed text-[15px]">
                      <span className="font-medium">📈 Create Reports:</span> Once we've analyzed properties, I can generate comprehensive investment reports that you'll find in your Reports tab, ready to download and share.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed text-[15px]">
                      Let's get started! Try asking me to "Find properties in [city]" or "Show me STR investments under $500k."
                    </p>
                  </div>
                </div>
                <div className="text-xs text-white/60 mt-2 ml-1">Just now</div>
              </div>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>
      
      {/* Smart Suggestions */}
      <div 
        className="flex-shrink-0 transition-all duration-300 px-0 md:px-8" 
        style={{ 
          minHeight: showSuggestions ? 'auto' : '0px', 
          opacity: showSuggestions ? 1 : 0,
          overflow: showSuggestions ? 'visible' : 'hidden'
        }}
      >
        {showSuggestions && messages.length > 0 && (
          <SmartSuggestions 
            lastMessage={messages[messages.length - 1]?.content || ''}
            onSuggestionClick={onSendMessage}
          />
        )}
      </div>
      
      {/* Composer */}
      <div className="flex-shrink-0 px-8 py-6">
        <div className="w-full max-w-6xl mx-auto">
          <Composer onSend={onSendMessage} aria-label="Chat input" />
        </div>
      </div>
    </>
  );
};
