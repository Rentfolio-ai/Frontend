import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, DollarSign, TrendingUp, Calendar, FileText, PartyPopper } from 'lucide-react';
import type { ScoutedProperty } from '../../types/backendTools';
import type { DealStatus } from '../../types/bookmarks';

export interface DealCloseDetails {
  salePrice?: number;
  closeDate?: string;
  notes?: string;
}

interface DealCloseModalProps {
  property: ScoutedProperty | null;
  bookmarkId: string;
  currentStatus: DealStatus;
  targetStatus: DealStatus;
  isPro: boolean;
  onConfirm: (bookmarkId: string, status: DealStatus, details?: DealCloseDetails) => Promise<void>;
  onClose: () => void;
}

const STATUS_CONFIG: Record<DealStatus, { label: string; color: string; description: string }> = {
  active: { label: 'Active', color: 'text-emerald-400', description: 'Mark this deal as actively being pursued.' },
  under_contract: { label: 'Under Contract', color: 'text-amber-400', description: 'Mark this property as under contract.' },
  closed: { label: 'Closed', color: 'text-blue-400', description: 'Mark this deal as closed. A $15 deal close fee will be applied to your account.' },
  lost: { label: 'Lost', color: 'text-red-400', description: 'Mark this deal as lost or no longer being pursued.' },
};

const inputClasses = 'w-full px-3 py-2 rounded-lg bg-black/[0.03] border border-black/[0.06] text-[13px] text-foreground/80 placeholder-muted-foreground/40 focus:outline-none focus:border-[#C08B5C]/30';

export const DealCloseModal: React.FC<DealCloseModalProps> = ({
  property, bookmarkId, currentStatus, targetStatus, isPro, onConfirm, onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [closeDate, setCloseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const config = STATUS_CONFIG[targetStatus];
  const showBillingWarning = targetStatus === 'closed' && isPro;
  const isClosing = targetStatus === 'closed';

  const purchasePrice = property?.price || 0;
  const salePriceNum = parseFloat(salePrice.replace(/[^0-9.]/g, '')) || 0;
  const profit = salePriceNum > 0 && purchasePrice > 0 ? salePriceNum - purchasePrice : null;
  const roi = profit !== null && purchasePrice > 0 ? ((profit / purchasePrice) * 100) : null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const details: DealCloseDetails | undefined = isClosing
        ? { salePrice: salePriceNum || undefined, closeDate: closeDate || undefined, notes: notes.trim() || undefined }
        : undefined;
      await onConfirm(bookmarkId, targetStatus, details);
      if (isClosing) {
        setShowSuccess(true);
      } else {
        onClose();
      }
    } catch {
      setLoading(false);
    }
  };

  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 rounded-xl bg-popover border border-black/[0.08] shadow-xl">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="px-5 py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mx-auto mb-4"
              >
                <PartyPopper className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <h3 className="text-[18px] font-semibold text-foreground mb-1">Deal Closed!</h3>
              <p className="text-[12px] text-muted-foreground/60 mb-5">
                {property.address}, {property.city}
              </p>

              {profit !== null && (
                <div className="rounded-xl bg-black/[0.02] border border-black/[0.05] p-4 mb-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground/50">Purchase</span>
                    <span className="text-[13px] text-foreground/70 tabular-nums">${purchasePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground/50">Sale</span>
                    <span className="text-[13px] text-foreground/70 tabular-nums">${salePriceNum.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-black/[0.05] pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground/60">Profit</span>
                    <span className={`text-[14px] font-bold tabular-nums ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
                    </span>
                  </div>
                  {roi !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground/60">ROI</span>
                      <span className={`text-[13px] font-bold tabular-nums ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#C08B5C] text-[#0A0A0C] text-[13px] font-bold hover:bg-[#D4A27F]"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
                <h3 className="text-[14px] font-semibold text-foreground">
                  {isClosing ? 'Close Deal' : 'Update Deal Status'}
                </h3>
                <button onClick={onClose} className="p-1 rounded-md hover:bg-black/[0.05] text-muted-foreground/50 hover:text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="rounded-lg bg-black/[0.02] border border-black/[0.06] p-3">
                  <div className="text-[12px] font-medium text-foreground/70 truncate">{property.address}</div>
                  <div className="text-[10px] text-muted-foreground/50 mt-0.5">{property.city}, {property.state}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-[11px] text-muted-foreground/50">
                    <span className="text-muted-foreground/40">From:</span>{' '}
                    <span className={STATUS_CONFIG[currentStatus].color}>{STATUS_CONFIG[currentStatus].label}</span>
                  </div>
                  <span className="text-muted-foreground/30">&rarr;</span>
                  <div className="text-[11px]">
                    <span className="text-muted-foreground/40">To:</span>{' '}
                    <span className={config.color}>{config.label}</span>
                  </div>
                </div>

                <p className="text-[12px] text-muted-foreground/70 leading-relaxed">{config.description}</p>

                {isClosing && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1.5 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Sale Price
                      </label>
                      <input
                        type="text"
                        value={salePrice}
                        onChange={e => setSalePrice(e.target.value)}
                        placeholder={purchasePrice ? `Purchase was $${purchasePrice.toLocaleString()}` : '$0'}
                        className={inputClasses}
                      />
                      {profit !== null && salePriceNum > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <TrendingUp className={`w-3 h-3 ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                          <span className={`text-[10px] font-semibold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {profit >= 0 ? '+' : ''}${profit.toLocaleString()} ({roi?.toFixed(1)}% ROI)
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Close Date
                      </label>
                      <input
                        type="date"
                        value={closeDate}
                        onChange={e => setCloseDate(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1.5 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Notes (optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Any final notes about this deal..."
                        rows={2}
                        className={`${inputClasses} resize-none`}
                      />
                    </div>
                  </div>
                )}

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
                  <div className="flex items-start gap-2.5 rounded-lg bg-black/[0.02] border border-black/[0.06] px-3.5 py-3">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                    <div className="text-[10px] text-muted-foreground/70 leading-relaxed">
                      Deal close tracking is available on the Pro plan. Upgrade to track closed deals and their financials.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-black/[0.06]">
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
                  {loading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 border-2 border-[#0A0A0C]/30 border-t-[#0A0A0C] rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isClosing ? 'Close Deal' : 'Confirm'}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
