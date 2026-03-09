/**
 * Preferences Modal - Next-Generation Design
 * 
 * Revolutionary, intelligent, and visually stunning preference configuration
 */

import React, { useState, useEffect } from 'react';
import { X, Settings, Home, DollarSign, TrendingUp, Target, Building2, MapPin, Check, Info, Zap, Shield, BarChart3, Sparkles, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { usePreferencesStore } from '../stores/preferencesStore';

interface PreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'general' | 'financial' | 'goals';

// Comprehensive US Real Estate Markets - Categorized by Growth & Region
const MARKET_CATEGORIES = {
    'High-Growth 🚀': [
        'Austin, TX', 'Nashville, TN', 'Raleigh, NC', 'Charlotte, NC', 'Boise, ID',
        'Phoenix, AZ', 'Tampa, FL', 'Jacksonville, FL', 'Fort Myers, FL', 'Cape Coral, FL',
        'Huntsville, AL', 'Provo, UT', 'Charleston, SC', 'Greenville, SC', 'Sarasota, FL'
    ],
    'Emerging Markets 📈': [
        'Fort Worth, TX', 'San Antonio, TX', 'Oklahoma City, OK', 'Des Moines, IA', 'Spokane, WA',
        'Knoxville, TN', 'Birmingham, AL', 'Chattanooga, TN', 'Little Rock, AR', 'Winston-Salem, NC',
        'Fresno, CA', 'Tucson, AZ', 'El Paso, TX', 'Albuquerque, NM', 'Tulsa, OK'
    ],
    'Established Markets 🏛️': [
        'Dallas, TX', 'Houston, TX', 'Atlanta, GA', 'Orlando, FL', 'Miami, FL',
        'Denver, CO', 'Las Vegas, NV', 'Salt Lake City, UT', 'Sacramento, CA', 'Portland, OR',
        'Seattle, WA', 'Minneapolis, MN', 'Kansas City, MO', 'Indianapolis, IN', 'Columbus, OH'
    ],
    'Major Metros 🌆': [
        'Los Angeles, CA', 'San Diego, CA', 'San Francisco, CA', 'Boston, MA', 'Philadelphia, PA',
        'Washington DC', 'Chicago, IL', 'New York, NY', 'Baltimore, MD', 'Milwaukee, WI',
        'Cleveland, OH', 'Detroit, MI', 'Cincinnati, OH', 'Pittsburgh, PA', 'St. Louis, MO'
    ],
    'Secondary Markets 💎': [
        'Reno, NV', 'Colorado Springs, CO', 'Omaha, NE', 'Louisville, KY', 'Richmond, VA',
        'Memphis, TN', 'Greensboro, NC', 'Durham, NC', 'Virginia Beach, VA', 'Norfolk, VA',
        'Lexington, KY', 'Grand Rapids, MI', 'Madison, WI', 'Asheville, NC', 'Wilmington, NC'
    ]
};

// Flattened list for search
const POPULAR_CITIES = Object.values(MARKET_CATEGORIES).flat().sort();

const PROPERTY_TYPES = [
    {
        id: 'Single Family',
        label: 'Single Family',
        icon: '🏡',
        desc: 'Traditional homes',
        avgPrice: '$250-400k',
        cashFlow: '$200-400/mo',
        appreciation: 'High',
        liquidity: 'High',
        mgmt: 'Easy'
    },
    {
        id: 'Multi-Family',
        label: 'Multi-Family',
        icon: '🏢',
        desc: '2-4 units',
        avgPrice: '$350-600k',
        cashFlow: '$400-800/mo',
        appreciation: 'Medium',
        liquidity: 'Medium',
        mgmt: 'Medium'
    },
    {
        id: 'Condo',
        label: 'Condo',
        icon: '🏙️',
        desc: 'Condominiums',
        avgPrice: '$150-300k',
        cashFlow: '$100-250/mo',
        appreciation: 'Medium',
        liquidity: 'High',
        mgmt: 'Easy'
    },
    {
        id: 'Townhouse',
        label: 'Townhouse',
        icon: '🏘️',
        desc: 'Attached homes',
        avgPrice: '$200-350k',
        cashFlow: '$150-350/mo',
        appreciation: 'Medium-High',
        liquidity: 'High',
        mgmt: 'Easy'
    }
];

const STRATEGIES = [
    {
        id: 'STR',
        label: 'Short-Term Rental',
        icon: '🏖️',
        desc: 'Airbnb, VRBO',
        color: 'cyan',
        roi: 'High',
        effort: 'High',
        timeline: '6-12 mo',
        details: 'Higher income potential but requires active management and market expertise'
    },
    {
        id: 'LTR',
        label: 'Long-Term Rental',
        icon: '🏠',
        desc: 'Traditional leases',
        color: 'emerald',
        roi: 'Medium',
        effort: 'Low',
        timeline: '3-6 mo',
        details: 'Stable, passive income with lower maintenance and predictable cash flow'
    },
    {
        id: 'FLIP',
        label: 'Fix & Flip',
        icon: '🔨',
        desc: 'Renovate & sell',
        color: 'amber',
        roi: 'Very High',
        effort: 'Very High',
        timeline: '3-9 mo',
        details: 'Quick profits but requires construction knowledge and market timing'
    }
] as const;

// Smart Presets
const FINANCIAL_PRESETS = {
    conservative: {
        name: 'Conservative',
        icon: Shield,
        downPayment: '25',
        interestRate: '7.5',
        mgmtFee: '12',
        capex: '8',
        vacancy: '10'
    },
    moderate: {
        name: 'Moderate',
        icon: BarChart3,
        downPayment: '20',
        interestRate: '7.0',
        mgmtFee: '10',
        capex: '5',
        vacancy: '6'
    },
    aggressive: {
        name: 'Aggressive',
        icon: Zap,
        downPayment: '15',
        interestRate: '6.5',
        mgmtFee: '8',
        capex: '3',
        vacancy: '4'
    }
};

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
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

    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [isSaving, setIsSaving] = useState(false);

    // Local State - General
    const [minBudget, setMinBudget] = useState(budgetRange?.min || 200000);
    const [maxBudget, setMaxBudget] = useState(budgetRange?.max || 400000);
    const [selectedBedrooms, setSelectedBedrooms] = useState<number | null>(preferredBedrooms);
    const [newMarket, setNewMarket] = useState('');
    const [showMarketDropdown, setShowMarketDropdown] = useState(false);
    const [filteredCities, setFilteredCities] = useState<string[]>(POPULAR_CITIES);

    // Local State - Financial DNA
    const [downPayment, setDownPayment] = useState<string>('20');
    const [interestRate, setInterestRate] = useState<string>('7.0');
    const [mgmtFee, setMgmtFee] = useState<string>('10');
    const [capex, setCapex] = useState<string>('5');
    const [vacancy, setVacancy] = useState<string>('5');

    // Local State - Investment Goals
    const [minCashFlow, setMinCashFlow] = useState<string>('');
    const [minCoc, setMinCoc] = useState<string>('');
    const [minCapRate, setMinCapRate] = useState<string>('');
    const [maxRehab, setMaxRehab] = useState<string>('');
    const [minTotalReturn, setMinTotalReturn] = useState<string>('');
    const [investmentHorizon, setInvestmentHorizon] = useState<number>(10);
    const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');


    // Initialize from store
    useEffect(() => {
        if (isOpen) {
            setMinBudget(budgetRange?.min || 200000);
            setMaxBudget(budgetRange?.max || 400000);
            setSelectedBedrooms(preferredBedrooms);

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
    }, [isOpen, budgetRange, financialDna, investmentCriteria, preferredBedrooms]);

    // Filter cities
    useEffect(() => {
        if (!newMarket.trim()) {
            setFilteredCities(POPULAR_CITIES);
            return;
        }
        const query = newMarket.toLowerCase();
        const filtered = POPULAR_CITIES.filter(city =>
            city.toLowerCase().includes(query) && !favoriteMarkets.includes(city)
        );
        setFilteredCities(filtered);
    }, [newMarket, favoriteMarkets]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.market-search-container')) {
                setShowMarketDropdown(false);
            }
        };
        if (showMarketDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMarketDropdown]);

    // Helper Functions
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
    };

    const getBudgetRecommendation = () => {
        const range = maxBudget - minBudget;
        if (range < 50000) return { type: 'warning', text: 'Consider widening your budget range for more options' };
        if (range > 500000) return { type: 'info', text: 'Large range may include very different property types' };
        return { type: 'success', text: 'Good range for focused searching' };
    };


    const applyPreset = (preset: keyof typeof FINANCIAL_PRESETS) => {
        const config = FINANCIAL_PRESETS[preset];
        setDownPayment(config.downPayment);
        setInterestRate(config.interestRate);
        setMgmtFee(config.mgmtFee);
        setCapex(config.capex);
        setVacancy(config.vacancy);
    };

    if (!isOpen) return null;

    const handleAddMarket = (city?: string) => {
        const marketToAdd = city || newMarket.trim();
        if (marketToAdd) {
            toggleFavoriteMarket(marketToAdd);
            setNewMarket('');
            setShowMarketDropdown(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            setBudgetRange(minBudget, maxBudget);
            setPreferredBedrooms(selectedBedrooms);

            const newDna = {
                down_payment_pct: parseFloat(downPayment) / 100,
                interest_rate_annual: parseFloat(interestRate) / 100,
                property_management_pct: parseFloat(mgmtFee) / 100,
                capex_reserve_pct: parseFloat(capex) / 100,
                vacancy_rate_pct: parseFloat(vacancy) / 100,
                maintenance_pct: 0.05,
                closing_cost_pct: 0.03,
                loan_term_years: 30
            };
            setFinancialDna(newDna);

            const newCriteria = {
                min_cash_flow: minCashFlow ? parseFloat(minCashFlow) : null,
                min_coc_pct: minCoc ? parseFloat(minCoc) / 100 : null,
                min_cap_rate_pct: minCapRate ? parseFloat(minCapRate) / 100 : null,
                max_rehab_cost: maxRehab ? parseFloat(maxRehab) : null
            };
            setInvestmentCriteria(newCriteria);

            const { savePreferences } = await import('../services/preferencesApi');
            const { recentSearches, showKeyboardHints, theme } = usePreferencesStore.getState();

            await savePreferences({
                user_id: 'default',
                default_strategy: defaultStrategy,
                budget_range: { min: minBudget, max: maxBudget },
                preferred_bedrooms: selectedBedrooms,
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            {/* Modal Container */}
            <div className="relative w-full max-w-5xl bg-background rounded-2xl shadow-2xl border border-black/5 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-6 border-b border-black/5 bg-gradient-to-r from-black/[0.02] to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-black/5 border border-black/8 flex items-center justify-center">
                                <Settings className="w-6 h-6 text-foreground" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-foreground">Investment Preferences</h2>
                                <p className="text-sm text-muted-foreground/70 mt-0.5">Configure your buy box and financial parameters</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-black/5 rounded-xl border border-transparent hover:border-black/8"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-8 pt-6 flex gap-2 border-b border-black/5">
                    {[
                        { id: 'general', label: 'Buy Box', icon: Home },
                        { id: 'financial', label: 'Financial DNA', icon: TrendingUp },
                        { id: 'goals', label: 'Success Criteria', icon: Target }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as Tab)}
                            className={`flex items-center gap-2 px-5 py-3 font-medium rounded-t-xl border-b-2 ${activeTab === id
                                ? 'text-white bg-black/5 border-[#C08B5C]'
                                : 'text-muted-foreground hover:text-foreground/70 hover:bg-black/[0.02] border-transparent'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">

                    {/* GENERAL / BUY BOX TAB */}
                    {activeTab === 'general' && (
                        <div className="max-w-5xl mx-auto space-y-8">

                            {/* Investment Strategy - Minimal */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-cyan-400" />
                                        <h3 className="text-sm font-semibold text-foreground">Investment Strategy</h3>
                                    </div>
                                    {defaultStrategy && (
                                        <span className="text-xs text-muted-foreground/70">{defaultStrategy}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                    {STRATEGIES.map((strategy) => {
                                        const isSelected = defaultStrategy === strategy.id;
                                        return (
                                            <button
                                                key={strategy.id}
                                                onClick={() => setDefaultStrategy(strategy.id as any)}
                                                className={`flex items-center gap-1.5 ${isSelected
                                                        ? 'text-cyan-300 font-medium'
                                                        : 'text-muted-foreground/50 hover:text-muted-foreground'
                                                    }`}
                                            >
                                                <span className="text-base">{strategy.icon}</span>
                                                {strategy.id}
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Budget Range */}
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-emerald-400" />
                                        <h3 className="text-sm font-semibold text-foreground">Investment Budget</h3>
                                    </div>
                                    <div className="text-sm font-mono text-emerald-300">
                                        {formatCurrency(minBudget)} - {formatCurrency(maxBudget)}
                                    </div>
                                </div>

                                {/* Quick Presets - Minimal clickable options */}
                                <div className="flex items-center gap-4 text-xs">
                                    {[
                                        { label: 'Entry Level', min: 150000, max: 250000, icon: '🎯' },
                                        { label: 'Mid-Range', min: 250000, max: 400000, icon: '🏠' },
                                        { label: 'Premium', min: 400000, max: 600000, icon: '💎' },
                                        { label: 'Luxury', min: 600000, max: 1000000, icon: '👑' }
                                    ].map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => {
                                                setMinBudget(preset.min);
                                                setMaxBudget(preset.max);
                                            }}
                                            className={`${minBudget === preset.min && maxBudget === preset.max
                                                ? 'text-emerald-300 font-medium'
                                                : 'text-muted-foreground/50 hover:text-muted-foreground'
                                                }`}
                                        >
                                            {preset.icon} {preset.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Input Fields - Minimal */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground/70 mb-1.5 block">Min</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 text-sm">$</span>
                                            <input
                                                type="number"
                                                value={minBudget}
                                                onChange={(e) => setMinBudget(Number(e.target.value))}
                                                className="w-full bg-transparent border-b border-black/8 py-2 pl-7 pr-2 text-foreground text-sm focus:outline-none focus:border-emerald-500/50"
                                                step="10000"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground/70 mb-1.5 block">Max</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A27F] text-sm">$</span>
                                            <input
                                                type="number"
                                                value={maxBudget}
                                                onChange={(e) => setMaxBudget(Number(e.target.value))}
                                                className="w-full bg-transparent border-b border-black/8 py-2 pl-7 pr-2 text-foreground text-sm focus:outline-none focus:border-[#C08B5C]/50"
                                                step="10000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback text */}
                                {(() => {
                                    const rec = getBudgetRecommendation();
                                    const iconMap = { success: CheckCircle2, warning: AlertCircle, info: Info };
                                    const Icon = iconMap[rec.type as keyof typeof iconMap];
                                    return (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                                            <Icon className="w-3.5 h-3.5" />
                                            <span>{rec.text}</span>
                                        </div>
                                    );
                                })()}
                            </div>


                            {/* Property Preferences - Side by Side */}
                            <div className="grid grid-cols-2 gap-8 pt-2">

                                {/* Bedrooms */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Home className="w-4 h-4 text-violet-400" />
                                            <h4 className="text-sm font-semibold text-foreground/80">Bedrooms</h4>
                                        </div>
                                        {selectedBedrooms && (
                                            <span className="text-xs text-violet-300 font-mono">{selectedBedrooms}BR{selectedBedrooms === 5 ? '+' : ''}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {[
                                            { num: 1, icon: '🛏️' },
                                            { num: 2, icon: '🏠' },
                                            { num: 3, icon: '🏡' },
                                            { num: 4, icon: '🏘️' },
                                            { num: 5, icon: '🏰' }
                                        ].map(({ num, icon }) => {
                                            const isSelected = selectedBedrooms === num;
                                            return (
                                                <button
                                                    key={num}
                                                    onClick={() => setSelectedBedrooms(isSelected ? null : num)}
                                                    className={`flex-1 py-2 text-center ${isSelected
                                                            ? 'text-violet-300 font-medium'
                                                            : 'text-muted-foreground/50 hover:text-muted-foreground'
                                                        }`}
                                                >
                                                    <div className="text-lg">{icon}</div>
                                                    <div className="text-xs mt-0.5">{num}{num === 5 ? '+' : ''}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Property Types */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-sky-400" />
                                        <h4 className="text-sm font-semibold text-foreground/80">Property Types</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {PROPERTY_TYPES.map((type) => {
                                            const isSelected = preferredPropertyTypes.includes(type.id);
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => togglePropertyType(type.id)}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs ${isSelected
                                                            ? 'text-sky-300 font-medium'
                                                            : 'text-muted-foreground/50 hover:text-muted-foreground'
                                                        }`}
                                                >
                                                    <span>{type.icon}</span>
                                                    {type.label}
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Target Markets */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-amber-400" />
                                        <h3 className="text-sm font-semibold text-foreground">Target Markets</h3>
                                    </div>
                                    <span className="text-xs text-muted-foreground/70">{favoriteMarkets.length} selected</span>
                                </div>

                                <div className="market-search-container relative">
                                    <input
                                        type="text"
                                        value={newMarket}
                                        onChange={(e) => setNewMarket(e.target.value)}
                                        onFocus={() => setShowMarketDropdown(true)}
                                        onKeyPress={(e) => e.key === 'Enter' && newMarket.trim() && handleAddMarket()}
                                        placeholder="Search 75+ markets..."
                                        className="w-full bg-transparent border-b border-black/8 py-2 px-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-amber-500/50"
                                    />

                                    {showMarketDropdown && (() => {
                                        const query = newMarket.toLowerCase().trim();
                                        const hasQuery = query.length > 0;

                                        if (hasQuery && filteredCities.length > 0) {
                                            return (
                                                <div className="absolute z-50 w-full mt-2 bg-popover border border-black/8 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                                                    {filteredCities.slice(0, 15).map((city) => (
                                                        <button
                                                            key={city}
                                                            onClick={() => handleAddMarket(city)}
                                                            className="w-full px-3 py-2 text-left text-foreground/70 hover:bg-black/5 hover:text-foreground text-xs border-b border-black/5 last:border-0"
                                                        >
                                                            {city}
                                                        </button>
                                                    ))}
                                                </div>
                                            );
                                        }

                                        if (!hasQuery) {
                                            return (
                                                <div className="absolute z-50 w-full mt-2 bg-popover border border-black/8 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
                                                    {Object.entries(MARKET_CATEGORIES).map(([category, cities]) => (
                                                        <div key={category} className="border-b border-black/5 last:border-0">
                                                            <div className="px-3 py-1.5 bg-black/5 border-b border-black/5">
                                                                <span className="text-xs font-semibold text-muted-foreground">{category}</span>
                                                            </div>
                                                            {cities.filter(city => !favoriteMarkets.includes(city)).map((city) => (
                                                                <button
                                                                    key={city}
                                                                    onClick={() => handleAddMarket(city)}
                                                                    className="w-full px-3 py-2 text-left text-muted-foreground hover:bg-black/5 hover:text-foreground text-xs border-b border-black/5 last:border-0"
                                                                >
                                                                    {city}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                {favoriteMarkets.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {favoriteMarkets.map((market) => (
                                            <div
                                                key={market}
                                                className="flex items-center gap-1.5 text-xs text-amber-300"
                                            >
                                                <span>{market}</span>
                                                <button
                                                    onClick={() => toggleFavoriteMarket(market)}
                                                    className="text-muted-foreground/40 hover:text-red-400"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground/50 pt-2">No markets selected</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* FINANCIAL DNA TAB */}
                    {activeTab === 'financial' && (
                        <div className="max-w-4xl mx-auto space-y-6">

                            {/* Smart Presets - Minimal buttons */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    <h3 className="text-sm font-semibold text-foreground">Financial Profile</h3>
                                </div>

                                <div className="flex items-center gap-4 text-xs">
                                    {Object.entries(FINANCIAL_PRESETS).map(([key, preset]) => {
                                        const Icon = preset.icon;
                                        const isActive = downPayment === preset.downPayment &&
                                            interestRate === preset.interestRate &&
                                            mgmtFee === preset.mgmtFee &&
                                            capex === preset.capex &&
                                            vacancy === preset.vacancy;

                                        return (
                                            <button
                                                key={key}
                                                onClick={() => applyPreset(key as keyof typeof FINANCIAL_PRESETS)}
                                                className={`flex items-center gap-1.5 ${isActive
                                                    ? 'text-indigo-300 font-medium'
                                                    : 'text-muted-foreground/50 hover:text-muted-foreground'
                                                    }`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {preset.name}
                                                {isActive && <Check className="w-3 h-3" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Parameters - Side by side, minimal */}
                            <div className="grid grid-cols-2 gap-8 pt-4">
                                {/* Financing Terms */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-400" />
                                        <h4 className="text-sm font-semibold text-foreground/80">Financing</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-muted-foreground/70 mb-1.5 block">Down Payment %</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={downPayment}
                                                    onChange={(e) => setDownPayment(e.target.value)}
                                                    className="w-full bg-transparent border-b border-black/8 py-2 pr-8 text-foreground text-sm focus:outline-none focus:border-blue-500/50"
                                                    placeholder="20"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 text-xs">%</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-muted-foreground/70 mb-1.5 block">Interest Rate %</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={interestRate}
                                                    onChange={(e) => setInterestRate(e.target.value)}
                                                    className="w-full bg-transparent border-b border-black/8 py-2 pr-8 text-foreground text-sm focus:outline-none focus:border-blue-500/50"
                                                    placeholder="7.0"
                                                    step="0.1"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 text-xs">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Operating Expenses */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-rose-400" />
                                        <h4 className="text-sm font-semibold text-foreground/80">Operating Costs</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-muted-foreground/70 mb-1.5 block">Property Mgmt %</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={mgmtFee}
                                                    onChange={(e) => setMgmtFee(e.target.value)}
                                                    className="w-full bg-transparent border-b border-black/8 py-2 pr-8 text-foreground text-sm focus:outline-none focus:border-rose-500/50"
                                                    placeholder="10"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-400 text-xs">%</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-muted-foreground/70 mb-1.5 block">CapEx %</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={capex}
                                                        onChange={(e) => setCapex(e.target.value)}
                                                        className="w-full bg-transparent border-b border-black/8 py-2 pr-7 text-foreground text-sm focus:outline-none focus:border-rose-500/50"
                                                        placeholder="5"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-400 text-xs">%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground/70 mb-1.5 block">Vacancy %</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={vacancy}
                                                        onChange={(e) => setVacancy(e.target.value)}
                                                        className="w-full bg-transparent border-b border-black/8 py-2 pr-7 text-foreground text-sm focus:outline-none focus:border-rose-500/50"
                                                        placeholder="5"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-400 text-xs">%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* INVESTMENT GOALS TAB */}
                    {activeTab === 'goals' && (
                        <div className="max-w-3xl mx-auto space-y-6">

                            {/* Monthly Cash Flow */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-400" />
                                    <h4 className="text-sm font-semibold text-foreground/80">Monthly Cash Flow</h4>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 text-sm">$</span>
                                    <input
                                        type="number"
                                        placeholder="300"
                                        value={minCashFlow}
                                        onChange={(e) => setMinCashFlow(e.target.value)}
                                        className="w-full bg-transparent border-b border-black/8 py-2 pl-7 pr-2 text-foreground text-sm focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground/50">Typical: $200-500/month</div>
                            </div>

                            {/* Cash-on-Cash Return */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-400" />
                                    <h4 className="text-sm font-semibold text-foreground/80">Cash-on-Cash Return</h4>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="10"
                                        value={minCoc}
                                        onChange={(e) => setMinCoc(e.target.value)}
                                        className="w-full bg-transparent border-b border-black/8 py-2 pr-8 text-foreground text-sm focus:outline-none focus:border-blue-500/50"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 text-xs">%</span>
                                </div>
                                <div className="text-xs text-muted-foreground/50">Typical: 8-12% annually</div>
                            </div>

                            {/* Total Return */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-400" />
                                    <h4 className="text-sm font-semibold text-foreground/80">Total Return</h4>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="15"
                                        value={minTotalReturn}
                                        onChange={(e) => setMinTotalReturn(e.target.value)}
                                        className="w-full bg-transparent border-b border-black/8 py-2 pr-8 text-foreground text-sm focus:outline-none focus:border-purple-500/50"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 text-xs">%</span>
                                </div>
                                <div className="text-xs text-muted-foreground/50">Typical: 12-18% annually</div>
                            </div>

                            {/* Investment Horizon */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-400" />
                                        <h4 className="text-sm font-semibold text-foreground/80">Investment Horizon</h4>
                                    </div>
                                    <span className="text-sm font-mono text-amber-400">{investmentHorizon} years</span>
                                </div>

                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={investmentHorizon}
                                    onChange={(e) => setInvestmentHorizon(Number(e.target.value))}
                                    className="w-full h-1 bg-black/8 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:cursor-pointer"
                                />

                                <div className="flex justify-between text-xs text-muted-foreground/50">
                                    <span>1 yr</span>
                                    <span>15 yrs</span>
                                    <span>30 yrs</span>
                                </div>
                            </div>

                            {/* Risk Tolerance */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-rose-400" />
                                        <h4 className="text-sm font-semibold text-foreground/80">Risk Tolerance</h4>
                                    </div>
                                    <span className="text-sm font-mono text-rose-400 capitalize">{riskTolerance}</span>
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    value={['conservative', 'moderate', 'aggressive'].indexOf(riskTolerance)}
                                    onChange={(e) => {
                                        const levels: Array<'conservative' | 'moderate' | 'aggressive'> = ['conservative', 'moderate', 'aggressive'];
                                        setRiskTolerance(levels[Number(e.target.value)]);
                                    }}
                                    className="w-full h-1 bg-black/8 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400 [&::-webkit-slider-thumb]:cursor-pointer"
                                />

                                <div className="flex justify-between text-xs text-muted-foreground/50">
                                    <span>Conservative</span>
                                    <span>Moderate</span>
                                    <span>Aggressive</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-black/5 bg-black/[0.01] flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-2.5 rounded-lg bg-[#A8734A] hover:bg-[#C08B5C] text-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};
