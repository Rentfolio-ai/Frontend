// FILE: src/components/chat/Composer.tsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Paperclip, ArrowUp, Square, Settings, Link2 } from 'lucide-react';
import { AttachmentPreview, generateThumbnail } from '../FileAttachment';
import { motion, AnimatePresence } from 'framer-motion';
import { trackComposerAction } from '../../services/analytics';
import type { AgentMode, ModelInfo } from '../../types/chat';
import { ModelSelector } from './ModelSelector';
import { TokenUsageMeter } from './TokenUsageRing';
import type { TokenUsage } from '../../hooks/useTokenUsage';

export interface ComposerProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'rows' | 'disabled' | 'onKeyDown' | 'placeholder'> {
  onSend?: (message: string) => void;
  onStop?: () => void;
  onAttach?: (file: File) => void;
  attachment?: File | null;
  onClearAttachment?: () => void;
  onOpenPreferences?: () => void;
  onOpenIntegrations?: () => void;
  currentMode?: AgentMode;
  onModeChange?: (mode: AgentMode) => void;
  voiceActive?: boolean;
  onVoiceActivate?: () => void;
  isPro?: boolean;
  onUpgradePrompt?: () => void;
  contextPlaceholders?: string[];
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  availableModels?: ModelInfo[];
  tokenUsage?: TokenUsage | null;
  isNearTokenLimit?: boolean;
  isTokenExhausted?: boolean;
  onTokenUpgrade?: () => void;
  onBuyTokenPack?: () => void;
}

export interface ComposerRef {
  setInput: (text: string) => void;
  focus: () => void;
}

/** Premium waveform icon — 5 organic bars with smooth height curve and copper gradient */
const VoiceIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="voiceGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D4A27F" />
        <stop offset="100%" stopColor="#C08B5C" />
      </linearGradient>
    </defs>
    <rect x="2.5" y="9.5" width="2" height="5" rx="1" fill="url(#voiceGrad)" />
    <rect x="6.75" y="6" width="2" height="12" rx="1" fill="url(#voiceGrad)" />
    <rect x="11" y="3.5" width="2" height="17" rx="1" fill="url(#voiceGrad)" />
    <rect x="15.25" y="6" width="2" height="12" rx="1" fill="url(#voiceGrad)" />
    <rect x="19.5" y="9.5" width="2" height="5" rx="1" fill="url(#voiceGrad)" />
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
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <radialGradient id="hunterGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#D4A27F" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#C08B5C" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="9" fill="url(#hunterGrad)" />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
    <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    <line x1="12" y1="2.5" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="19" x2="12" y2="21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="2.5" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="19" y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ResearchIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="researchGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <rect x="3" y="16" width="3.5" height="5" rx="1" fill="url(#researchGrad)" stroke="currentColor" strokeWidth="1.2" />
    <rect x="8.5" y="11" width="3.5" height="10" rx="1" fill="url(#researchGrad)" stroke="currentColor" strokeWidth="1.2" />
    <rect x="14" y="7" width="3.5" height="14" rx="1" fill="url(#researchGrad)" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4 14L10 9L16 5L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7" />
    <circle cx="21" cy="3" r="1.5" fill="currentColor" fillOpacity="0.6" />
  </svg>
);

const StrategistIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <defs>
      <linearGradient id="stratGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.05" />
      </linearGradient>
    </defs>
    <circle cx="6" cy="6" r="3.5" fill="url(#stratGrad)" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="18" cy="6" r="3.5" fill="url(#stratGrad)" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="12" cy="18" r="3.5" fill="url(#stratGrad)" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8.5 8L10.5 15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M15.5 8L13.5 15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M9 6h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />
  </svg>
);

