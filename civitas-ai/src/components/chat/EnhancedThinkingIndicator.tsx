// FILE: src/components/chat/EnhancedThinkingIndicator.tsx
/**
 * Enhanced Thinking Indicator with modern animations
 * Shows AI processing with tool completions and smooth animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, Loader2, ChevronDown, ChevronUp, Zap, X } from 'lucide-react';
import type { ThinkingState, CompletedTool } from '@/types/stream';
import '../../styles/llm-theme.css';

interface EnhancedThinkingIndicatorProps {
  thinking: ThinkingState | null;
  completedTools?: CompletedTool[];
  className?: string;
  onCancel?: () => void;
  showDetails?: boolean;
}

export const EnhancedThinkingIndicator: React.FC<EnhancedThinkingIndicatorProps> = ({
  thinking,
  completedTools = [],
  className = '',
  onCancel,
  showDetails = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  // Track elapsed time
  useEffect(() => {
    if (thinking && !startTimeRef.current) {
      startTimeRef.current = Date.now();
      setElapsedSeconds(0);
    } else if (!thinking) {
      startTimeRef.current = null;
      setElapsedSeconds(0);
    }
  }, [thinking]);

  useEffect(() => {
    if (!thinking) return;
    
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [thinking]);

  if (!thinking) return null;

  const displayThinking: ThinkingState = thinking || { status: 'Thinking...' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative rounded-xl overflow-hidden ${className}`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 animated-gradient" />
      
      {/* Content */}
      <div className="relative p-4 backdrop-blur-sm">
        {/* Main thinking status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {/* Animated brain icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="flex-shrink-0"
            >
              <Brain className="w-5 h-5 text-purple-400" />
            </motion.div>
            
            {/* Status text */}
            <div className="flex-1">
              <span className="text-sm text-white/80 font-medium">
                {displayThinking.status || 'Thinking...'}
              </span>
            </div>
            
            {/* Animated dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-purple-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            {/* Elapsed time */}
            <span className="text-xs text-white/40 font-mono">
              {elapsedSeconds}s
            </span>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {completedTools.length > 0 && showDetails && (
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white/60" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60" />
                )}
              </motion.button>
            )}
            
            {onCancel && (
              <motion.button
                onClick={onCancel}
                className="p-1 rounded hover:bg-red-500/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4 text-red-400" />
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Completed tools (compact view) */}
        {completedTools.length > 0 && !isExpanded && (
          <motion.div 
            className="mt-3 flex flex-wrap gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.2 }}
          >
            {completedTools.slice(-3).map((tool, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30"
              >
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-300 font-medium">
                  {getToolDisplayName(tool)}
                </span>
              </motion.div>
            ))}
            {completedTools.length > 3 && (
              <span className="text-xs text-white/40 px-2 py-1">
                +{completedTools.length - 3} more
              </span>
            )}
          </motion.div>
        )}
        
        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && completedTools.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              <div className="text-xs text-white/50 font-medium uppercase tracking-wide mb-2">
                Completed Steps ({completedTools.length})
              </div>
              {completedTools.map((tool, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {/* Step number */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  
                  {/* Tool info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 font-medium truncate">
                      {getToolDisplayName(tool)}
                    </div>
                    {getToolDataPreview(tool) && (
                      <div className="text-xs text-white/50 mt-0.5">
                        {getToolDataPreview(tool)}
                      </div>
                    )}
                  </div>
                  
                  {/* Success checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 + 0.2, type: "spring" }}
                    className="flex-shrink-0"
                  >
                    <Check className="w-5 h-5 text-green-400" />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Helper functions
function getToolDisplayName(tool: CompletedTool): string {
  const name = tool.name || tool.tool || 'Unknown';
  
  // Make tool names more readable
  const nameMap: Record<string, string> = {
    'scout_properties': 'Property Search',
    'analyze_property': 'Property Analysis',
    'calculate_roi': 'ROI Calculation',
    'market_analysis': 'Market Analysis',
    'compliance_check': 'Compliance Check',
    'get_property_data': 'Fetch Property Data',
    'search_properties': 'Search Properties',
  };
  
  return nameMap[name] || name.split('_').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
}

function getToolDataPreview(tool: CompletedTool): string | null {
  if (!tool.data) return null;
  
  // Handle different data structures
  if (Array.isArray(tool.data)) {
    const count = tool.data.length;
    if (count === 0) return null;
    
    // Try to identify what kind of items
    const toolName = (tool.tool || tool.name || '').toLowerCase();
    if (toolName.includes('property') || toolName.includes('scout') || toolName.includes('search')) {
      return `${count} ${count === 1 ? 'property' : 'properties'} found`;
    }
    return `${count} ${count === 1 ? 'result' : 'results'}`;
  }
  
  // Handle object with count/total
  if (typeof tool.data === 'object') {
    const data = tool.data as any;
    if (data.count !== undefined) return `${data.count} found`;
    if (data.total !== undefined) return `${data.total} total`;
    if (data.properties?.length) return `${data.properties.length} properties`;
    if (data.results?.length) return `${data.results.length} results`;
  }
  
  return null;
}
