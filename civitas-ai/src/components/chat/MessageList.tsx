// FILE: src/components/chat/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import { AgentAvatar } from '../common/AgentAvatar';
import type { Message } from '../../data/seed';

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
          <div className="mx-auto flex justify-center">
            <AgentAvatar size="lg" />
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
      <div className="p-6 pb-32 space-y-1">
        {grouped.map(({ message, groupLength, isFirst }) => (
          <MessageBubble key={message.id} message={message} groupLength={groupLength} isFirst={isFirst} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};