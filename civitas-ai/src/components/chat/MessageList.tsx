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
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="mx-auto flex justify-center">
            <div className="p-4 bg-white rounded-3xl shadow-lg">
              <AgentAvatar size="lg" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-3 text-gray-900">Welcome to Civitas AI</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
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
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 pb-32 space-y-1">
        {grouped.map(({ message, groupLength, isFirst }) => (
          <MessageBubble key={message.id} message={message} groupLength={groupLength} isFirst={isFirst} />
        ))}
        {isLoading && <LoadingBubble />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};