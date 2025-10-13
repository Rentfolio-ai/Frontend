import React from 'react';

export const LoadingBubble: React.FC = () => (
  <div className="flex gap-3 mb-3 animate-slide-in justify-start px-6">
    {/* iMessage style thinking bubble */}
    <div className="max-w-[70%]">
      <div 
        className="px-5 py-3.5 rounded-[22px] rounded-bl-md backdrop-blur-lg flex items-center gap-1.5"
        style={{
          background: 'rgba(235, 238, 241, 0.95)',
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
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
