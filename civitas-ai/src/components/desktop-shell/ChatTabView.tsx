// FILE: src/components/desktop-shell/ChatTabView.tsx
import React from 'react';
import { MessageList } from '../chat/MessageList';
import { Composer } from '../chat/Composer';
import { AgentAvatar } from '../common/AgentAvatar';
import type { Message } from '../../types/chat';

interface ChatTabViewProps {
  messages: Message[];
  isLoading: boolean;
  userName?: string;
  selectedState?: string;
  onSendMessage: (message: string) => void;
}

export const ChatTabView: React.FC<ChatTabViewProps> = ({
  messages,
  isLoading,
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
              className="text-3xl font-bold text-white"
              style={{ 
                fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: 700
              }}
            >
              Civitas AI
            </h1>
            <p 
              className="text-sm text-white/80"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                fontWeight: 500,
                letterSpacing: '0.01em'
              }}
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
                  <div className="space-y-3">
                    <p className="text-gray-800 leading-relaxed text-[15px]">
                      <span className="font-semibold">Hi {userName || 'there'}!</span> 👋
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed text-[15px]">
                      I'm Civitas AI, your short-term rental investment advisor. To get started, just say hi or ask me anything about STR properties!
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
      
      {/* Composer */}
      <div className="flex-shrink-0 px-8 py-6">
        <div className="w-full max-w-6xl mx-auto">
          <Composer onSend={onSendMessage} aria-label="Chat input" />
        </div>
      </div>
    </>
  );
};
