// FILE: src/components/portfolio/PropertyForm.tsx
/**
 * Enhanced Property Form - Professional multi-step property entry
 * Matches the PortfolioForm design with step-by-step guidance
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Home,
  DollarSign,
  Calculator,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  Calendar,
  Percent,
  Sparkles,
  AlertCircle,
  Bed,
  Bath,
  Square,
} from 'lucide-react';
import type { AddPropertyForm, PortfolioProperty } from '../../types/portfolio';
import { validatePropertyForm, calculateTotalMonthlyExpenses, formatDateForInput } from '../../utils/portfolioHelpers';

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (property: AddPropertyForm) => Promise<void>;
  initialData?: PortfolioProperty;
  mode?: 'create' | 'edit';
}

// Property type options
const propertyTypes = [
  { id: 'SFH', label: 'Single Family', icon: '🏠' },
  { id: 'Multi', label: 'Multi-Family', icon: '🏢' },
  { id: 'Condo', label: 'Condo', icon: '🏙️' },
  { id: 'Townhouse', label: 'Townhouse', icon: '🏘️' },
  { id: 'Duplex', label: 'Duplex', icon: '🏡' },
  { id: 'Land', label: 'Land', icon: '🌳' },
];

// Strategy options
const strategyOptions = [
  { id: 'LTR', label: 'Long-Term Rental', color: 'blue' },
  { id: 'STR', label: 'Short-Term Rental', color: 'purple' },
  { id: 'MTR', label: 'Mid-Term Rental', color: 'amber' },
  { id: 'Flip', label: 'Fix & Flip', color: 'green' },
];

interface ExtendedPropertyForm extends AddPropertyForm {
  property_type: string;
  strategy: string;
  beds: number;
  baths: number;
  sqft: number;
  year_built: number;
  parking: number;
  city: string;
  state: string;
  zip: string;
}

const initialFormState: ExtendedPropertyForm = {
  address: '',
  purchase_price: 0,
  purchase_date: new Date().toISOString().split('T')[0],
  down_payment: 0,
  loan_amount: 0,
  interest_rate: 7,
  loan_term_years: 30,
  monthly_rent: 0,
  monthly_expenses: {
    property_tax: 0,
    insurance: 0,
    maintenance: 0,
    property_management: 0,
    utilities: 0,
    hoa: 0,
    other: 0,
  },
  closing_costs: 0,
  renovation_costs: 0,
  current_value: 0,
  notes: '',
  tags: [],
  property_type: 'SFH',
  strategy: 'LTR',
  beds: 3,
  baths: 2,
  sqft: 1500,
  year_built: 2000,
  parking: 2,
  city: '',
  state: '',
  zip: '',
};

export const PropertyForm: React.FC<PropertyFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}) => {
  const [step, setStep] = useState<'property' | 'financing' | 'income' | 'review'>('property');
  const [formData, setFormData] = useState<ExtendedPropertyForm>(initialFormState);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        ...initialFormState,
        address: initialData.address,
        purchase_price: initialData.financials.purchase_price,
        purchase_date: formatDateForInput(initialData.financials.purchase_date),
        down_payment: initialData.financials.down_payment,
        loan_amount: initialData.financials.loan_amount,
        interest_rate: initialData.financials.interest_rate,
        loan_term_years: initialData.financials.loan_term_years,
        monthly_rent: initialData.financials.monthly_rent,
        monthly_expenses: {
          property_tax: initialData.financials.monthly_expenses.property_tax,
          insurance: initialData.financials.monthly_expenses.insurance,
          maintenance: initialData.financials.monthly_expenses.maintenance,
          property_management: initialData.financials.monthly_expenses.property_management,
          utilities: initialData.financials.monthly_expenses.utilities || 0,
          hoa: initialData.financials.monthly_expenses.hoa || 0,
          other: initialData.financials.monthly_expenses.other || 0,
        },
        closing_costs: initialData.financials.closing_costs,
        renovation_costs: initialData.financials.renovation_costs,
        current_value: initialData.financials.current_value,
        notes: initialData.notes || '',
        tags: initialData.tags || [],
        city: initialData.city || '',
        state: initialData.state || '',
      });
    } else {
      setFormData(initialFormState);
    }
    setStep('property');
    setTagInput('');
    setErrors({});
  }, [initialData, mode, isOpen]);

  // Calculate derived values
  const calculations = useMemo(() => {
    const totalInvestment = formData.down_payment + formData.closing_costs + formData.renovation_costs;
    const monthlyExpenses = calculateTotalMonthlyExpenses(formData.monthly_expenses);

    // Calculate monthly mortgage payment
    const monthlyRate = formData.interest_rate / 100 / 12;
    const numPayments = formData.loan_term_years * 12;
    const monthlyMortgage = formData.loan_amount > 0
      ? (formData.loan_amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0;

    const totalMonthlyExpenses = monthlyExpenses + monthlyMortgage;
    const monthlyCashFlow = formData.monthly_rent - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    // Cap rate calculation
    const NOI = (formData.monthly_rent - monthlyExpenses) * 12;
    const capRate = formData.purchase_price > 0 ? (NOI / formData.purchase_price) * 100 : 0;

    // Cash on cash return
    const cashOnCash = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      monthlyExpenses,
      monthlyMortgage: Math.round(monthlyMortgage),
      totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
      monthlyCashFlow: Math.round(monthlyCashFlow),
      annualCashFlow: Math.round(annualCashFlow),
      capRate,
      cashOnCash,
      NOI,
    };
  }, [formData]);

  const validateStep = (currentStep: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'property') {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    } else if (currentStep === 'financing') {
      if (formData.purchase_price <= 0) {
        newErrors.purchase_price = 'Purchase price is required';
      }
    } else if (currentStep === 'income') {
      if (formData.monthly_rent <= 0) {
        newErrors.monthly_rent = 'Monthly rent is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    if (step === 'property') setStep('financing');
    else if (step === 'financing') setStep('income');
    else if (step === 'income') setStep('review');
  };

  const handleBack = () => {
    if (step === 'financing') setStep('property');
    else if (step === 'income') setStep('financing');
    else if (step === 'review') setStep('income');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validatePropertyForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'Failed to save property' });
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

  const handleExpenseChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      monthly_expenses: { ...formData.monthly_expenses, [field]: value },
    });
  };

  // Auto-calculate loan from purchase price and down payment
  const autoCalculateLoan = () => {
    if (formData.purchase_price > 0 && formData.down_payment >= 0) {
      const loan = formData.purchase_price - formData.down_payment;
      setFormData({ ...formData, loan_amount: Math.max(0, loan) });
    }
  };

  // Auto-calculate down payment from percentage
  const setDownPaymentPercent = (percent: number) => {
    if (formData.purchase_price > 0) {
      const down = Math.round(formData.purchase_price * (percent / 100));
      const loan = formData.purchase_price - down;
      setFormData({ ...formData, down_payment: down, loan_amount: loan });
    }
  };

  const steps = ['property', 'financing', 'income', 'review'];
  const currentStepIndex = steps.indexOf(step);
  const stepLabels = ['Property', 'Financing', 'Income', 'Review'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/20">
                <Home className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {mode === 'create' ? 'Add Property' : 'Edit Property'}
                </h2>
                <p className="text-sm text-slate-400">
                  Enter property details and financials
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
                    {stepLabels[i]}
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
          <div className="p-6 min-h-[450px] max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Property Details */}
              {step === 'property' && (
                <motion.div
                  key="property"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 text-teal-400 mb-4">
                    <Home className="w-5 h-5" />
                    <span className="text-sm font-medium">Property Details</span>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border ${errors.address ? 'border-red-500' : 'border-white/10'
                        } focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all`}
                      placeholder="123 Main St, Austin, TX 78701"
                    />
                    {errors.address && <p className="text-sm text-red-400">{errors.address}</p>}
                  </div>

                  {/* City, State, Zip */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                        placeholder="Austin"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                        placeholder="TX"
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">ZIP</label>
                      <input
                        type="text"
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                        placeholder="78701"
                        maxLength={5}
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Property Type</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {propertyTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, property_type: type.id })}
                          className={`p-3 rounded-xl border text-center transition-all ${formData.property_type === type.id
                            ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                        >
                          <span className="text-xl block mb-1">{type.icon}</span>
                          <span className="text-xs">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strategy */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Investment Strategy</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {strategyOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, strategy: opt.id })}
                          className={`p-3 rounded-xl border text-center transition-all ${formData.strategy === opt.id
                            ? `bg-${opt.color}-500/20 border-${opt.color}-500 text-${opt.color}-400`
                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                        >
                          <span className="text-sm font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Property Features */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                        <Bed className="w-4 h-4" /> Beds
                      </label>
                      <input
                        type="number"
                        value={formData.beds}
                        onChange={(e) => setFormData({ ...formData, beds: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                        <Bath className="w-4 h-4" /> Baths
                      </label>
                      <input
                        type="number"
                        value={formData.baths}
                        onChange={(e) => setFormData({ ...formData, baths: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        min="0"
                        step="0.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                        <Square className="w-4 h-4" /> Sqft
                      </label>
                      <input
                        type="number"
                        value={formData.sqft}
                        onChange={(e) => setFormData({ ...formData, sqft: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> Year Built
                      </label>
                      <input
                        type="number"
                        value={formData.year_built}
                        onChange={(e) => setFormData({ ...formData, year_built: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Financing */}
              {step === 'financing' && (
                <motion.div
                  key="financing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 text-teal-400 mb-4">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm font-medium">Financing Details</span>
                  </div>

                  {/* Purchase Price & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Purchase Price <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={formData.purchase_price || ''}
                          onChange={(e) => setFormData({ ...formData, purchase_price: parseInt(e.target.value) || 0 })}
                          onBlur={autoCalculateLoan}
                          className={`w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 text-white border ${errors.purchase_price ? 'border-red-500' : 'border-white/10'
                            } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all`}
                          placeholder="350000"
                        />
                      </div>
                      {errors.purchase_price && <p className="text-sm text-red-400">{errors.purchase_price}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Purchase Date</label>
                      <input
                        type="date"
                        value={formData.purchase_date}
                        onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Down Payment</label>
                    <div className="flex gap-2">
                      {[20, 25, 30].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDownPaymentPercent(pct)}
                          className={`px-3 py-1 text-xs rounded-lg transition-all ${formData.purchase_price > 0 &&
                            Math.round((formData.down_payment / formData.purchase_price) * 100) === pct
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={formData.down_payment || ''}
                        onChange={(e) => {
                          const down = parseInt(e.target.value) || 0;
                          setFormData({
                            ...formData,
                            down_payment: down,
                            loan_amount: Math.max(0, formData.purchase_price - down)
                          });
                        }}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        placeholder="70000"
                      />
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Loan Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={formData.loan_amount || ''}
                          onChange={(e) => setFormData({ ...formData, loan_amount: parseInt(e.target.value) || 0 })}
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                        <Percent className="w-4 h-4" /> Interest Rate
                      </label>
                      <input
                        type="number"
                        value={formData.interest_rate || ''}
                        onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        step="0.125"
                        min="0"
                        max="20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Loan Term</label>
                      <div className="flex gap-2">
                        {[15, 30].map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setFormData({ ...formData, loan_term_years: term })}
                            className={`flex-1 py-3 rounded-xl border text-center transition-all ${formData.loan_term_years === term
                              ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                              : 'bg-white/5 border-white/10 text-slate-400'
                              }`}
                          >
                            {term}yr
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional Costs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Closing Costs</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={formData.closing_costs || ''}
                          onChange={(e) => setFormData({ ...formData, closing_costs: parseInt(e.target.value) || 0 })}
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Renovation Costs</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          value={formData.renovation_costs || ''}
                          onChange={(e) => setFormData({ ...formData, renovation_costs: parseInt(e.target.value) || 0 })}
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Investment Summary */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Total Investment</span>
                      <span className="text-lg font-semibold text-white">
                        ${calculations.totalInvestment.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-slate-400">Est. Monthly Mortgage</span>
                      <span className="text-lg font-semibold text-amber-400">
                        ${calculations.monthlyMortgage.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Income & Expenses */}
              {step === 'income' && (
                <motion.div
                  key="income"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 text-teal-400 mb-4">
                    <Calculator className="w-5 h-5" />
                    <span className="text-sm font-medium">Income & Expenses</span>
                  </div>

                  {/* Monthly Rent */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Monthly Rent <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={formData.monthly_rent || ''}
                        onChange={(e) => setFormData({ ...formData, monthly_rent: parseInt(e.target.value) || 0 })}
                        className={`w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 text-white border ${errors.monthly_rent ? 'border-red-500' : 'border-white/10'
                          } focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-lg`}
                        placeholder="2500"
                      />
                    </div>
                    {errors.monthly_rent && <p className="text-sm text-red-400">{errors.monthly_rent}</p>}
                  </div>

                  {/* Monthly Expenses Grid */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Monthly Expenses</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'property_tax', label: 'Property Tax' },
                        { key: 'insurance', label: 'Insurance' },
                        { key: 'maintenance', label: 'Maintenance' },
                        { key: 'property_management', label: 'PM Fee' },
                        { key: 'hoa', label: 'HOA' },
                        { key: 'utilities', label: 'Utilities' },
                      ].map((expense) => (
                        <div key={expense.key} className="space-y-1">
                          <label className="text-xs text-slate-400">{expense.label}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                            <input
                              type="number"
                              value={(formData.monthly_expenses as any)[expense.key] || ''}
                              onChange={(e) => handleExpenseChange(expense.key, parseInt(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Value */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Current Market Value</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={formData.current_value || ''}
                        onChange={(e) => setFormData({ ...formData, current_value: parseInt(e.target.value) || 0 })}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        placeholder={formData.purchase_price.toString()}
                      />
                    </div>
                  </div>

                  {/* Cash Flow Summary */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Monthly Income</p>
                        <p className="text-lg font-semibold text-green-400">${formData.monthly_rent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Monthly Expenses</p>
                        <p className="text-lg font-semibold text-red-400">${calculations.totalMonthlyExpenses.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Monthly Cash Flow</p>
                        <p className={`text-lg font-bold ${calculations.monthlyCashFlow >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                          {calculations.monthlyCashFlow >= 0 ? '+' : ''}${calculations.monthlyCashFlow.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Cap Rate</p>
                        <p className="text-lg font-bold text-teal-400">{calculations.capRate.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 text-teal-400 mb-4">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Review & Submit</span>
                  </div>

                  {/* Property Summary */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/20">
                        <Home className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{formData.address || 'No address'}</h4>
                        <p className="text-sm text-slate-400">
                          {formData.city}{formData.city && formData.state ? ', ' : ''}{formData.state} {formData.zip}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                          <span>{formData.beds} bd</span>
                          <span>{formData.baths} ba</span>
                          <span>{formData.sqft.toLocaleString()} sqft</span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">
                            {formData.strategy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financials Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-slate-400 mb-2">Purchase Price</p>
                      <p className="text-xl font-bold text-white">${formData.purchase_price.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-slate-400 mb-2">Total Investment</p>
                      <p className="text-xl font-bold text-white">${calculations.totalInvestment.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
                    <h4 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      Projected Returns
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Monthly Cash Flow</p>
                        <p className={`text-lg font-bold ${calculations.monthlyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {calculations.monthlyCashFlow >= 0 ? '+' : ''}${calculations.monthlyCashFlow.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Annual Cash Flow</p>
                        <p className={`text-lg font-bold ${calculations.annualCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {calculations.annualCashFlow >= 0 ? '+' : ''}${calculations.annualCashFlow.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Cap Rate</p>
                        <p className="text-lg font-bold text-teal-400">{calculations.capRate.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Cash on Cash</p>
                        <p className="text-lg font-bold text-purple-400">{calculations.cashOnCash.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Notes (optional)</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all resize-none"
                      placeholder="Any additional notes about this property..."
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Tags</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                        placeholder="Add tag..."
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all text-sm"
                      >
                        Add
                      </button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-sm"
                          >
                            {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag)}>
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mx-6 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.submit}
            </div>
          )}

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div>
              {step !== 'property' && (
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
              {step !== 'review' ? (
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
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Add Property
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
