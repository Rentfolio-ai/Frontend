import React, { useState } from 'react';
import { Home, MessageSquare, TrendingUp, Search, Building2, Sparkles, ArrowRight } from 'lucide-react';
import type { TabType } from '../../hooks/useDesktopShell';
import { completeOnboarding } from '../../services/onboardingApi';
import { usePreferencesStore } from '../../stores/preferencesStore';

const ONBOARDING_STORAGE_KEY = 'vasthu-onboarding-completed';

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: (redirectTab?: TabType) => void;
  onSkip: (redirectTab?: TabType) => void;
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'AI-Powered Conversations',
    description: 'Ask anything about properties, markets, and deals in natural language.',
  },
  {
    icon: TrendingUp,
    title: 'Instant Deal Analysis',
    description: 'Get P&L calculations, ROI projections, and investment insights instantly.',
  },
  {
    icon: Search,
    title: 'Market Intelligence',
    description: 'Access real-time data on rental rates, occupancy, and market trends.',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'Personalized property suggestions based on your investment goals.',
  },
];

const START_OPTIONS = [
  {
    key: 'home' as const,
    icon: Home,
    title: 'Home Dashboard',
    description: 'Your portfolio overview with market alerts, saved properties, and recent activity.',
    recommended: true,
  },
  {
    key: 'chat' as const,
    icon: MessageSquare,
    title: 'Chat with AI',
    description: 'Start analyzing properties and markets with natural language right away.',
    recommended: false,
  },
  {
    key: 'marketplace' as const,
    icon: Building2,
    title: 'Marketplace',
    description: 'Browse agents, lenders, contractors, and other professionals.',
    recommended: false,
  },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onComplete,
  onSkip,
}) => {
  const [startTime] = useState(Date.now());
  const [currentStep, setCurrentStep] = useState(0);
  const setPreferredStartPage = usePreferencesStore(s => s.setPreferredStartPage);

  const urlParams = new URLSearchParams(window.location.search);
  const forceShow = urlParams.get('onboarding') === 'true';
  const hasSeenOnboarding = !forceShow && localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';

  const handleComplete = async (redirectTab: TabType = 'home') => {
    const duration = Math.floor((Date.now() - startTime) / 1000);

    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    localStorage.setItem('vasthu-onboarding-date', new Date().toISOString());

    await completeOnboarding({
      completed: true,
      steps_completed: 2,
      skipped: false,
      duration_seconds: duration,
    });

    onComplete(redirectTab);
  };

  const handleStartPageChoice = (choice: 'home' | 'chat' | 'marketplace') => {
    setPreferredStartPage(choice);
    handleComplete(choice as TabType);
  };

  const handleSkip = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);

    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    localStorage.setItem('vasthu-onboarding-skipped', 'true');

    await completeOnboarding({
      completed: false,
      steps_completed: currentStep,
      skipped: true,
      duration_seconds: duration,
    });

    onSkip('home' as TabType);
  };

  if (!isOpen || hasSeenOnboarding) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Card */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] mx-4 z-50">
        <div className="relative rounded-2xl bg-popover border border-border shadow-2xl shadow-black/10 overflow-hidden">

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="absolute top-5 right-5 px-3 py-1.5 text-muted-foreground/50 hover:text-muted-foreground text-[12px] font-medium transition-colors rounded-lg hover:bg-black/[0.03] z-10"
          >
            Skip
          </button>

          <div className="p-10">
            {currentStep === 0 ? (
              /* ── Step 1: Welcome ── */
              <>
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#C08B5C]/[0.08] border border-[#C08B5C]/15 flex items-center justify-center">
                    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                      <circle cx="16" cy="16" r="14" stroke="#C08B5C" strokeWidth="1.5" opacity="0.6" />
                      <path d="M16 6L24 12V20L16 26L8 20V12L16 6Z" stroke="#C08B5C" strokeWidth="2" fill="none" strokeLinejoin="round" />
                      <path d="M13 13L16 19L19 13" stroke="#D4A27F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Heading */}
                <div className="text-center mb-8">
                  <h1 className="text-[24px] font-bold text-white/95 tracking-[-0.02em] mb-2">
                    Welcome to Vasthu
                  </h1>
                  <p className="text-[14px] text-muted-foreground/70 leading-relaxed max-w-md mx-auto">
                    Your AI-powered real estate intelligence platform. Here's what you can do.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {FEATURES.map(({ icon: Icon, title, description }) => (
                    <div
                      key={title}
                      className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface border border-border/50"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#C08B5C]/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-[16px] h-[16px] text-[#D4A27F]" />
                      </div>
                      <div>
                        <h3 className="text-[13px] font-semibold text-foreground/85">{title}</h3>
                        <p className="text-[12px] text-muted-foreground/60 leading-relaxed mt-0.5">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C08B5C] hover:bg-[#D4A27F] text-[#0A0A0C] text-[13px] font-bold transition-colors shadow-lg shadow-[#C08B5C]/15"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-muted-foreground/40">Takes less than 30 seconds</p>
                </div>
              </>
            ) : (
              /* ── Step 2: Choose Start Page ── */
              <>
                <div className="text-center mb-8">
                  <h2 className="text-[22px] font-bold text-white/95 tracking-[-0.02em] mb-2">
                    Where would you like to start?
                  </h2>
                  <p className="text-[14px] text-muted-foreground/60">
                    You can always switch between these from the sidebar.
                  </p>
                </div>

                <div className="space-y-3">
                  {START_OPTIONS.map(({ key, icon: Icon, title, description, recommended }) => (
                    <button
                      key={key}
                      onClick={() => handleStartPageChoice(key)}
                      className="group w-full flex items-start gap-4 p-4 rounded-xl bg-surface border border-border/50 hover:border-[#C08B5C]/25 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-black/[0.03] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C08B5C]/[0.08] transition-colors">
                        <Icon className="w-[18px] h-[18px] text-muted-foreground/70 group-hover:text-[#D4A27F] transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-semibold text-foreground/85 group-hover:text-foreground/95 transition-colors">
                            {title}
                          </h3>
                          {recommended && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C08B5C]/[0.08] text-[#C08B5C] border border-[#C08B5C]/15">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground/50 leading-relaxed mt-0.5">{description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/50 flex-shrink-0 mt-1 transition-colors" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
