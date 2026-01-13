import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ThinkingState, CompletedTool } from '@/types/stream';

interface ThinkingIndicatorProps {
  thinking: ThinkingState | null;
  completedTools?: CompletedTool[];
  className?: string;
  userQuery?: string;
  onCancel?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  thinking,
  completedTools = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  // Timer logic
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

  if (!thinking && completedTools.length === 0) return null;

  const timeText = elapsedSeconds > 0
    ? `Thought for ${elapsedSeconds} second${elapsedSeconds === 1 ? '' : 's'}`
    : 'Thinking...';

  return (
    <div className="py-2 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
        style={{
          color: '#9ca3af', // gray-400
          background: 'none',
          border: 'none',
          padding: '4px 0',
          cursor: 'pointer'
        }}
      >
        <span>🧠</span>
        <span>{timeText}</span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Expanded Chain of Thought */}
      {isExpanded && (
        <div
          className="mt-2 ml-7 space-y-2 text-sm"
          style={{ color: '#9ca3af' }} // gray-400
        >
          {/* Current step */}
          {thinking?.status && (
            <div style={{ color: '#d1d5db' }}> {/* gray-300 - slightly brighter for active */}
              → {thinking.status}
            </div>
          )}

          {/* Completed steps */}
          {completedTools.map((tool, i) => (
            <div key={i}>
              • {tool.summary || tool.tool}
            </div>
          ))}

          {/* Context if available */}
          {thinking?.filtersApplied && thinking.filtersApplied.length > 0 && (
            <div className="text-xs mt-3 pt-2" style={{
              color: '#6b7280', // gray-500 - dimmer
              borderTop: '1px solid #374151' // gray-700
            }}>
              Context: {thinking.filtersApplied.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
