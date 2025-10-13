import React from 'react';
import { AgentAvatar } from '../common/AgentAvatar';

export const LoadingBubble: React.FC = () => (
  <div className="flex gap-3 mb-6 animate-slide-in justify-start">
    {/* AI Agent Avatar */}
    <AgentAvatar size="sm" />
    <div className="max-w-[80%]">
      <div className="px-4 py-3 rounded-2xl bg-surface border border-border flex items-center gap-2">
        <span className="text-body text-foreground/70">Thinking</span>
        <span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse" />
        <span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse delay-100" />
        <span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse delay-200" />
      </div>
    </div>
  </div>
);
