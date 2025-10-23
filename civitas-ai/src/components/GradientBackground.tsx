import React from 'react';

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`min-h-screen w-full ${className}`}
      style={{
        background: 'linear-gradient(135deg, #19002E 0%, #3B0A72 50%, #00C78C 100%)'
      }}
    >
      {children}
    </div>
  );
};
