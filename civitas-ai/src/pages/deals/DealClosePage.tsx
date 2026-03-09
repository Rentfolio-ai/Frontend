import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home, MapPin, DollarSign, Calendar, FileText, CheckCircle2,
  AlertCircle, Loader2, PartyPopper, TrendingUp, Bed, Bath,
} from 'lucide-react';

const API_BASE = (() => {
  const env = import.meta.env.VITE_DATALAYER_API_URL;
  return env && typeof env === 'string' && env.startsWith('http') ? env : '';
})();

interface DealClosePageProps {
  token: string;
}

interface CloseDetails {
  token: string;
  address: string;
  status: string;
  expires_at: string | null;
  property: {
    display_name: string;
    price: number | null;
    city: string | null;
    state: string | null;
    beds: number | null;
    baths: number | null;
  };
  deal_status: string;
}

const inputClasses =
  'w-full px-3 py-2.5 rounded-lg bg-black/[0.03] border border-black/[0.06] text-[13px] text-foreground/80 placeholder-muted-foreground/40 focus:outline-none focus:border-[#C08B5C]/30';

export const DealClosePage: React.FC<DealClosePageProps> = ({ token }) => {
  const [details, setDetails] = useState<CloseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [closed, setClosed] = useState(false);

  const [salePrice, setSalePrice] = useState('');
  const [closeDate, setCloseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bookmarks/close/${token}`);
        if (!res.ok) throw new Error('not found');
        const data = await res.json();
        setDetails(data);
        if (data.status === 'used' || data.deal_status === 'closed') {
          setClosed(true);
        }
      } catch {
        setError('This deal close link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const purchasePrice = details?.property?.price || 0;
  const salePriceNum = parseFloat(salePrice.replace(/[^0-9.]/g, '')) || 0;
  const profit = salePriceNum > 0 && purchasePrice > 0 ? salePriceNum - purchasePrice : null;
  const roi = profit !== null && purchasePrice > 0 ? (profit / purchasePrice) * 100 : null;

  const handleClose = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookmarks/close/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_price: salePriceNum || null,
          close_date: closeDate || null,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to close deal');
      }
      setClosed(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div
          className="h-[2px] w-full rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, #C08B5C 0%, #D4A27F 50%, #C08B5C 100%)' }}
        />

        <div className="rounded-b-2xl border border-t-0 border-black/[0.08] bg-background p-8">
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 text-[#C08B5C] animate-spin mb-4" />
              <p className="text-[14px] text-muted-foreground/60">Loading deal details...</p>
            </div>
          ) : error && !details ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-[18px] font-semibold text-foreground mb-2">Invalid Link</h2>
              <p className="text-[13px] text-muted-foreground/60 text-center max-w-[300px]">{error}</p>
            </div>
          ) : closed ? (
            <div className="flex flex-col items-center py-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mb-4"
              >
                <PartyPopper className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <h2 className="text-[18px] font-semibold text-foreground mb-2">Deal Closed!</h2>
              <p className="text-[13px] text-muted-foreground/60 text-center">
                {details?.address || details?.property?.display_name}
              </p>

              {profit !== null && (
                <div className="w-full rounded-xl bg-black/[0.02] border border-black/[0.05] p-4 mt-5 space-y-2">
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
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#C08B5C]/15 to-[#C08B5C]/5 border border-[#C08B5C]/15 flex items-center justify-center">
                  <Home className="w-7 h-7 text-[#C08B5C]" />
                </div>
              </div>

              <h2 className="text-[18px] font-semibold text-foreground text-center mb-1">Close Deal</h2>
              <p className="text-[13px] text-muted-foreground/60 text-center mb-5">
                Confirm the closing details for this property
              </p>

              {/* Property summary card */}
              <div className="rounded-xl bg-black/[0.02] border border-black/[0.06] p-4 mb-5">
                <div className="text-[14px] font-medium text-foreground/80 mb-1">
                  {details?.property?.display_name || details?.address}
                </div>
                {details?.property?.city && (
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground/50 mb-2">
                    <MapPin className="w-3 h-3" />
                    {details.property.city}, {details.property.state}
                  </div>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  {purchasePrice > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                      <DollarSign className="w-3 h-3" /> ${purchasePrice.toLocaleString()}
                    </span>
                  )}
                  {details?.property?.beds && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                      <Bed className="w-3 h-3" /> {details.property.beds} bed
                    </span>
                  )}
                  {details?.property?.baths && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                      <Bath className="w-3 h-3" /> {details.property.baths} bath
                    </span>
                  )}
                </div>
              </div>

              {/* Close details form */}
              <div className="space-y-4 mb-6">
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

              {error && (
                <div className="flex items-center gap-2 text-[12px] text-red-400 mb-4">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </div>
              )}

              <button
                onClick={handleClose}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#C08B5C] text-[#0A0A0C] text-[14px] font-bold hover:bg-[#D4A27F] transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Closing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Confirm Close
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-muted-foreground/30 mt-4">
          Powered by Civitas AI
        </p>
      </motion.div>
    </div>
  );
};
