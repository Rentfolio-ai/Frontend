import React from 'react';
import { AgentAvatar } from '../common/AgentAvatar';

export const LoadingBubble: React.FC = () => (
  <div className="flex gap-4 mb-6 animate-slide-in justify-start">
    {/* AI Agent Avatar with timestamp placeholder */}
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <AgentAvatar size="md" />
      <div className="text-xs text-white/70 font-medium whitespace-nowrap">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
    
    {/* Glassmorphic thinking bubble */}
    <div className="flex-1 max-w-3xl">
      <div className="px-6 py-4 rounded-3xl bg-white/25 backdrop-blur-md border border-white/40 shadow-xl flex items-center gap-2">
        <span className="text-base text-white">Thinking</span>
        <span className="inline-block w-0.5 h-5 ml-1 bg-white animate-pulse" />
        <span className="inline-block w-0.5 h-5 ml-1 bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
        <span className="inline-block w-0.5 h-5 ml-1 bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  </div>
);
