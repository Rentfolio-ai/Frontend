// FILE: src/components/chat/Composer.tsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Paperclip, ArrowUp, Square, Settings } from 'lucide-react';
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
  voiceActive?: boolean;
  onVoiceActivate?: () => void;
  /** Whether the user has Pro (or higher) access. When false, voice is gated. */
  isPro?: boolean;
  /** Callback when gated feature is clicked by free user */
  onUpgradePrompt?: () => void;
}

export interface ComposerRef {
  setInput: (text: string) => void;
  focus: () => void;
}

/** Custom waveform icon for voice mode — 4 asymmetric bars forming a distinctive wave */
const VoiceIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="9" width="2.5" height="6" rx="1.25" fill="currentColor" />
    <rect x="8" y="5" width="2.5" height="14" rx="1.25" fill="currentColor" />
    <rect x="13" y="3" width="2.5" height="18" rx="1.25" fill="currentColor" />
    <rect x="18" y="7" width="2.5" height="10" rx="1.25" fill="currentColor" />
  </svg>
);

const ProStarIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C12 2 13.5 8.5 16 11C18.5 13.5 25 15 25 15C25 15 18.5 16.5 16 19C13.5 21.5 12 28 12 28C12 28 10.5 21.5 8 19C5.5 16.5 -1 15 -1 15C-1 15 5.5 13.5 8 11C10.5 8.5 12 2 12 2Z"
      transform="scale(0.8) translate(3, -2)" />
    <circle cx="12" cy="15" r="2" className="text-black" fill="black" opacity="0.4" />
  </svg>
);

const HunterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
  </svg>
);

const ResearchIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    <path d="M10 8v4" />
    <path d="M8 10h4" />
  </svg>
);

const StrategistIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <path d="M10 6.5h4" />
    <path d="M17.5 10v4" />
    <path d="M6.5 10v6.5h5.5" />
  </svg>
);

export const Composer = forwardRef<ComposerRef, ComposerProps>(({
  onSend,
  onStop,
  onAttach,
  attachment,
  onClearAttachment,
  onOpenPreferences,
  currentMode = 'hunter',
  onModeChange,
  voiceActive = false,
  onVoiceActivate,
  isPro = true,  // Default true so existing callers aren't gated
  onUpgradePrompt,
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
    { id: 'hunter', label: 'Hunter', icon: <HunterIcon className="w-4 h-4" />, description: 'Exhaustive search & discovery' },
    { id: 'research', label: 'Research', icon: <ResearchIcon className="w-4 h-4" />, description: 'Deep market analysis' },
    { id: 'strategist', label: 'Strategist', icon: <StrategistIcon className="w-4 h-4" />, description: 'Planning & scenarios' },
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

      <div className="relative rounded-2xl backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] hover:border-white/[0.18] focus-within:border-[#C08B5C]/30 transition-all duration-200 shadow-2xl shadow-black/20">

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
                  <span className={`${currentMode === 'hunter' ? 'text-[#C08B5C]' : currentMode === 'strategist' ? 'text-purple-400' : 'text-blue-400'}`}>
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
                      className="absolute bottom-full left-0 mb-3 w-64 bg-[#121212]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden z-30"
                    >
                      <div className="p-2 space-y-1">
                        <div className="px-3 py-2 text-[10px] uppercase font-bold text-white/30 tracking-wider">
                          Select Agent
                        </div>
                        {modes.map(mode => (
                          <button
                            key={mode.id}
                            type="button"
                            className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all border ${currentMode === mode.id
                              ? 'bg-[#C08B5C]/10 border-[#C08B5C]/30 text-white shadow-lg shadow-[#C08B5C]/5'
                              : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.06]'
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
                            <div className={`mt-0.5 ${currentMode === mode.id ? 'text-[#C08B5C]' : 'text-current opacity-70'}`}>
                              {mode.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-sm font-medium ${currentMode === mode.id ? 'text-[#D4A27F]' : 'text-white/90'}`}>
                                {mode.label}
                              </span>
                              <span className="text-[10px] text-white/40 leading-relaxed mt-0.5">
                                {mode.description}
                              </span>
                            </div>
                            {currentMode === mode.id && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C08B5C] shadow-[0_0_8px_rgba(192,139,92,0.6)] mt-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-white/10 mx-1" />

              {/* Star Actions Menu */}
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
                  <ProStarIcon className="w-4 h-4" />
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

            <div className="flex items-center gap-1.5">
              {/* Mic button — gated for Pro */}
              <button
                type="button"
                onClick={() => {
                  if (!isPro) { onUpgradePrompt?.(); return; }
                  onVoiceActivate?.();
                }}
                disabled={isLoading || voiceActive}
                className={`relative p-2 rounded-lg transition-all ${voiceActive
                  ? 'bg-[#C08B5C]/20 text-[#C08B5C]'
                  : 'text-[#C08B5C]/60 hover:text-[#C08B5C] hover:bg-[#C08B5C]/[0.08]'
                  } disabled:opacity-30`}
                aria-label="Voice mode"
                title={isPro ? 'Start voice conversation (Beta)' : 'Upgrade to Pro to unlock voice mode'}
              >
                <VoiceIcon className="w-6 h-6" />
                {!isPro && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-amber-500 text-black rounded px-0.5 leading-tight">PRO</span>
                )}
              </button>

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
          </div>
        </form>

      </div >

    </div >
  );
});

