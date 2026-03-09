/**
 * WalkthroughMode — Guided room-by-room property walkthrough
 *
 * Step-by-step UI guiding users through a property:
 *   1. Start walkthrough → creates session via POST /walkthrough
 *   2. Suggests room sequence with horizontal scroll cards
 *   3. Each room: capture → analysis → mini result card
 *   4. Circular progress arc showing completion
 *   5. On complete → navigates to Property Dashboard
 *
 * Design: Horizontal snap-scroll room cards, circular progress arc,
 * shared-element transitions, cinematic completion glow.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Play,
  Camera,
  ChevronRight,
  CheckCircle2,
  Plus,
  SkipForward,
  Loader2,
  X,
  Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraFeed, type CameraFeedRef } from '../shared/CameraFeed';
import { ScoreGauge } from '../shared/ScoreGauge';
import { SeverityBadge } from '../shared/SeverityBadge';
import type { Detection } from '../shared/DetectionOverlay';

// ── Types ──────────────────────────────────────────────────

interface RoomAnalysis {
  room_type: string;
  condition: string;
  condition_confidence: number;
  detections: Detection[];
  summary?: string;
  renovation_costs?: {
    basic_refresh: number;
    standard_rental: number;
    premium_upgrade: number;
  };
  investment_metrics?: {
    deal_score: number;
  };
}

interface RoomConfig {
  id: string;
  name: string;
  icon: string;
  status: 'pending' | 'scanning' | 'done' | 'skipped';
  result?: RoomAnalysis;
}

type WalkthroughPhase = 'start' | 'scanning' | 'capture' | 'complete';

interface WalkthroughModeProps {
  /** Navigate to full dashboard after completion */
  onViewDashboard?: (sessionId: string) => void;
}

// ── API Config ─────────────────────────────────────────────

const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http')) ? envApiUrl : 'http://localhost:8001';
const API_KEY = import.meta.env.VITE_API_KEY;

function getHeaders(isJson = false): HeadersInit {
  const headers: HeadersInit = {};
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  if (isJson) headers['Content-Type'] = 'application/json';
  return headers;
}

// ── Default rooms ──────────────────────────────────────────

const DEFAULT_ROOMS: Omit<RoomConfig, 'status'>[] = [
  { id: 'living', name: 'Living Room', icon: '🛋️' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'bedroom1', name: 'Bedroom 1', icon: '🛏️' },
  { id: 'bathroom1', name: 'Bathroom', icon: '🚿' },
  { id: 'bedroom2', name: 'Bedroom 2', icon: '🛏️' },
  { id: 'dining', name: 'Dining Room', icon: '🪑' },
  { id: 'garage', name: 'Garage', icon: '🚗' },
];

// ── Helpers ────────────────────────────────────────────────

function formatDamageClass(cls: string): string {
  return cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const conditionColors: Record<string, string> = {
  excellent: 'text-emerald-400',
  good: 'text-green-400',
  fair: 'text-yellow-400',
  poor: 'text-orange-400',
  critical: 'text-red-400',
};

// ── Circular Progress Arc ──────────────────────────────────

const ProgressArc: React.FC<{
  total: number;
  completed: number;
  rooms: RoomConfig[];
}> = ({ total, completed, rooms }) => {
  const size = 160;
  const strokeWidth = 4;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#8B5CF6" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.3))' }}
        />

        {/* Room indicator dots around the arc */}
        {rooms.map((room, i) => {
          const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
          const dotRadius = radius + 12;
          const cx = size / 2 + dotRadius * Math.cos(angle);
          const cy = size / 2 + dotRadius * Math.sin(angle);
          const fill = room.status === 'done' ? '#8B5CF6' :
                       room.status === 'scanning' ? '#A78BFA' :
                       room.status === 'skipped' ? 'rgba(255,255,255,0.1)' :
                       'rgba(0,0,0,0.06)';
          return (
            <motion.circle
              key={room.id}
              cx={cx} cy={cy} r={3}
              fill={fill}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          );
        })}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-foreground">
          {completed}
        </span>
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
          of {total} rooms
        </span>
      </div>
    </div>
  );
};

