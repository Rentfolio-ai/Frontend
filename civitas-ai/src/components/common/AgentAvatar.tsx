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

  return (
    <div className={`${sizeClasses[size]} ${className} flex-shrink-0 relative group/avatar`}>
      {/* Outer glow ring - animated on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent-from to-accent-to rounded-full opacity-0 group-hover/avatar:opacity-60 blur-md transition-opacity duration-500 animate-gradient"></div>
      
      {/* Main avatar container */}
      <div 
        className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/20 shadow-glow group-hover/avatar:ring-primary/40 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        
        {/* Avatar SVG */}
        <AgentAvatarSvg className="w-full h-full relative z-10" />
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover/avatar:translate-x-full transition-transform duration-1000"></div>
      </div>
      
      {/* Status indicator - online/active */}
      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white/90 dark:ring-background shadow-sm ${base}`}>
        <div className={`absolute inset-0 rounded-full opacity-80 ${glow} ${pulse ? 'animate-pulse' : ''}`}></div>
      </div>
    </div>
  );
};