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
import type { WandState } from '../../hooks/useAutopilotWand';

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
  wandState?: WandState;
  onActivateWand?: (goal: string) => void;
  onDeactivateWand?: () => void;
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

const HunterIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="6" />
    <path d="M11 8v6M8 11h6" strokeOpacity="0.5" />
    <path d="M16 16l4 4" strokeLinecap="round" />
  </svg>
);

const ResearchIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
    <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    <circle cx="18" cy="17" r="3" stroke="#C08B5C" />
    <path d="M18 15v4M16 17h4" stroke="#C08B5C" strokeWidth="1" />
  </svg>
);

const StrategistIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
    <path d="M12 4l-6 10h12L12 4z" strokeOpacity="0.3" />
    <circle cx="12" cy="4" r="2" fill="currentColor" />
    <circle cx="6" cy="14" r="2" fill="currentColor" />
    <circle cx="18" cy="14" r="2" fill="currentColor" />
    <path d="M12 6l-4 6M12 6l4 6M8 14h8" strokeOpacity="0.5" />
  </svg>
);

/** Magic wand SVG icon */
const WandIcon: React.FC<{ className?: string; active?: boolean }> = ({ className = 'w-4 h-4', active }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {active && (
      <defs>
        <linearGradient id="wandGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4A27F" />
          <stop offset="100%" stopColor="#C08B5C" />
        </linearGradient>
      </defs>
    )}
    <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M12.2 6.2l-1.4-1.4M17.8 6.2l1.4-1.4M12.2 11.8l-1.4 1.4" stroke={active ? 'url(#wandGrad)' : 'currentColor'} strokeOpacity={active ? 1 : 0.5} strokeWidth="1.5" />
    <path d="M15 9l-9.7 9.7a1 1 0 0 0 0 1.4l.6.6a1 1 0 0 0 1.4 0L17 11" stroke={active ? '#C08B5C' : 'currentColor'} strokeWidth="2" />
    <circle cx="15" cy="9" r="1" fill={active ? '#C08B5C' : 'currentColor'} opacity={active ? 1 : 0.4} />
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
  wandState,
  onActivateWand,
  onDeactivateWand,
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
  const [showWandPopover, setShowWandPopover] = useState(false);
  const wandPopoverRef = useRef<HTMLDivElement>(null);
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
      if (wandPopoverRef.current && !wandPopoverRef.current.contains(event.target as Node)) {
        setShowWandPopover(false);
      }
    };

    if (showActionsMenu || showModeMenu || showWandPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsMenu, showModeMenu, showWandPopover]);

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
    { id: 'hunter', label: 'Deep Search', icon: <HunterIcon className="w-3.5 h-3.5" />, description: 'In-depth property analysis, deal scoring, full due diligence' },
    { id: 'research', label: 'Deep Research', icon: <ResearchIcon className="w-3.5 h-3.5" />, description: 'Comprehensive market research, policy analysis, data synthesis' },
    { id: 'strategist', label: 'Expert Strategist', icon: <StrategistIcon className="w-3.5 h-3.5" />, description: 'Portfolio strategy, risk modeling, long-term wealth planning' },
  ];

  const currentModeData = modes.find(m => m.id === currentMode) || modes[0];

  return (
    <div className="relative">
      {showCommands && (
        <div className="absolute bottom-full mb-3 w-full backdrop-blur-xl bg-black/[0.06] border border-black/[0.10] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden z-20 max-h-[300px] overflow-y-auto custom-scrollbar">
          {filteredCommands.map((cmd: any) => (
            <button
              key={cmd.id}
              onClick={() => handleCommandSelect(cmd.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/[0.06] text-left transition-all duration-150"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-black/[0.08] to-black/[0.04] flex items-center justify-center text-lg shrink-0 shadow-sm">
                {cmd.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{cmd.label.split(' - ')[0]}</div>
                <div className="text-xs text-muted-foreground truncate">{cmd.label.split(' - ')[1]}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className={`relative rounded-xl bg-black/[0.03] border hover:border-black/[0.10] focus-within:border-black/[0.12] transition-colors ${
        wandState?.isActive
          ? 'border-[#C08B5C]/30 shadow-[0_0_0_1px_rgba(192,139,92,0.1),0_0_12px_rgba(192,139,92,0.06)]'
          : 'border-black/[0.08]'
      }`} style={wandState?.isActive ? { animation: 'wandPulse 3s ease-in-out infinite' } : undefined}>

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
                <div className="mx-3 mt-2.5 mb-1 flex items-center gap-3 px-3 py-2 rounded-lg bg-black/[0.03] border-l-2 border-[#C08B5C]/60">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground/80">
                      {isPro ? 'Monthly token limit reached' : 'Monthly limit reached'}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
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
            value={wandState?.isActive && wandState.wandMessage ? wandState.wandMessage : message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isTokenExhausted ? 'Token limit reached — upgrade to continue' : wandState?.isActive && wandState.status === 'ready' ? '🪄 Type your next goal...' : wandState?.isActive && wandState.status !== 'done' && wandState.status !== 'paused' ? '🪄 Wand is working...' : placeholders[placeholderIndex]}
            className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 px-3.5 py-2.5 min-h-[38px] max-h-[140px] resize-none focus:outline-none custom-scrollbar text-[14px] leading-snug ${
              wandState?.isActive && wandState.status === 'acting' ? 'text-[#C08B5C]' : ''
            }`}
            style={{ height: '38px' }}
            disabled={isLoading || isTokenExhausted || (wandState?.isActive && wandState.status !== 'ready' && wandState.status !== 'done' && wandState.status !== 'paused')}
            data-wand-id="composer-input"
            data-wand-type="input"
            data-wand-label="Chat composer"
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
                  className={`h-6 pl-1.5 pr-2 rounded-lg flex items-center gap-1.5 transition-all bg-black/[0.04] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${showModeMenu
                    ? 'text-foreground border-black/12'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.06]'
                    } ${(!onModeChange || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Select Agent Mode"
                >
                  <span className={`${currentMode === 'hunter' ? 'text-[#C08B5C]' : ''}`}>
                    {currentModeData.icon}
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide">{currentModeData.label}</span>
                </button>

                <AnimatePresence>
                  {showModeMenu && onModeChange && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.12, ease: 'easeOut' }}
                      className="absolute bottom-full left-0 mb-2 w-64 bg-background border border-black/[0.08] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-30"
                    >
                      <div className="p-1.5 flex flex-col gap-0.5">
                        <div className="px-3 pt-2 pb-1.5 text-[9px] uppercase font-bold text-muted-foreground/50 tracking-[0.12em]">
                          Agent Mode
                        </div>
                        {modes.map(mode => {
                          const isActive = currentMode === mode.id;

                          return (
                            <button
                              key={mode.id}
                              type="button"
                              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${isActive
                                ? 'bg-black/[0.06] text-foreground'
                                : 'text-muted-foreground hover:bg-black/[0.03] hover:text-foreground/80'
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
                              <div className={`mt-0.5 shrink-0 ${isActive ? 'text-[#C08B5C]' : 'text-muted-foreground/50'}`}>
                                {mode.icon}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-[12px] font-semibold">
                                  {mode.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground/50 leading-snug mt-0.5">
                                  {mode.description}
                                </span>
                              </div>
                              {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C08B5C] mt-2 shrink-0 shadow-[0_0_8px_rgba(192,139,92,0.4)]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Model Selector */}
              {onModelChange && selectedModel && availableModels.length > 0 && (
                <>
                  <div className="w-px h-3.5 bg-black/[0.05] mx-0.5" />
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
                  <div className="w-px h-3.5 bg-black/[0.05] mx-0.5" />
                  <TokenUsageMeter
                    usage={tokenUsage}
                    isNearLimit={isNearTokenLimit}
                    isExhausted={isTokenExhausted}
                    onClick={onTokenUpgrade}
                  />
                </>
              )}

              {/* Divider */}
              <div className="w-px h-3.5 bg-black/[0.05] mx-0.5" />

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
                    ? 'text-foreground bg-black/[0.08]'
                    : 'text-muted-foreground/70 hover:text-foreground/80 hover:bg-black/[0.05]'
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
                      className="absolute bottom-full left-0 mb-2 w-56 bg-popover backdrop-blur-xl rounded-lg border border-black/[0.12] overflow-hidden z-50"
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
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-black/[0.06] transition-colors"
                        >
                          <Paperclip className="w-4 h-4 text-foreground/70" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-foreground">Attach file</div>
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
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-black/[0.06] transition-colors"
                          >
                            <Settings className="w-4 h-4 text-foreground/70" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-foreground">Preferences</div>
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
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-black/[0.06] transition-colors"
                          >
                            <Link2 className="w-4 h-4 text-foreground/70" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-foreground">Integrations</div>
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
              {/* Wand Autopilot Button */}
              <div className="relative" ref={wandPopoverRef}>
                <button
                  type="button"
                  onClick={() => {
                    const wandReady = wandState?.isActive && (wandState.status === 'ready' || wandState.status === 'done' || wandState.status === 'paused');
                    console.log('[Wand] clicked', { isActive: wandState?.isActive, wandReady, message: message.trim() });
                    if (wandReady && message.trim()) {
                      // Wand is on and user typed a new goal — run it
                      const goal = message.trim();
                      setMessage('');
                      onActivateWand?.(goal);
                    } else if (wandState?.isActive && !wandReady) {
                      // Wand is actively running — show popover for status/stop
                      setShowWandPopover(!showWandPopover);
                    } else if (!wandState?.isActive && message.trim()) {
                      // Wand is off, user typed a goal — activate
                      const goal = message.trim();
                      setMessage('');
                      onActivateWand?.(goal);
                    } else {
                      setShowWandPopover(!showWandPopover);
                    }
                  }}
                  disabled={isLoading && !wandState?.isActive}
                  className={`relative p-1.5 rounded-lg transition-all duration-200 ${
                    wandState?.isActive
                      ? 'bg-[#C08B5C]/25 text-[#C08B5C] ring-1 ring-[#C08B5C]/40'
                      : 'opacity-70 hover:opacity-100 text-muted-foreground/70 hover:text-foreground/80 hover:bg-black/[0.05]'
                  } disabled:opacity-30`}
                  style={wandState?.isActive ? { boxShadow: '0 0 10px rgba(192,139,92,0.3), 0 0 20px rgba(192,139,92,0.1)' } : undefined}
                  aria-label="Autopilot Wand"
                  title="Autopilot Wand (Beta)"
                  data-wand-id="wand-button"
                  data-wand-type="button"
                  data-wand-label="Autopilot Wand"
                >
                  <WandIcon className={`w-[18px] h-[18px] ${wandState?.isActive ? 'animate-pulse' : ''}`} active={wandState?.isActive} />
                  {wandState?.isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border border-black/20" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
                  )}
                  {!wandState?.isActive && (
                    <span className="absolute -top-1.5 -right-2 text-[7px] font-bold bg-[#C08B5C]/20 text-[#C08B5C] rounded px-0.5 leading-tight">BETA</span>
                  )}
                </button>

                {/* Wand Popover */}
                <AnimatePresence>
                  {showWandPopover && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute bottom-full right-0 mb-2 w-72 bg-popover backdrop-blur-xl rounded-xl border border-black/[0.12] overflow-hidden z-50"
                      style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)' }}
                    >
                      {wandState?.isActive ? (
                        /* Active state: show status + stop button */
                        <div className="p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-[#C08B5C]/10 flex items-center justify-center">
                              <WandIcon className="w-4 h-4" active />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-semibold text-foreground/80">Wand Active</div>
                              <div className="text-[10px] text-muted-foreground/50">Step {(wandState.currentStep || 0) + 1} of {wandState.estimatedTotal || '?'}</div>
                            </div>
                          </div>
                          {wandState.statusText && (
                            <div className="text-[11px] text-[#C08B5C]/80 mb-3 flex items-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C08B5C] animate-pulse" />
                              {wandState.statusText}
                            </div>
                          )}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              onDeactivateWand?.();
                              setShowWandPopover(false);
                            }}
                            className="w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-[12px] font-semibold hover:bg-red-500/15 transition-colors"
                          >
                            Stop Wand
                          </button>
                        </div>
                      ) : (
                        /* Inactive state: quick actions or type in composer */
                        <div className="p-3.5">
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#C08B5C]/15 to-[#C08B5C]/5 border border-[#C08B5C]/15 flex items-center justify-center">
                              <WandIcon className="w-3.5 h-3.5" active />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] font-semibold text-foreground/80">Autopilot Wand</span>
                              <span className="text-[7px] font-bold bg-[#C08B5C]/15 text-[#C08B5C] rounded px-1 py-0.5">BETA</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground/50 leading-relaxed mb-3">
                            Type a goal in the composer and click the wand, or pick a quick action below.
                          </p>
                          <div className="space-y-1.5">
                            {[
                              { label: '🔍 Find deals in Austin under $500K', goal: 'Find investment properties in Austin, TX under $500,000 with good STR potential' },
                              { label: '📊 Morning briefing', goal: 'Give me a morning briefing — check my deals pipeline, portfolio, and reports' },
                              { label: '🏠 Due diligence on a market', goal: 'Run due diligence on the best STR deal in Tampa, FL under $400,000' },
                              { label: '🌎 Sweep Austin vs Tampa vs Nashville', goal: 'Compare deals across Austin, Tampa, and Nashville under $500K' },
                              { label: '✉️ Draft outreach emails', goal: 'Draft professional outreach emails for my top bookmarked properties' },
                            ].map((action) => (
                              <button
                                key={action.label}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  onActivateWand?.(action.goal);
                                  setShowWandPopover(false);
                                }}
                                className="w-full text-left px-2.5 py-2 rounded-lg bg-black/[0.03] hover:bg-[#C08B5C]/10 border border-transparent hover:border-[#C08B5C]/20 text-[11px] text-foreground/70 hover:text-foreground/90 transition-all"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
                  ? 'bg-black/[0.08] hover:bg-black/[0.10] text-foreground'
                  : message.trim() || attachment
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'bg-black/[0.05] text-muted-foreground/40 cursor-not-allowed'
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

      </div >

      {/* Wand status bar — enhanced with confidence + progress */}
      {wandState?.isActive && wandState.statusText && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 px-3.5 py-1.5 text-[10px] text-[#C08B5C]/70"
        >
          {/* Status icon */}
          <span className="flex-shrink-0">
            {wandState.status === 'observing' ? '👁' :
             wandState.status === 'deciding' ? '🧠' :
             wandState.status === 'acting' ? '⚡' :
             wandState.status === 'waiting' ? '⏳' :
             wandState.status === 'verifying' ? '✓' :
             wandState.status === 'paused' ? '⏸' :
             wandState.status === 'done' ? '✨' :
             wandState.status === 'ready' ? '🪄' : '🪄'}
          </span>
          <span className="truncate flex-1">{wandState.statusText}</span>
          {/* Step counter */}
          {wandState.estimatedTotal > 0 && (
            <span className="text-[9px] text-muted-foreground/40 flex-shrink-0">
              {(wandState.currentStep || 0) + 1}/{wandState.estimatedTotal}
            </span>
          )}
          {/* Confidence dot */}
          <span
            className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: (wandState.confidence ?? 1) >= 0.8 ? '#22c55e' :
                          (wandState.confidence ?? 1) >= 0.5 ? '#eab308' : '#ef4444'
            }}
          />
          <button
            type="button"
            onClick={() => onDeactivateWand?.()}
            className="ml-auto text-[9px] text-muted-foreground/40 hover:text-red-400 transition-colors flex-shrink-0"
          >
            Stop
          </button>
        </motion.div>
      )}

      {/* Wand pulse keyframes */}
      {wandState?.isActive && (
        <style>{`
          @keyframes wandPulse {
            0%, 100% { box-shadow: 0 0 0 1px rgba(192,139,92,0.1), 0 0 12px rgba(192,139,92,0.04); }
            50% { box-shadow: 0 0 0 1px rgba(192,139,92,0.2), 0 0 20px rgba(192,139,92,0.08); }
          }
        `}</style>
      )}
    </div >
  );
});

