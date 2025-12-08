// FILE: src/components/chat/Composer.tsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Paperclip, X, File as FileIcon, ArrowUp, MapPin, Square } from 'lucide-react';
import { QuickPreferencesChip } from './QuickPreferencesChip';
import { usePreferencesStore } from '../../stores/preferencesStore';




export interface ComposerProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'rows' | 'disabled' | 'onKeyDown' | 'placeholder'> {
  onSend?: (message: string) => void;
  onStop?: () => void;
  onAttach?: (file: File) => void;
  attachment?: File | null;
  onClearAttachment?: () => void;
  onOpenPreferences?: () => void;
}

export interface ComposerRef {
  setInput: (text: string) => void;
  focus: () => void;
}

export const Composer = forwardRef<ComposerRef, ComposerProps>(({ onSend, onStop, onAttach, attachment, onClearAttachment, onOpenPreferences, ...rest }, ref) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [shouldFocusAfterSet, setShouldFocusAfterSet] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateClientLocation, clientLocation, promptPresets } = usePreferencesStore();

  const allCommands = useMemo(() => {
    const systemCommands = [
      { id: '/analyze', label: '/analyze - Market analysis', icon: '📈', content: null },
      { id: '/compare', label: '/compare - Property comparison', icon: '⚖️', content: null },
      { id: '/report', label: '/report - Generate report', icon: '📄', content: null },
      { id: '/search', label: '/search - Find properties', icon: '🔍', content: null },
    ];

    const userCommands = (promptPresets || []).map(p => ({
      id: p.id,
      label: `${p.command} - ${p.label}`,
      icon: '✨',
      content: p.content,
      trigger: p.command // store the trigger to match against input
    }));

    return [...systemCommands, ...userCommands];
  }, [promptPresets]);

  const [filteredCommands, setFilteredCommands] = useState(allCommands);

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
    if (isLoading) {
      if (onStop) onStop();
      return;
    }

    if ((!message.trim() && !attachment)) return;

    setIsLoading(true);
    if (onSend) onSend(message);

    setMessage('');
    if (onClearAttachment) onClearAttachment();

    // Reset local loading state after a delay if parent doesn't unset it (safety fallback)
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }

    if (showCommands) {
      if (e.key === 'Escape') {
        setShowCommands(false);
      }
      // Add arrow key navigation later if needed
    } else {
      if (e.key === '/' && message === '') {
        setShowCommands(true);
        setFilteredCommands(allCommands);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.startsWith('/')) {
      const searchTerm = value.toLowerCase();
      const matches = allCommands.filter((cmd: { id: string; label: string; icon: string; content: string | null; trigger?: string; }) =>
        // Match system commands by ID (e.g. /analyze)
        (cmd.id.startsWith('/') && cmd.id.toLowerCase().startsWith(searchTerm)) ||
        // Match user presets by trigger (e.g. /flip)
        (cmd.trigger && cmd.trigger.toLowerCase().startsWith(searchTerm))
      );
      setFilteredCommands(matches);
      setShowCommands(matches.length > 0);
    } else {
      setShowCommands(false);
    }
  };

  const handleCommandSelect = (cmdId: string) => {
    const cmd = allCommands.find((c: any) => c.id === cmdId);
    if (!cmd) return;

    if (cmd.content) {
      // User Preset: Replace with content
      setMessage(cmd.content);
    } else {
      // System Command: Append command
      setMessage(cmd.id + ' ');
    }

    setShowCommands(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (onAttach) onAttach(e.target.files[0]);
    }
  };

  const handleDetectLocation = () => {
    if (isLocating) return;

    setIsLocating(true);
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateClientLocation({ latitude, longitude });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error detecting location:", error);
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="relative">
      {showCommands && (
        <div className="absolute bottom-full mb-2 w-full bg-[#1A1D24] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 max-h-[300px] overflow-y-auto custom-scrollbar">
          {filteredCommands.map((cmd: any) => (
            <button
              key={cmd.id}
              onClick={() => handleCommandSelect(cmd.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0">
                {cmd.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{cmd.label.split(' - ')[0]}</div>
                <div className="text-xs text-white/40 truncate">{cmd.label.split(' - ')[1]}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className={`relative transition-all duration-300 rounded-3xl border bg-black/40 backdrop-blur-xl ${isLoading ? 'border-blue-500/30 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]' : 'border-white/10 hover:border-white/20'
        }`}>

        {attachment && (
          <div className="mx-4 mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileIcon className="w-4 h-4" />
              </div>
              <div className="text-sm text-white/90 font-medium truncate max-w-[200px]">
                {attachment.name}
              </div>
            </div>
            <button
              type="button"
              onClick={onClearAttachment}
              className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex flex-col">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about properties, markets, or analyze a deal..."
            className="w-full bg-transparent text-white placeholder-white/40 px-6 py-5 min-h-[60px] max-h-[160px] resize-none focus:outline-none custom-scrollbar text-[15px] leading-relaxed font-light"
            style={{ height: '60px' }}
            disabled={isLoading}
            {...rest}
          />

          <div className="px-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <QuickPreferencesChip onOpenFullPreferences={onOpenPreferences || (() => { })} />

              <div className="h-4 w-[1px] bg-white/10 mx-2" />

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all group"
                title="Attach file"
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>

              {/* Location Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                className={`p-2 rounded-xl transition-all group relative ${clientLocation
                  ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                title={clientLocation ? "Location detected" : "Detect location"}
                disabled={isLoading || isLocating}
              >
                <MapPin className={`w-4 h-4 transition-transform group-hover:scale-110 ${isLocating ? 'animate-pulse' : ''}`} />
                {clientLocation && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-black" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={(!message.trim() && !attachment && !isLoading) || (isLoading && !onStop)}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${isLoading
                ? 'bg-white/10 hover:bg-white/20 text-white scale-100'
                : message.trim() || attachment
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 text-white scale-100'
                  : 'bg-white/5 text-white/20 scale-95 cursor-not-allowed'
                }`}
            >
              {isLoading && onStop ? (
                <Square className="w-3 h-3 fill-current" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
