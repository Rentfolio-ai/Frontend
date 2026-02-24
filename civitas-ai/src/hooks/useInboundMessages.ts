/**
 * useInboundMessages — SSE listener for real-time inbound messages.
 *
 * Connects to the /v2/communications/inbound/stream SSE endpoint
 * and emits parsed InboundMessage events via a callback.
 */

import { useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL, API_KEY } from '../services/apiConfig';
import type { InboundMessage } from '../components/chat/tool-cards/InboundMessageCard';

interface UseInboundMessagesOptions {
  enabled: boolean;
  onMessage: (msg: InboundMessage) => void;
}

export function useInboundMessages({ enabled, onMessage }: UseInboundMessagesOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${API_BASE_URL}/v2/communications/inbound/stream${API_KEY ? `?api_key=${encodeURIComponent(API_KEY)}` : ''}`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ping') return;

        if (data.type === 'inbound_message') {
          const msg: InboundMessage = {
            conversationId: data.conversation_id,
            messageId: data.message_id,
            channel: data.channel || 'sms',
            fromName: data.from_name || 'Unknown',
            subject: data.subject,
            content: data.content || '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          onMessageRef.current(msg);
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      // Reconnect after delay
      setTimeout(() => {
        if (enabled) connect();
      }, 5000);
    };

    eventSourceRef.current = es;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      return;
    }
    connect();
    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [enabled, connect]);
}
