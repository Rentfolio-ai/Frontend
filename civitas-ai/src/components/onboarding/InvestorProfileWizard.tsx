import React, { useState } from 'react';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';
import { CheckCircle, TrendingUp, DollarSign, MapPin, Target } from 'lucide-react';

interface InvestorProfileData {
    // Investment Goals
    investment_goals: string[];
    target_annual_return?: number;
    investment_horizon?: string;

    // Risk Profile
    risk_tolerance: string;
    max_property_price?: number;
    min_cash_flow_monthly?: number;

    // Preferences
    preferred_markets: string[];
    preferred_strategies: string[];
    property_types: string[];

    // Financial Capacity
    available_capital?: number;
    max_down_payment?: number;
    financing_preference?: string;

    // Experience
    experience_level: string;
    properties_owned: number;
}

interface InvestorProfileWizardProps {
    onComplete: (profile: InvestorProfileData) => void;
    onSkip?: () => void;
}

export const InvestorProfileWizard: React.FC<InvestorProfileWizardProps> = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<InvestorProfileData>({
        investment_goals: [],
        risk_tolerance: 'moderate',
        preferred_markets: [],
        preferred_strategies: [],
        property_types: [],
        experience_level: 'beginner',
        properties_owned: 0
    });

    const totalSteps = 5;

    const updateProfile = (updates: Partial<InvestorProfileData>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const toggleArrayItem = (field: keyof InvestorProfileData, value: string) => {
        const current = profile[field] as string[];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        updateProfile({ [field]: updated });
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onComplete(profile);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
            <Card className="w-full max-w-3xl p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Step {step} of {totalSteps}</span>
                        <span className="text-sm text-indigo-400">{Math.round((step / totalSteps) * 100)}% Complete</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step 1: Investment Goals */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Target className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">What are your investment goals?</h2>
                            <p className="text-gray-400">Select all that apply</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { value: 'cash_flow', label: 'Monthly Cash Flow', desc: 'Generate passive income' },
                                { value: 'appreciation', label: 'Property Appreciation', desc: 'Long-term value growth' },
                                { value: 'tax_benefits', label: 'Tax Benefits', desc: 'Deductions and write-offs' },
                                { value: 'portfolio_diversification', label: 'Diversification', desc: 'Spread investment risk' }
                            ].map(goal => (
                                <button
                                    key={goal.value}
                                    onClick={() => toggleArrayItem('investment_goals', goal.value)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${profile.investment_goals.includes(goal.value)
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium text-white">{goal.label}</div>
                                            <div className="text-sm text-gray-400 mt-1">{goal.desc}</div>
                                        </div>
                                        {profile.investment_goals.includes(goal.value) && (
                                            <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm text-gray-400">Target Annual Return (%)</span>
                                <input
                                    type="number"
                                    value={profile.target_annual_return || ''}
                                    onChange={(e) => updateProfile({ target_annual_return: parseFloat(e.target.value) })}
                                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="e.g., 12"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm text-gray-400">Investment Horizon</span>
                                <select
                                    value={profile.investment_horizon || ''}
                                    onChange={(e) => updateProfile({ investment_horizon: e.target.value })}
                                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="">Select...</option>
                                    <option value="short_term">Short-term (1-3 years)</option>
                                    <option value="medium_term">Medium-term (3-7 years)</option>
                                    <option value="long_term">Long-term (7+ years)</option>
                                </select>
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 2: Risk Tolerance */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <TrendingUp className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">What's your risk tolerance?</h2>
                            <p className="text-gray-400">This helps us recommend suitable properties</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { value: 'conservative', label: 'Conservative', desc: 'Stable cash flow, lower risk, established markets' },
                                { value: 'moderate', label: 'Moderate', desc: 'Balanced approach, some growth potential' },
                                { value: 'aggressive', label: 'Aggressive', desc: 'Higher returns, emerging markets, value-add opportunities' }
                            ].map(risk => (
                                <button
                                    key={risk.value}
                                    onClick={() => updateProfile({ risk_tolerance: risk.value })}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${profile.risk_tolerance === risk.value
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium text-white">{risk.label}</div>
                                            <div className="text-sm text-gray-400 mt-1">{risk.desc}</div>
                                        </div>
                                        {profile.risk_tolerance === risk.value && (
                                            <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <label className="block">
                                <span className="text-sm text-gray-400">Max Property Price</span>
                                <input
                                    type="number"
                                    value={profile.max_property_price || ''}
                                    onChange={(e) => updateProfile({ max_property_price: parseInt(e.target.value) })}
                                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="$500,000"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm text-gray-400">Min Monthly Cash Flow</span>
                                <input
                                    type="number"
                                    value={profile.min_cash_flow_monthly || ''}
                                    onChange={(e) => updateProfile({ min_cash_flow_monthly: parseInt(e.target.value) })}
                                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="$500"
                                />
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 3: Preferred Markets */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <MapPin className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Where do you want to invest?</h2>
                            <p className="text-gray-400">Select your target markets</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                'Austin, TX', 'Denver, CO', 'Nashville, TN', 'Phoenix, AZ',
                                'Tampa, FL', 'Charlotte, NC', 'Atlanta, GA', 'Dallas, TX',
                                'Las Vegas, NV', 'Orlando, FL', 'Portland, OR', 'Seattle, WA'
                            ].map(market => (
                                <button
                                    key={market}
                                    onClick={() => toggleArrayItem('preferred_markets', market)}
                                    className={`p-3 rounded-lg border text-sm transition-all ${profile.preferred_markets.includes(market)
                                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    {market}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6">
                            <label className="block">
                                <span className="text-sm text-gray-400">Preferred Strategies</span>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                    {['STR', 'LTR', 'MTR', 'BRRRR', 'Flip', 'House Hack'].map(strategy => (
                                        <button
                                            key={strategy}
                                            onClick={() => toggleArrayItem('preferred_strategies', strategy)}
                                            className={`p-2 rounded-lg border text-sm transition-all ${profile.preferred_strategies.includes(strategy)
                                                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                                                    : 'border-gray-700 text-gray-400 hover:border-gray-600'
                                                }`}
                                        >
                                            {strategy}
                                        </button>
                                    ))}
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 4: Financial Capacity */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <DollarSign className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">What's your budget?</h2>
                            <p className="text-gray-400">Help us find properties within your means</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm text-gray-400">Available Capital</span>
                                <input
                                    type="number"
                                    value={profile.available_capital || ''}
                                    onChange={(e) => updateProfile({ available_capital: parseInt(e.target.value) })}
                                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="$100,000"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm text-gray-400">Max Down Payment</span>
                                <input
                                    type="number"
                                    value={profile.max_down_payment || ''}
                                    onChange={(e) => updateProfile({ max_down_payment: parseInt(e.target.value) })}
                                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="$80,000"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm text-gray-400">Financing Preference</span>
                                <select
                                    value={profile.financing_preference || ''}
                                    onChange={(e) => updateProfile({ financing_preference: e.target.value })}
                                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="">Select...</option>
                                    <option value="conventional">Conventional Loan</option>
                                    <option value="fha">FHA Loan</option>
                                    <option value="cash">All Cash</option>
                                    <option value="creative">Creative Financing</option>
                                    <option value="partnership">Partnership/Syndication</option>
                                </select>
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 5: Experience Level */}
                {step === 5 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Tell us about your experience</h2>
                            <p className="text-gray-400">This helps us tailor recommendations</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { value: 'beginner', label: 'Beginner', desc: 'New to real estate investing' },
                                { value: 'intermediate', label: 'Intermediate', desc: '1-5 properties owned' },
                                { value: 'expert', label: 'Expert', desc: '5+ properties, experienced investor' }
                            ].map(level => (
                                <button
                                    key={level.value}
                                    onClick={() => updateProfile({ experience_level: level.value })}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${profile.experience_level === level.value
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : 'border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium text-white">{level.label}</div>
                                            <div className="text-sm text-gray-400 mt-1">{level.desc}</div>
                                        </div>
                                        {profile.experience_level === level.value && (
                                            <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <label className="block mt-6">
                            <span className="text-sm text-gray-400">Properties Currently Owned</span>
                            <input
                                type="number"
                                value={profile.properties_owned}
                                onChange={(e) => updateProfile({ properties_owned: parseInt(e.target.value) || 0 })}
                                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                placeholder="0"
                                min="0"
                            />
                        </label>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
                    <div>
                        {step > 1 && (
                            <Button onClick={prevStep} variant="secondary">
                                Back
                            </Button>
                        )}
                        {onSkip && step === 1 && (
                            <Button onClick={onSkip} variant="ghost" className="text-gray-400">
                                Skip for now
                            </Button>
                        )}
                    </div>
                    <Button onClick={nextStep} variant="primary">
                        {step === totalSteps ? 'Complete Profile' : 'Next Step'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
