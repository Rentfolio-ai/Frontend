/**
 * Calm Thinking Indicator
 * 
 * ChatGPT/Claude-style thinking indicator
 * Simple, clean, and calm - just animated dots
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalmThinkingProps {
  status?: string;
}

export const CalmThinking: React.FC<CalmThinkingProps> = ({
  status = 'Thinking',
}) => {
  const [dots, setDots] = useState('');

  // Animate dots (...) like ChatGPT
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Remove trailing "..." from status if present
  const cleanStatus = status.replace(/\.\.\.?$/, '');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 py-3 px-4"
    >
      {/* Animated dots (like ChatGPT) */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/40"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      
      {/* Status text with animated dots */}
      <span className="text-sm text-white/60 font-medium">
        {cleanStatus}{dots}
      </span>
    </motion.div>
  );
};
