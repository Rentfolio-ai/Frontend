// FILE: src/components/chat/PropertyContextCard.tsx
// Compact inline card displayed in user message bubbles when a property
// is sent from the Explore page for AI analysis.
import React from 'react';
import { Bed, Bath, Maximize2, Home } from 'lucide-react';
import type { PropertyContextData } from '../../types/chat';

const fmtPrice = (n: number | undefined | null): string => {
  if (n == null) return '';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

const fmtPct = (n: number | undefined | null): string => {
  if (n == null) return '—';
  return `${n.toFixed(1)}%`;
};

const fmtCurrency = (n: number | undefined | null): string => {
  if (n == null) return '—';
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

interface PropertyContextCardProps {
  data: PropertyContextData;
}

export const PropertyContextCard: React.FC<PropertyContextCardProps> = ({ data }) => {
  const metrics = data.calculated_metrics;
  const address = data.address || 'Property';
  const cityState = [data.city, data.state].filter(Boolean).join(', ');

  return (
    <div className="flex gap-3 p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm max-w-[340px] mb-2">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.04]">
        {data.image_url ? (
          <img
            src={data.image_url}
            alt={address}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-6 h-6 text-white/15" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Price + address */}
        <div>
          {data.price && (
            <span className="text-[14px] font-bold text-white/90">{fmtPrice(data.price)}</span>
          )}
          <p className="text-[11px] text-white/50 truncate leading-tight">{address}</p>
          {cityState && (
            <p className="text-[10px] text-white/30 truncate">{cityState}</p>
          )}
        </div>

        {/* Specs */}
        <div className="flex items-center gap-2 text-[10px] text-white/40">
          {data.beds != null && (
            <span className="flex items-center gap-0.5">
              <Bed className="w-3 h-3" /> {data.beds}
            </span>
          )}
          {data.baths != null && (
            <span className="flex items-center gap-0.5">
              <Bath className="w-3 h-3" /> {data.baths}
            </span>
          )}
          {data.sqft != null && (
            <span className="flex items-center gap-0.5">
              <Maximize2 className="w-3 h-3" /> {data.sqft.toLocaleString()}
            </span>
          )}
        </div>

        {/* Metrics row */}
        {metrics && (metrics.cap_rate != null || metrics.monthly_cash_flow != null || metrics.cash_on_cash_roi != null) && (
          <div className="flex items-center gap-2 text-[10px]">
            {metrics.cap_rate != null && (
              <span className="text-white/50">CAP {fmtPct(metrics.cap_rate)}</span>
            )}
            {metrics.monthly_cash_flow != null && (
              <span className={metrics.monthly_cash_flow >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}>
                CF {fmtCurrency(metrics.monthly_cash_flow)}/mo
              </span>
            )}
            {metrics.cash_on_cash_roi != null && (
              <span className="text-white/50">CoC {fmtPct(metrics.cash_on_cash_roi)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
