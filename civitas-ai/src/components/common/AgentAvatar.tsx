import React from 'react';
import { AgentAvatarSvg } from './AgentAvatarSvg';

export type AgentStatus = 'online' | 'offline' | 'unknown';

interface AgentAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  status?: AgentStatus;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ size = 'md', className = '', status = 'online' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const statusStyles: Record<AgentStatus, { base: string; glow: string; pulse: boolean }> = {
    online: { base: 'bg-success', glow: 'bg-success', pulse: true },
    offline: { base: 'bg-red-500', glow: 'bg-red-500', pulse: false },
    unknown: { base: 'bg-amber-400', glow: 'bg-amber-400', pulse: true }
  };

  const { base, glow, pulse } = statusStyles[status];
  const statusSize = size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  return (
    <div className={`${sizeClasses[size]} ${className} flex-shrink-0 relative group/avatar`}>
      <div className="absolute -inset-0.5 rounded-full opacity-0 group-hover/avatar:opacity-40 blur-sm transition-opacity duration-300 bg-[#C08B5C]/30" />

      <div
        className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden ring-[1px] ring-white/[0.08] group-hover/avatar:ring-[#C08B5C]/30 transition-all duration-300"
        style={{
          background: 'linear-gradient(145deg, #1e1e24 0%, #111114 100%)',
          boxShadow: '0 1px 8px rgba(0,0,0,0.3)',
        }}
      >
        <AgentAvatarSvg className="w-[70%] h-[70%] relative z-10" />
      </div>

      <div className={`absolute bottom-0 right-0 ${statusSize} rounded-full ring-[1.5px] ring-[#111114] shadow-sm ${base}`}>
        <div className={`absolute inset-0 rounded-full opacity-70 ${glow} ${pulse ? 'animate-pulse' : ''}`} />
      </div>
    </div>
  );
};
