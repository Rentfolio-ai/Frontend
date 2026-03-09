/**
 * Preferences Modal - Simplified & Clean Design
 * Notion-inspired simplicity with user control
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { usePreferencesStore } from '../stores/preferencesStore';
import { cn } from '../lib/utils';

interface PreferencesModalSimplifiedProps {
    isOpen: boolean;
    onClose: () => void;
}

// Popular US markets for autocomplete
const POPULAR_MARKETS = [
    'Austin, TX', 'Nashville, TN', 'Raleigh, NC', 'Charlotte, NC', 'Phoenix, AZ',
    'Tampa, FL', 'Dallas, TX', 'Houston, TX', 'Atlanta, GA', 'Orlando, FL',
    'Miami, FL', 'Denver, CO', 'Las Vegas, NV', 'Seattle, WA', 'Portland, OR',
    'San Diego, CA', 'Los Angeles, CA', 'San Francisco, CA', 'Boston, MA',
    'Chicago, IL', 'New York, NY', 'Philadelphia, PA', 'Washington DC',
    'Fort Worth, TX', 'San Antonio, TX', 'Jacksonville, FL', 'Indianapolis, IN',
    'Columbus, OH', 'Sacramento, CA', 'Salt Lake City, UT'
].sort();

export const PreferencesModalSimplified: React.FC<PreferencesModalSimplifiedProps> = ({ isOpen, onClose }) => {
    const {
        defaultStrategy,
        budgetRange,
        preferredBedrooms,
        preferredPropertyTypes,
        financialDna,
        investmentCriteria,
        favoriteMarkets,
        setDefaultStrategy,
        setBudgetRange,
        setPreferredBedrooms,
        setFinancialDna,
        setInvestmentCriteria,
        toggleFavoriteMarket,
        togglePropertyType
    } = usePreferencesStore();

    // Local state for form
    const [strategy, setStrategy] = useState<'STR' | 'LTR' | 'FLIP' | null>(defaultStrategy);
    const [minBudget, setMinBudget] = useState(budgetRange?.min?.toString() || '200000');
    const [maxBudget, setMaxBudget] = useState(budgetRange?.max?.toString() || '400000');
    const [markets, setMarkets] = useState<string[]>(favoriteMarkets);
    const [propertyTypes, setPropertyTypes] = useState<string[]>(preferredPropertyTypes);
    const [bedrooms, setBedrooms] = useState<string>(preferredBedrooms?.toString() || 'any');
    const [bathrooms, setBathrooms] = useState<string>('any');
    
    // Financial assumptions
    const [showFinancial, setShowFinancial] = useState(false);
    const [downPayment, setDownPayment] = useState(financialDna?.down_payment_pct ? (financialDna.down_payment_pct * 100).toString() : '20');
    const [interestRate, setInterestRate] = useState(financialDna?.interest_rate_annual ? (financialDna.interest_rate_annual * 100).toString() : '7.0');
    const [mgmtFee, setMgmtFee] = useState(financialDna?.property_management_pct ? (financialDna.property_management_pct * 100).toString() : '10');
    const [vacancy, setVacancy] = useState(financialDna?.vacancy_rate_pct ? (financialDna.vacancy_rate_pct * 100).toString() : '5');
    
    // Investment goals
    const [showGoals, setShowGoals] = useState(false);
    const [minCashFlow, setMinCashFlow] = useState(investmentCriteria?.min_cash_flow?.toString() || '200');
    const [targetReturn, setTargetReturn] = useState(investmentCriteria?.min_coc_pct ? (investmentCriteria.min_coc_pct * 100).toString() : '8');
    
    // Market autocomplete
    const [marketSearch, setMarketSearch] = useState('');
    const [showMarketDropdown, setShowMarketDropdown] = useState(false);
    const [filteredMarkets, setFilteredMarkets] = useState<string[]>(POPULAR_MARKETS);

    // Validation error
    const [budgetError, setBudgetError] = useState('');

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Filter markets based on search
    useEffect(() => {
        if (marketSearch) {
            const filtered = POPULAR_MARKETS.filter(m => 
                m.toLowerCase().includes(marketSearch.toLowerCase()) &&
                !markets.includes(m)
            );
            setFilteredMarkets(filtered);
        } else {
            setFilteredMarkets(POPULAR_MARKETS.filter(m => !markets.includes(m)));
        }
    }, [marketSearch, markets]);

    const formatCurrency = (value: string) => {
        const num = parseInt(value.replace(/,/g, ''));
        if (isNaN(num)) return '';
        return num.toLocaleString();
    };

    const handleAddMarket = (market: string) => {
        if (!markets.includes(market) && markets.length < 10) {
            setMarkets([...markets, market]);
            setMarketSearch('');
            setShowMarketDropdown(false);
        }
    };

    const handleRemoveMarket = (market: string) => {
        setMarkets(markets.filter(m => m !== market));
    };

    const togglePropertyTypeLocal = (type: string) => {
        if (propertyTypes.includes(type)) {
            setPropertyTypes(propertyTypes.filter(t => t !== type));
        } else {
            setPropertyTypes([...propertyTypes, type]);
        }
    };

    const handleSave = () => {
        // Validate budget
        const min = parseInt(minBudget.replace(/,/g, ''));
        const max = parseInt(maxBudget.replace(/,/g, ''));
        
        if (max <= min) {
            setBudgetError('Maximum must be greater than minimum');
            return;
        }
        setBudgetError('');

        // Save to store
        if (strategy) setDefaultStrategy(strategy);
        setBudgetRange(min, max);
        
        // Update markets
        const currentMarkets = favoriteMarkets;
        markets.forEach(m => {
            if (!currentMarkets.includes(m)) toggleFavoriteMarket(m);
        });
        currentMarkets.forEach(m => {
            if (!markets.includes(m)) toggleFavoriteMarket(m);
        });

        // Update property types
        const currentTypes = preferredPropertyTypes;
        propertyTypes.forEach(t => {
            if (!currentTypes.includes(t)) togglePropertyType(t);
        });
        currentTypes.forEach(t => {
            if (!propertyTypes.includes(t)) togglePropertyType(t);
        });

        // Update bedrooms
        if (bedrooms !== 'any') {
            setPreferredBedrooms(parseInt(bedrooms));
        } else {
            setPreferredBedrooms(null);
        }

        // Save financial DNA
        setFinancialDna({
            down_payment_pct: parseFloat(downPayment) / 100,
            interest_rate_annual: parseFloat(interestRate) / 100,
            property_management_pct: parseFloat(mgmtFee) / 100,
            vacancy_rate_pct: parseFloat(vacancy) / 100,
        });

        // Save investment criteria
        setInvestmentCriteria({
            min_cash_flow: parseFloat(minCashFlow),
            min_coc_pct: parseFloat(targetReturn) / 100,
        });

        onClose();
    };

    const handleCancel = () => {
        // Reset to store values
        setStrategy(defaultStrategy);
        setMinBudget(budgetRange?.min?.toString() || '200000');
        setMaxBudget(budgetRange?.max?.toString() || '400000');
        setMarkets(favoriteMarkets);
        setPropertyTypes(preferredPropertyTypes);
        onClose();
    };

    const useTypicalValues = () => {
        setDownPayment('20');
        setInterestRate('7.0');
        setMgmtFee('10');
        setVacancy('5');
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleCancel();
            }}
        >
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-popover rounded-2xl shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-black/[0.04]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Investment Preferences</h2>
                            <p className="text-sm text-muted-foreground mt-1">Set your criteria and Civitas will find better matches</p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-black/[0.04] rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                    
                    {/* Strategy Section */}
                    <section>
                        <label className="block text-sm font-medium text-foreground/70 mb-3">Strategy</label>
                        <div className="space-y-2">
                            {[
                                { id: 'STR', label: 'Short-Term Rental', desc: 'Airbnb, VRBO' },
                                { id: 'LTR', label: 'Long-Term Rental', desc: 'Traditional leases' },
                                { id: 'FLIP', label: 'Fix & Flip', desc: 'Renovate and sell' }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setStrategy(option.id as any)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left',
                                        strategy === option.id
                                            ? 'bg-black/[0.06] border-black/[0.15]'
                                            : 'bg-black/[0.02] border-black/[0.08] hover:bg-black/[0.03]'
                                    )}
                                >
                                    <div className={cn(
                                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                                        strategy === option.id ? 'border-white' : 'border-white/30'
                                    )}>
                                        {strategy === option.id && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-foreground">{option.label}</div>
                                        <div className="text-xs text-muted-foreground">{option.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Budget Range Section */}
                    <section>
                        <label className="block text-sm font-medium text-foreground/70 mb-3">Budget Range</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Min</label>
                                <input
                                    type="text"
                                    value={formatCurrency(minBudget)}
                                    onChange={(e) => setMinBudget(e.target.value.replace(/,/g, ''))}
                                    className={cn(
                                        'w-full h-10 px-3 py-2 bg-black/[0.02] border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50',
                                        'focus:outline-none focus:border-black/[0.15] focus:ring-2 focus:ring-black/[0.10] transition-all',
                                        budgetError ? 'border-red-500/50' : 'border-black/[0.08]'
                                    )}
                                    placeholder="200,000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Max</label>
                                <input
                                    type="text"
                                    value={formatCurrency(maxBudget)}
                                    onChange={(e) => setMaxBudget(e.target.value.replace(/,/g, ''))}
                                    className={cn(
                                        'w-full h-10 px-3 py-2 bg-black/[0.02] border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50',
                                        'focus:outline-none focus:border-black/[0.15] focus:ring-2 focus:ring-black/[0.10] transition-all',
                                        budgetError ? 'border-red-500/50' : 'border-black/[0.08]'
                                    )}
                                    placeholder="400,000"
                                />
                            </div>
                        </div>
                        {budgetError && (
                            <p className="text-xs text-red-400 mt-2">{budgetError}</p>
                        )}
                    </section>

                    {/* Target Markets Section */}
                    <section>
                        <label className="block text-sm font-medium text-foreground/70 mb-3">Target Markets</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {markets.map((market) => (
                                <span
                                    key={market}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.06] border border-black/[0.08] rounded-full text-sm text-foreground"
                                >
                                    {market}
                                    <button
                                        onClick={() => handleRemoveMarket(market)}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMarketDropdown(!showMarketDropdown)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.02] border border-black/[0.08] rounded-full text-sm text-muted-foreground hover:bg-black/[0.04] hover:text-foreground/80 transition-all"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add Market
                                </button>
                                
                                {showMarketDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowMarketDropdown(false)}
                                        />
                                        <div className="absolute top-full left-0 mt-2 w-64 bg-popover/95 backdrop-blur-xl border border-black/[0.08] rounded-lg shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                            <input
                                                type="text"
                                                value={marketSearch}
                                                onChange={(e) => setMarketSearch(e.target.value)}
                                                placeholder="Search cities..."
                                                className="w-full px-3 py-2 bg-black/[0.04] border-b border-black/[0.08] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                                                autoFocus
                                            />
                                            <div className="max-h-48 overflow-y-auto">
                                                {filteredMarkets.slice(0, 10).map((market) => (
                                                    <button
                                                        key={market}
                                                        onClick={() => handleAddMarket(market)}
                                                        className="w-full px-3 py-2 text-left text-sm text-foreground/80 hover:bg-black/[0.04] transition-colors"
                                                    >
                                                        {market}
                                                    </button>
                                                ))}
                                                {filteredMarkets.length === 0 && (
                                                    <div className="px-3 py-4 text-sm text-muted-foreground/70 text-center">
                                                        No markets found
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Property Types Section */}
                    <section>
                        <label className="block text-sm font-medium text-foreground/70 mb-3">Property Types</label>
                        <div className="space-y-2">
                            {[
                                { id: 'Single Family', label: 'Single Family Homes' },
                                { id: 'Multi-Family', label: 'Multi-Family (2-4 units)' },
                                { id: 'Condo', label: 'Condos' },
                                { id: 'Townhouse', label: 'Townhouses' }
                            ].map((type) => (
                                <label
                                    key={type.id}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-black/[0.08] hover:bg-black/[0.02] cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={propertyTypes.includes(type.id)}
                                        onChange={() => togglePropertyTypeLocal(type.id)}
                                        className="w-4 h-4 rounded border-black/20 bg-black/[0.04] text-foreground focus:ring-black/20 focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-foreground">{type.label}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Property Details Section */}
                    <section>
                        <label className="block text-sm font-medium text-foreground/70 mb-3">Property Details <span className="text-muted-foreground/70">(Optional)</span></label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Bedrooms</label>
                                <select
                                    value={bedrooms}
                                    onChange={(e) => setBedrooms(e.target.value)}
                                    className="w-full h-10 px-3 py-2 bg-black/[0.02] border border-black/[0.08] rounded-lg text-sm text-foreground focus:outline-none focus:border-black/[0.15] focus:ring-2 focus:ring-black/[0.10] transition-all"
                                >
                                    <option value="any">Any</option>
                                    <option value="1">1+</option>
                                    <option value="2">2+</option>
                                    <option value="3">3+</option>
                                    <option value="4">4+</option>
                                    <option value="5">5+</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Bathrooms</label>
                                <select
                                    value={bathrooms}
                                    onChange={(e) => setBathrooms(e.target.value)}
                                    className="w-full h-10 px-3 py-2 bg-black/[0.02] border border-black/[0.08] rounded-lg text-sm text-foreground focus:outline-none focus:border-black/[0.15] focus:ring-2 focus:ring-black/[0.10] transition-all"
                                >
                                    <option value="any">Any</option>
                                    <option value="1">1+</option>
                                    <option value="2">2+</option>
                                    <option value="3">3+</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Financial Assumptions - Collapsible */}
                    <section>
                        <button
                            onClick={() => setShowFinancial(!showFinancial)}
                            className="flex items-center justify-between w-full text-sm font-medium text-foreground/70 mb-3 hover:text-foreground transition-colors"
                        >
                            <span>Financial Assumptions</span>
                            {showFinancial ? <ChevronUp className="w-4 h-4 transition-transform" /> : <ChevronDown className="w-4 h-4 transition-transform" />}
                        </button>
                        
                        {showFinancial && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Down Payment</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={downPayment}
                                                onChange={(e) => setDownPayment(e.target.value)}
                                                className="w-full h-10 px-3 py-2 pr-8 bg-black/[0.02] border border-black/[0.08] rounded-lg text-sm text-foreground focus:outline-none focus:border-black/[0.15] focus:ring-2 focus:ring-black/[0.10] transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/70">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Interest Rate</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={interestRate}
                                                onChange={(e) => setInterestRate(e.target.value)}
                                                className="w-full h-10 px-3 py-2 pr-8 bg-black/[0.02] border border-black/[0.08] rounded-lg text-sm text-foreground focus:outline-none focus:border-black/[0.15] focus:ring-2 focus:ring-black/[0.10] transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/70">%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Management Fee</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={mgmtFee}
                                                onChange={(e) => setMgmtFee(e.target.value)}
                                                className="w-full h-10 px-3 py-2 pr-8 bg-black/[0.02] border border-black/[0.08] rounded-lg text-sm text-foreground focus:outline-none focus:border-black/[0.15] focus:ring-2 focus:ring-black/[0.10] transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/70">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Vacancy Rate</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={vacancy}
                                                onChange={(e) => setVacancy(e.target.value)}
                                                className="w-full h-10 px-3 py-2 pr-8 bg-black/[0.02] border border-black/[0.08] rounded-lg text-sm text-foreground focus:outline-none focus:border-black/[0.15] focus:ring-2 focus:ring-black/[0.10] transition-all"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/70">%</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={useTypicalValues}
                                    className="text-xs text-muted-foreground hover:text-foreground/70 transition-colors"
                                >
                                    Use typical values
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Investment Goals - Collapsible */}
                    <section>
                        <button
                            onClick={() => setShowGoals(!showGoals)}
                            className="flex items-center justify-between w-full text-sm font-medium text-foreground/70 mb-3 hover:text-foreground transition-colors"
                        >
                            <span>Investment Goals <span className="text-muted-foreground/70">(Optional)</span></span>
                            {showGoals ? <ChevronUp className="w-4 h-4 transition-transform" /> : <ChevronDown className="w-4 h-4 transition-transform" />}
                        </button>
                        
                        {showGoals && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Minimum Monthly Cash Flow</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/70">$</span>
                                        <input
                                            type="text"
                                            value={minCashFlow}
                                            onChange={(e) => setMinCashFlow(e.target.value)}
                                            className="w-full h-10 px-3 py-2 pl-8 bg-black/[0.02] border border-black/[0.08] rounded-lg text-sm text-foreground focus:outline-none focus:border-black/[0.15] focus:ring-2 focus:ring-black/[0.10] transition-all"
                                            placeholder="200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Target Annual Return</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={targetReturn}
                                            onChange={(e) => setTargetReturn(e.target.value)}
                                            className="w-full h-10 px-3 py-2 pr-8 bg-black/[0.02] border border-black/[0.08] rounded-lg text-sm text-foreground focus:outline-none focus:border-black/[0.15] focus:ring-2 focus:ring-black/[0.10] transition-all"
                                            placeholder="8"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/70">%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground/70">These are optional - leave blank if unsure</p>
                            </div>
                        )}
                    </section>

                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-black/[0.04] flex items-center justify-end gap-3">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:bg-black/[0.04] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
                    >
                        Save
                    </button>
                </div>

            </div>
        </div>
    );
};

