// FILE: src/components/chat/Composer.tsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Mic, Paperclip, X, File as FileIcon } from 'lucide-react';

interface SuggestionChip {
  id: string;
  label: string;
  icon?: string;
}

const slashCommands = [
  { id: '/analyze', label: '/analyze - Market analysis', icon: '📈' },
  { id: '/compare', label: '/compare - Property comparison', icon: '⚖️' },
  { id: '/report', label: '/report - Generate report', icon: '📄' },
  { id: '/search', label: '/search - Find properties', icon: '🔍' },
];

interface ComposerProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 
  'value' | 'onChange' | 'rows' | 'disabled' | 'onKeyDown' | 'placeholder'> {
  onSend?: (message: string) => void;
  onAttach?: (file: File) => void;
  attachment?: File | null;
  onClearAttachment?: () => void;
}

export interface ComposerRef {
  setInput: (text: string) => void;
  focus: () => void;
}

export const Composer = forwardRef<ComposerRef, ComposerProps>(({ onSend, onAttach, attachment, onClearAttachment, ...rest }, ref) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [shouldFocusAfterSet, setShouldFocusAfterSet] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if ((!message.trim() && !attachment) || isLoading) return;

    setIsLoading(true);
    if (onSend) onSend(message);
    
    // Reset local state
    setMessage('');
    if (onClearAttachment) onClearAttachment();
    setIsLoading(false);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAttach) {
      onAttach(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Slash Commands */}
      {showCommands && (
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.15] rounded-xl p-3 space-y-1 shadow-medium animate-slide-in">
          <div className="text-xs text-white/60 font-semibold uppercase tracking-wider px-2 py-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Commands
          </div>
          {slashCommands
            .filter(cmd => cmd.id.toLowerCase().includes(message.toLowerCase()))
            .map(command => (
              <button
                key={command.id}
                onClick={() => handleCommandSelect(command)}
                className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-white/[0.08] transition-all duration-200 flex items-center gap-3 text-white/90 hover:text-white hover-lift group"
              >
                <span className="text-base group-hover:scale-110 transition-transform duration-200">{command.icon}</span>
                <span className="font-medium">{command.label}</span>
              </button>
            ))}
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.08] border border-white/[0.1] w-fit animate-slide-in">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <FileIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white/90 truncate max-w-[200px]">{attachment.name}</span>
            <span className="text-xs text-white/50">{(attachment.size / 1024).toFixed(1)} KB</span>
          </div>
          <button
            type="button"
            onClick={onClearAttachment}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors ml-2"
          >
            <X className="w-4 h-4 text-white/60 hover:text-white" />
          </button>
        </div>
      )}

      {/* Enhanced Input Form with professional real-estate glow */}
      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
        <div className="flex items-end gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.txt,.md,.csv,.json,image/*"
          />

          {/* Action Buttons (Left) */}
          <div className="flex gap-1 pb-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-white/60 transition-all duration-200 backdrop-blur-lg"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          {/* Main Input Container with navy gradient border */}
          <div className="flex-1 relative group/input">
            {/* Subtle navy glow on focus */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-900/30 via-teal-500/30 to-cyan-500/30 rounded-2xl opacity-0 group-focus-within/input:opacity-100 blur-lg transition-opacity duration-300"></div>
            
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about properties, markets, or investments..."
              className="relative w-full resize-none rounded-2xl backdrop-blur-2xl bg-white/90 border border-blue-900/10 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-blue-900/20 focus:bg-white/95 focus:ring-2 focus:ring-blue-900/10 transition-all duration-200 min-h-[44px] max-h-32 shadow-lg shadow-blue-900/5 hover:border-blue-900/15 font-medium"
              rows={1}
              disabled={isLoading}
              {...rest}
            />
            
            {/* Loading indicator - professional colors */}
            {isLoading && (
              <div className="absolute right-3 bottom-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse animation-delay-100"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse animation-delay-200"></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side Action Button (Send) - Coral CTA */}
          <div className="pb-1">
            {!isLoading && (message.trim() || attachment) ? (
              <button
                type="submit"
                className="p-3 rounded-xl backdrop-blur-xl transition-all duration-200 group/btn bg-gradient-to-br from-orange-500 to-coral-600 border border-orange-400/20 shadow-lg shadow-orange-400/15 hover:shadow-orange-400/25 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FF6B4A 100%)' }}
              >
                <svg
                  className="w-4 h-4 text-white transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className="p-3 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-white/60 transition-all duration-200 backdrop-blur-lg"
                title="Voice input (coming soon)"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
});

Composer.displayName = 'Composer';
