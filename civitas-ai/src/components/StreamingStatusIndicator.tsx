/**
 * Production-grade streaming status indicator.
 * 
 * Features:
 * - Smooth animations
 * - Debounced status updates (minimum display time)
 * - Progress bar
 * - Clean, minimal design
 * - Brandable
 */

import { useState, useEffect, useRef } from 'react';
import type { StatusEvent } from '../hooks/useSSEStream';

interface StreamingStatusIndicatorProps {
  status: StatusEvent | null;
  className?: string;
  minDisplayTime?: number; // ms
}

const STATUS_ICONS: Record<string, string> = {
  thinking: '🤔',
  retrieving: '🔍',
  calling_tool: '🔧',
  writing: '✍️',
  finalizing: '✅'
};

const STATUS_LABELS: Record<string, string> = {
  thinking: 'Thinking',
  retrieving: 'Retrieving information',
  calling_tool: 'Using tools',
  writing: 'Writing response',
  finalizing: 'Finalizing'
};

export function StreamingStatusIndicator({
  status,
  className = '',
  minDisplayTime = 500
}: StreamingStatusIndicatorProps) {
  const [displayStatus, setDisplayStatus] = useState<StatusEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!status) {
      // Status cleared - hide after minimum display time
      const elapsed = Date.now() - lastUpdateRef.current;
      const delay = Math.max(0, minDisplayTime - elapsed);

      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setDisplayStatus(null);
      }, delay);

      return;
    }

    // New status - update immediately or after minimum display time
    const elapsed = Date.now() - lastUpdateRef.current;
    
    if (elapsed < minDisplayTime && displayStatus) {
      // Still showing previous status, wait before updating
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDisplayStatus(status);
        setIsVisible(true);
        lastUpdateRef.current = Date.now();
      }, minDisplayTime - elapsed);
    } else {
      // Update immediately
      setDisplayStatus(status);
      setIsVisible(true);
      lastUpdateRef.current = Date.now();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status, minDisplayTime, displayStatus]);

  if (!isVisible || !displayStatus) {
    return null;
  }

  const icon = STATUS_ICONS[displayStatus.state] || '⚡';
  const label = displayStatus.label || STATUS_LABELS[displayStatus.state] || displayStatus.state;
  const progress = displayStatus.progress;

  return (
    <div
      className={`streaming-status-indicator ${className}`}
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        color: '#1e293b',
        transition: 'all 0.3s ease',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      {/* Icon with pulse animation */}
      <span
        style={{
          fontSize: '20px',
          animation: 'pulse 2s ease-in-out infinite'
        }}
      >
        {icon}
      </span>

      {/* Status text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, marginBottom: '4px' }}>
          {label}
        </div>
        
        {displayStatus.detail && (
          <div
            style={{
              fontSize: '12px',
              color: '#64748b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {displayStatus.detail}
          </div>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <div
            style={{
              marginTop: '8px',
              height: '4px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
                width: `${Math.round(progress * 100)}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function CompactStatusIndicator({
  status,
  className = ''
}: { status: StatusEvent | null; className?: string }) {
  if (!status) return null;

  const icon = STATUS_ICONS[status.state] || '⚡';
  const label = status.label || STATUS_LABELS[status.state] || status.state;

  return (
    <div
      className={`compact-status-indicator ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '12px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fontSize: '13px',
        color: '#3b82f6',
        fontWeight: 500
      }}
    >
      <span style={{ animation: 'pulse 2s ease-in-out infinite' }}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}
