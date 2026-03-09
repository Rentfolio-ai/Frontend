// FILE: src/components/chat/ActionButtons.tsx
import { motion } from 'framer-motion';
import { FileText, X, ArrowRight } from 'lucide-react';
import type { Action } from '@/types/chat';

interface ActionButtonsProps {
  action: Action;
  onAction: (actionValue: string, actionContext?: unknown) => void;
}

export function ActionButtons({ action, onAction }: ActionButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="mt-3 p-3 rounded-xl border border-black/[0.08] bg-black/[0.02] backdrop-blur-sm"
    >
      {/* Message */}
      <p className="text-[13px] font-medium text-muted-foreground mb-2.5">
        {action.message}
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2">
        {action.options.map((option, index) => {
          const isPrimary = option.action === 'generate_report' || index === 0;

          return (
            <motion.button
              key={option.action}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.2 + index * 0.08 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction(option.action, action.context)}
              className={`
                flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-[13px]
                transition-all duration-200
                ${isPrimary
                  ? 'bg-gradient-to-r from-[#C08B5C] to-[#A8734A] text-white shadow-lg shadow-[#C08B5C]/20 hover:from-[#D4A27F] hover:to-[#C08B5C]'
                  : 'bg-black/[0.05] text-muted-foreground border border-black/[0.08] hover:bg-black/[0.07] hover:text-foreground/80'
                }
              `}
            >
              {isPrimary ? (
                <FileText className="w-3.5 h-3.5" />
              ) : option.action === 'skip' ? (
                <X className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
