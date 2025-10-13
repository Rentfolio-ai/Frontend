// FILE: src/components/chat/Composer.tsx
import React, { useState, useRef } from 'react';
import { SuggestionChips } from './SuggestionChips';

interface SuggestionChip {
  id: string;
  label: string;
  icon?: string;
}

const defaultSuggestions: SuggestionChip[] = [
  { id: '1', label: 'Analyze market trends', icon: '📈' },
  { id: '2', label: 'Compare properties', icon: '🏠' },
  { id: '3', label: 'Generate ROI report', icon: '📊' },
  { id: '4', label: 'Find investment opportunities', icon: '💰' },
];

const slashCommands = [
  { id: '/analyze', label: '/analyze - Market analysis', icon: '📈' },
  { id: '/compare', label: '/compare - Property comparison', icon: '⚖️' },
  { id: '/report', label: '/report - Generate report', icon: '📄' },
  { id: '/search', label: '/search - Find properties', icon: '🔍' },
];

interface ComposerProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 
  'value' | 'onChange' | 'rows' | 'disabled' | 'onKeyDown' | 'placeholder'> {
  onSend?: (message: string) => void;
}

export const Composer: React.FC<ComposerProps> = ({ onSend, ...rest }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    if (onSend) onSend(message);
    // TODO: Send message to AI
    console.log('Send message:', message);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setMessage('');
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: SuggestionChip) => {
    setMessage(suggestion.label);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    
    if (e.key === '/' && message === '') {
      setShowCommands(true);
    }
    
    if (e.key === 'Escape') {
      setShowCommands(false);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
    
    // Show/hide slash commands
    const value = e.target.value;
    setShowCommands(value.startsWith('/') && value.length > 0);
  };

  const handleCommandSelect = (command: SuggestionChip) => {
    setMessage(command.id + ' ');
    setShowCommands(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Suggestion Chips */}
      {message === '' && (
        <SuggestionChips
          suggestions={defaultSuggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      )}

      {/* Slash Commands */}
      {showCommands && (
        <div className="bg-surface border border-border rounded-lg p-2 space-y-1">
          <div className="text-xs text-foreground/60 px-2 py-1">Commands</div>
          {slashCommands
            .filter(cmd => cmd.id.toLowerCase().includes(message.toLowerCase()))
            .map(command => (
              <button
                key={command.id}
                onClick={() => handleCommandSelect(command)}
                className="w-full text-left px-2 py-2 text-sm rounded hover:bg-muted transition-colors flex items-center gap-2"
              >
                <span>{command.icon}</span>
                <span>{command.label}</span>
              </button>
            ))}
        </div>
      )}

      {/* Input Form - Clean glassmorphic style */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Add a message"
            className="w-full resize-none bg-transparent border-none px-4 py-3 pr-14
                       text-gray-800 placeholder:text-gray-500
                       focus:outline-none
                       min-h-[52px] max-h-[120px] text-base"
            rows={1}
            disabled={isLoading}
            {...rest}
          />
          
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="absolute right-4 bottom-4 w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg"
          >
            {!isLoading ? (
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            ) : (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};