// ── Room Card ──────────────────────────────────────────────

const RoomCard: React.FC<{
  room: RoomConfig;
  isActive: boolean;
  onSelect: () => void;
  onSkip: () => void;
}> = ({ room, isActive, onSelect, onSkip }) => (
  <motion.div
    layout
    animate={{ scale: isActive ? 1.05 : 0.95, opacity: isActive ? 1 : 0.5 }}
    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    className={`flex-shrink-0 w-[140px] snap-center rounded-2xl border transition-all duration-200 ${
      isActive
        ? 'bg-background border-violet-500/15 shadow-[0_8px_40px_rgba(139,92,246,0.06)]'
        : room.status === 'done'
        ? 'bg-card border-black/[0.04]'
        : 'bg-background border-black/[0.05]'
    }`}
  >
    <div className="p-4 text-center">
      <div className="text-2xl mb-2">{room.icon}</div>
      <div className="text-xs font-medium text-foreground/70 mb-1">{room.name}</div>

      {room.status === 'done' && room.result ? (
        <div className="mt-2">
          <span className={`text-[10px] font-medium capitalize ${conditionColors[room.result.condition] || 'text-muted-foreground/70'}`}>
            {room.result.condition}
          </span>
          <div className="text-[9px] text-muted-foreground/40 mt-0.5">
            {room.result.detections.length} issue{room.result.detections.length !== 1 ? 's' : ''}
          </div>
        </div>
      ) : room.status === 'scanning' ? (
        <div className="mt-2 flex items-center justify-center gap-1">
          <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
          <span className="text-[10px] text-violet-400">Scanning</span>
        </div>
      ) : room.status === 'skipped' ? (
        <div className="mt-2 text-[10px] text-muted-foreground/40">Skipped</div>
      ) : isActive ? (
        <div className="mt-2 flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onSelect}
            className="flex-1 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-[10px] font-medium border border-violet-500/10"
          >
            Scan
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onSkip}
            className="p-1.5 rounded-lg bg-black/[0.03] border border-black/[0.04]"
          >
            <SkipForward className="w-3 h-3 text-muted-foreground/50" />
          </motion.button>
        </div>
      ) : (
        <div className="mt-2 text-[10px] text-muted-foreground/40">Pending</div>
      )}
    </div>
  </motion.div>
);

// ── Main Component ─────────────────────────────────────────

