import React from 'react';
import { AgentAvatar } from '../common/AgentAvatar';

export const LoadingBubble: React.FC = () => (
  <div className="flex gap-3 mb-3 animate-slide-in justify-start">
    {/* AI Agent Avatar with pulse */}
    <div className="flex-shrink-0 pt-1 relative">
      <AgentAvatar size="md" />
      <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse" style={{ animationDuration: '2s' }} />
    </div>
    
    {/* STR Intelligence - Enhanced glassmorphic loading card */}
    <div className="max-w-[75%] relative">
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 rounded-2xl rounded-tl-md overflow-hidden">
        <div 
          className="absolute inset-0 -translate-x-full animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.1), transparent)',
            animationDuration: '2s',
            animationIterationCount: 'infinite'
          }}
        />
      </div>
      
      <div className="relative px-4 py-3.5 rounded-2xl rounded-tl-md backdrop-blur-2xl bg-gradient-to-br from-white/[0.10] to-white/[0.06] border border-cyan-400/20 shadow-xl shadow-cyan-500/10">
        {/* Animated thinking dots with STR context */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span 
              className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 animate-bounce shadow-lg shadow-cyan-400/50"
              style={{ animationDuration: '1s', animationDelay: '0s' }}
            />
            <span 
              className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 animate-bounce shadow-lg shadow-blue-400/50" 
              style={{ animationDuration: '1s', animationDelay: '0.15s' }}
            />
            <span 
              className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 animate-bounce shadow-lg shadow-purple-400/50" 
              style={{ animationDuration: '1s', animationDelay: '0.3s' }}
            />
          </div>
          <span className="text-sm text-white/85 font-medium flex items-center gap-1.5">
            <span className="inline-block">Analyzing STR opportunities</span>
            <span className="text-cyan-300 animate-pulse">🏡</span>
          </span>
        </div>
      </div>
    </div>
  </div>
);
