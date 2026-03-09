import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';
import type { ModelInfo } from '../../types/chat';

const PROVIDER_ORDER = ['google', 'openai', 'anthropic', 'xai'] as const;

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  google: (
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ),
  openai: (
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  ),
  anthropic: (
    <svg viewBox="0 0 16 16" className="w-3 h-3" fill="#D97757">
      <path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212 2.736-.75.096-.324-.302.04-.496.154-.162 1.267-.871z" />
    </svg>
  ),
  xai: (
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
      <path d="M2.04 3h4.44l5.52 8.52L17.52 3h4.44l-7.8 11.4L22.08 21h-4.44l-5.64-8.64L6.36 21H1.92l7.92-11.4L2.04 3z" />
    </svg>
  ),
};

const AutoIcon = ({ className = "w-3 h-3" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
    <path d="M12 8v8M8 12h8" strokeOpacity="0.4" />
    <path d="M12 7l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z" fill="currentColor" stroke="none" />
  </svg>
);

function getIconForModel(model: ModelInfo): React.ReactNode {
  if (model.id === 'auto') return <AutoIcon />;
  return PROVIDER_ICONS[model.provider] || null;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  isPro?: boolean;
  models: ModelInfo[];
  disabled?: boolean;
  dropdownAlign?: 'left' | 'right';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  isPro = false,
  models,
  disabled = false,
  dropdownAlign = 'left',
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
  const triggerIcon = current ? getIconForModel(current) : null;

  const autoModel = models.find(m => m.id === 'auto');
  const orderedModels = PROVIDER_ORDER.flatMap(provider =>
    models.filter(m => m.provider === provider && m.id !== 'auto')
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`h-6 pl-1 pr-1.5 rounded-lg flex items-center gap-1.5 transition-all bg-black/[0.04] border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${open
          ? 'text-foreground border-black/12'
          : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.06]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={current?.description || 'Select Model'}
      >
        <span className={`${selectedModel === 'auto' ? 'text-[#C08B5C]' : 'text-muted-foreground'} [&_svg]:w-3 [&_svg]:h-3`}>{triggerIcon}</span>
        <span className="text-[10px] font-semibold tracking-wide truncate">
          {current?.name || selectedModel}
        </span>
        <ChevronDown className="w-3 h-3 opacity-30" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`absolute bottom-full mb-2 w-52 bg-popover/95 backdrop-blur-2xl border border-black/[0.08] rounded-xl shadow-2xl overflow-hidden z-30 ${dropdownAlign === 'right' ? 'right-0' : 'left-0'}`}
          >
            <div className="p-1.5 max-h-[320px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent">
              {autoModel && (
                <>
                  <ModelRow
                    model={autoModel}
                    icon={<AutoIcon />}
                    isSelected={selectedModel === 'auto'}
                    isLocked={false}
                    onSelect={() => { onModelChange('auto'); setOpen(false); }}
                  />
                  <div className="h-px bg-black/[0.04] mx-2 my-1" />
                </>
              )}

              {orderedModels.map(model => {
                const isSelected = selectedModel === model.id;
                const isLocked = model.tier === 'pro' && !isPro;

                return (
                  <ModelRow
                    key={model.id}
                    model={model}
                    icon={PROVIDER_ICONS[model.provider]}
                    isSelected={isSelected}
                    isLocked={isLocked}
                    onSelect={() => { onModelChange(model.id); setOpen(false); }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function ModelRow({
  model,
  icon,
  isSelected,
  isLocked,
  onSelect,
}: {
  model: ModelInfo;
  icon: React.ReactNode;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={isLocked}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${isSelected
        ? 'bg-black/[0.06] text-foreground'
        : isLocked
          ? 'text-muted-foreground/40 cursor-not-allowed'
          : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.03]'
        }`}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLocked) onSelect();
      }}
    >
      <span className={`shrink-0 ${isSelected ? (model.id === 'auto' ? 'text-[#C08B5C]' : 'text-foreground/70') : 'text-muted-foreground/50'}`}>
        {icon}
      </span>
      <span className={`text-[12px] font-semibold truncate flex-1 ${isSelected ? 'text-foreground' : ''}`}>
        {model.name}
      </span>
      {isLocked && <Lock className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0" />}
      {isSelected && (
        <div className="w-1.5 h-1.5 rounded-full bg-[#C08B5C] shrink-0 shadow-[0_0_8px_rgba(192,139,92,0.4)]" />
      )}
    </button>
  );
}

export default ModelSelector;
