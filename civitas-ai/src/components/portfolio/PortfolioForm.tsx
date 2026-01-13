// FILE: src/components/portfolio/PortfolioForm.tsx
/**
 * Enhanced Portfolio Creation Form
 * Professional multi-step form with investment goals and strategy configuration
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Target,
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Home,
  Hotel,
  Briefcase,
  Check,
  Info,
} from 'lucide-react';
import type { CreatePortfolioForm, Portfolio } from '../../types/portfolio';

interface PortfolioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (portfolio: CreatePortfolioForm) => Promise<void>;
  initialData?: Portfolio;
  mode?: 'create' | 'edit';
}

// Investment strategy options
const strategyOptions = [
  {
    id: 'LTR',
    label: 'Long-Term Rental',
    description: 'Traditional 12+ month leases with stable cash flow',
    icon: Home,
    color: 'blue',
  },
  {
    id: 'STR',
    label: 'Short-Term Rental',
    description: 'Airbnb/VRBO style with higher income potential',
    icon: Hotel,
    color: 'purple',
  },
  {
    id: 'MTR',
    label: 'Mid-Term Rental',
    description: '1-6 month furnished rentals for traveling professionals',
    icon: Briefcase,
    color: 'amber',
  },
  {
    id: 'mixed',
    label: 'Mixed Strategy',
    description: 'Combination of rental strategies for diversification',
    icon: TrendingUp,
    color: 'teal',
  },
];

// Risk tolerance options
const riskOptions = [
  { id: 'conservative', label: 'Conservative', description: 'Lower risk, steady returns', color: 'blue' },
  { id: 'moderate', label: 'Moderate', description: 'Balanced risk and reward', color: 'teal' },
  { id: 'aggressive', label: 'Aggressive', description: 'Higher risk for higher returns', color: 'amber' },
];

// Popular market suggestions
const marketSuggestions = [
  'Austin, TX', 'Tampa, FL', 'Phoenix, AZ', 'Dallas, TX', 'Orlando, FL',
  'Nashville, TN', 'Charlotte, NC', 'Denver, CO', 'Atlanta, GA', 'Raleigh, NC',
];

interface ExtendedFormData extends CreatePortfolioForm {
  strategy: string;
  riskTolerance: string;
  targetMarkets: string[];
  cashFlowGoal: number;
  targetValue: number;
  timeHorizon: number;
}

export const PortfolioForm: React.FC<PortfolioFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}) => {
  const [step, setStep] = useState<'basics' | 'strategy' | 'goals'>('basics');
  const [formData, setFormData] = useState<ExtendedFormData>({
    name: '',
    description: '',
    tags: [],
    strategy: 'LTR',
    riskTolerance: 'moderate',
    targetMarkets: [],
    cashFlowGoal: 5000,
    targetValue: 1000000,
    timeHorizon: 5,
  });
  const [tagInput, setTagInput] = useState('');
  const [marketInput, setMarketInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        tags: initialData.tags || [],
        strategy: 'LTR',
        riskTolerance: 'moderate',
        targetMarkets: [],
        cashFlowGoal: 5000,
        targetValue: 1000000,
        timeHorizon: 5,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        tags: [],
        strategy: 'LTR',
        riskTolerance: 'moderate',
        targetMarkets: [],
        cashFlowGoal: 5000,
        targetValue: 1000000,
        timeHorizon: 5,
      });
    }
    setStep('basics');
    setTagInput('');
    setMarketInput('');
    setErrors({});
  }, [initialData, mode, isOpen]);

  const validateStep = (currentStep: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'basics') {
      if (!formData.name.trim()) {
        newErrors.name = 'Portfolio name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    if (step === 'basics') setStep('strategy');
    else if (step === 'strategy') setStep('goals');
  };

  const handleBack = () => {
    if (step === 'strategy') setStep('basics');
    else if (step === 'goals') setStep('strategy');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setSubmitting(true);
    try {
      // Include extended data as tags for now (can be enhanced later)
      const portfolioData: CreatePortfolioForm = {
        name: formData.name,
        description: formData.description,
        tags: [
          ...formData.tags,
          formData.strategy,
          formData.riskTolerance,
          ...formData.targetMarkets.map(m => `market:${m}`),
        ],
      };
      await onSubmit(portfolioData);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'Failed to save portfolio' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleAddMarket = (market: string) => {
    if (!formData.targetMarkets.includes(market)) {
      setFormData({ ...formData, targetMarkets: [...formData.targetMarkets, market] });
    }
    setMarketInput('');
  };

  const handleRemoveMarket = (market: string) => {
    setFormData({ ...formData, targetMarkets: formData.targetMarkets.filter(m => m !== market) });
  };

  const steps = ['basics', 'strategy', 'goals'];
  const currentStepIndex = steps.indexOf(step);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/20">
                <Building2 className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {mode === 'create' ? 'Create Portfolio' : 'Edit Portfolio'}
                </h2>
                <p className="text-sm text-slate-400">
                  Set up your investment portfolio
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-6">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${i < currentStepIndex
                        ? 'bg-teal-500 text-white'
                        : i === currentStepIndex
                          ? 'bg-teal-500/20 text-teal-400 ring-2 ring-teal-500'
                          : 'bg-white/5 text-slate-500'
                      }`}
                  >
                    {i < currentStepIndex ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-sm hidden sm:inline ${i === currentStepIndex ? 'text-white' : 'text-slate-500'
                      }`}
                  >
                    {s === 'basics' ? 'Basics' : s === 'strategy' ? 'Strategy' : 'Goals'}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${i < currentStepIndex ? 'bg-teal-500' : 'bg-white/10'
                      }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* Step 1: Basics */}
              {step === 'basics' && (
                <motion.div
                  key="basics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 text-teal-400 mb-4">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium">Let's start with the basics</span>
                  </div>

                  {/* Portfolio Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-300 flex items-center gap-1">
                      Portfolio Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border ${errors.name ? 'border-red-500' : 'border-white/10'
                        } focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all`}
                      placeholder="e.g., Austin Rental Portfolio"
                    />
                    {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-slate-300">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all resize-none"
                      placeholder="Describe your investment goals for this portfolio..."
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label htmlFor="tags" className="text-sm font-medium text-slate-300">
                      Tags
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                        placeholder="Press Enter to add..."
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                      >
                        Add
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-teal-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Strategy */}
              {step === 'strategy' && (
                <motion.div
                  key="strategy"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 text-teal-400 mb-4">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-medium">Define your investment strategy</span>
                  </div>

                  {/* Strategy Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">
                      Primary Strategy
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {strategyOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = formData.strategy === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, strategy: option.id })}
                            className={`relative p-4 rounded-xl border text-left transition-all ${isSelected
                                ? 'bg-teal-500/20 border-teal-500'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg bg-${option.color}-500/20`}>
                                <Icon className={`w-5 h-5 text-${option.color}-400`} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-white">{option.label}</p>
                                <p className="text-xs text-slate-400 mt-1">{option.description}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-3 right-3">
                                <Check className="w-5 h-5 text-teal-400" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Risk Tolerance */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">
                      Risk Tolerance
                    </label>
                    <div className="flex gap-3">
                      {riskOptions.map((option) => {
                        const isSelected = formData.riskTolerance === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, riskTolerance: option.id })}
                            className={`flex-1 p-3 rounded-xl border text-center transition-all ${isSelected
                                ? `bg-${option.color}-500/20 border-${option.color}-500`
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                              }`}
                          >
                            <p className={`font-medium ${isSelected ? `text-${option.color}-400` : 'text-white'}`}>
                              {option.label}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{option.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Markets */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Target Markets
                    </label>
                    <input
                      type="text"
                      value={marketInput}
                      onChange={(e) => setMarketInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          marketInput.trim() && handleAddMarket(marketInput.trim());
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                      placeholder="Add a market..."
                    />
                    {formData.targetMarkets.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.targetMarkets.map((market) => (
                          <span
                            key={market}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm"
                          >
                            <MapPin className="w-3 h-3" />
                            {market}
                            <button
                              type="button"
                              onClick={() => handleRemoveMarket(market)}
                              className="hover:text-blue-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {formData.targetMarkets.length === 0 && (
                      <div className="flex flex-wrap gap-2">
                        <p className="text-xs text-slate-500 mr-2">Suggestions:</p>
                        {marketSuggestions.slice(0, 5).map((market) => (
                          <button
                            key={market}
                            type="button"
                            onClick={() => handleAddMarket(market)}
                            className="px-2 py-1 text-xs rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                          >
                            + {market}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Goals */}
              {step === 'goals' && (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 text-teal-400 mb-4">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">Set your investment goals</span>
                  </div>

                  {/* Monthly Cash Flow Goal */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Monthly Cash Flow Goal
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={formData.cashFlowGoal}
                        onChange={(e) => setFormData({ ...formData, cashFlowGoal: parseInt(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                        placeholder="5000"
                      />
                    </div>
                    <div className="flex gap-2">
                      {[2500, 5000, 10000, 25000].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setFormData({ ...formData, cashFlowGoal: amount })}
                          className={`px-3 py-1 text-xs rounded-lg transition-all ${formData.cashFlowGoal === amount
                              ? 'bg-teal-500/20 text-teal-400'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                          ${amount.toLocaleString()}/mo
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio Value Goal */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Target Portfolio Value
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={formData.targetValue}
                        onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                        placeholder="1000000"
                      />
                    </div>
                    <div className="flex gap-2">
                      {[500000, 1000000, 2500000, 5000000].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setFormData({ ...formData, targetValue: amount })}
                          className={`px-3 py-1 text-xs rounded-lg transition-all ${formData.targetValue === amount
                              ? 'bg-teal-500/20 text-teal-400'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                          ${(amount / 1000000).toFixed(1)}M
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Horizon */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Investment Time Horizon
                    </label>
                    <div className="flex gap-2">
                      {[3, 5, 10, 15, 20].map((years) => (
                        <button
                          key={years}
                          type="button"
                          onClick={() => setFormData({ ...formData, timeHorizon: years })}
                          className={`flex-1 py-3 rounded-xl border text-center transition-all ${formData.timeHorizon === years
                              ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                        >
                          <p className="font-medium">{years}</p>
                          <p className="text-xs">years</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
                    <div className="flex items-center gap-2 text-teal-400 mb-3">
                      <Info className="w-4 h-4" />
                      <span className="text-sm font-medium">Portfolio Summary</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Name</p>
                        <p className="text-white font-medium">{formData.name || 'Untitled'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Strategy</p>
                        <p className="text-white font-medium">
                          {strategyOptions.find(s => s.id === formData.strategy)?.label}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Cash Flow Goal</p>
                        <p className="text-green-400 font-medium">${formData.cashFlowGoal.toLocaleString()}/mo</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Target Value</p>
                        <p className="text-teal-400 font-medium">${formData.targetValue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mx-6 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {errors.submit}
            </div>
          )}

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div>
              {step !== 'basics' && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white transition-all"
              >
                Cancel
              </button>
              {step !== 'goals' ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:from-teal-400 hover:to-cyan-400 transition-all shadow-lg shadow-teal-500/20"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:from-teal-400 hover:to-cyan-400 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Portfolio
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
