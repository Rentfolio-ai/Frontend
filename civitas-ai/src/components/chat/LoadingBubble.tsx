import React from 'react';

export const LoadingBubble: React.FC = () => (
  <div className="flex gap-3 mb-6 animate-slide-in justify-start">
    {/* Assistant Avatar */}
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
      <svg
        className="w-4 h-4 text-primary-foreground"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
      </svg>
    </div>
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
