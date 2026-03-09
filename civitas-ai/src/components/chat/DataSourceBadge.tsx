// FILE: src/components/chat/DataSourceBadge.tsx
/**
 * Data Source Badge - Week 2 Feature
 * 
 * Shows where data comes from, building credibility and trust.
 * Expandable to show more details about the data source.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Wifi, CheckCircle, Clock } from 'lucide-react';

interface DataSourceBadgeProps {
  source: string;
  dataCount?: number;
  status?: 'live' | 'cached' | 'recent';
  lastUpdated?: Date;
  className?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  source,
  dataCount,
  status = 'live',
  lastUpdated,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getStatusInfo = () => {
    switch (status) {
      case 'live':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          icon: <Wifi className="w-3 h-3" />,
          label: 'Live'
        };
      case 'recent':
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          icon: <Clock className="w-3 h-3" />,
          label: 'Recent'
        };
      case 'cached':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          icon: <CheckCircle className="w-3 h-3" />,
          label: 'Cached'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Badge */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/8 hover:border-black/12 transition-colors cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Database className="w-3 h-3 text-blue-400" />
        
        <span className="text-xs text-foreground/70 font-medium">
          {source}
        </span>
        
        {/* Status dot */}
        {status === 'live' && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-green-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* Tooltip on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 rounded-lg bg-black/95 backdrop-blur-xl border border-black/12 shadow-xl z-50 min-w-[200px]"
          >
            <div className="text-xs text-foreground/80 space-y-2">
              {/* Source info */}
              <div>
                <div className="font-bold text-foreground mb-1">Data Source</div>
                <div className="text-foreground/70">{source}</div>
              </div>
              
              {/* Status */}
              <div className="flex items-center justify-between pt-2 border-t border-black/8">
                <span className="text-muted-foreground">Status:</span>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${statusInfo.bgColor}`}>
                  <div className={statusInfo.color}>
                    {statusInfo.icon}
                  </div>
                  <span className={`${statusInfo.color} font-medium`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
              
              {/* Last updated */}
              {lastUpdated && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Updated:</span>
                  <span>{lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            
            {/* Tooltip arrow */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/95 border-l border-t border-black/12 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
