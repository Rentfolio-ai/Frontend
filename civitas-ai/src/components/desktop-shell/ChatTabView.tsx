// FILE: src/components/desktop-shell/ChatTabView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from '../chat/MessageList';
import { Composer, type ComposerRef } from '../chat/Composer';
import { AgentAvatar } from '../common/AgentAvatar';
import type { Message } from '../../types/chat';
import { getOnboardingMessage } from '../../services/chatApi';

interface ChatTabViewProps {
  messages: Message[];
  isLoading: boolean;
  userName?: string;
  selectedState?: string;
  onSendMessage: (message: string) => void;
  onAction?: (actionValue: string, actionContext?: any) => void;
}

interface ExamplePrompt {
  text: string;
  label: string;
  category: string;
  placeholder?: boolean; // If true, populate input instead of sending
}

export const ChatTabView: React.FC<ChatTabViewProps> = ({
  messages,
  isLoading,
  userName,
  selectedState: _selectedState,
  onSendMessage,
  onAction
}) => {
  const [onboardingMessage, setOnboardingMessage] = useState<string>('');
  const [examplePrompts, setExamplePrompts] = useState<ExamplePrompt[]>([]);
  const composerRef = useRef<ComposerRef>(null);

  const handlePopulateInput = (text: string) => {
    composerRef.current?.setInput(text);
  };

  useEffect(() => {
    // Fetch onboarding message from backend on component mount
    const fetchOnboarding = async () => {
      const data = await getOnboardingMessage(userName);
      setOnboardingMessage(data.message);
      if (data.example_prompts) {
        setExamplePrompts(data.example_prompts);
      }
    };
    fetchOnboarding();
  }, [userName]);

  return (
    <>
      {/* Header - Glassmorphic floating bar */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4 p-4 rounded-2xl backdrop-blur-2xl bg-white/[0.06] border border-white/[0.1] shadow-2xl">
          <AgentAvatar size="lg" />
          <div className="relative">
            <h1 
              className="flex items-center gap-2"
              style={{ 
                fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                letterSpacing: '-0.02em',
                fontWeight: 700
              }}
            >
              <span 
                className="text-3xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.15)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))'
                }}
              >
                Civitas AI
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>–</span>
              <span 
                className="text-2xl font-semibold"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.95) 0%, rgba(147, 197, 253, 0.9) 50%, rgba(96, 165, 250, 0.85) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 12px rgba(103, 232, 249, 0.4)) drop-shadow(0 2px 4px rgba(6, 182, 212, 0.2))'
                }}
              >
                Short-Term Rental Advisor
              </span>
            </h1>
            <p 
              className="text-sm mt-1.5 flex items-center gap-1.5"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                fontWeight: 500,
                letterSpacing: '0.01em',
                color: 'rgba(255, 255, 255, 0.75)'
              }}
            >
              Your AI co-host for smarter STR investments 
              <span className="inline-flex gap-1">
                <span>🏡</span>
                <span>📊</span>
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          /* Empty State - Translucent design */
          <div className="max-w-4xl mx-auto px-4 md:px-8 pt-12">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-shrink-0">
                <AgentAvatar />
              </div>
              <div className="flex-1">
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all duration-200">
                <div className="space-y-3">
                    <div className="text-white/85 leading-relaxed text-sm whitespace-pre-line">
                      {onboardingMessage || 'Loading...'}
                    </div>
                    
                    {/* Example Prompt Chips - Translucent */}
                    {examplePrompts.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-white/50 font-medium">
                          {examplePrompts.some(p => p.placeholder) 
                            ? 'Try asking (click to edit):' 
                            : 'Try asking:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {examplePrompts.map((prompt, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                if (prompt.placeholder) {
                                  handlePopulateInput(prompt.text);
                                } else {
                                  onSendMessage(prompt.text);
                                }
                              }}
                              className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 backdrop-blur-sm ${
                                prompt.category === 'search'
                                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30'
                                  : prompt.category === 'market'
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                                  : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/30'
                              } ${
                                prompt.placeholder ? 'italic' : ''
                              }`}
                              title={prompt.placeholder ? 'Click to edit this query' : 'Click to send'}
                            >
                              {prompt.label}
                              {prompt.placeholder && (
                                <span className="ml-1 text-xs opacity-60">✏️</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-white/30 font-medium mt-2">Just now</div>
              </div>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} onAction={onAction} />
        )}
      </div>
      
      {/* Composer */}
      <div className="flex-shrink-0 px-8 py-6">
        <div className="w-full max-w-6xl mx-auto">
          <Composer ref={composerRef} onSend={onSendMessage} aria-label="Chat input" />
        </div>
      </div>
    </>
  );
};