export const Composer = forwardRef<ComposerRef, ComposerProps>(({
  onSend,
  onStop,
  onAttach,
  attachment,
  onClearAttachment,
  onOpenPreferences,
  onOpenIntegrations,
  currentMode = 'hunter',
  onModeChange,
  voiceActive = false,
  onVoiceActivate,
  isPro = true,
  onUpgradePrompt,
  contextPlaceholders,
  selectedModel,
  onModelChange,
  availableModels = [],
  tokenUsage,
  isNearTokenLimit = false,
  isTokenExhausted = false,
  onTokenUpgrade,
  onBuyTokenPack,
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

  // Rotating placeholder suggestions — context-aware ones get priority
  const placeholders = useMemo(() => {
    const staticPh = [
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
    if (contextPlaceholders && contextPlaceholders.length > 0) {
      return [...contextPlaceholders, ...contextPlaceholders, ...staticPh];
    }
    return staticPh;
  }, [contextPlaceholders]);

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
    { id: 'hunter', label: 'Hunter', icon: <HunterIcon className="w-3.5 h-3.5" />, description: 'Search listings, score deals, run financial analysis' },
    { id: 'research', label: 'Research', icon: <ResearchIcon className="w-3.5 h-3.5" />, description: 'Market trends, comparisons, education — no listings' },
    { id: 'strategist', label: 'Strategist', icon: <StrategistIcon className="w-3.5 h-3.5" />, description: 'Portfolio strategy, risk modeling, long-term planning' },
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

      <div className={`relative rounded-xl backdrop-blur-xl bg-white/[0.06] border transition-all duration-200 shadow-lg shadow-black/10 ${currentMode === 'hunter' ? 'border-[#C08B5C]/15 hover:border-[#C08B5C]/25 focus-within:border-[#C08B5C]/35' :
          currentMode === 'research' ? 'border-blue-400/15 hover:border-blue-400/25 focus-within:border-blue-400/35' :
            currentMode === 'strategist' ? 'border-purple-400/15 hover:border-purple-400/25 focus-within:border-purple-400/35' :
              'border-white/[0.08] hover:border-white/[0.14] focus-within:border-[#C08B5C]/25'
        }`}>

        {attachment && (
          <div className="mx-3 mt-2.5">
            <div className="inline-block w-28">
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
          {/* Token Exhaustion Banner */}
          <AnimatePresence>
            {isTokenExhausted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mx-3 mt-2.5 mb-1 flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.04] border-l-2 border-[#C08B5C]/60">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-white/80">
                      {isPro ? 'Monthly token limit reached' : 'Monthly limit reached'}
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      {isPro
                        ? 'Purchase a token pack to keep going'
                        : 'Upgrade to Pro for 100K tokens/month'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={isPro ? onBuyTokenPack : onTokenUpgrade}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all bg-gradient-to-r from-[#C08B5C] to-[#D4A27F] text-black hover:brightness-110"
                  >
                    {isPro ? 'Buy 25K tokens — $10' : 'Upgrade'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isTokenExhausted ? 'Token limit reached — upgrade to continue' : placeholders[placeholderIndex]}
            className="w-full bg-transparent text-white placeholder-white/35 px-3.5 py-2.5 min-h-[38px] max-h-[140px] resize-none focus:outline-none custom-scrollbar text-[14px] leading-snug"
            style={{ height: '38px' }}
            disabled={isLoading || isTokenExhausted}
            {...rest}
          />

          <div className="px-2.5 pb-2 flex items-center justify-between">
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
                  className={`h-6 pl-1.5 pr-2 rounded-lg flex items-center gap-1.5 transition-all ${
                    showModeMenu
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/90'
                  } ${(!onModeChange || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    background: showModeMenu
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)'
                      : currentMode === 'hunter'
                        ? 'linear-gradient(135deg, rgba(192,139,92,0.12) 0%, rgba(192,139,92,0.04) 100%)'
                        : currentMode === 'research'
                          ? 'linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(96,165,250,0.04) 100%)'
                          : 'linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(167,139,250,0.04) 100%)',
                    border: `1px solid ${
                      currentMode === 'hunter' ? 'rgba(192,139,92,0.2)'
                      : currentMode === 'research' ? 'rgba(96,165,250,0.2)'
                      : 'rgba(167,139,250,0.2)'
                    }`,
                  }}
                  title="Select Agent Mode"
                >
                  <span className={`${currentMode === 'hunter' ? 'text-[#C08B5C]' : currentMode === 'strategist' ? 'text-purple-400' : 'text-blue-400'}`}>
                    {currentModeData.icon}
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide">{currentModeData.label}</span>
                </button>

                <AnimatePresence>
                  {showModeMenu && onModeChange && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute bottom-full left-0 mb-2 w-60 bg-[#111113]/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-30"
                    >
                      <div className="p-1.5">
                        <div className="px-2.5 pt-1.5 pb-1 text-[8px] uppercase font-bold text-white/25 tracking-[0.12em]">
                          Agent Mode
                        </div>
                        <div className="space-y-0.5">
                          {modes.map(mode => {
                            const isActive = currentMode === mode.id;
                            const accentColor = mode.id === 'hunter' ? '#C08B5C'
                              : mode.id === 'research' ? '#60A5FA' : '#A78BFA';

                            return (
                              <button
                                key={mode.id}
                                type="button"
                                className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                                  isActive
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                                }`}
                                style={isActive ? {
                                  background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}05 100%)`,
                                  border: `1px solid ${accentColor}30`,
                                  boxShadow: `0 0 12px ${accentColor}10`,
                                } : { border: '1px solid transparent' }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (onModeChange) {
                                    onModeChange(mode.id);
                                  }
                                  setShowModeMenu(false);
                                }}
                              >
                                <div
                                  className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                  style={{
                                    background: isActive
                                      ? `linear-gradient(135deg, ${accentColor}25, ${accentColor}10)`
                                      : 'rgba(255,255,255,0.04)',
                                    color: isActive ? accentColor : 'rgba(255,255,255,0.5)',
                                  }}
                                >
                                  {mode.icon}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11px] font-semibold" style={{ color: isActive ? accentColor : undefined }}>
                                    {mode.label}
                                  </span>
                                  <span className="text-[9px] text-white/35 leading-snug mt-0.5">
                                    {mode.description}
                                  </span>
                                </div>
                                {isActive && (
                                  <div
                                    className="ml-auto w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                    style={{
                                      backgroundColor: accentColor,
                                      boxShadow: `0 0 8px ${accentColor}90`,
                                    }}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Model Selector */}
              {onModelChange && selectedModel && availableModels.length > 0 && (
                <>
                  <div className="w-px h-3.5 bg-white/[0.06] mx-0.5" />
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                    isPro={isPro}
                    models={availableModels}
                    disabled={isLoading}
                  />
                </>
              )}

              {/* Token Usage Meter */}
              {tokenUsage && (
                <>
                  <div className="w-px h-3.5 bg-white/[0.06] mx-0.5" />
                  <TokenUsageMeter
                    usage={tokenUsage}
                    isNearLimit={isNearTokenLimit}
                    isExhausted={isTokenExhausted}
                    onClick={onTokenUpgrade}
                  />
                </>
              )}

              {/* Divider */}
              <div className="w-px h-3.5 bg-white/[0.06] mx-0.5" />

              {/* Star Actions Menu */}
              <div className="relative" ref={actionsMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    const newState = !showActionsMenu;
                    setShowActionsMenu(newState);
                    trackComposerAction(newState ? 'star_opened' : 'star_closed');
                  }}
                  className={`p-1.5 rounded-md transition-all ${showActionsMenu
                    ? 'text-white bg-white/[0.12]'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.06]'
                    }`}
                  disabled={isLoading}
                  aria-label="Actions menu"
                >
                  <ProStarIcon className="w-3.5 h-3.5" />
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

                        {/* Integrations */}
                        {onOpenIntegrations && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenIntegrations();
                              setShowActionsMenu(false);
                              trackComposerAction('integrations');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.08] transition-colors"
                          >
                            <Link2 className="w-4 h-4 text-white/70" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-white">Integrations</div>
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
                className={`relative p-1 rounded-md transition-all ${voiceActive
                  ? 'bg-[#C08B5C]/20'
                  : 'opacity-70 hover:opacity-100 hover:bg-[#C08B5C]/[0.08]'
                  } disabled:opacity-30`}
                aria-label="Voice mode"
                title={isPro ? 'Start voice conversation (Beta)' : 'Upgrade to Pro to unlock voice mode'}
              >
                <VoiceIcon className="w-[18px] h-[18px]" />
                {!isPro && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-amber-500 text-black rounded px-0.5 leading-tight">PRO</span>
                )}
              </button>

              <button
                type="submit"
                disabled={isTokenExhausted || (!message.trim() && !attachment && !isLoading) || (isLoading && !onStop)}
                className={`p-1.5 rounded-full transition-all ${isLoading
                  ? 'bg-white/[0.12] hover:bg-white/[0.16] text-white'
                  : message.trim() || attachment
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
                  }`}
                aria-label={isLoading ? 'Stop' : 'Send message'}
              >
                {isLoading && onStop ? (
                  <Square className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUp className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </form>

      </div>

    </div>
  );
});

