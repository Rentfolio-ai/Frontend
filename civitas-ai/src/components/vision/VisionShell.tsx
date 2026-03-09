/**
 * VisionShell — Top-level mode switcher + navigation
 *
 * Replaces the old VisionPage monolith. Provides a bottom tab bar
 * with premium iOS-style segmented control and renders the active
 * mode: Scan (Quick/Live), Walkthrough, History, Compare.
 *
 * Design: Apple Vision Pro quality. Frosted glass, spring physics,
 * staggered animations. No generic UI.
 */

import React, { useState } from 'react';
import {
  Camera,
  Zap,
  Footprints,
  History,
  GitCompareArrows,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickScanMode } from './modes/QuickScanMode';
import { LiveScanMode } from './modes/LiveScanMode';
import { WalkthroughMode } from './modes/WalkthroughMode';
import { ComparisonView } from './ComparisonView';
import { EnhancedHistory } from './EnhancedHistory';

// ── Types ──────────────────────────────────────────────────

type VisionMode = 'scan' | 'walkthrough' | 'history' | 'compare';
type ScanSubMode = 'quick' | 'live';

interface TabConfig {
  key: VisionMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { key: 'scan', label: 'Scan', icon: Camera },
  { key: 'walkthrough', label: 'Walkthrough', icon: Footprints },
  { key: 'history', label: 'History', icon: History },
  { key: 'compare', label: 'Compare', icon: GitCompareArrows },
];

// ── Pill Segmented Control ─────────────────────────────────

const ScanModeToggle: React.FC<{
  mode: ScanSubMode;
  onChange: (mode: ScanSubMode) => void;
}> = ({ mode, onChange }) => (
  <div className="relative inline-flex items-center bg-black/[0.03] rounded-full p-0.5 border border-black/[0.04]">
    {/* Sliding indicator */}
    <motion.div
      className="absolute top-0.5 bottom-0.5 rounded-full bg-violet-500/20 border border-violet-500/15"
      layoutId="scanModeIndicator"
      animate={{
        left: mode === 'quick' ? '2px' : '50%',
        right: mode === 'quick' ? '50%' : '2px',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    />

    <button
      onClick={() => onChange('quick')}
      className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        mode === 'quick' ? 'text-violet-300' : 'text-muted-foreground/50 hover:text-muted-foreground'
      }`}
    >
      <Camera className="w-3.5 h-3.5" />
      Quick
    </button>
    <button
      onClick={() => onChange('live')}
      className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        mode === 'live' ? 'text-violet-300' : 'text-muted-foreground/50 hover:text-muted-foreground'
      }`}
    >
      <Zap className="w-3.5 h-3.5" />
      Live
    </button>
  </div>
);

// ── Main Component ─────────────────────────────────────────

interface VisionShellProps {
  /** Overrides for mode navigation from parent */
  onBack?: () => void;
}

export const VisionShell: React.FC<VisionShellProps> = ({ onBack }) => {
  const [activeMode, setActiveMode] = useState<VisionMode>('scan');
  const [scanSubMode, setScanSubMode] = useState<ScanSubMode>('quick');

  // ── Render active mode content ────────────────────────

  const renderContent = () => {
    switch (activeMode) {
      case 'scan':
        return scanSubMode === 'quick' ? (
          <QuickScanMode
            key="quick-scan"
            onViewInteractiveResults={undefined} // Phase 4
            onGetRenovationPlan={undefined}      // Phase 5
            onGetNegotiationPoints={undefined}    // Phase 6
          />
        ) : (
          <LiveScanMode key="live-scan" />
        );
      case 'walkthrough':
        return <WalkthroughMode key="walkthrough" />;
      case 'history':
        return <EnhancedHistory key="history" onBack={() => setActiveMode('scan')} />;
      case 'compare':
        return <ComparisonView key="compare" onBack={() => setActiveMode('scan')} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full bg-background text-foreground flex flex-col overflow-hidden">
      {/* Scan sub-mode toggle (only visible on scan tab) */}
      {activeMode === 'scan' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 flex items-center justify-center py-2 bg-background z-10"
        >
          <ScanModeToggle mode={scanSubMode} onChange={setScanSubMode} />
        </motion.div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeMode}-${scanSubMode}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom Tab Bar ─────────────────────────────────── */}
      <div
        className="flex-shrink-0 border-t border-black/[0.04] bg-background/95 backdrop-blur-2xl z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex justify-around items-center h-[68px] max-w-lg mx-auto px-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.key;

            return (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={() => setActiveMode(tab.key)}
                className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px] ${
                  isActive ? 'text-violet-400' : 'text-muted-foreground/50 hover:text-muted-foreground/70'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Active indicator */}
                <motion.div
                  animate={{
                    scale: isActive ? 1 : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-1 h-1 rounded-full bg-violet-400 mb-0.5"
                />

                <Icon className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-violet-400' : 'text-muted-foreground/50'
                }`} />

                <span className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${
                  isActive ? 'text-violet-400' : 'text-muted-foreground/50'
                }`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VisionShell;