export const WalkthroughMode: React.FC<WalkthroughModeProps> = ({ onViewDashboard }) => {
  const [phase, setPhase] = useState<WalkthroughPhase>('start');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomConfig[]>(
    DEFAULT_ROOMS.map(r => ({ ...r, status: 'pending' as const }))
  );
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraFeedRef>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const completedCount = rooms.filter(r => r.status === 'done').length;
  const activeRoom = rooms[activeRoomIndex];

  // ── Start walkthrough ─────────────────────────────────

  const startWalkthrough = useCallback(async () => {
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/vision/walkthrough`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          rooms: rooms.map(r => r.name),
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setSessionId(data.session_id);
        setPhase('scanning');
      } else {
        // Fallback: use local session
        setSessionId(`local-${Date.now()}`);
        setPhase('scanning');
      }
    } catch {
      // Fallback to local mode
      setSessionId(`local-${Date.now()}`);
      setPhase('scanning');
    }
  }, [rooms]);

  // ── Scan current room ─────────────────────────────────

  const scanCurrentRoom = useCallback(() => {
    setPhase('capture');
  }, []);

  const handleCapture = useCallback(async (file: File, previewUrl: string) => {
    if (!sessionId) return;
    setAnalyzing(true);
    setPhase('scanning');

    // Mark room as scanning
    setRooms(prev => prev.map((r, i) =>
      i === activeRoomIndex ? { ...r, status: 'scanning' as const } : r
    ));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('room_name', activeRoom.name);

      const resp = await fetch(
        `${API_BASE}/api/vision/walkthrough/${sessionId}/room`,
        { method: 'POST', headers: getHeaders(), body: formData }
      );

      if (resp.ok) {
        const data = await resp.json();
        setRooms(prev => prev.map((r, i) =>
          i === activeRoomIndex ? { ...r, status: 'done' as const, result: data } : r
        ));
      } else {
        // Fallback: use direct analyze
        const analyzeForm = new FormData();
        analyzeForm.append('file', file);
        analyzeForm.append('region', 'national_average');

        const analyzeResp = await fetch(`${API_BASE}/api/vision/analyze`, {
          method: 'POST', headers: getHeaders(), body: analyzeForm,
        });

        if (analyzeResp.ok) {
          const data = await analyzeResp.json();
          setRooms(prev => prev.map((r, i) =>
            i === activeRoomIndex ? { ...r, status: 'done' as const, result: data } : r
          ));
        } else {
          throw new Error('Analysis failed');
        }
      }

      // Move to next pending room
      const nextIdx = rooms.findIndex((r, i) => i > activeRoomIndex && r.status === 'pending');
      if (nextIdx >= 0) {
        setActiveRoomIndex(nextIdx);
      } else {
        // Check if all done
        const updatedRooms = rooms.map((r, i) =>
          i === activeRoomIndex ? { ...r, status: 'done' as const } : r
        );
        const allDone = updatedRooms.every(r => r.status === 'done' || r.status === 'skipped');
        if (allDone) {
          // Complete the walkthrough
          try {
            await fetch(`${API_BASE}/api/vision/walkthrough/${sessionId}/complete`, {
              method: 'POST', headers: getHeaders(),
            });
          } catch { /* ignore */ }
          setPhase('complete');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Room scan failed');
      setRooms(prev => prev.map((r, i) =>
        i === activeRoomIndex ? { ...r, status: 'pending' as const } : r
      ));
    } finally {
      setAnalyzing(false);
    }
  }, [sessionId, activeRoomIndex, activeRoom, rooms]);

  // ── Skip room ─────────────────────────────────────────

  const skipRoom = useCallback(() => {
    setRooms(prev => prev.map((r, i) =>
      i === activeRoomIndex ? { ...r, status: 'skipped' as const } : r
    ));
    const nextIdx = rooms.findIndex((r, i) => i > activeRoomIndex && r.status === 'pending');
    if (nextIdx >= 0) {
      setActiveRoomIndex(nextIdx);
    } else {
      setPhase('complete');
    }
  }, [activeRoomIndex, rooms]);

  // ── Add custom room ───────────────────────────────────

  const addRoom = useCallback(() => {
    const id = `custom-${Date.now()}`;
    setRooms(prev => [...prev, { id, name: `Room ${prev.length + 1}`, icon: '📷', status: 'pending' }]);
  }, []);

  // ── Render ────────────────────────────────────────────

  return (
    <div className="h-full w-full flex flex-col bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ── Start Screen ────────────────────────── */}
        {phase === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center mb-6"
            >
              <Camera className="w-10 h-10 text-violet-400" />
            </motion.div>

            <h2 className="text-xl font-display font-semibold text-foreground mb-2 text-center">
              Property Walkthrough
            </h2>
            <p className="text-sm text-muted-foreground/60 text-center leading-relaxed max-w-xs mb-8">
              Scan each room for a complete property assessment. Scores aggregate into a comprehensive property report.
            </p>

            {/* Room count preview */}
            <div className="flex items-center gap-2 mb-6">
              {rooms.slice(0, 5).map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-xl"
                >
                  {room.icon}
                </motion.div>
              ))}
              {rooms.length > 5 && (
                <span className="text-xs text-muted-foreground/40">+{rooms.length - 5}</span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={startWalkthrough}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-violet-500 hover:bg-violet-600 text-foreground text-sm font-medium transition-colors shadow-[0_4px_24px_rgba(139,92,246,0.3)]"
            >
              <Play className="w-4 h-4" />
              Begin Walkthrough
            </motion.button>

            {error && (
              <p className="mt-4 text-xs text-red-400">{error}</p>
            )}
          </motion.div>
        )}

        {/* ── Scanning Phase ──────────────────────── */}
        {phase === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center p-6 overflow-y-auto"
          >
            {/* Progress arc */}
            <div className="mb-6 mt-2">
              <ProgressArc
                total={rooms.length}
                completed={completedCount}
                rooms={rooms}
              />
            </div>

            {/* Room cards — horizontal scroll */}
            <div className="w-full mb-6">
              <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-2"
              >
                {rooms.map((room, i) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isActive={i === activeRoomIndex}
                    onSelect={scanCurrentRoom}
                    onSkip={skipRoom}
                  />
                ))}

                {/* Add room button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={addRoom}
                  className="flex-shrink-0 w-[140px] snap-center rounded-2xl border border-dashed border-black/[0.06] flex flex-col items-center justify-center p-4 hover:bg-black/[0.02] transition-colors"
                >
                  <Plus className="w-5 h-5 text-muted-foreground/40 mb-1" />
                  <span className="text-[10px] text-muted-foreground/40">Add room</span>
                </motion.button>
              </div>
            </div>

            {/* Current room prompt */}
            {activeRoom && activeRoom.status === 'pending' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Scan <span className="text-foreground/80 font-medium">{activeRoom.name}</span>
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={scanCurrentRoom}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium border border-violet-500/10 hover:bg-violet-500/30 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  Open Camera
                </motion.button>
              </motion.div>
            )}

            {/* Complete button when all rooms done/skipped */}
            {rooms.every(r => r.status === 'done' || r.status === 'skipped') && phase !== 'complete' && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPhase('complete')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-violet-500 hover:bg-violet-600 text-foreground text-sm font-medium transition-colors shadow-[0_4px_24px_rgba(139,92,246,0.3)] mt-4"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete Walkthrough
              </motion.button>
            )}

            {error && (
              <p className="mt-4 text-xs text-red-400">{error}</p>
            )}
          </motion.div>
        )}

        {/* ── Camera Capture ──────────────────────── */}
        {phase === 'capture' && (
          <motion.div
            key="capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full relative"
          >
            {/* Room label overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-xl border border-black/[0.08]">
              <span className="text-lg">{activeRoom?.icon}</span>
              <span className="text-xs font-medium text-foreground/70">{activeRoom?.name}</span>
              <span className="text-[10px] text-muted-foreground/50">
                {activeRoomIndex + 1}/{rooms.length}
              </span>
            </div>

            {/* Back button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setPhase('scanning')}
              className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl border border-black/[0.08] flex items-center justify-center"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>

            <CameraFeed
              ref={cameraRef}
              active={true}
              showScanLine={true}
              onCapture={handleCapture}
              onUpload={handleCapture}
            />
          </motion.div>
        )}

        {/* ── Completion Screen ───────────────────── */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 relative"
          >
            {/* Radial glow background */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 0.15 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute w-40 h-40 rounded-full bg-violet-500 blur-[80px]"
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="relative z-10 text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-500/15 border border-violet-500/15 flex items-center justify-center mb-6">
                <Trophy className="w-10 h-10 text-violet-400" />
              </div>

              <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                Walkthrough Complete
              </h2>
              <p className="text-sm text-muted-foreground/60 mb-2">
                {completedCount} of {rooms.length} rooms scanned
              </p>

              {/* Quick summary */}
              <div className="flex items-center justify-center gap-3 my-6">
                {rooms.filter(r => r.status === 'done' && r.result).slice(0, 4).map(room => (
                  <div key={room.id} className="text-center">
                    <div className="text-lg mb-1">{room.icon}</div>
                    <div className={`text-[10px] font-medium capitalize ${conditionColors[room.result!.condition] || 'text-muted-foreground/70'}`}>
                      {room.result!.condition}
                    </div>
                  </div>
                ))}
              </div>

              {onViewDashboard && sessionId && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onViewDashboard(sessionId)}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-violet-500 hover:bg-violet-600 text-foreground text-sm font-medium transition-colors shadow-[0_4px_24px_rgba(139,92,246,0.3)]"
                >
                  View Property Dashboard
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}

              {!onViewDashboard && (
                <div className="text-[10px] text-muted-foreground/40 uppercase tracking-widest mt-4">
                  Dashboard coming soon
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalkthroughMode;
