// FILE: src/components/onboarding/OnboardingTour.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { AgentAvatar } from '../common/AgentAvatar';
import type { TabType } from '../../hooks/useDesktopShell';
import { getOnboardingSteps, completeOnboarding, type OnboardingStep } from '../../services/onboardingApi';

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
  currentTab,
  onTabChange,
}) => {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(18);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime] = useState(Date.now());

  // Fetch steps from backend
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getOnboardingSteps()
        .then((fetchedSteps) => {
          setSteps(fetchedSteps);
          if (fetchedSteps.length > 0) {
            setTimeRemaining(fetchedSteps[0].duration);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load onboarding steps:', error);
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Navigate to the tab for current step
  useEffect(() => {
    if (isOpen && currentStep && !isLoading) {
      onTabChange(currentStep.tab);
    }
  }, [isOpen, currentStepIndex, currentStep, isLoading, onTabChange]);

  // Timer for auto-advancing steps
  useEffect(() => {
    if (!isOpen || isPaused || isLoading || steps.length === 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (isLastStep) {
            handleComplete();
            return 0;
          }
          setCurrentStepIndex((idx) => idx + 1);
          return steps[currentStepIndex + 1]?.duration || 18;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, isLastStep, currentStepIndex, isLoading, steps]);

  // Reset timer when step changes
  useEffect(() => {
    if (isOpen && currentStep && !isLoading) {
      setTimeRemaining(currentStep.duration);
    }
  }, [currentStepIndex, isOpen, currentStep, isLoading]);

  const handleComplete = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const response = await completeOnboarding({
      completed: true,
      steps_completed: steps.length,
      skipped: false,
      duration_seconds: duration,
    });
    
    // Navigate to the tab specified by backend
    const redirectTab = response.redirect_to_tab || 'chat';
    onComplete(redirectTab);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((idx) => idx + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((idx) => idx - 1);
    }
  };

  const handleSkip = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const response = await completeOnboarding({
      completed: false,
      steps_completed: currentStepIndex,
      skipped: true,
      duration_seconds: duration,
    });
    
    // Navigate to the tab specified by backend
    const redirectTab = response.redirect_to_tab || 'chat';
    onSkip(redirectTab);
  };

  if (!isOpen) return null;

  if (isLoading || steps.length === 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="text-white">Loading onboarding...</div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setIsPaused(!isPaused)}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4 z-50"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative rounded-2xl backdrop-blur-xl border border-primary/25 shadow-2xl overflow-hidden" style={{ backgroundColor: 'hsla(215, 85%, 55%, 0.25)' }}>
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-from to-accent-to"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Skip Button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-primary/20 transition-colors z-10"
                title="Skip onboarding"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>

              <div className="p-6 pt-8">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent-from/20 rounded-full blur-xl"></div>
                      <AgentAvatar size="lg" className="relative" status="online" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-primary">
                        {currentStep.title}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {currentStepIndex + 1} / {steps.length}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">
                      {currentStep.description}
                    </p>

                    {/* Timer */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-accent-from rounded-full"
                          initial={{ width: '100%' }}
                          animate={{ width: isPaused ? '100%' : '0%' }}
                          transition={{ 
                            duration: timeRemaining,
                            ease: 'linear'
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-medium min-w-[2rem] text-right">
                        {timeRemaining}s
                      </span>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handlePrevious}
                        disabled={isFirstStep}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-primary/20 hover:bg-primary/10"
                        style={{ backgroundColor: 'hsla(215, 85%, 55%, 0.15)' }}
                      >
                        <ChevronLeft className="w-4 h-4 inline mr-1" />
                        Previous
                      </button>

                      <div className="flex gap-2">
                        {steps.map((step, idx) => (
                          <button
                            key={step.id}
                            onClick={() => setCurrentStepIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentStepIndex
                                ? 'bg-accent-from w-6'
                                : 'bg-primary/30 hover:bg-primary/50'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleNext}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all border border-accent-from/40 shadow-lg shadow-accent-from/20 hover:shadow-accent-from/30"
                        style={{ backgroundColor: 'hsla(43, 96%, 56%, 0.6)', backgroundImage: 'linear-gradient(135deg, hsla(43, 96%, 65%, 0.7) 0%, hsla(43, 96%, 50%, 0.6) 100%)' }}
                      >
                        {isLastStep ? 'Get Started' : 'Next'}
                        <ChevronRight className="w-4 h-4 inline ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

