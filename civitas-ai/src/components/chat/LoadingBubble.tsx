import React from 'react';
import { AgentAvatar } from '../common/AgentAvatar';

export const LoadingBubble: React.FC = () => (
  <div className="flex gap-4 mb-4 animate-slide-in justify-start px-6">
    {/* AI Agent Avatar */}
    <div className="flex-shrink-0 pt-1">
      <AgentAvatar size="md" />
    </div>
    
    {/* Real Estate professional analyzing card */}
    <div className="max-w-[68%]">
      <div 
        className="px-6 py-4 rounded-2xl rounded-tl-sm backdrop-blur-2xl shadow-lg animate-pulse-subtle"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          boxShadow: '0px 8px 32px rgba(56, 189, 248, 0.12), 0px 4px 16px rgba(14, 165, 233, 0.08), 0px 2px 8px rgba(125, 211, 252, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          transform: 'translateZ(0)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
              Analyzing...
            </span>
          </div>
        </div>

        {/* Animated thinking dots */}
        <div className="flex items-center gap-2">
          <span 
            className="inline-block w-2.5 h-2.5 rounded-full animate-bounce"
            style={{ background: '#3b82f6', animationDelay: '0s' }}
          />
          <span 
            className="inline-block w-2.5 h-2.5 rounded-full animate-bounce" 
            style={{ background: '#3b82f6', animationDelay: '0.1s' }}
          />
          <span 
            className="inline-block w-2.5 h-2.5 rounded-full animate-bounce" 
            style={{ background: '#3b82f6', animationDelay: '0.2s' }}
          />
          <span className="ml-2 text-sm text-gray-500 font-medium">
            Crunching the numbers
          </span>
        </div>
      </div>
    </div>
  </div>
);
