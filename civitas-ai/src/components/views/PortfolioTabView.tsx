import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PortfolioPage } from '../Portfolio';

export const PortfolioTabView: React.FC = () => {
  const [experimentalEnabled, setExperimentalEnabled] = useState(false);

  useEffect(() => {
    // Check if experimental features are enabled
    try {
      const enabled = localStorage.getItem('civitas-experimental-portfolio') === 'true';
      setExperimentalEnabled(enabled);
    } catch (err) {
      console.error('Failed to read experimental portfolio setting:', err);
      setExperimentalEnabled(false);
    }
  }, []);

  const handleToggle = () => {
    const newValue = !experimentalEnabled;
    setExperimentalEnabled(newValue);
    try {
      localStorage.setItem('civitas-experimental-portfolio', String(newValue));
    } catch (err) {
      console.error('Failed to save experimental portfolio setting:', err);
    }
  };

  // If experimental mode is enabled, show the actual portfolio
  if (experimentalEnabled) {
    return <PortfolioPage />;
  }
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
          💼
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4 font-['Inter_Tight']">
            Portfolio
          </h1>
          <p className="text-xl text-white/70 font-['Inter_Tight'] mb-6">
            Coming Soon - Phase 2
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
            Track your real estate portfolio with live analytics. Your portfolio summary will appear here with ROI tracking, occupancy rates, and AI-powered insights.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500">
            <span className="text-white font-['Inter_Tight'] font-semibold">
              ✨ Portfolio Analytics Coming in Phase 2
            </span>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleToggle}
              className="px-6 py-3 rounded-xl font-['Inter_Tight'] font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white'
              }}
            >
              🧪 Enable Experimental Portfolio (Preview)
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
