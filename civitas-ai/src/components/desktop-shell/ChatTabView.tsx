import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from '../chat/MessageList';
import { Composer, type ComposerRef } from '../chat/Composer';
import type { Message } from '../../types/chat';
import type { InvestmentStrategy } from '../../types/pnl';
import type { ThinkingState, CompletedTool } from '../../types/stream';
import { checkHealth } from '../../services/agentsApi';
import type { BookmarkedProperty } from '../../types/bookmarks';
import type { ScoutedProperty } from '../../types/backendTools';
import { CiviPropertyCard } from '../chat/CiviPropertyCard';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';

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
  onOpenDealAnalyzer?: (propertyId: string | null, strategy: InvestmentStrategy, purchasePrice?: number, propertyAddress?: string) => void;
  bookmarks?: BookmarkedProperty[];
  onToggleBookmark?: (property: ScoutedProperty) => void;
  onNavigateToReports?: () => void;
  onOpenSidebar?: () => void;
  onNewChat?: () => void;
  // Thinking state
  thinking?: ThinkingState | null;
  completedTools?: CompletedTool[];
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
  onClearAttachment,
  onOpenDealAnalyzer,
  bookmarks,
  onToggleBookmark,
  onNavigateToReports,
  onOpenSidebar,

  thinking,
  completedTools = [],
}) => {
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'up' | 'down'>('unknown');
  const composerRef = useRef<ComposerRef>(null);

  // Voice Assistant Hook
  const { state: voiceState, startListening, stopListening } = useVoiceAssistant();

  const agentStatus = backendStatus === 'down' ? 'offline' : backendStatus === 'unknown' ? 'unknown' : 'online';

  // Mock active property for now (replace with real state later)
  // In a real implementation, this would come from useDesktopShell or a context
  const activeProperty = messages.length > 0 ? {
    address: "4500 Manor Rd",
    city: "Austin, TX",
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    capRate: 5.8,
    cashFlow: 450,
    dscr: 1.25
  } : undefined;

  useEffect(() => {
    let isMounted = true;
    const fetchHealthStatus = async () => {
      try {
        await checkHealth();
        if (isMounted) setBackendStatus('up');
      } catch {
        if (isMounted) setBackendStatus('down');
      }
    };
    fetchHealthStatus();
    const intervalId = window.setInterval(fetchHealthStatus, 60000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleMicClick = () => {
    if (voiceState.status === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="h-screen w-full relative bg-[#020617] overflow-hidden flex flex-col">
      {/* Background Gradients - Green/Emerald Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-600/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Main Layout Area - Flex Row */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* LEFT COLUMN: Main Chat Area (70%) */}
        <div className="flex-1 flex flex-col h-full relative">

          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between z-20 border-b border-white/5 bg-[#020617]/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              {onOpenSidebar && (
                <button
                  onClick={onOpenSidebar}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">ProphetAtlas</h1>
                <p className="text-xs text-white/40 font-medium">Your AI-powered real estate intelligence</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto chat-scroll relative px-4 md:px-6 pb-4">
            <div className="max-w-5xl mx-auto h-full flex flex-col">
              {messages.length === 0 && !isLoading ? (
                /* Empty State - OmniEstate Style */
                <div className="flex-1 flex flex-col items-center justify-start animate-fade-in pt-24 pb-10">

                  {/* Hero Section */}
                  <div className="text-center space-y-6 mb-8">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-blue-500 to-cyan-400 mx-auto shadow-2xl">
                        <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center overflow-hidden">
                          <img src="/assets/civi_avatar_3d.png" alt="ProphetAtlas" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-[#020617] flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-4xl font-bold text-white tracking-tight">
                        ProphetAtlas
                      </h2>
                      <p className="text-lg text-white/60 font-light">
                        Your AI-powered real estate intelligence
                      </p>
                    </div>

                    <p className="text-sm text-white/40 max-w-lg mx-auto leading-relaxed pt-2">
                      Welcome to ProphetAtlas! 🏠✨ I'm your all-knowing real estate intelligence assistant. Ask me anything about properties, markets, investments, and more!
                    </p>
                  </div>

                  {/* Grid Layout Removed */}
                </div>
              ) : (
                /* Message List */
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  onAction={onAction}
                  agentStatus={agentStatus}
                  onOpenDealAnalyzer={onOpenDealAnalyzer}
                  bookmarks={bookmarks}
                  onToggleBookmark={onToggleBookmark}
                  onNavigateToReports={onNavigateToReports}
                  thinking={thinking}
                  completedTools={completedTools}
                  userName={userName}
                />
              )}
            </div>
          </div>

          {/* Composer Area (Flex Child - No Overlap) */}
          <div className="flex-shrink-0 px-4 pt-4 pb-6 bg-[#020617] z-30">
            <div className="max-w-5xl mx-auto w-full">
              <Composer
                ref={composerRef}
                onSend={onSendMessage}
                onAttach={onAttach}
                attachment={attachment}
                onClearAttachment={onClearAttachment}
                onMicClick={handleMicClick}
                isListening={voiceState.status === 'listening'}
                aria-label="Chat input"
              />
              <p className="text-center text-[11px] text-white/20 mt-3">
                CIVI · Powered by ProphetAtlas
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CIVI Property Card (30% - Hidden on Mobile) */}
        <div className="hidden lg:block w-[300px] flex-shrink-0 h-full p-4 pl-0">
          <CiviPropertyCard
            activeProperty={activeProperty}
            isListening={voiceState.status === 'listening'}
            onMicClick={handleMicClick}
            onFindSimilar={() => onSendMessage("Find similar properties")}
            className="h-full shadow-2xl"
          />
        </div>

      </div>
    </div>
  );
};
