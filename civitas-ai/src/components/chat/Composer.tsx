// FILE: src/components/chat/Composer.tsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Paperclip, ArrowUp, Square, Sparkles, Settings, Brain, Search, Target } from 'lucide-react';
import { AttachmentPreview, generateThumbnail } from '../FileAttachment';
import { motion, AnimatePresence } from 'framer-motion';
import { trackComposerAction } from '../../services/analytics';
import type { AgentMode } from '../../types/chat';

export interface ComposerProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'rows' | 'disabled' | 'onKeyDown' | 'placeholder'> {
  onSend?: (message: string) => void;
  onStop?: () => void;
  onAttach?: (file: File) => void;
  attachment?: File | null;
  onClearAttachment?: () => void;
  onOpenPreferences?: () => void;
  currentMode?: AgentMode;
  onModeChange?: (mode: AgentMode) => void;
}

export interface ComposerRef {
  setInput: (text: string) => void;
  focus: () => void;
}

export const Composer = forwardRef<ComposerRef, ComposerProps>(({
  onSend,
  onStop,
  onAttach,
  attachment,
  onClearAttachment,
  onOpenPreferences,
  currentMode = 'hunter',
  onModeChange,
  ...rest
}, ref) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [shouldFocusAfterSet, setShouldFocusAfterSet] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Agent Mode Dropdown State
  const [showModeMenu, setShowModeMenu] = useState(false);
  const modeMenuRef = useRef<HTMLDivElement>(null);

  // Rotating placeholder suggestions
  const placeholders = [
    "Ask, search, or make anything...",
    "Find investment properties in San Francisco...",
    "Analyze this property for STR potential...",
    "Compare these properties side by side...",
    "What's the cap rate for this deal?...",
    "Generate a full investment report...",
    "Search for ADU-friendly properties...",
    "Calculate my cash-on-cash return...",
    "Find flip opportunities under $500k...",
  ];

  const allCommands = useMemo(() => {
    const systemCommands = [
      { id: '/analyze', label: '/analyze - Market analysis', icon: '📈', content: null },
      { id: '/compare', label: '/compare - Property comparison', icon: '⚖️', content: null },
      { id: '/report', label: '/report - Generate report', icon: '📄', content: null },
      { id: '/search', label: '/search - Find properties', icon: '🔍', content: null },
    ];

    return systemCommands;
  }, []);

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

  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setShowModeMenu(false);
      }
    };

    if (showActionsMenu || showModeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsMenu, showModeMenu]);

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
    // Cmd/Ctrl + Enter to send
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e as any);
      return;
    }

    // Enter without shift to send
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Generate thumbnail for images
      if (file.type.startsWith('image/')) {
        try {
          const thumb = await generateThumbnail(file);
          setThumbnail(thumb);
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
          setThumbnail(undefined);
        }
      } else {
        setThumbnail(undefined);
      }

      if (onAttach) onAttach(file);
    }
  };

  // Agent Mode Logic
  const modes: { id: AgentMode, label: string, icon: React.ReactNode, description: string }[] = [
    { id: 'hunter', label: 'Hunter', icon: <Target className="w-3.5 h-3.5" />, description: 'Exhaustive search & discovery' },
    { id: 'research', label: 'Research', icon: <Search className="w-3.5 h-3.5" />, description: 'Deep market analysis' },
    { id: 'strategist', label: 'Strategist', icon: <Brain className="w-3.5 h-3.5" />, description: 'Planning & scenarios' },
  ];

  const currentModeData = modes.find(m => m.id === currentMode) || modes[0];

  return (
    <div className="relative">
      {showCommands && (
        <div className="absolute bottom-full mb-3 w-full backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden z-20 max-h-[300px] overflow-y-auto custom-scrollbar">
          {filteredCommands.map((cmd: any) => (
            <button
              key={cmd.id}
              onClick={() => handleCommandSelect(cmd.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.08] text-left transition-all duration-150"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.04] flex items-center justify-center text-lg shrink-0 shadow-sm">
                {cmd.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{cmd.label.split(' - ')[0]}</div>
                <div className="text-xs text-white/50 truncate">{cmd.label.split(' - ')[1]}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="relative rounded-2xl backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] hover:border-white/[0.18] focus-within:border-teal-400/30 transition-all duration-200 shadow-2xl shadow-black/20">

        {attachment && (
          <div className="mx-4 mt-4">
            <div className="inline-block w-32">
              <AttachmentPreview
                file={attachment}
                thumbnail={thumbnail}
                onRemove={() => {
                  if (onClearAttachment) onClearAttachment();
                  setThumbnail(undefined);
                }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex flex-col">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[placeholderIndex]}
            className="w-full bg-transparent text-white placeholder-white/35 px-5 py-4 min-h-[56px] max-h-[160px] resize-none focus:outline-none custom-scrollbar text-[15px] leading-relaxed"
            style={{ height: '56px' }}
            disabled={isLoading}
            {...rest}
          />


          <div className="px-4 pb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Mode Selector Dropdown */}
              <div className="relative" ref={modeMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowModeMenu(!showModeMenu)}
                  disabled={isLoading || !onModeChange}
                  className={`h-8 pl-2 pr-3 rounded-lg flex items-center gap-2 border transition-all ${showModeMenu
                    ? 'bg-white/[0.12] border-white/20 text-white'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white/90 hover:bg-white/[0.08] hover:border-white/15'
                    } ${(!onModeChange || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Select Agent Mode"
                >
                  <span className={`${currentMode === 'hunter' ? 'text-teal-400' : currentMode === 'strategist' ? 'text-purple-400' : 'text-blue-400'}`}>
                    {currentModeData.icon}
                  </span>
                  <span className="text-xs font-medium">{currentModeData.label}</span>
                </button>

                <AnimatePresence>
                  {showModeMenu && onModeChange && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute bottom-full left-0 mb-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30"
                    >
                      <div className="p-1">
                        {modes.map(mode => (
                          <button
                            key={mode.id}
                            type="button"

                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${currentMode === mode.id
                              ? 'bg-white/10 text-white'
                              : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                              }`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onModeChange) {
                                onModeChange(mode.id);
                              }
                              setShowModeMenu(false);
                            }}
                          >
                            <div className={`${currentMode === mode.id ? (mode.id === 'hunter' ? 'text-teal-400' : mode.id === 'strategist' ? 'text-purple-400' : 'text-blue-400') : 'text-current'}`}>
                              {mode.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium">{mode.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-white/10 mx-1" />

              {/* Star Actions Menu - Updated Styling */}
              <div className="relative" ref={actionsMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    const newState = !showActionsMenu;
                    setShowActionsMenu(newState);
                    trackComposerAction(newState ? 'star_opened' : 'star_closed');
                  }}
                  className={`p-2 rounded-lg transition-all ${showActionsMenu
                    ? 'text-white bg-white/[0.12]'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
                    }`}
                  disabled={isLoading}
                  aria-label="Actions menu"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                {/* Actions Menu Popover */}
                <AnimatePresence>
                  {showActionsMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute bottom-full left-0 mb-2 w-56 bg-[#0f0f0f] backdrop-blur-xl rounded-lg border border-white/[0.15] overflow-hidden z-50"
                      style={{
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
                      }}
                    >
                      {/* Menu Items */}
                      <div className="py-1">
                        {/* Attach File */}
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowActionsMenu(false);
                            trackComposerAction('attach_file');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.08] transition-colors"
                        >
                          <Paperclip className="w-4 h-4 text-white/70" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-white">Attach file</div>
                          </div>
                        </button>

                        {/* Preferences */}
                        {onOpenPreferences && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenPreferences();
                              setShowActionsMenu(false);
                              trackComposerAction('preferences');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.08] transition-colors"
                          >
                            <Settings className="w-4 h-4 text-white/70" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-white">Preferences</div>
                            </div>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              type="submit"
              disabled={(!message.trim() && !attachment && !isLoading) || (isLoading && !onStop)}
              className={`p-2 rounded-lg transition-all ${isLoading
                ? 'bg-white/[0.12] hover:bg-white/[0.16] text-white'
                : message.trim() || attachment
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'bg-white/[0.08] text-white/30 cursor-not-allowed'
                }`}
              aria-label={isLoading ? 'Stop' : 'Send message'}
            >
              {isLoading && onStop ? (
                <Square className="w-4 h-4" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
});

