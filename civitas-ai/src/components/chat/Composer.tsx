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

      {/* Input Form - Enhanced with buttons inside */}
      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
        {/* Main Input Container - Sleek glassmorphism design with integrated buttons */}
        <div 
          className="relative rounded-2xl transition-all duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0px 4px 20px rgba(59, 130, 246, 0.12), 0px 1px 3px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <div className="flex items-center">
            {/* File Upload Button - Left side */}
            {/* TODO: Implement file upload functionality */}
            <button
              type="button"
              className="w-10 h-10 ml-2 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 opacity-50 cursor-not-allowed"
              title="Feature coming soon"
              disabled
              aria-disabled="true"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>

            {/* Vertical Separator */}
            <div 
              className="w-px h-8 mx-2"
              style={{
                background: 'linear-gradient(180deg, rgba(148, 163, 184, 0) 0%, rgba(148, 163, 184, 0.3) 50%, rgba(148, 163, 184, 0) 100%)'
              }}
            />

            {/* Text Input - Flexible */}
            <div className="flex-1 py-3">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about properties, markets, or investment strategies..."
                className="w-full resize-none bg-transparent border-none
                           placeholder:text-slate-400
                           focus:outline-none
                           min-h-[24px] max-h-[120px] text-base leading-relaxed"
                style={{
                  color: '#0f172a',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif'
                }}
                rows={1}
                disabled={isLoading}
                {...rest}
              />
            </div>

            {/* Vertical Separator */}
            <div 
              className="w-px h-8 mx-2"
              style={{
                background: 'linear-gradient(180deg, rgba(148, 163, 184, 0) 0%, rgba(148, 163, 184, 0.3) 50%, rgba(148, 163, 184, 0) 100%)'
              }}
            />

            {/* Voice Input Button - Right side */}
            {/* TODO: Implement voice recording functionality */}
            <button
              type="button"
              className="w-10 h-10 mr-2 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 opacity-50 cursor-not-allowed"
              title="Feature coming soon"
              disabled
              aria-disabled="true"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};