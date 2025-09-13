// FILE: src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ToolMessage } from './ToolMessage';
import { LoadingBubble } from './LoadingBubble';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  isStreaming?: boolean;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-h2 mb-2">Welcome to Civitas AI</h3>
            <p className="text-foreground/60 text-body">
              Start a conversation to analyze properties, generate reports, or explore investment opportunities.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group consecutive messages by sender
  const grouped: Array<{ message: Message; groupLength: number; isFirst: boolean }> = [];
  let i = 0;
  while (i < messages.length) {
    const current = messages[i];
    let groupLen = 1;
    let j = i + 1;
    while (j < messages.length && messages[j].role === current.role) {
      groupLen++;
      j++;
    }
    for (let k = 0; k < groupLen; k++) {
      grouped.push({
        message: messages[i + k],
        groupLength: groupLen,
        isFirst: k === 0
      });
    }
    i += groupLen;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-1">
        {grouped.map(({ message, groupLength, isFirst }) => (
          <MessageBubble key={message.id} message={message} groupLength={groupLength} isFirst={isFirst} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};