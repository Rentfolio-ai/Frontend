// FILE: src/components/onboarding/OnboardingTour.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, TrendingUp, Search, Building2 } from 'lucide-react';
import type { TabType } from '../../hooks/useDesktopShell';
import { completeOnboarding } from '../../services/onboardingApi';
import { usePreferencesStore } from '../../stores/preferencesStore';

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
  const [currentStep, setCurrentStep] = useState(0);
  const setPreferredStartPage = usePreferencesStore(s => s.setPreferredStartPage);

  // Check if user has already seen onboarding (can be bypassed with ?onboarding=true)
  const urlParams = new URLSearchParams(window.location.search);
  const forceShow = urlParams.get('onboarding') === 'true';
  const hasSeenOnboarding = !forceShow && localStorage.getItem('vasthu-onboarding-completed') === 'true';

  const steps = [
    {
      title: "Welcome to Vasthu",
      subtitle: "Ancient Wisdom, Modern Intelligence",
      description: "Your AI-powered real estate intelligence assistant is ready to help you make smarter investment decisions.",
      features: [
        {
          icon: <MessageSquare className="w-6 h-6" />,
          title: "AI-Powered Conversations",
          description: "Ask anything about properties, markets, and deals in natural language",
          highlight: "Natural Language Processing"
        },
        {
          icon: <TrendingUp className="w-6 h-6" />,
          title: "Instant Deal Analysis",
          description: "Get P&L calculations, ROI projections, and investment insights instantly",
          highlight: "Real-time Analytics"
        },
        {
          icon: <Search className="w-6 h-6" />,
          title: "Market Intelligence",
          description: "Access real-time data on rental rates, occupancy, and market trends",
          highlight: "Live Market Data"
        },
        {
          icon: <Sparkles className="w-6 h-6" />,
          title: "Smart Recommendations",
          description: "Get personalized property suggestions based on your investment goals",
          highlight: "Personalized Insights"
        }
      ]
    }
  ];

  const handleComplete = async (redirectTab: TabType = 'chat') => {
    const duration = Math.floor((Date.now() - startTime) / 1000);

    // Mark onboarding as completed for this user
    localStorage.setItem('vasthu-onboarding-completed', 'true');
    localStorage.setItem('vasthu-onboarding-date', new Date().toISOString());

    await completeOnboarding({
      completed: true,
      steps_completed: steps.length,
      skipped: false,
      duration_seconds: duration,
    });

    onComplete(redirectTab);
  };

  // Handle the start page choice
  const handleStartPageChoice = (choice: 'chat' | 'marketplace') => {
    setPreferredStartPage(choice);
    handleComplete(choice as TabType);
  };

  const handleSkip = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);

    // Mark as completed but skipped
    localStorage.setItem('vasthu-onboarding-completed', 'true');
    localStorage.setItem('vasthu-onboarding-skipped', 'true');

    await completeOnboarding({
      completed: false,
      steps_completed: currentStep,
      skipped: true,
      duration_seconds: duration,
    });

    onSkip('chat' as TabType);
  };

  // Don't show if user has already seen it
  if (!isOpen || hasSeenOnboarding) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Lighter Backdrop - app visible behind */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Compact Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl mx-4 z-50"
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/10 shadow-2xl overflow-hidden">
              {/* Decorative gradient orbs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#C08B5C]/20 to-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

              {/* Content */}
              <div className="relative z-10 p-12">
                {/* Skip Button */}
                <button
                  onClick={handleSkip}
                  className="absolute top-6 right-6 px-4 py-2 text-white/60 hover:text-white text-sm font-medium transition-all hover:bg-white/5 rounded-lg"
                >
                  Skip
                </button>

                {currentStep === 0 ? (
                  <>
                    {/* Header with custom Vasthu icon */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col items-center mb-12"
                    >
                      {/* Vasthu Icon */}
                      <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#C08B5C] to-blue-500 rounded-2xl blur-2xl opacity-50"></div>
                        <svg viewBox="0 0 32 32" fill="none" className="w-20 h-20 relative">
                          <circle cx="16" cy="16" r="14" stroke="url(#vasthuGradientOnboarding)" strokeWidth="1.5" opacity="0.8" />
                          <path d="M16 6L24 12V20L16 26L8 20V12L16 6Z" stroke="url(#vasthuGradientOnboarding)" strokeWidth="2" fill="none" strokeLinejoin="round" />
                          <path d="M13 13L16 19L19 13" stroke="url(#vasthuGradientOnboarding)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <defs>
                            <linearGradient id="vasthuGradientOnboarding" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#C08B5C" />
                              <stop offset="100%" stopColor="#2563EB" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>

                      <h1 className="text-5xl font-bold bg-gradient-to-r from-[#D4A27F] via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3 text-center">
                        {currentStepData.title}
                      </h1>
                      <p className="text-xl text-[#D4A27F]/80 font-medium mb-2">
                        {currentStepData.subtitle}
                      </p>
                      <p className="text-white/60 text-center max-w-2xl">
                        {currentStepData.description}
                      </p>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                      {currentStepData.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-[#C08B5C]/50 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-[#C08B5C]/0 to-blue-500/0 group-hover:from-[#C08B5C]/10 group-hover:to-blue-500/10 rounded-2xl transition-all duration-300"></div>
                          <div className="relative flex items-start gap-4">
                            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-[#C08B5C]/20 to-blue-500/20 text-[#D4A27F] group-hover:scale-110 transition-transform">
                              {feature.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-white font-bold text-base">{feature.title}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C08B5C]/20 text-[#D4A27F] font-semibold">
                                  {feature.highlight}
                                </span>
                              </div>
                              <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8734A] via-blue-600 to-purple-600 hover:from-[#C08B5C] hover:via-blue-500 hover:to-purple-500 text-white font-bold text-lg shadow-2xl shadow-[#C08B5C]/40 transition-all hover:scale-[1.05] hover:shadow-[#C08B5C]/60 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center gap-2">
                          Continue
                          <Sparkles className="w-5 h-5" />
                        </span>
                      </button>
                      <p className="text-white/40 text-xs">
                        Takes less than 30 seconds to get started
                      </p>
                    </motion.div>
                  </>
                ) : (
                  /* ======== STEP 2: Choose Your Start Page ======== */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col items-center mb-10">
                      <h2 className="text-3xl font-bold text-white mb-2 text-center">
                        How would you like to start?
                      </h2>
                      <p className="text-white/50 text-center max-w-lg">
                        You can always switch between these anytime from the sidebar.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                      {/* Chat with AI */}
                      <button
                        onClick={() => handleStartPageChoice('chat')}
                        className="group relative flex flex-col items-center gap-5 p-8 rounded-2xl
                          bg-gradient-to-br from-white/[0.04] to-white/[0.01]
                          border border-white/[0.08] hover:border-blue-500/40
                          transition-all duration-200 hover:bg-white/[0.06] text-left"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center
                          group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors duration-200">
                          <MessageSquare className="w-7 h-7 text-blue-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-white mb-1.5">Chat with AI</h3>
                          <p className="text-[13px] text-white/45 leading-relaxed">
                            Ask questions in natural language. Get instant property analysis, market insights, and deal recommendations.
                          </p>
                        </div>
                        <span className="text-[11px] text-blue-400/60 font-medium">Recommended for new users</span>
                      </button>

                      {/* Browse Properties */}
                      <button
                        onClick={() => handleStartPageChoice('marketplace')}
                        className="group relative flex flex-col items-center gap-5 p-8 rounded-2xl
                          bg-gradient-to-br from-white/[0.04] to-white/[0.01]
                          border border-white/[0.08] hover:border-[#C08B5C]/40
                          transition-all duration-200 hover:bg-white/[0.06] text-left"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C08B5C]/20 to-[#D4A27F]/20 flex items-center justify-center
                          group-hover:from-[#C08B5C]/30 group-hover:to-[#D4A27F]/30 transition-colors duration-200">
                          <Building2 className="w-7 h-7 text-[#C08B5C]" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-white mb-1.5">Marketplace</h3>
                          <p className="text-[13px] text-white/45 leading-relaxed">
                            Browse agents, lenders, contractors, and other professionals. Connect via chat or Vasthu Voice.
                          </p>
                        </div>
                        <span className="text-[11px] text-[#C08B5C]/60 font-medium">Find the right pro</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
