/**
 * Preferences Modal Component
 * 
 * Allows users to configure their preferences including Financial DNA and Investment Goals
 */

import React, { useState, useEffect } from 'react';
import { X, Settings, Star, DollarSign, Home, Check, TrendingUp, Target, BarChart3, Banknote, Percent } from 'lucide-react';
import { usePreferencesStore } from '../stores/preferencesStore';

interface PreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'general' | 'financial' | 'goals';

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
    const {
        defaultStrategy,
        budgetRange,
        preferredBedrooms,
        financialDna,
        investmentCriteria,
        favoriteMarkets,
        setDefaultStrategy,
        setBudgetRange,
        setFinancialDna,
        setInvestmentCriteria,
        toggleFavoriteMarket
    } = usePreferencesStore();

    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [isSaving, setIsSaving] = useState(false);

    // --- Local State ---

    // General
    const [newMarket, setNewMarket] = useState('');
    const [minBudget, setMinBudget] = useState(budgetRange?.min || 200000);
    const [maxBudget, setMaxBudget] = useState(budgetRange?.max || 400000);

    // Financial DNA
    const [downPayment, setDownPayment] = useState<string>('20');
    const [interestRate, setInterestRate] = useState<string>('7.0');
    const [mgmtFee, setMgmtFee] = useState<string>('10');
    const [capex, setCapex] = useState<string>('5');
    const [vacancy, setVacancy] = useState<string>('5');

    // Investment Goals (Criteria)
    const [minCashFlow, setMinCashFlow] = useState<string>('');
    const [minCoc, setMinCoc] = useState<string>('');
    const [minCapRate, setMinCapRate] = useState<string>('');
    const [maxRehab, setMaxRehab] = useState<string>('');


    // Initialize local state from store when modal opens
    useEffect(() => {
        if (isOpen) {
            setMinBudget(budgetRange?.min || 200000);
            setMaxBudget(budgetRange?.max || 400000);

            if (financialDna) {
                setDownPayment(financialDna.down_payment_pct ? (financialDna.down_payment_pct * 100).toString() : '20');
                setInterestRate(financialDna.interest_rate_annual ? (financialDna.interest_rate_annual * 100).toString() : '7.0');
                setMgmtFee(financialDna.property_management_pct ? (financialDna.property_management_pct * 100).toString() : '10');
                setCapex(financialDna.capex_reserve_pct ? (financialDna.capex_reserve_pct * 100).toString() : '5');
                setVacancy(financialDna.vacancy_rate_pct ? (financialDna.vacancy_rate_pct * 100).toString() : '5');
            }

            if (investmentCriteria) {
                setMinCashFlow(investmentCriteria.min_cash_flow?.toString() || '');
                setMinCoc(investmentCriteria.min_coc_pct ? (investmentCriteria.min_coc_pct * 100).toString() : '');
                setMinCapRate(investmentCriteria.min_cap_rate_pct ? (investmentCriteria.min_cap_rate_pct * 100).toString() : '');
                setMaxRehab(investmentCriteria.max_rehab_cost?.toString() || '');
            }
        }
    }, [isOpen, budgetRange, financialDna, investmentCriteria]);

    if (!isOpen) return null;

    // Calculate overall completion percentage
    const calculateOverallCompletion = () => {
        let completed = 0;
        let total = 12; // Total fields across all tabs

        // General tab (3 items)
        if (defaultStrategy) completed++;
        if (budgetRange?.max) completed++;
        if (favoriteMarkets.length > 0) completed++;

        // Financial DNA tab (5 items)
        if (downPayment && parseFloat(downPayment) > 0) completed++;
        if (interestRate && parseFloat(interestRate) > 0) completed++;
        if (mgmtFee && parseFloat(mgmtFee) > 0) completed++;
        if (capex && parseFloat(capex) > 0) completed++;
        if (vacancy && parseFloat(vacancy) > 0) completed++;

        // Goals tab (4 items)
        if (minCashFlow) completed++;
        if (minCoc) completed++;
        if (minCapRate) completed++;
        if (maxRehab) completed++;

        return Math.round((completed / total) * 100);
    };

    const overallCompletion = calculateOverallCompletion();

    const handleAddMarket = () => {
        if (newMarket.trim()) {
            toggleFavoriteMarket(newMarket.trim());
            setNewMarket('');
        }
    };



    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Prepare Data
            setBudgetRange(minBudget, maxBudget);

            const newDna = {
                down_payment_pct: parseFloat(downPayment) / 100,
                interest_rate_annual: parseFloat(interestRate) / 100,
                property_management_pct: parseFloat(mgmtFee) / 100,
                capex_reserve_pct: parseFloat(capex) / 100,
                vacancy_rate_pct: parseFloat(vacancy) / 100,
                maintenance_pct: 0.05, // Default
                closing_cost_pct: 0.03, // Default
                loan_term_years: 30 // Default
            };
            setFinancialDna(newDna);

            const newCriteria = {
                min_cash_flow: minCashFlow ? parseFloat(minCashFlow) : null,
                min_coc_pct: minCoc ? parseFloat(minCoc) / 100 : null,
                min_cap_rate_pct: minCapRate ? parseFloat(minCapRate) / 100 : null,
                max_rehab_cost: maxRehab ? parseFloat(maxRehab) : null
            };
            setInvestmentCriteria(newCriteria);

            // 2. Save to Backend
            // Dynamic import to avoid circular dependency if any
            const { savePreferences } = await import('../services/preferencesApi');

            // Get additional required fields from store
            const { recentSearches, showKeyboardHints, theme } = usePreferencesStore.getState();

            await savePreferences({
                user_id: 'default',
                default_strategy: defaultStrategy,
                budget_range: { min: minBudget, max: maxBudget },
                preferred_bedrooms: preferredBedrooms,
                favorite_markets: favoriteMarkets,
                financial_dna: newDna,
                investment_criteria: newCriteria,
                recent_searches: recentSearches,
                show_keyboard_hints: showKeyboardHints,
                theme: theme
            });

            onClose();
        } catch (err) {
            console.error("Failed to save preferences", err);
        } finally {
            setIsSaving(false);
        }
    };

    const TabButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${activeTab === id
                ? 'text-white'
                : 'text-white/60 hover:text-white/80'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
            {activeTab === id && (
                <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-teal-500" />
            )}
        </button>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-white/70" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Settings</h2>
                                <p className="text-sm text-white/60 mt-0.5">Configure your preferences</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1.5 rounded-lg bg-white/5">
                                <span className="text-sm font-medium text-white/70">{overallCompletion}% complete</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-3">
                    <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${overallCompletion}%` }}
                        />
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 py-3 border-b border-white/10 bg-white/[0.01] flex gap-2">
                    <TabButton id="general" label="General & Buy Box" icon={Home} />
                    <TabButton id="financial" label="Financial DNA" icon={TrendingUp} />
                    <TabButton id="goals" label="Investment Goals" icon={Target} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* --- GENERAL TAB --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-8">
                            {/* Strategy */}
                            <section>
                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-4">
                                    <Home className="w-4 h-4 text-blue-400" />
                                    Default Strategy
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['STR', 'LTR', 'FLIP'].map((strategy) => (
                                        <button
                                            key={strategy}
                                            onClick={() => setDefaultStrategy(strategy as any)}
                                            className={`relative group p-4 rounded-xl transition-all duration-300 text-left ${defaultStrategy === strategy
                                                ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10'
                                                : 'hover:bg-white/[0.02]'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-semibold ${defaultStrategy === strategy ? 'text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text' : 'text-white/80'}`}>{strategy}</span>
                                                {defaultStrategy === strategy && <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-0.5"><Check className="w-3 h-3 text-white" /></div>}
                                            </div>
                                            <div className="text-xs text-white/40">
                                                {strategy === 'STR' && 'Short-term Rental'}
                                                {strategy === 'LTR' && 'Long-term Rental'}
                                                {strategy === 'FLIP' && 'Fix & Flip'}
                                            </div>
                                            {defaultStrategy === strategy && (
                                                <div className="absolute inset-0 rounded-xl border border-blue-500/30" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Budget */}
                            <section>
                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-4">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    Budget Range
                                </label>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs text-white/40 uppercase tracking-wider">Min</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
                                                <input type="number" value={minBudget} onChange={(e) => setMinBudget(Number(e.target.value))} className="w-full bg-white/[0.03] border border-transparent rounded-lg py-2.5 pl-7 pr-3 text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/30 transition-all" step="10000" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-white/40 uppercase tracking-wider">Max</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
                                                <input type="number" value={maxBudget} onChange={(e) => setMaxBudget(Number(e.target.value))} className="w-full bg-white/[0.03] border border-transparent rounded-lg py-2.5 pl-7 pr-3 text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/30 transition-all" step="10000" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center text-sm text-white/50">
                                        Target: <span className="text-white">{minBudget >= 1000000 ? `$${(minBudget / 1000000).toFixed(1)}M` : `$${(minBudget / 1000).toFixed(0)}k`}</span> - <span className="text-white">{maxBudget >= 1000000 ? `$${(maxBudget / 1000000).toFixed(1)}M` : `$${(maxBudget / 1000).toFixed(0)}k`}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Markets */}
                            <section>
                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-4">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    Favorite Markets
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input type="text" value={newMarket} onChange={(e) => setNewMarket(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddMarket()} placeholder="Add a city..." className="flex-1 bg-white/[0.03] border border-transparent rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/30 transition-all" />
                                    <button onClick={handleAddMarket} disabled={!newMarket.trim()} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {favoriteMarkets.map((market: string) => (
                                        <div key={market} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white/[0.05] border border-transparent text-white/90 rounded-lg group hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all">
                                            <span className="text-sm">{market}</span>
                                            <button onClick={() => toggleFavoriteMarket(market)} className="p-1 rounded text-white/40 hover:text-red-400 hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] transition-all"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* --- FINANCIAL DNA TAB --- */}
                    {activeTab === 'financial' && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-blue-500/5 text-blue-200/70 text-sm">
                                These settings ensure your deal analysis is accurate to your financial situation.
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">Down Payment %</label>
                                    <div className="relative">
                                        <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="w-full bg-white/[0.03] border border-transparent rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/30 transition-all" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">Interest Rate %</label>
                                    <div className="relative">
                                        <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full bg-white/[0.03] border border-transparent rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/30 transition-all" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">Prop Mgmt Fee %</label>
                                    <div className="relative">
                                        <input type="number" value={mgmtFee} onChange={(e) => setMgmtFee(e.target.value)} className="w-full bg-white/[0.03] border border-transparent rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/30 transition-all" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">CapEx / Vacancy %</label>
                                    <div className="relative">
                                        <input type="number" value={capex} onChange={(e) => setCapex(e.target.value)} className="w-full bg-white/[0.03] border border-transparent rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/30 transition-all" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- GOALS TAB (NEW) --- */}
                    {activeTab === 'goals' && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-purple-500/5 text-purple-200/70 text-sm flex items-start gap-3">
                                <Target className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold mb-1">Define your "Win" conditions</p>
                                    <p className="opacity-80">Deals that meet these criteria will be highlighted with a special badge.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Cash Flow */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                                        <Banknote className="w-4 h-4 text-green-400" />
                                        Min. Monthly Cash Flow
                                    </label>
                                    <div className="relative max-w-sm">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                        <input placeholder="e.g. 300" type="number" value={minCashFlow} onChange={(e) => setMinCashFlow(e.target.value)} className="w-full bg-white/[0.03] border border-transparent rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-green-500/30 transition-all" />
                                    </div>
                                </div>

                                {/* CoC Return */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                                        <Percent className="w-4 h-4 text-blue-400" />
                                        Min. Cash-on-Cash Return
                                    </label>
                                    <div className="relative max-w-sm">
                                        <input placeholder="e.g. 10" type="number" value={minCoc} onChange={(e) => setMinCoc(e.target.value)} className="w-full bg-white/[0.03] border border-transparent rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500/30 transition-all" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">%</span>
                                    </div>
                                </div>

                                {/* Max Rehab */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                                        <BarChart3 className="w-4 h-4 text-orange-400" />
                                        Max Rehab Budget
                                    </label>
                                    <div className="relative max-w-sm">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                        <input placeholder="e.g. 50000" type="number" value={maxRehab} onChange={(e) => setMaxRehab(e.target.value)} className="w-full bg-white/[0.03] border border-transparent rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500/30 transition-all" />
                                    </div>
                                    <p className="text-xs text-white/30 mt-2">Projects exceeding this rehab cost will be flagged.</p>
                                </div>
                            </div>
                        </div>
                    )}



                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-6">
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group relative overflow-hidden"
                    >
                        {/* Shimmer effect */}
                        {!isSaving && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        )}
                        <span className="relative z-10">{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

