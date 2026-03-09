/**
 * VisionProductPage — Standalone Vasthu Vision Product
 *
 * Full-screen standalone wrapper that renders OUTSIDE of DesktopShell.
 * It owns the entire viewport with its own nav bar, bottom tab bar,
 * and renders the active view (Scan, Walkthrough, Portfolio, Settings).
 *
 * Accessible via:
 *   - Direct URL: /vision (landing) -> /vision/app (authenticated)
 *   - Landing page CTA
 *   - Profile menu "Try Vasthu Vision" in Vasthu AI
 */

import React, { useCallback } from 'react';
import {
  ScanEye,
  ArrowLeft,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { VisionShell } from '../../components/vision/VisionShell';

// ── Main Component ──────────────────────────────────────────

interface VisionProductPageProps {
  onBackToApp: () => void;
  onGoToAI?: () => void;
}

export const VisionProductPage: React.FC<VisionProductPageProps> = ({ onBackToApp, onGoToAI }) => {
  const { user } = useAuth();

  const handleBack = useCallback(() => {
    window.history.replaceState({}, '', '/vision');
    onBackToApp();
  }, [onBackToApp]);

  const handleGoToAI = useCallback(() => {
    window.history.replaceState({}, '', '/');
    onGoToAI?.();
  }, [onGoToAI]);

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* ── Product Nav Bar ──────────────────────────────────── */}
      <nav className="flex items-center justify-between px-5 py-3 border-b border-black/[0.04] bg-background/95 backdrop-blur-2xl flex-shrink-0 z-50">
        {/* Left: Back + branding */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Vision Home</span>
          </button>

          <div className="h-5 w-px bg-black/[0.05]" />

          <div className="flex items-center gap-2">
            <ScanEye className="w-5 h-5 text-violet-400" />
            <span className="text-[16px] font-display font-semibold tracking-tight">Vasthu Vision</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300/80 font-medium uppercase tracking-wider border border-violet-500/10">
              Pro
            </span>
          </div>
        </div>

        {/* Right: Cross-link to AI + user avatar */}
        <div className="flex items-center gap-4">
          {onGoToAI && (
            <button
              onClick={handleGoToAI}
              className="hidden sm:flex items-center gap-1.5 text-[12px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              Open Vasthu AI
            </button>
          )}

          {user?.name && (
            <span className="text-sm text-muted-foreground/50 hidden sm:inline">
              {user.name.split(' ')[0]}
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-black/[0.03] border border-black/[0.06] flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground/50" />
            )}
          </div>
        </div>
      </nav>

      {/* ── VisionShell owns all mode switching + tab bar ────── */}
      <div className="flex-1 overflow-hidden">
        <VisionShell />
      </div>
    </div>
  );
};

export default VisionProductPage;
