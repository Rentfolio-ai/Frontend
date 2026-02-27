import React from 'react';

interface AgentAvatarSvgProps {
  className?: string;
}

export const AgentAvatarSvg: React.FC<AgentAvatarSvgProps> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="vasthu-copper" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#D4A27F" />
          <stop offset="100%" stopColor="#C08B5C" />
        </linearGradient>
        <linearGradient id="vasthu-light" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#E8D4C0" />
          <stop offset="100%" stopColor="#D4A27F" />
        </linearGradient>
      </defs>

      {/* V mark — left arm */}
      <polygon points="28,36 40,36 63,82 53,82" fill="url(#vasthu-copper)" />
      {/* V mark — right arm (lighter for depth) */}
      <polygon points="92,36 80,36 57,82 67,82" fill="url(#vasthu-copper)" opacity="0.75" />

      {/* AI sparkle — 4-pointed star */}
      <path
        d="M 60,19 L 62.5,25.5 L 69,28 L 62.5,30.5 L 60,37 L 57.5,30.5 L 51,28 L 57.5,25.5 Z"
        fill="url(#vasthu-light)"
      />

      {/* Foundation line */}
      <line x1="40" y1="88" x2="80" y2="88" stroke="#C08B5C" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
};
