import React from 'react';
import { motion } from 'framer-motion';

export const ReportsTabView: React.FC = () => {
  return (
    <div 
      className="flex-1 overflow-y-auto relative flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1B0034 0%, #3B0A72 40%, #00C78C 100%)'
      }}
    >
      <div className="max-w-2xl mx-auto text-center px-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          className="text-8xl mb-6"
        >
          📊
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4 font-['Inter_Tight']">
            Reports
          </h1>
          <p className="text-xl text-white/70 font-['Inter_Tight'] mb-6">
            Coming Soon
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <p className="text-lg text-white/80 font-['Inter_Tight'] leading-relaxed">
            Generate comprehensive property performance reports with AI. Track revenue, expenses, and ROI across your portfolio.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500"
        >
          <span className="text-white font-['Inter_Tight'] font-semibold">
            ✨ AI Reports Coming Soon
          </span>
        </motion.div>
      </div>
    </div>
  );
};
