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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed top-0 right-0 h-full bg-background shadow-2xl z-50 flex flex-col',
              isMaximized ? 'w-full' : 'w-full max-w-4xl'
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? (
                    <Minimize2 className="w-4 h-4 text-foreground/60" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-foreground/60" />
                  )}
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-foreground/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
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
