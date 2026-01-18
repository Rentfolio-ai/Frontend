// FILE: src/utils/activityStepMapper.ts
/**
 * Activity Step Mapper - Converts stream events to step-by-step activity items
 * Maps existing backend events (thinking, completedTools) to user-friendly steps
 */

import React from 'react';
import type { ThinkingState, CompletedTool } from '@/types/stream';

export type ActivityStepStatus = 'pending' | 'doing' | 'done' | 'error';

export interface ActivityStep {
  id: string;
  label: string;  // 4-8 words max
  status: ActivityStepStatus;
  icon?: string;  // Optional emoji/icon
}

/**
 * Maps stream events to activity steps (max 8-10 steps)
 * Derives steps from:
 * 1. thinking.status keywords (search/retrieve/compare/draft/finalize)
 * 2. completedTools (each tool = 1-2 micro-steps)
 * 3. Stage changes (Search/Analyze/Compile = 2-3 steps per stage)
 */
export function mapStreamToActivitySteps(
  thinking: ThinkingState | null,
  completedTools: CompletedTool[]
): ActivityStep[] {
  const steps: ActivityStep[] = [];
  const maxSteps = 10;
  
  // Step 1: Always start with "Analyzing request"
  steps.push({
    id: 'analyze-request',
    label: 'Analyzing request',
    status: thinking ? 'done' : 'pending',
    icon: '🔍'
  });
  
  // Step 2-N: Map completed tools to steps
  completedTools.forEach((tool, index) => {
    if (steps.length >= maxSteps) return;
    
    const toolLower = (tool.tool || '').toLowerCase();
    const summaryLower = (tool.summary || '').toLowerCase();
    
    // Map tool names to user-friendly labels
    let label = 'Processing data';
    let icon = '⚙️';
    
    if (toolLower.includes('scout') || toolLower.includes('search') || summaryLower.includes('properties')) {
      label = 'Retrieving relevant properties';
      icon = '🏠';
    } else if (toolLower.includes('hunt') || summaryLower.includes('deals')) {
      label = 'Finding investment opportunities';
      icon = '💎';
    } else if (toolLower.includes('valuation') || summaryLower.includes('value')) {
      label = 'Calculating property values';
      icon = '💰';
    } else if (toolLower.includes('pnl') || summaryLower.includes('cash flow')) {
      label = 'Projecting cash flows';
      icon = '📊';
    } else if (toolLower.includes('compliance') || summaryLower.includes('regulation')) {
      label = 'Checking compliance';
      icon = '✅';
    } else if (toolLower.includes('market') || summaryLower.includes('market')) {
      label = 'Analyzing market trends';
      icon = '📈';
    } else if (toolLower.includes('knowledge') || toolLower.includes('search_knowledge')) {
      label = 'Retrieving context';
      icon = '📚';
    }
    
    steps.push({
      id: `tool-${index}`,
      label,
      status: 'done',
      icon
    });
  });
  
  // Add "Comparing scenarios" step if multiple tools completed
  if (completedTools.length >= 2 && steps.length < maxSteps) {
    steps.push({
      id: 'compare-scenarios',
      label: 'Comparing scenarios',
      status: thinking ? 'doing' : 'done',
      icon: '⚖️'
    });
  }
  
  // If currently thinking, add current activity
  if (thinking) {
    const status = (thinking.status || '').toLowerCase();
    
    // Map current thinking status to step
    if (status.includes('draft') || status.includes('compil') || status.includes('generat')) {
      if (steps.length < maxSteps) {
        steps.push({
          id: 'draft-response',
          label: 'Drafting response',
          status: 'doing',
          icon: '✍️'
        });
      }
    } else if (status.includes('analyz') || status.includes('process')) {
      // Already covered by earlier steps, mark last as doing
      if (steps.length > 0 && steps[steps.length - 1].status !== 'doing') {
        steps[steps.length - 1].status = 'doing';
      }
    }
  }
  
  // Final step: "Finalizing output" (pending until done)
  if (steps.length < maxSteps) {
    steps.push({
      id: 'finalize',
      label: 'Finalizing output',
      status: thinking ? 'pending' : 'done',
      icon: '🎯'
    });
  }
  
  // Trim to max steps
  return steps.slice(0, maxSteps);
}

/**
 * Hook to manage activity steps during streaming
 * Maintains step history and updates status as events arrive
 */
export function useActivitySteps(
  thinking: ThinkingState | null,
  completedTools: CompletedTool[]
): ActivityStep[] {
  const [steps, setSteps] = React.useState<ActivityStep[]>([]);
  
  React.useEffect(() => {
    const newSteps = mapStreamToActivitySteps(thinking, completedTools);
    setSteps(newSteps);
  }, [thinking, completedTools]);
  
  return steps;
}
