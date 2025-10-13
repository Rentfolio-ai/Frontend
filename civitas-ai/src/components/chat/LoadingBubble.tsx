import React from 'react';
import { AgentAvatar } from '../common/AgentAvatar';

export const LoadingBubble: React.FC = () => (
  <div className="flex gap-4 mb-6 animate-slide-in justify-start">
    {/* AI Agent Avatar with timestamp placeholder */}
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <AgentAvatar size="md" />
      <div 
        className="text-xs font-medium whitespace-nowrap"
        style={{ color: '#5A6473', fontFamily: 'Inter, sans-serif' }}
      >
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
    
    {/* Frosted glass thinking bubble */}
    <div className="flex-1 max-w-3xl">
      <div 
        className="px-6 py-4 rounded-2xl backdrop-blur-md flex items-center gap-2"
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <span 
          className="text-base font-medium"
          style={{ color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}
        >
          Thinking
        </span>
        <span 
          className="inline-block w-0.5 h-5 ml-1 animate-pulse rounded-full"
          style={{ background: 'linear-gradient(135deg, #00B2FF 0%, #00C6AE 100%)' }}
        />
        <span 
          className="inline-block w-0.5 h-5 ml-1 animate-pulse rounded-full" 
          style={{ background: 'linear-gradient(135deg, #00B2FF 0%, #00C6AE 100%)', animationDelay: '0.2s' }}
        />
        <span 
          className="inline-block w-0.5 h-5 ml-1 animate-pulse rounded-full" 
          style={{ background: 'linear-gradient(135deg, #00B2FF 0%, #00C6AE 100%)', animationDelay: '0.4s' }}
        />
      </div>
    </div>
  </div>
);
