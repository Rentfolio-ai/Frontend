// FILE: src/components/chat/Composer.tsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
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

export interface ComposerRef {
  setInput: (text: string) => void;
  focus: () => void;
}

export const Composer = forwardRef<ComposerRef, ComposerProps>(({ onSend, ...rest }, ref) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [shouldFocusAfterSet, setShouldFocusAfterSet] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height whenever message changes
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Handle focus when setInput is called
  useEffect(() => {
    if (shouldFocusAfterSet && textareaRef.current) {
      textareaRef.current.focus();
      setShouldFocusAfterSet(false);
    }
  }, [shouldFocusAfterSet]);

  useImperativeHandle(ref, () => ({
    setInput: (text: string) => {
      setMessage(text);
      setShouldFocusAfterSet(true);
    },
    focus: () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    },
  }));

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
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Show/hide slash commands
    const value = e.target.value;
    setShowCommands(value.startsWith('/') && value.length > 0);
  };

  const handleCommandSelect = (command: SuggestionChip) => {
    setMessage(command.id + ' ');
    setShowCommands(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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

      {/* Input Form - Translucent glassy design */}
      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
        <div className="flex items-end gap-2">
          {/* Main Input Container */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about properties, markets, or investments..."
              className="w-full resize-none rounded-2xl backdrop-blur-2xl bg-white/[0.08] border border-white/[0.15] px-4 py-3 pr-14 text-sm text-white/95 placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.12] focus:ring-2 focus:ring-cyan-400/20 focus:shadow-cyan-500/20 transition-all duration-150 min-h-[48px] max-h-32 shadow-lg hover:border-white/[0.2]"
              rows={1}
              disabled={isLoading}
              {...rest}
            />
            {message.trim() && !isLoading && (
              <button
                type="submit"
                className="absolute right-2 bottom-2 p-2.5 rounded-xl backdrop-blur-xl transition-all duration-150 group/btn bg-gradient-to-br from-cyan-500/70 to-blue-600/70 border border-cyan-400/40 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/60 hover:from-cyan-500/80 hover:to-blue-600/80 hover:scale-[1.08] hover:border-cyan-400/60 active:scale-[1.02] animate-scale-in"
              >
                <svg
                  className="w-4 h-4 text-white transition-transform duration-150 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
});

Composer.displayName = 'Composer';