// FILE: src/components/onboarding/OnboardingTour.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageSquare, TrendingUp, Search } from 'lucide-react';
import { AgentAvatar } from '../common/AgentAvatar';
import type { TabType } from '../../hooks/useDesktopShell';
import { completeOnboarding } from '../../services/onboardingApi';

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: (redirectTab?: TabType) => void;
  onSkip: (redirectTab?: TabType) => void;
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onComplete,
  onSkip,
}) => {
  const [startTime] = useState(Date.now());

  const features = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "AI-Powered Chat",
      description: "Ask questions about properties, markets, and deals in natural language"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Deal Analysis",
      description: "Instant P&L calculations and investment insights for any property"
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Market Intelligence",
      description: "Real-time data on rental rates, occupancy, and market trends"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Smart Recommendations",
      description: "Personalized property suggestions based on your investment goals"
    }
  ];

  const handleComplete = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const response = await completeOnboarding({
      completed: true,
      steps_completed: 1,
      skipped: false,
      duration_seconds: duration,
    });

    let redirectTab = response.redirect_to_tab || 'chat';
    if (redirectTab === 'settings') redirectTab = 'chat';

    onComplete(redirectTab as TabType);
  };

  const handleSkip = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const response = await completeOnboarding({
      completed: false,
      steps_completed: 0,
      skipped: true,
      duration_seconds: duration,
    });

    let redirectTab = response.redirect_to_tab || 'chat';
    if (redirectTab === 'settings') redirectTab = 'chat';

    onSkip(redirectTab as TabType);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 z-50"
          >
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 shadow-2xl overflow-hidden p-8">
              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors group"
                title="Skip"
              >
                <X className="w-5 h-5 group-hover:drop-shadow-[0_0_6px_rgba(96,165,250,0.5)]" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-6 mb-8">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                    <AgentAvatar size="lg" className="relative" status="online" />
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    Welcome to OmniEstate
                  </h2>
                  <p className="text-white/60 text-lg">
                    Your AI-powered real estate investment assistant
                  </p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500/20 text-blue-400">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-white/50 text-xs leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleSkip}
                  className="text-white/50 hover:text-white text-sm font-medium transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative z-10">Get Started</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
