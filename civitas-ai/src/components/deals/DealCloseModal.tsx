import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';
import type { ScoutedProperty } from '../../types/backendTools';
import type { DealStatus } from '../../types/bookmarks';

interface DealCloseModalProps {
  property: ScoutedProperty | null;
  bookmarkId: string;
  currentStatus: DealStatus;
  targetStatus: DealStatus;
  isPro: boolean;
  onConfirm: (bookmarkId: string, status: DealStatus) => Promise<void>;
  onClose: () => void;
}

const STATUS_CONFIG: Record<DealStatus, { label: string; color: string; description: string }> = {
  active: { label: 'Active', color: 'text-emerald-400', description: 'Mark this deal as actively being pursued.' },
  under_contract: { label: 'Under Contract', color: 'text-amber-400', description: 'Mark this property as under contract.' },
  closed: { label: 'Closed', color: 'text-blue-400', description: 'Mark this deal as closed. A $15 deal close fee will be applied to your account.' },
  lost: { label: 'Lost', color: 'text-red-400', description: 'Mark this deal as lost or no longer being pursued.' },
};

export const DealCloseModal: React.FC<DealCloseModalProps> = ({
  property, bookmarkId, currentStatus, targetStatus, isPro, onConfirm, onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const config = STATUS_CONFIG[targetStatus];
  const showBillingWarning = targetStatus === 'closed' && isPro;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(bookmarkId, targetStatus);
      onClose();
    } catch {
      setLoading(false);
    }
  };

  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 rounded-xl bg-[#1C1C20] border border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-[14px] font-semibold text-white/90">Update Deal Status</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/[0.06] text-white/30 hover:text-white/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="text-[12px] font-medium text-white/70 truncate">{property.address}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{property.city}, {property.state}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[11px] text-white/30">
              <span className="text-white/20">From:</span>{' '}
              <span className={STATUS_CONFIG[currentStatus].color}>{STATUS_CONFIG[currentStatus].label}</span>
            </div>
            <span className="text-white/10">&rarr;</span>
            <div className="text-[11px]">
              <span className="text-white/20">To:</span>{' '}
              <span className={config.color}>{config.label}</span>
            </div>
          </div>

          <p className="text-[12px] text-white/45 leading-relaxed">{config.description}</p>

          {showBillingWarning && (
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/10 px-3.5 py-3">
              <DollarSign className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-semibold text-amber-400">Billable Action</div>
                <div className="text-[10px] text-amber-400/60 mt-0.5 leading-relaxed">
                  A <span className="font-semibold text-amber-400/80">$15.00</span> deal close fee will be added to your current billing period.
                </div>
              </div>
            </div>
          )}

          {targetStatus === 'closed' && !isPro && (
            <div className="flex items-start gap-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3.5 py-3">
              <AlertTriangle className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-white/40 leading-relaxed">
                Deal close tracking is available on the Pro plan. Upgrade to track closed deals and their financials.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[12px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[12px] font-bold hover:bg-[#D4A27F] disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-[#0A0A0C]/30 border-t-[#0A0A0C] rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
