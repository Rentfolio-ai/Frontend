// FILE: src/components/chat/AIReasoningPanel.tsx
/**
 * AI Reasoning Panel - Week 2 Feature
 * 
 * Shows users HOW the AI thinks, building transparency and trust.
 * Expandable panel that reveals the step-by-step reasoning process.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, Check, Zap, AlertCircle } from 'lucide-react';
import '../../styles/llm-theme.css';

export interface ReasoningStep {
  title: string;
  description: string;
  tool?: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  confidence?: number;
}

interface AIReasoningPanelProps {
  steps: ReasoningStep[];
  totalFactors?: number;
  className?: string;
}

export const AIReasoningPanel: React.FC<AIReasoningPanelProps> = ({
  steps,
  totalFactors,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const progressPercent = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  
  // Find current step to show in collapsed view
  const runningStep = steps.find(s => s.status === 'running');
  const currentStep = runningStep || steps[steps.length - 1]; // Show running step, or last step if all complete
  const isProcessing = completedSteps < steps.length;
  
  return (
    <motion.div
      className={`glass rounded-xl overflow-hidden border border-white/10 ${className}`}
      initial={false}
      animate={{ height: isExpanded ? 'auto' : 60 }}
      layout
    >
      {/* Compact Header (always visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.div
            animate={{
              rotate: isExpanded || isProcessing ? [0, 360] : 0,
              scale: isExpanded ? 1 : [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 2, repeat: isProcessing && !isExpanded ? Infinity : 0 },
              scale: { duration: 2, repeat: isProcessing && !isExpanded ? Infinity : 0 }
            }}
          >
            <Brain className="w-5 h-5 text-purple-400" />
          </motion.div>
          
          <div className="text-left flex-1 min-w-0">
            <div className="text-sm text-white/90 font-medium">
              AI Reasoning Process
            </div>
            
            {/* 🚀 NEW: Show current step summary when collapsed */}
            {!isExpanded && currentStep && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-white/60 mt-0.5 flex items-center gap-2"
              >
                {isProcessing && (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-blue-400"
                  >
                    •
                  </motion.span>
                )}
                <span className="truncate">
                  {currentStep.title}
                  {currentStep.status === 'running' && '...'}
                </span>
              </motion.div>
            )}
            
            {/* Show step count when expanded */}
            {isExpanded && (
              <div className="text-xs text-white/50 mt-0.5">
                {completedSteps}/{steps.length} steps complete
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Progress indicator */}
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Expand/collapse icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4 text-white/50" />
          </motion.div>
        </div>
      </button>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-4 space-y-3 border-t border-white/10"
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {/* Step number */}
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 text-sm flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                
                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-white/90 font-medium">
                      {step.title}
                    </div>
                    
                    {/* Status badge */}
                    {step.status === 'running' && (
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex-shrink-0 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs"
                      >
                        Running...
                      </motion.div>
                    )}
                    
                    {step.status === 'error' && (
                      <div className="flex-shrink-0 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Error
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-white/60 mt-0.5">
                    {step.description}
                  </div>
                  
                  {/* Tool used badge */}
                  {step.tool && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                      <Zap className="w-3 h-3" />
                      {step.tool}
                    </div>
                  )}
                </div>
                
                {/* Success checkmark */}
                {step.status === 'complete' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.2, type: 'spring' }}
                    className="flex-shrink-0"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
