/**
 * LiveCallCard — displayed in chat during an active AI voice call.
 * Shows call status (ringing → connected → in progress → completed)
 * with a live transcript feed and end call button.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Phone, PhoneOff, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { API_BASE_URL, jsonHeaders } from '../../../services/apiConfig';

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
}

interface LiveCallCardProps {
  callId: string;
  professionalName: string;
  toPhone: string;
}

const STATUS_LABELS: Record<string, string> = {
  initiated: 'Initiating call...',
  ringing: 'Ringing...',
  'in-progress': 'Connected',
  answered: 'Connected',
  completed: 'Call ended',
  failed: 'Call failed',
  busy: 'Line busy',
  'no-answer': 'No answer',
  canceled: 'Cancelled',
  not_found: 'Call not found',
};

export const LiveCallCard: React.FC<LiveCallCardProps> = ({
  callId,
  professionalName,
  toPhone,
}) => {
  const [status, setStatus] = useState('initiated');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [ending, setEnding] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const isFinished = ['completed', 'failed', 'busy', 'no-answer', 'canceled', 'not_found'].includes(status);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v2/communications/call/${callId}/status`, {
        headers: jsonHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        if (data.transcript?.length) setTranscript(data.transcript);
      }
    } catch { /* ignore */ }
  }, [callId]);

  useEffect(() => {
    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => clearInterval(pollRef.current);
  }, [poll]);

  useEffect(() => {
    if (isFinished) clearInterval(pollRef.current);
  }, [isFinished]);

  const handleEnd = useCallback(async () => {
    setEnding(true);
    try {
      await fetch(`${API_BASE_URL}/v2/communications/call/${callId}/end`, {
        method: 'POST',
        headers: jsonHeaders(),
      });
      setStatus('completed');
    } catch { /* ignore */ }
    setEnding(false);
  }, [callId]);

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden max-w-md">
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] ${
        isFinished ? '' : 'bg-emerald-500/5'
      }`}>
        <Phone className={`w-4 h-4 ${isFinished ? 'text-white/30' : 'text-emerald-400'}`} />
        <span className="text-[12px] font-medium text-white/70">
          {isFinished ? 'Call completed' : 'Live call'} — {professionalName}
        </span>
        {!isFinished && (
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Status */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          {!isFinished ? (
            <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin" />
          ) : status === 'completed' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-400/80" />
          )}
          <span className="text-[12px] text-white/60">
            {STATUS_LABELS[status] || status}
          </span>
          <span className="text-[11px] text-white/25 ml-auto">{toPhone}</span>
        </div>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto rounded-lg bg-white/[0.02] border border-white/[0.04] p-2">
            {transcript.map((t, i) => (
              <div key={i} className="text-[11px]">
                <span className={`font-medium ${
                  t.speaker === 'ai' ? 'text-[#D4A27F]/70' : 'text-white/50'
                }`}>
                  {t.speaker === 'ai' ? 'You (Vasthu)' : 'Professional'}:
                </span>
                <span className="text-white/40 ml-1">{t.text}</span>
              </div>
            ))}
          </div>
        )}

        {transcript.length === 0 && !isFinished && (
          <p className="text-[11px] text-white/20 mt-1">
            Transcript will appear as the conversation progresses...
          </p>
        )}
      </div>

      {/* Actions */}
      {!isFinished && (
        <div className="flex items-center px-4 py-2.5 border-t border-white/[0.06]">
          <button
            onClick={handleEnd}
            disabled={ending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                       bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20
                       transition-all disabled:opacity-50"
          >
            <PhoneOff className="w-3 h-3" />
            {ending ? 'Ending...' : 'End Call'}
          </button>
        </div>
      )}
    </div>
  );
};
