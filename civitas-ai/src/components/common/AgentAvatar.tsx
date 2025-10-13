import React from 'react';

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
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* Background Circle */}
        <circle cx="50" cy="50" r="48" fill="url(#avatarGradient)" />
        
        {/* Gradients */}
        <defs>
          <radialGradient id="avatarGradient">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </radialGradient>
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fcd6a8" />
            <stop offset="100%" stopColor="#f4a460" />
          </linearGradient>
        </defs>

        {/* Head */}
        <ellipse cx="50" cy="45" rx="18" ry="22" fill="url(#skinGradient)" />
        
        {/* Hair */}
        <path 
          d="M 32 35 Q 32 25, 50 23 Q 68 25, 68 35 L 68 40 Q 65 30, 50 28 Q 35 30, 32 40 Z" 
          fill="#2c1810"
        />
        
        {/* Eyes - simplified friendly look */}
        <circle cx="42" cy="42" r="2" fill="#1f2937" />
        <circle cx="58" cy="42" r="2" fill="#1f2937" />
        
        {/* Small smile - subtle and professional */}
        <path 
          d="M 42 50 Q 50 52, 58 50" 
          stroke="#1f2937" 
          strokeWidth="1.5" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Suit Jacket */}
        <path 
          d="M 25 70 L 30 60 L 35 58 Q 50 55, 65 58 L 70 60 L 75 70 L 75 95 L 25 95 Z" 
          fill="#1e3a8a"
        />
        
        {/* Shirt/Collar */}
        <path 
          d="M 35 58 L 40 65 L 45 62 Q 50 60, 55 62 L 60 65 L 65 58 Q 50 56, 35 58" 
          fill="white"
        />
        
        {/* Tie */}
        <path 
          d="M 48 62 L 47 75 L 50 78 L 53 75 L 52 62 Q 50 63, 48 62" 
          fill="#b91c1c"
        />
        
        {/* Lapel pin - house icon */}
        <circle cx="62" cy="68" r="3" fill="#fbbf24" />
        <path 
          d="M 60 69 L 62 67 L 64 69 L 64 70 L 60 70 Z" 
          fill="#1e3a8a"
          strokeWidth="0.3"
        />
      </svg>
    </div>
  );
};
