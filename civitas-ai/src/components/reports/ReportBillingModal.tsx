import React, { useState, useEffect } from 'react';
import { X, FileText, DollarSign, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';

interface ReportBillingModalProps {
  isPro: boolean;
  isFree: boolean;
  onConfirm: () => void;
  onClose: () => void;
  onUpgrade?: () => void;
  freeReportsRemaining?: number;
}

export const ReportBillingModal: React.FC<ReportBillingModalProps> = ({
  isPro, isFree, onConfirm, onClose, onUpgrade, freeReportsRemaining = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentUsage, setCurrentUsage] = useState<{ count: number; total_cents: number } | null>(null);

  useEffect(() => {
    if (isPro) {
      subscriptionService.getCurrentUsage()
        .then(data => {
          setCurrentUsage(data.reports || { count: 0, total_cents: 0 });
        })
        .catch(() => setCurrentUsage({ count: 0, total_cents: 0 }));
    }
  }, [isPro]);

  const handleConfirm = () => {
    setLoading(true);
    onConfirm();
  };

  const showFreeLimit = isFree && freeReportsRemaining <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 rounded-xl bg-popover border border-black/[0.08] shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground/70" />
            Generate Report
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-black/[0.05] text-muted-foreground/50 hover:text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {showFreeLimit ? (
            <>
              <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/10 px-3.5 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-semibold text-amber-400">Free Report Limit Reached</div>
                  <div className="text-[10px] text-amber-400/60 mt-0.5 leading-relaxed">
                    You've used all 2 free reports this month. Upgrade to Pro to generate unlimited reports at $5 each.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-muted-foreground/70 hover:text-foreground/70 hover:bg-black/[0.03]"
                >
                  Cancel
                </button>
                {onUpgrade && (
                  <button
                    onClick={onUpgrade}
                    className="px-4 py-2 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[12px] font-bold hover:bg-[#D4A27F] flex items-center gap-1.5"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </>
          ) : isPro ? (
            <>
              <div className="flex items-start gap-2.5 rounded-lg bg-black/[0.02] border border-black/[0.06] px-3.5 py-3">
                <DollarSign className="w-4 h-4 text-[#C08B5C] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-semibold text-foreground/70">Report Generation Fee</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-0.5 leading-relaxed">
                    A <span className="font-semibold text-muted-foreground">$5.00</span> fee will be added to your current billing period.
                  </div>
                </div>
              </div>

              {currentUsage && (
                <div className="rounded-lg bg-black/[0.02] border border-black/[0.05] px-3.5 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/50">Current period reports</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {currentUsage.count} reports &middot; ${(currentUsage.total_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground/50">After this report</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {currentUsage.count + 1} reports &middot; ${((currentUsage.total_cents + 500) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-muted-foreground/70 hover:text-foreground/70 hover:bg-black/[0.03]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[12px] font-bold hover:bg-[#D4A27F] disabled:opacity-40"
                >
                  {loading ? 'Generating...' : 'Generate — $5.00'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                You have <span className="font-semibold text-foreground/70">{freeReportsRemaining}</span> free report{freeReportsRemaining !== 1 ? 's' : ''} remaining this month.
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-muted-foreground/70 hover:text-foreground/70 hover:bg-black/[0.03]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-[#C08B5C] text-[#0A0A0C] text-[12px] font-bold hover:bg-[#D4A27F] disabled:opacity-40"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
