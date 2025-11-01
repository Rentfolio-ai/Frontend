// FILE: src/components/chat/ActionButtons.tsx
import { motion } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import type { Action } from '@/types/chat';

interface ActionButtonsProps {
  action: Action;
  onAction: (actionValue: string, actionContext?: any) => void;
}

export function ActionButtons({ action, onAction }: ActionButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-4 p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
    >
      {/* Message */}
      <p className="text-sm font-medium text-gray-800 mb-3">
        {action.message}
      </p>

      {/* Buttons */}
      <div className="flex gap-2">
        {action.options.map((option, index) => {
          const isPrimary = option.action === 'generate_report';
          
          return (
            <motion.button
              key={option.action}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction(option.action, action.context)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200
                ${isPrimary 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {isPrimary ? (
                <FileText className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
