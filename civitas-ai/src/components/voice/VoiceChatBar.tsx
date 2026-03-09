// FILE: src/components/voice/VoiceChatBar.tsx
// Compact inline voice control bar that replaces the Composer during a voice session.
// Two-row layout: status strip on top, text input + End button on the bottom.

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Camera, CameraOff, RotateCcw, ArrowUp, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceWaveform } from './VoiceWaveform';
import type { UseVoiceSessionReturn } from '../../hooks/useVoiceSession';

interface VoiceChatBarProps {
  session: UseVoiceSessionReturn;
  onSend: (text: string) => void;
  onEnd: () => void;
  onChangePersona?: () => void;
}

export const VoiceChatBar: React.FC<VoiceChatBarProps> = ({
  session,
  onSend,
  onEnd,
  onChangePersona,
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const persona = session.activePersona;
  const accentColor = persona
    ? `rgb(${persona.orbColors.speaking.r1},${persona.orbColors.speaking.g1},${persona.orbColors.speaking.b1})`
    : 'rgb(255,255,255)';

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, session.sessionLimitSeconds - session.elapsed);
  const timerText = session.cameraUsed
    ? formatTime(remainingSeconds)
    : formatTime(session.elapsed);
  const timerWarning = session.cameraUsed && remainingSeconds <= 30;

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }, [text, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture shortcuts when typing in the input
      if (document.activeElement === inputRef.current) return;

      // Space bar — toggle mute
      if (e.code === 'Space' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        session.toggleMute();
      }
      // Escape — end session
      if (e.key === 'Escape') {
        e.preventDefault();
        onEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, onEnd]);

  // ── Transcript export ──
  const handleExportTranscript = useCallback(() => {
    if (session.turns.length === 0) return;

    const lines = session.turns.map(t => {
      const time = t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : '';
      const role = t.role === 'user' ? 'You' : (session.activePersona?.name || 'AI');
      return `[${time}] ${role}: ${t.content}`;
    });

    const header = `Voice Session Transcript\nDate: ${new Date().toLocaleDateString()}\nAdvisor: ${session.activePersona?.name || 'AI'}\nDuration: ${formatTime(session.elapsed)}\n${'─'.repeat(50)}\n`;
    const content = header + lines.join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [session.turns, session.activePersona, session.elapsed]);

  // ── Audio level visualization ──
  const [audioLevel, setAudioLevel] = useState(0);
  const animFrameRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const analyser = session.analyserNode;
    if (!analyser || session.muted) {
      setAudioLevel(0);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    if (!dataArrayRef.current || dataArrayRef.current.length !== bufferLength) {
      dataArrayRef.current = new Uint8Array(bufferLength);
    }

    const update = () => {
      analyser.getByteFrequencyData(dataArrayRef.current!);
      // Average the frequency data to get a simple level (0-1)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArrayRef.current![i];
      }
      const avg = sum / bufferLength / 255;
      setAudioLevel(avg);
      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [session.analyserNode, session.muted]);

  const isError = session.status === 'error' || session.status === 'disconnected';
  const isConnecting = session.status === 'connecting' || session.status === 'idle';

  const statusText = isConnecting
    ? 'Connecting...'
    : session.status === 'tool_calling'
      ? 'Searching...'
      : session.status === 'speaking'
        ? 'Speaking'
        : isError
          ? 'Disconnected'
          : 'Listening';

  return (
    <div className="space-y-2">
      {/* Camera PiP preview */}
      <AnimatePresence>
        {session.camera.isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-end"
          >
            <div className="relative w-[120px] h-[120px] rounded-2xl overflow-hidden border border-[#C08B5C]/15 shadow-[0_8px_24px_rgba(192,139,92,0.12)]">
              <video
                ref={session.camera.videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-bold text-foreground/80 tracking-wider">LIVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session warnings / errors */}
      <AnimatePresence>
        {session.sessionWarning && !session.sessionExpired && (
          <motion.div
            key="warning"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400/80 text-xs text-center"
          >
            {session.cameraUsed
              ? 'Camera session ending soon'
              : 'Session approaching limit'}
          </motion.div>
        )}
        {session.sessionExpired && (
          <motion.div
            key="expired"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg bg-white/50 border border-[#C08B5C]/10"
          >
            <span className="text-muted-foreground text-xs">Session ended</span>
            <button
              onClick={() => session.reconnect()}
              className="px-3 py-1 rounded-full bg-[#C08B5C]/10 hover:bg-[#C08B5C]/20 text-[#C08B5C] hover:text-[#C08B5C] text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Reconnect
            </button>
          </motion.div>
        )}
        {session.error && !session.sessionExpired && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/15"
          >
            <span className="text-red-400/80 text-xs truncate">{session.error}</span>
            {isError && (
              <button
                onClick={() => session.reconnect()}
                className="px-3 py-1 rounded-full bg-[#C08B5C]/10 hover:bg-[#C08B5C]/20 text-[#C08B5C] text-xs font-medium flex items-center gap-1.5 transition-all shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bar */}
      <div className="rounded-2xl backdrop-blur-2xl bg-white/70 border border-[#C08B5C]/12 hover:border-[#C08B5C]/18 transition-all duration-200 shadow-[0_8px_32px_rgba(192,139,92,0.08)]">
        {/* Row 1: Status strip */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-[#C08B5C]/8">
          {/* Persona monogram + name */}
          {persona && (
            <button
              onClick={onChangePersona}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              title="Change advisor"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: `rgba(${persona.orbColors.speaking.r1},${persona.orbColors.speaking.g1},${persona.orbColors.speaking.b1},0.2)`,
                  color: accentColor,
                }}
              >
                {persona.name.charAt(0)}
              </div>
              <span className="text-muted-foreground text-xs font-medium">{persona.name}</span>
            </button>
          )}

          {/* Status */}
          <span className="text-muted-foreground/50 text-[11px]" role="status" aria-live="polite">{statusText}</span>

          {/* Audio level indicator — shows mic input level */}
          {!session.muted && !isError && !isConnecting && (
            <div className="flex items-center gap-[2px] h-3" aria-label="Microphone audio level">
              {[0.15, 0.25, 0.35, 0.50, 0.65].map((threshold, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full transition-all duration-75"
                  style={{
                    height: `${8 + i * 2}px`,
                    backgroundColor: audioLevel > threshold
                      ? accentColor
                      : 'rgba(192,139,92,0.15)',
                    opacity: audioLevel > threshold ? 0.8 : 0.3,
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex-1" />

          {/* Timer */}
          <span
            className={`text-[11px] font-mono tabular-nums ${
              timerWarning ? 'text-amber-400' : 'text-[#C08B5C]/40'
            }`}
          >
            {timerText}
          </span>

          {/* Transcript export */}
          {session.turns.length > 0 && (
            <button
              onClick={handleExportTranscript}
              className="p-1.5 rounded-lg text-[#C08B5C]/40 hover:text-[#C08B5C]/70 hover:bg-[#C08B5C]/8 transition-all"
              title="Download transcript"
              aria-label="Download voice session transcript"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mute toggle */}
          <button
            onClick={session.toggleMute}
            className={`p-1.5 rounded-lg transition-all ${
              session.muted
                ? 'bg-red-500/15 text-red-400'
                : 'text-[#C08B5C]/50 hover:text-[#C08B5C]/80 hover:bg-[#C08B5C]/8'
            }`}
            title={session.muted ? 'Unmute (Space)' : 'Mute (Space)'}
            aria-label={session.muted ? 'Unmute microphone' : 'Mute microphone'}
            role="switch"
            aria-checked={!session.muted}
          >
            {session.muted ? (
              <MicOff className="w-3.5 h-3.5" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Camera toggle */}
          <button
            onClick={session.toggleCamera}
            disabled={session.camera.isInitializing || session.sessionExpired}
            className={`p-1.5 rounded-lg transition-all ${
              session.camera.isActive
                ? 'text-white'
                : 'text-[#C08B5C]/50 hover:text-[#C08B5C]/80 hover:bg-[#C08B5C]/8'
            } disabled:opacity-30`}
            style={
              session.camera.isActive
                ? {
                    backgroundColor: `rgba(${persona?.orbColors.speaking.r1 ?? 255},${persona?.orbColors.speaking.g1 ?? 255},${persona?.orbColors.speaking.b1 ?? 255},0.2)`,
                    color: accentColor,
                  }
                : undefined
            }
            title={session.camera.isActive ? 'Turn off camera' : 'Turn on camera'}
            aria-label={session.camera.isActive ? 'Turn off camera' : 'Turn on camera'}
            role="switch"
            aria-checked={session.camera.isActive}
          >
            {session.camera.isActive ? (
              <Camera className="w-3.5 h-3.5" />
            ) : (
              <CameraOff className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Row 2: Text input + End button */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-foreground placeholder:text-[#C08B5C]/30 text-sm focus:outline-none"
          />

          {/* Send typed message */}
          {text.trim() && (
            <button
              onClick={handleSubmit}
              className="p-1.5 rounded-lg bg-[#C08B5C]/10 hover:bg-[#C08B5C]/20 text-[#C08B5C] transition-all"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {/* End button with waveform dots */}
          <button
            onClick={onEnd}
            className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full bg-[#C08B5C] hover:bg-[#D49E6A] text-white text-sm font-medium transition-all"
            aria-label="End voice session (Escape)"
            title="End session (Esc)"
          >
            <VoiceWaveform
              active={
                !session.muted &&
                session.status !== 'error' &&
                session.status !== 'disconnected'
              }
              color="white"
              size="sm"
            />
            <span>End</span>
          </button>
        </div>
      </div>
    </div>
  );
};
