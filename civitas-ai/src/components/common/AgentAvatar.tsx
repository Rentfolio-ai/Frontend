import React from 'react';
import { AgentAvatarSvg } from './AgentAvatarSvg';

interface AgentAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex-shrink-0`}>
      <div 
        className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--agent-avatar-bg-start) 0%, var(--agent-avatar-bg-end) 100%)',
          boxShadow: '0px 4px 12px rgba(59, 130, 246, 0.25)'
        }}
      >
        <AgentAvatarSvg className="w-full h-full" />
      </div>
    </div>
  );
};
