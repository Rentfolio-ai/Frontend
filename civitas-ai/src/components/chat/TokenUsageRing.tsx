import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import type { TokenUsage } from '@/hooks/useTokenUsage';

interface TokenUsageMeterProps {
  usage: TokenUsage | null;
  isNearLimit: boolean;
  isExhausted: boolean;
  onClick?: () => void;
  className?: string;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export const TokenUsageMeter: React.FC<TokenUsageMeterProps> = ({
  usage,
  isNearLimit,
  isExhausted,
  onClick,
  className,
}) => {
  if (!usage || usage.budget <= 0) return null;

  const fraction = Math.min(usage.percentage / 100, 1);

  const barGradient = isExhausted
    ? 'from-[#ef4444] to-[#f87171]'
    : isNearLimit
      ? 'from-[#f59e0b] to-[#fbbf24]'
      : 'from-[#C08B5C] to-[#D4A27F]';

  const labelColor = isExhausted
    ? 'text-red-400'
    : isNearLimit
      ? 'text-amber-400/80'
      : 'text-white/40';

  const glowStyle = isExhausted
    ? 'shadow-[0_0_8px_rgba(239,68,68,0.15)]'
    : isNearLimit
      ? 'shadow-[0_0_8px_rgba(245,158,11,0.12)]'
      : '';

  const tooltip = isExhausted
    ? `Token limit reached. Resets ${usage.resetDate}`
    : `${formatTokens(usage.used)} / ${formatTokens(usage.budget)} tokens used · Resets ${usage.resetDate}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-2.5 py-[5px] rounded-full',
        'bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm',
        'transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.1] group',
        glowStyle,
        className,
      )}
      title={tooltip}
    >
      {/* Progress bar track */}
      <div className="w-[52px] h-[3px] rounded-full bg-white/[0.08] overflow-hidden flex-shrink-0">
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500',
            barGradient,
          )}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>

      {/* Label */}
      {isExhausted ? (
        <span className="flex items-center gap-0.5 text-[10px] font-medium text-[#D4A27F]">
          Upgrade
          <ArrowRight className="w-2.5 h-2.5" />
        </span>
      ) : (
        <span className={cn('text-[10px] font-medium tabular-nums whitespace-nowrap', labelColor)}>
          {formatTokens(usage.used)}/{formatTokens(usage.budget)}
        </span>
      )}
    </button>
  );
};

/** @deprecated Use TokenUsageMeter instead */
export const TokenUsageRing = TokenUsageMeter;
