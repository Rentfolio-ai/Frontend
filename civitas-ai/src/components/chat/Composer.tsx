// FILE: src/components/chat/Composer.tsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Mic, Paperclip, X, File as FileIcon, Send, ArrowUp } from 'lucide-react';

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

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

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

  const hasContent = message.trim() || attachment;

  return (
    <div className="space-y-3">
      {/* Slash Commands Dropdown */}
      {showCommands && (
        <div className="glass-card rounded-xl p-2 space-y-1 animate-slide-up">
          <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider px-3 py-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Commands
          </div>
          {slashCommands
            .filter(cmd => cmd.id.toLowerCase().includes(message.toLowerCase()))
            .map(command => (
              <button
                key={command.id}
                onClick={() => handleCommandSelect(command)}
                className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-white/[0.06] transition-all duration-200 flex items-center gap-3 text-white/80 hover:text-white group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">{command.icon}</span>
                <span className="font-medium">{command.label}</span>
              </button>
            ))}
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="flex items-center gap-3 p-3 rounded-xl glass-card w-fit animate-slide-up">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <FileIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white/90 truncate max-w-[200px]">{attachment.name}</span>
            <span className="text-xs text-white/40">{(attachment.size / 1024).toFixed(1)} KB</span>
          </div>
          <button
            type="button"
            onClick={onClearAttachment}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors ml-2"
          >
            <X className="w-4 h-4 text-white/50 hover:text-white" />
          </button>
        </div>
      )}

      {/* Main Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          {/* Glow effect on focus */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 via-accent-to/40 to-primary/40 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
          
          {/* Input Container */}
          <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] group-focus-within:border-white/[0.15] transition-all duration-300">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.txt,.md,.csv,.json,image/*"
            />

            {/* Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message OmniEstate..."
              className="flex-1 bg-transparent resize-none text-[15px] text-white/90 placeholder:text-white/30 focus:outline-none py-2.5 px-1 min-h-[44px] max-h-40"
              rows={1}
              disabled={isLoading}
              {...rest}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!hasContent || isLoading}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                hasContent && !isLoading
                  ? 'bg-white text-black hover:bg-white/90 hover:scale-105 active:scale-95'
                  : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
              }`}
              title="Send message"
            >
              {isLoading ? (
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
});

Composer.displayName = 'Composer';
