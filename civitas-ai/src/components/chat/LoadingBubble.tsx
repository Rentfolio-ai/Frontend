import React from 'react';
import { AgentAvatar } from '../common/AgentAvatar';

export const LoadingBubble: React.FC = () => (
  <div className="flex gap-3 mb-4 animate-slide-in justify-start px-4">
    {/* AI Agent Avatar */}
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <AgentAvatar size="sm" />
      <div 
        className="text-[10px] font-medium whitespace-nowrap text-white/60"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </div>
    </div>
    
    {/* iMessage style thinking bubble */}
    <div className="max-w-[65%]">
      <div 
        className="px-4 py-3 rounded-[20px] rounded-bl-sm backdrop-blur-lg flex items-center gap-1.5"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <span 
          className="inline-block w-2 h-2 rounded-full animate-pulse"
          style={{ background: '#8E8E93' }}
        />
        <span 
          className="inline-block w-2 h-2 rounded-full animate-pulse" 
          style={{ background: '#8E8E93', animationDelay: '0.2s' }}
        />
        <span 
          className="inline-block w-2 h-2 rounded-full animate-pulse" 
          style={{ background: '#8E8E93', animationDelay: '0.4s' }}
        />
      </div>
    </div>
  </div>
);
