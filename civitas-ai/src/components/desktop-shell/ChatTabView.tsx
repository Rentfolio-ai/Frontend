// FILE: src/components/desktop-shell/ChatTabView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from '../chat/MessageList';
import { Composer, type ComposerRef } from '../chat/Composer';
import { AgentAvatar, type AgentStatus } from '../common/AgentAvatar';
import type { Message } from '../../types/chat';
import { getOnboardingMessage } from '../../services/chatApi';
import { Sparkles, TrendingUp, Search } from 'lucide-react';
import { checkHealth } from '../../services/agentsApi';

interface ChatTabViewProps {
  messages: Message[];
  isLoading: boolean;
  userName?: string;
  selectedState?: string;
  onSendMessage: (message: string) => void;
  onAction?: (actionValue: string, actionContext?: any) => void;
  onAttach?: (file: File) => void;
  attachment?: File | null;
  onClearAttachment?: () => void;
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
  onAction,
  onAttach,
  attachment,
  onClearAttachment
}) => {
  const [onboardingMessage, setOnboardingMessage] = useState<string>('');
  const [examplePrompts, setExamplePrompts] = useState<ExamplePrompt[]>([]);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'up' | 'down'>('unknown');
  const composerRef = useRef<ComposerRef>(null);

  const agentStatus: AgentStatus = backendStatus === 'down' ? 'offline' : backendStatus === 'unknown' ? 'unknown' : 'online';

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

  useEffect(() => {
    let isMounted = true;

    const fetchHealthStatus = async () => {
      try {
        await checkHealth();
        if (isMounted) {
          setBackendStatus('up');
        }
      } catch (error) {
        if (isMounted) {
          setBackendStatus('down');
        }
      }
    };

    fetchHealthStatus();
    const intervalId = window.setInterval(fetchHealthStatus, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="h-full flex flex-col relative">
      {/* Professional Hero Card - Real Estate Copilot */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          {/* Main header card with enhanced shadow and borders */}
          <div className="relative group">
            {/* Stronger navy glow for elevation */}
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-900/25 via-teal-500/20 to-cyan-500/20 rounded-3xl opacity-70 group-hover:opacity-90 blur-2xl transition-opacity duration-500"></div>
            
            {/* Main card - professional floating panel */}
            <div className="relative flex flex-col items-center text-center gap-4 px-8 py-6 rounded-3xl backdrop-blur-2xl bg-white/90 border-2 border-blue-900/20 shadow-[0_12px_48px_rgba(21,46,95,0.18)] hover:shadow-[0_16px_56px_rgba(21,46,95,0.24)] transition-all duration-300">
              {/* Avatar with professional styling */}
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl"></div>
                <AgentAvatar size="lg" className="relative" status={agentStatus} />
              </div>
              
              <div className="space-y-2">
                {/* Title with professional typography */}
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-blue-900">
                    Civitas AI
                  </h1>
                  <p className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Real Estate Rental Advisor
                  </p>
                </div>
                
                {/* Subtitle */}
                <p className="text-sm font-medium text-slate-600 flex items-center justify-center gap-1.5 mt-3">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  <span>Your trusted copilot for smarter rental investments</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message List - On Subtle Surface Panel */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent via-slate-50/30 to-slate-50/40">
        {messages.length === 0 && !isLoading ? (
          /* Enhanced Empty State */
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 mt-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-lg"></div>
                  <AgentAvatar className="relative" status={agentStatus} />
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                {/* Welcome message card with professional styling */}
                <div className="relative group">
                  {/* Subtle border glow */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-900/15 via-teal-500/10 to-transparent rounded-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                  
                  {/* Message content */}
                  <div className="relative rounded-2xl rounded-tl-sm px-5 py-4 backdrop-blur-xl bg-blue-50/90 border border-blue-900/10 hover:bg-blue-50/95 hover:border-blue-900/15 transition-all duration-300 shadow-lg shadow-blue-900/5">
                    <div className="text-slate-800 leading-relaxed text-[15px] whitespace-pre-line font-medium">
                      {onboardingMessage || 'Loading...'}
                    </div>
                    
                    {/* Enhanced Example Prompt Chips */}
                    {examplePrompts.length > 0 && (
                      <div className="mt-5 space-y-3">
                        <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
                          {examplePrompts.some(p => p.placeholder) 
                            ? 'Try asking (click to edit)' 
                            : 'Popular queries'}
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {examplePrompts.map((prompt, index) => {
                            const isSearch = prompt.category === 'search';
                            const isMarket = prompt.category === 'market';
                            
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  if (prompt.placeholder) {
                                    handlePopulateInput(prompt.text);
                                  } else {
                                    onSendMessage(prompt.text);
                                  }
                                }}
                                className={`
                                  group/chip relative px-4 py-2.5 text-sm font-medium rounded-xl
                                  transition-all duration-300 hover-lift hover-scale active-press
                                  backdrop-blur-sm border shadow-soft hover:shadow-medium
                                  ${isSearch 
                                    ? 'bg-primary/15 hover:bg-primary/25 text-primary border-primary/30 hover:border-primary/50' 
                                    : isMarket
                                    ? 'bg-success/15 hover:bg-success/25 text-success border-success/30 hover:border-success/50'
                                    : 'bg-accent-from/15 hover:bg-accent-from/25 text-accent-from border-accent-from/30 hover:border-accent-from/50'
                                  }
                                  ${prompt.placeholder ? 'italic' : ''}
                                `}
                                title={prompt.placeholder ? 'Click to edit this query' : 'Click to send'}
                              >
                                <span className="flex items-center gap-2">
                                  {isSearch && <Search className="w-3.5 h-3.5" />}
                                  {isMarket && <TrendingUp className="w-3.5 h-3.5" />}
                                  <span>{prompt.label}</span>
                                  {prompt.placeholder && (
                                    <span className="text-xs opacity-70">✏️</span>
                                  )}
                                </span>
                                
                                {/* Hover glow effect */}
                                <div className={`
                                  absolute inset-0 rounded-xl opacity-0 group-hover/chip:opacity-100 transition-opacity duration-300 blur-md -z-10
                                  ${isSearch ? 'bg-primary/20' : isMarket ? 'bg-success/20' : 'bg-accent-from/20'}
                                `}></div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-[11px] text-white/40 font-medium ml-1 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                  <span>Just now</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} onAction={onAction} agentStatus={agentStatus} />
        )}
      </div>
      
      {/* Composer */}
      <div className="flex-shrink-0 px-8 py-6">
        <div className="w-full max-w-6xl mx-auto">
          <Composer 
            ref={composerRef} 
            onSend={onSendMessage} 
            onAttach={onAttach}
            attachment={attachment}
            onClearAttachment={onClearAttachment}
            aria-label="Chat input" 
          />
        </div>
      </div>
    </div>
  );
};