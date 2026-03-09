// FILE: src/components/chat/AIConfidenceMeter.tsx
/**
 * AI Confidence Meter - Week 2 Feature
 * 
 * Shows how confident the AI is in its response.
 * Builds trust by being transparent about certainty.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AIConfidenceMeterProps {
  confidence: number; // 0-100
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AIConfidenceMeter: React.FC<AIConfidenceMeterProps> = ({
  confidence,
  label = 'AI Confidence',
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const getColor = (conf: number) => {
    if (conf >= 90) return {
      gradient: 'from-green-500 to-emerald-500',
      text: 'text-green-400',
      bg: 'bg-green-500/20'
    };
    if (conf >= 70) return {
      gradient: 'from-blue-500 to-cyan-500',
      text: 'text-blue-400',
      bg: 'bg-blue-500/20'
    };
    if (conf >= 50) return {
      gradient: 'from-yellow-500 to-orange-500',
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/20'
    };
    return {
      gradient: 'from-red-500 to-rose-500',
      text: 'text-red-400',
      bg: 'bg-red-500/20'
    };
  };
  
  const getLabel = (conf: number) => {
    if (conf >= 90) return 'Very High';
    if (conf >= 70) return 'High';
    if (conf >= 50) return 'Medium';
    return 'Low';
  };
  
  const getIcon = (conf: number) => {
    if (conf >= 70) return <TrendingUp className="w-4 h-4" />;
    if (conf >= 50) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };
  
  const colors = getColor(confidence);
  const heightMap = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };
  const textSizeMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Label */}
      <span className={`${textSizeMap[size]} text-muted-foreground whitespace-nowrap`}>
        {label}:
      </span>
      
      {/* Progress bar */}
      <div className={`flex-1 ${heightMap[size]} bg-black/8 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${colors.gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      {/* Percentage with icon */}
      <div className={`flex items-center gap-1.5 ${colors.bg} px-2 py-1 rounded-full`}>
        {showIcon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className={colors.text}
          >
            {getIcon(confidence)}
          </motion.div>
        )}
        
        <motion.span
          className={`${textSizeMap[size]} font-bold ${colors.text}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {confidence}%
        </motion.span>
        
        <span className={`${textSizeMap[size]} text-muted-foreground ml-1`}>
          {getLabel(confidence)}
        </span>
      </div>
    </div>
  );
};
