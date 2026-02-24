import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';
import type { ModelInfo } from '../../types/chat';

const PROVIDER_ORDER = ['google', 'openai', 'anthropic', 'xai'] as const;

const PROVIDER_META: Record<string, { label: string; icon: React.ReactNode }> = {
  google: {
    label: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  openai: {
    label: 'OpenAI',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
      </svg>
    ),
  },
  anthropic: {
    label: 'Anthropic',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M13.827 3.52h3.603L24 20.48h-3.603l-6.57-16.96zm-7.258 0h3.767L16.906 20.48h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm1.065 5.78l-2.36 6.085h4.715l-2.355-6.086z"/>
      </svg>
    ),
  },
  xai: {
    label: 'xAI',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M2.04 3h4.44l5.52 8.52L17.52 3h4.44l-7.8 11.4L22.08 21h-4.44l-5.64-8.64L6.36 21H1.92l7.92-11.4L2.04 3z"/>
      </svg>
    ),
  },
};

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isPro?: boolean;
  models: ModelInfo[];
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  isPro = false,
  models,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = models.find(m => m.id === selectedModel);
  const providerIcon = PROVIDER_META[current?.provider || 'google']?.icon;

  const grouped = PROVIDER_ORDER.map(provider => ({
    provider,
    meta: PROVIDER_META[provider],
    items: models.filter(m => m.provider === provider),
  })).filter(g => g.items.length > 0);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`h-6 pl-1 pr-1.5 rounded-md flex items-center gap-1 border transition-all ${
          open
            ? 'bg-white/[0.12] border-white/20 text-white'
            : 'bg-white/[0.04] border-white/[0.06] text-white/60 hover:text-white/90 hover:bg-white/[0.08] hover:border-white/15'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={current?.description || 'Select Model'}
      >
        <span className="text-white/70 [&_svg]:w-3 [&_svg]:h-3">{providerIcon}</span>
        <span className="text-[10px] font-medium max-w-[100px] truncate">
          {current?.name || selectedModel}
        </span>
        <ChevronDown className="w-2.5 h-2.5 opacity-40" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute bottom-full left-0 mb-2 w-52 bg-[#141414]/95 backdrop-blur-2xl border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-30"
          >
            <div className="p-1.5 max-h-[280px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {grouped.map((group, gi) => (
                <div key={group.provider}>
                  {gi > 0 && <div className="h-px bg-white/[0.06] mx-1.5 my-0.5" />}
                  <div className="px-2 pt-1 pb-0.5 flex items-center gap-1">
                    <span className="text-white/40 [&_svg]:w-2.5 [&_svg]:h-2.5">{group.meta.icon}</span>
                    <span className="text-[8px] font-semibold text-white/35 uppercase tracking-wider">
                      {group.meta.label}
                    </span>
                  </div>

                  {group.items.map(model => {
                    const isSelected = selectedModel === model.id;
                    const isLocked = model.tier === 'pro' && !isPro;

                    return (
                      <button
                        key={model.id}
                        type="button"
                        disabled={isLocked}
                        className={`w-full flex items-center gap-1.5 px-2 py-[5px] rounded-md text-left transition-colors ${
                          isSelected
                            ? 'bg-[#C08B5C]/10 text-white'
                            : isLocked
                            ? 'text-white/25 cursor-not-allowed'
                            : 'text-white/55 hover:text-white hover:bg-white/[0.05]'
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isLocked) {
                            onModelChange(model.id);
                            setOpen(false);
                          }
                        }}
                      >
                        <span className={`text-[11px] font-medium truncate flex-1 ${
                          isSelected ? 'text-[#D4A27F]' : ''
                        }`}>
                          {model.name}
                        </span>
                        {model.tier === 'pro' && !isPro && (
                          <Lock className="w-2.5 h-2.5 text-white/20 shrink-0" />
                        )}
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C08B5C] shadow-[0_0_6px_rgba(192,139,92,0.5)] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
