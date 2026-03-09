/**
 * CallConfirmModal — confirms before initiating an AI voice call.
 * User provides talking points and confirms. If no voice profile,
 * prompts to set one up.
 */

import React, { useState, useCallback } from 'react';
import { Phone, X, Mic, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL, jsonHeaders } from '../../services/apiConfig';

interface CallConfirmModalProps {
  professionalId: string;
  professionalName: string;
  toPhone: string;
  hasVoiceProfile: boolean;
  onClose: () => void;
  onCallStarted: (callId: string) => void;
  onGoToIntegrations?: () => void;
}

export const CallConfirmModal: React.FC<CallConfirmModalProps> = ({
  professionalId,
  professionalName,
  toPhone,
  hasVoiceProfile,
  onClose,
  onCallStarted,
  onGoToIntegrations,
}) => {
  const [talkingPoints, setTalkingPoints] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const handleStart = useCallback(async () => {
    setStarting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/v2/communications/call`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
          professional_id: professionalId,
          to_phone: toPhone,
          talking_points: talkingPoints,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Failed to start call' }));
        throw new Error(data.detail || `HTTP ${res.status}`);
      }
      const result = await res.json();
      onCallStarted(result.call_id);
    } catch (e: any) {
      setError(e.message);
      setStarting(false);
    }
  }, [professionalId, toPhone, talkingPoints, onCallStarted]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-popover border border-black/[0.08] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#D4A27F]" />
            <h2 className="text-[14px] font-semibold text-foreground">Call {professionalName}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/[0.04] transition-colors">
            <X className="w-4 h-4 text-muted-foreground/70" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {!hasVoiceProfile ? (
            /* No voice profile */
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-400/80" />
                <span className="text-[13px] text-foreground/70">Voice profile required</span>
              </div>
              <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                Record a voice sample so Vasthu can make calls using your voice.
                Go to Settings → Integrations → Voice Profile.
              </p>
              <button
                onClick={onGoToIntegrations}
                className="px-4 py-2 rounded-lg text-[12px] font-medium
                           bg-[#C08B5C]/20 hover:bg-[#C08B5C]/30 text-[#D4A27F]
                           border border-[#C08B5C]/20 transition-all"
              >
                Set up Voice Profile
              </button>
            </div>
          ) : (
            /* Ready to call */
            <>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Calling</span>
                <p className="text-[13px] text-foreground/70 mt-0.5">{professionalName} — {toPhone}</p>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground/50 block mb-1.5">
                  What should Vasthu discuss?
                </label>
                <textarea
                  value={talkingPoints}
                  onChange={e => setTalkingPoints(e.target.value)}
                  placeholder="e.g., Ask about available properties in Austin, discuss pricing, get info on their commission structure..."
                  className="w-full h-24 px-3 py-2 rounded-lg bg-black/[0.02] border border-black/[0.08]
                             text-[12px] text-foreground/70 placeholder:text-muted-foreground/40 resize-none
                             focus:outline-none focus:border-[#C08B5C]/30 transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-400/80">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {hasVoiceProfile && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-black/[0.06]">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground/70
                         hover:bg-black/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              disabled={starting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-medium
                         bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400
                         border border-emerald-500/20 transition-all disabled:opacity-50"
            >
              {starting ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Starting...</>
              ) : (
                <><Phone className="w-3 h-3" /> Start Call</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
