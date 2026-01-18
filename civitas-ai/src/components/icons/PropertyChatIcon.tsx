// Custom icon: House silhouette integrated with chat bubble
// Represents AI-powered real estate conversations

import React from 'react';

interface PropertyChatIconProps {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const PropertyChatIcon: React.FC<PropertyChatIconProps> = ({ 
  className = '', 
  size = 24,
  style
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* Chat bubble base */}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
      
      {/* House roof integrated into bubble */}
      <path d="M9 10l3-3 3 3" />
      
      {/* House body */}
      <path d="M9 10v5h6v-5" />
      
      {/* Door */}
      <rect x="11.5" y="12" width="1.5" height="3" fill="currentColor" />
    </svg>
  );
};
