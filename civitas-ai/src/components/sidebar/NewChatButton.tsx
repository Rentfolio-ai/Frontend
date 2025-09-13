// FILE: src/components/sidebar/NewChatButton.tsx
import React from 'react';
import { Button } from '../primitives/Button';

interface NewChatButtonProps {
  onClick: () => void;
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="w-full justify-start gap-3 text-left h-11 shadow-sm hover:shadow-md transition-all duration-200"
      variant="primary"
      leftIcon={
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      }
    >
      New Chat
    </Button>
  );
};