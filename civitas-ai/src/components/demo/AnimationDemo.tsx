// FILE: src/components/demo/AnimationDemo.tsx
import React, { useState } from 'react';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import NotificationDemo from './NotificationDemo';

interface AnimatedBoxProps {
  animation: string;
  title: string;
  delay?: number;
}

const AnimatedBox: React.FC<AnimatedBoxProps> = ({ animation, title, delay }) => {
  const delayClass = delay ? `animation-delay-${delay}` : '';
  
  return (
    <div 
      className={`p-4 rounded-md bg-primary/10 border border-primary/20 ${animation} ${delayClass}`}
    >
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">Animation: {animation}</p>
    </div>
  );
};

export const AnimationDemo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  // Reset animations to demonstrate them again
  const resetAnimations = () => {
    setIsVisible(false);
    setTimeout(() => {
      setAnimationKey(prev => prev + 1);
      setIsVisible(true);
    }, 100);
  };

  return (
    <div className="space-y-8">
      {/* Notification Demo */}
      <NotificationDemo />
      
      {/* General Animation Demo */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Animation Utilities</h2>
          <Button onClick={resetAnimations} variant="outline" size="sm">
            Reset Animations
          </Button>
        </div>
        
        {isVisible && (
          <div key={animationKey} className="space-y-8">
            {/* Fade In Animation */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Fade In</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnimatedBox animation="animate-fade-in" title="No Delay" />
                <AnimatedBox animation="animate-fade-in animation-delay-200" title="200ms Delay" />
                <AnimatedBox animation="animate-fade-in animation-delay-400" title="400ms Delay" />
              </div>
            </div>
            
            {/* Slide In Animation */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Slide In</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatedBox animation="animate-slide-in-left" title="Slide In Left" />
                <AnimatedBox animation="animate-slide-in-right" title="Slide In Right" />
              </div>
            </div>
            
            {/* Scale In Animation */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Scale In</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnimatedBox 
                  animation="animate-scale-in" 
                  title="Normal" 
                />
                <AnimatedBox 
                  animation="animate-scale-in animation-duration-fast" 
                  title="Fast" 
                />
                <AnimatedBox 
                  animation="animate-scale-in animation-duration-slow" 
                  title="Slow" 
                />
              </div>
            </div>
            
            {/* Staggered Animation */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Staggered Animation</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <AnimatedBox animation="animate-fade-in" title="Item 1" />
                <AnimatedBox animation="animate-fade-in animation-delay-100" title="Item 2" />
                <AnimatedBox animation="animate-fade-in animation-delay-200" title="Item 3" />
                <AnimatedBox animation="animate-fade-in animation-delay-300" title="Item 4" />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnimationDemo;