import React from 'react';
import { AgentAvatar } from '../common/AgentAvatar';

export const LoadingBubble: React.FC = () => {
  return (
    <div className="flex gap-3 mb-3 animate-slide-in justify-start">
      {/* AI Agent Avatar with professional pulse */}
      <div className="flex-shrink-0 pt-1 relative">
        <AgentAvatar size="md" />
        <div className="absolute inset-0 rounded-full bg-teal-400/15 animate-pulse" style={{ animationDuration: '2s' }} />
      </div>
      
      {/* Real Estate Intelligence - Professional glassmorphic loading card */}
      <div className="relative">
        <div className="relative px-5 py-4 rounded-2xl rounded-tl-sm backdrop-blur-xl bg-blue-50/90 border border-blue-900/10 shadow-lg shadow-blue-900/5">
          {/* Animated thinking dots with real-estate theme */}
          <div className="flex items-center gap-4">
            {/* Fluid Wave Dots */}
            <div className="flex gap-1.5 items-center h-full">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400"
                  style={{
                    animation: 'wave 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </div>

            {/* Simple text - backend will provide actual status */}
            <div className="min-w-[180px]">
              <span className="text-[13px] font-medium text-slate-700 flex items-center gap-2">
                Thinking...
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
