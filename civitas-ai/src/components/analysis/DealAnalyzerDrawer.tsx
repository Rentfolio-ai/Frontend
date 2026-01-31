// FILE: src/components/analysis/DealAnalyzerDrawer.tsx
/**
 * Deal Analyzer Drawer Component
 * Slide-in panel for the full Deal Analyzer
 */
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DealAnalyzer } from './DealAnalyzer';
import type { InvestmentStrategy } from '../../types/pnl';

interface DealAnalyzerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string | null;
  initialPurchasePrice?: number;
  initialStrategy?: InvestmentStrategy;
  propertyAddress?: string;
}

export const DealAnalyzerDrawer: React.FC<DealAnalyzerDrawerProps> = ({
  isOpen,
  onClose,
  propertyId,
  initialPurchasePrice = 500000,
  initialStrategy = 'STR',
  propertyAddress,
}) => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Subtle dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer - Clean, solid background */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 40, // Reduced bounce
              stiffness: 400 // Faster snap
            }}
            className={cn(
              'fixed top-0 right-0 h-full z-50 flex flex-col',
              'bg-[#0F1115] border-l border-white/10', // Dark solid bg, subtle border
              'shadow-2xl',
              isMaximized ? 'w-full' : 'w-full max-w-6xl'
            )}
          >
            {/* Header - Minimalist */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-[#0F1115] border-b border-white/5">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white tracking-tight">Deal Analysis</h2>
                  {propertyAddress && (
                    <>
                      <span className="text-white/20">|</span>
                      <p className="text-sm text-white/60 font-medium">{propertyAddress}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content - Solid background */}
            <div className="flex-1 overflow-hidden bg-[#0F1115]">
              <DealAnalyzer
                propertyId={propertyId}
                initialPurchasePrice={initialPurchasePrice}
                initialStrategy={initialStrategy}
                propertyAddress={propertyAddress}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DealAnalyzerDrawer;
