/**
 * SSE Streaming Playground
 * 
 * Debug and test the production-grade SSE streaming implementation.
 * Features:
 * - Live event log
 * - Connection status
 * - Message input
 * - Event statistics
 * - Reconnection testing
 */

import { useState, useRef, useEffect } from 'react';
import { useSSEStream, type StreamEvent } from '../hooks/useSSEStream';
import { StreamingStatusIndicator } from '../components/StreamingStatusIndicator';

export function SSEPlayground() {
  const [message, setMessage] = useState('Find properties in Austin under $400k');
  const [events, setEvents] = useState<Array<{ timestamp: number; event: StreamEvent }>>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  const sse = useSSEStream({
    onEvent: (event) => {
      setEvents(prev => [...prev, { timestamp: Date.now(), event }]);
    },
    onConnect: () => {
      console.log('[Playground] Connected');
    },
    onDisconnect: () => {
      console.log('[Playground] Disconnected');
    },
    onError: (error) => {
      console.error('[Playground] Error:', error);
    },
    heartbeatTimeout: 30000,
    maxReconnectAttempts: 3
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, autoScroll]);

  const handleSend = () => {
    if (!message.trim()) return;

    // Clear previous events
    setEvents([]);

    // Start stream
    sse.startStream('/api/stream/v2', {
      message: message.trim(),
      mode: 'smart',
      temperature: 0.2
    });
  };

  const handleStop = () => {
    sse.stopStream();
  };

  const clearEvents = () => {
    setEvents([]);
  };

  // Calculate stats
  const stats = {
    total: events.length,
    messageStart: events.filter(e => e.event.type === 'message_start').length,
    status: events.filter(e => e.event.type === 'status').length,
    delta: events.filter(e => e.event.type === 'delta' || e.event.type === 'answer.delta').length,
    toolCall: events.filter(e => e.event.type === 'tool_call').length,
    toolResult: events.filter(e => e.event.type === 'tool_result').length,
    messageEnd: events.filter(e => e.event.type === 'message_end' || e.event.type === 'done').length,
    error: events.filter(e => e.event.type === 'error').length
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px' }}>SSE Streaming Playground</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Test production-grade Server-Sent Events streaming with robust parsing, heartbeats, and reconnection.
      </p>

      {/* Connection Status */}
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: sse.isConnected ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${sse.isConnected ? '#86efac' : '#fca5a5'}`,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: sse.isConnected ? '#22c55e' : '#ef4444',
            animation: sse.isStreaming ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        />
        <div style={{ flex: 1 }}>
          <strong>{sse.isConnected ? 'Connected' : 'Disconnected'}</strong>
          {sse.isStreaming && <span style={{ marginLeft: '8px', color: '#64748b' }}>Streaming...</span>}
          {sse.error && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{sse.error}</div>}
        </div>
        {sse.messageId && (
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Message ID: <code>{sse.messageId}</code>
          </div>
        )}
      </div>

      {/* Current Status Indicator */}
      {sse.currentStatus && (
        <StreamingStatusIndicator status={sse.currentStatus} className="mb-4" />
      )}

      {/* Input Controls */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !sse.isStreaming && handleSend()}
            placeholder="Enter your message..."
            disabled={sse.isStreaming}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '14px'
            }}
          />
          {sse.isStreaming ? (
            <button
              onClick={handleStop}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: message.trim() ? '#3b82f6' : '#cbd5e1',
                color: 'white',
                fontWeight: 500,
                cursor: message.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Send
            </button>
          )}
          <button
            onClick={clearEvents}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          Auto-scroll to latest event
        </label>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}
      >
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#1e293b' }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          </div>
        ))}
      </div>

      {/* Response Content */}
      {sse.content && (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.6'
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>Response</h3>
          <div style={{ whiteSpace: 'pre-wrap' }}>{sse.content}</div>
        </div>
      )}

      {/* Event Log */}
      <div>
        <h3 style={{ marginBottom: '12px' }}>Event Log ({events.length})</h3>
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            maxHeight: '500px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '13px'
          }}
        >
          {events.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              No events yet. Send a message to start streaming.
            </div>
          ) : (
            events.map((item, index) => {
              const time = new Date(item.timestamp).toLocaleTimeString();
              const eventType = item.event.type;
              const color = getEventColor(eventType);

              return (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    borderBottom: index < events.length - 1 ? '1px solid #334155' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>{time}</span>
                    <span style={{ color, fontWeight: 600 }}>{eventType}</span>
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      fontSize: '12px',
                      color: '#cbd5e1'
                    }}
                  >
                    {JSON.stringify(item.event, null, 2)}
                  </pre>
                </div>
              );
            })
          )}
          <div ref={eventsEndRef} />
        </div>
      </div>
    </div>
  );
}

function getEventColor(eventType: string): string {
  const colors: Record<string, string> = {
    message_start: '#22c55e',
    status: '#3b82f6',
    delta: '#a855f7',
    'answer.delta': '#a855f7',
    tool_call: '#f59e0b',
    tool_result: '#10b981',
    message_end: '#22c55e',
    done: '#22c55e',
    error: '#ef4444',
    init: '#64748b'
  };
  return colors[eventType] || '#e2e8f0';
}
