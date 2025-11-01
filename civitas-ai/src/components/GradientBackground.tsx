import React from 'react';

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`min-h-screen w-full relative overflow-hidden ${className}`}
    >
      {/* Multi-layer animated gradient background */}
      <div className="absolute inset-0">
        {/* Base gradient layer */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 25%, #2563eb 50%, #06b6d4 75%, #10b981 100%)',
            opacity: 0.9
          }}
        />
        
        {/* Animated gradient orbs for depth */}
        <div 
          className="absolute top-0 -left-1/4 w-3/4 h-3/4 rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
            animationDuration: '8s'
          }}
        />
        <div 
          className="absolute bottom-0 -right-1/4 w-3/4 h-3/4 rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
            animationDuration: '10s',
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)',
            animationDuration: '12s',
            animationDelay: '4s'
          }}
        />
      </div>
      
      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
