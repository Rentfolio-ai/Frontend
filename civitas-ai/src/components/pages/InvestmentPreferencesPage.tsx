/**
 * Investment Preferences Page - Full Static Page
 * Comprehensive investment preferences management
 */

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Home, DollarSign, TrendingUp, Target, 
    Building2, MapPin, Plus, X, Info, Save, Check
} from 'lucide-react';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { cn } from '../../lib/utils';

interface InvestmentPreferencesPageProps {
    onBack: () => void;
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

const PROPERTY_TYPES = ['Single Family', 'Multi-Family', 'Condo', 'Townhouse', 'Land'];

export const InvestmentPreferencesPage: React.FC<InvestmentPreferencesPageProps> = ({ onBack }) => {
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

    // Form state
    const [strategy, setStrategy] = useState<'STR' | 'LTR' | 'FLIP' | null>(defaultStrategy);
    const [minBudget, setMinBudget] = useState(budgetRange?.min?.toString() || '200000');
    const [maxBudget, setMaxBudget] = useState(budgetRange?.max?.toString() || '400000');
    const [markets, setMarkets] = useState<string[]>(favoriteMarkets);
    const [propertyTypes, setPropertyTypes] = useState<string[]>(preferredPropertyTypes);
    const [bedrooms, setBedrooms] = useState<string>(preferredBedrooms?.toString() || 'any');

    // Financial DNA
    const [downPayment, setDownPayment] = useState(financialDna?.down_payment_pct ? (financialDna.down_payment_pct * 100).toString() : '20');
    const [interestRate, setInterestRate] = useState(financialDna?.interest_rate_annual ? (financialDna.interest_rate_annual * 100).toString() : '7.0');
    const [loanTerm, setLoanTerm] = useState(financialDna?.loan_term_years?.toString() || '30');
    const [mgmtFee, setMgmtFee] = useState(financialDna?.property_management_pct ? (financialDna.property_management_pct * 100).toString() : '10');
    const [maintenance, setMaintenance] = useState(financialDna?.maintenance_pct ? (financialDna.maintenance_pct * 100).toString() : '1');
    const [capex, setCapex] = useState(financialDna?.capex_reserve_pct ? (financialDna.capex_reserve_pct * 100).toString() : '1');
    const [vacancy, setVacancy] = useState(financialDna?.vacancy_rate_pct ? (financialDna.vacancy_rate_pct * 100).toString() : '5');
    const [closingCost, setClosingCost] = useState(financialDna?.closing_cost_pct ? (financialDna.closing_cost_pct * 100).toString() : '3');

    // Investment Criteria
    const [minCashFlow, setMinCashFlow] = useState(investmentCriteria?.min_cash_flow?.toString() || '200');
    const [minCoC, setMinCoC] = useState(investmentCriteria?.min_coc_pct ? (investmentCriteria.min_coc_pct * 100).toString() : '8');
    const [minCapRate, setMinCapRate] = useState(investmentCriteria?.min_cap_rate_pct ? (investmentCriteria.min_cap_rate_pct * 100).toString() : '6');
    const [maxRehab, setMaxRehab] = useState(investmentCriteria?.max_rehab_cost?.toString() || '50000');

    // Market search
    const [marketSearch, setMarketSearch] = useState('');
    const [showMarketDropdown, setShowMarketDropdown] = useState(false);
    const [filteredMarkets, setFilteredMarkets] = useState<string[]>(POPULAR_MARKETS);

    // Saving state
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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
        setIsSaving(true);

        // Save to store
        if (strategy) setDefaultStrategy(strategy);
        
        const min = parseInt(minBudget.replace(/,/g, ''));
        const max = parseInt(maxBudget.replace(/,/g, ''));
        setBudgetRange(min, max);

        setPreferredBedrooms(bedrooms === 'any' ? null : parseInt(bedrooms));

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

        // Save financial DNA
        setFinancialDna({
            down_payment_pct: parseFloat(downPayment) / 100,
            interest_rate_annual: parseFloat(interestRate) / 100,
            loan_term_years: parseInt(loanTerm),
            property_management_pct: parseFloat(mgmtFee) / 100,
            maintenance_pct: parseFloat(maintenance) / 100,
            capex_reserve_pct: parseFloat(capex) / 100,
            vacancy_rate_pct: parseFloat(vacancy) / 100,
            closing_cost_pct: parseFloat(closingCost) / 100
        });

        // Save investment criteria
        setInvestmentCriteria({
            min_cash_flow: parseInt(minCashFlow),
            min_coc_pct: parseFloat(minCoC) / 100,
            min_cap_rate_pct: parseFloat(minCapRate) / 100,
            max_rehab_cost: parseInt(maxRehab)
        });

        // Show success
        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        }, 500);
    };

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#334155' }}>
            {/* Header */}
            <div
                className="flex items-center gap-4 px-6 py-4 border-b"
                style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}
            >
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: '#E2E8F0',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>
                        Investment Preferences
                    </h1>
                    <p className="text-sm" style={{ color: '#94A3B8' }}>
                        Set your buy box, strategy, and investment criteria
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                    style={{
                        backgroundColor: showSuccess ? '#10B981' : '#14B8A6',
                        color: '#FFFFFF',
                    }}
                    onMouseEnter={(e) => {
                        if (!showSuccess) e.currentTarget.style.backgroundColor = '#0D9488';
                    }}
                    onMouseLeave={(e) => {
                        if (!showSuccess) e.currentTarget.style.backgroundColor = '#14B8A6';
                    }}
                >
                    {isSaving ? (
                        <>Saving...</>
                    ) : showSuccess ? (
                        <>
                            <Check className="w-4 h-4" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    
                    {/* Investment Strategy */}
                    <Section
                        icon={TrendingUp}
                        title="Investment Strategy"
                        description="Choose your primary investment strategy"
                    >
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'STR', label: 'Short-Term Rental', desc: 'Airbnb, VRBO' },
                                { value: 'LTR', label: 'Long-Term Rental', desc: 'Traditional lease' },
                                { value: 'FLIP', label: 'Fix & Flip', desc: 'Buy, renovate, sell' }
                            ].map((strat) => (
                                <button
                                    key={strat.value}
                                    onClick={() => setStrategy(strat.value as any)}
                                    className="p-4 rounded-xl text-left transition-all"
                                    style={{
                                        backgroundColor: strategy === strat.value
                                            ? 'rgba(20, 184, 166, 0.1)'
                                            : 'rgba(255, 255, 255, 0.03)',
                                        border: strategy === strat.value
                                            ? '2px solid #14B8A6'
                                            : '1px solid rgba(148, 163, 184, 0.12)',
                                    }}
                                >
                                    <div className="text-base font-semibold text-white/90 mb-1">
                                        {strat.label}
                                    </div>
                                    <div className="text-sm text-white/60">{strat.desc}</div>
                                </button>
                            ))}
                        </div>
                    </Section>

                    {/* Budget Range */}
                    <Section
                        icon={DollarSign}
                        title="Budget Range"
                        description="Your target property price range"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Minimum
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
                                    <input
                                        type="text"
                                        value={formatCurrency(minBudget)}
                                        onChange={(e) => setMinBudget(e.target.value.replace(/,/g, ''))}
                                        className="w-full pl-7 pr-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.12] text-white/90 focus:outline-none focus:border-teal-400/30"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Maximum
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
                                    <input
                                        type="text"
                                        value={formatCurrency(maxBudget)}
                                        onChange={(e) => setMaxBudget(e.target.value.replace(/,/g, ''))}
                                        className="w-full pl-7 pr-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.12] text-white/90 focus:outline-none focus:border-teal-400/30"
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Property Criteria */}
                    <Section
                        icon={Home}
                        title="Property Criteria"
                        description="Bedroom count and property types"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Bedrooms
                                </label>
                                <div className="grid grid-cols-6 gap-2">
                                    {['any', '1', '2', '3', '4', '5+'].map((bed) => (
                                        <button
                                            key={bed}
                                            onClick={() => setBedrooms(bed)}
                                            className="p-3 rounded-lg text-sm font-medium transition-all"
                                            style={{
                                                backgroundColor: bedrooms === bed
                                                    ? 'rgba(20, 184, 166, 0.1)'
                                                    : 'rgba(255, 255, 255, 0.03)',
                                                border: bedrooms === bed
                                                    ? '2px solid #14B8A6'
                                                    : '1px solid rgba(148, 163, 184, 0.12)',
                                                color: bedrooms === bed ? '#14B8A6' : '#94A3B8'
                                            }}
                                        >
                                            {bed}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Property Types
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PROPERTY_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => togglePropertyTypeLocal(type)}
                                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                            style={{
                                                backgroundColor: propertyTypes.includes(type)
                                                    ? 'rgba(20, 184, 166, 0.1)'
                                                    : 'rgba(255, 255, 255, 0.03)',
                                                border: propertyTypes.includes(type)
                                                    ? '2px solid #14B8A6'
                                                    : '1px solid rgba(148, 163, 184, 0.12)',
                                                color: propertyTypes.includes(type) ? '#14B8A6' : '#94A3B8'
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Favorite Markets */}
                    <Section
                        icon={MapPin}
                        title="Favorite Markets"
                        description="Cities you're interested in (up to 10)"
                    >
                        <div className="space-y-3">
                            {/* Market input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={marketSearch}
                                    onChange={(e) => {
                                        setMarketSearch(e.target.value);
                                        setShowMarketDropdown(true);
                                    }}
                                    onFocus={() => setShowMarketDropdown(true)}
                                    placeholder="Search cities..."
                                    className="w-full px-4 py-3 pr-10 rounded-lg bg-white/[0.03] border border-white/[0.12] text-white/90 placeholder-white/40 focus:outline-none focus:border-teal-400/30"
                                    disabled={markets.length >= 10}
                                />
                                <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />

                                {/* Dropdown */}
                                {showMarketDropdown && marketSearch && filteredMarkets.length > 0 && (
                                    <div className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto bg-[#1f1f1f] border border-white/10 rounded-lg shadow-2xl z-10">
                                        {filteredMarkets.slice(0, 10).map((market) => (
                                            <button
                                                key={market}
                                                onClick={() => handleAddMarket(market)}
                                                className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 transition-colors"
                                            >
                                                {market}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected markets */}
                            {markets.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {markets.map((market) => (
                                        <div
                                            key={market}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30"
                                        >
                                            <span className="text-sm text-teal-400">{market}</span>
                                            <button
                                                onClick={() => handleRemoveMarket(market)}
                                                className="p-0.5 hover:bg-teal-500/20 rounded transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5 text-teal-400" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* Financial Assumptions */}
                    <Section
                        icon={Building2}
                        title="Financial Assumptions"
                        description="Default underwriting parameters"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Down Payment %"
                                value={downPayment}
                                onChange={setDownPayment}
                                suffix="%"
                            />
                            <InputField
                                label="Interest Rate %"
                                value={interestRate}
                                onChange={setInterestRate}
                                suffix="%"
                            />
                            <InputField
                                label="Loan Term (years)"
                                value={loanTerm}
                                onChange={setLoanTerm}
                            />
                            <InputField
                                label="Property Mgmt %"
                                value={mgmtFee}
                                onChange={setMgmtFee}
                                suffix="%"
                            />
                            <InputField
                                label="Maintenance %"
                                value={maintenance}
                                onChange={setMaintenance}
                                suffix="%"
                            />
                            <InputField
                                label="CapEx Reserve %"
                                value={capex}
                                onChange={setCapex}
                                suffix="%"
                            />
                            <InputField
                                label="Vacancy Rate %"
                                value={vacancy}
                                onChange={setVacancy}
                                suffix="%"
                            />
                            <InputField
                                label="Closing Costs %"
                                value={closingCost}
                                onChange={setClosingCost}
                                suffix="%"
                            />
                        </div>
                    </Section>

                    {/* Investment Goals */}
                    <Section
                        icon={Target}
                        title="Investment Goals"
                        description="Minimum acceptable returns and criteria"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Min Monthly Cash Flow"
                                value={minCashFlow}
                                onChange={setMinCashFlow}
                                prefix="$"
                            />
                            <InputField
                                label="Min Cash-on-Cash Return %"
                                value={minCoC}
                                onChange={setMinCoC}
                                suffix="%"
                            />
                            <InputField
                                label="Min Cap Rate %"
                                value={minCapRate}
                                onChange={setMinCapRate}
                                suffix="%"
                            />
                            <InputField
                                label="Max Rehab Budget"
                                value={maxRehab}
                                onChange={setMaxRehab}
                                prefix="$"
                            />
                        </div>
                    </Section>

                </div>
            </div>
        </div>
    );
};

// Section Component
const Section: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ icon: Icon, title, description, children }) => (
    <div
        className="p-6 rounded-xl"
        style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
        }}
    >
        <div className="flex items-start gap-3 mb-4">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                }}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-white/90 mb-1">{title}</h3>
                <p className="text-sm text-white/60">{description}</p>
            </div>
        </div>
        {children}
    </div>
);

// Input Field Component
const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    prefix?: string;
    suffix?: string;
}> = ({ label, value, onChange, prefix, suffix }) => (
    <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
            {label}
        </label>
        <div className="relative">
            {prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                    {prefix}
                </span>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "w-full py-3 rounded-lg bg-white/[0.03] border border-white/[0.12] text-white/90 focus:outline-none focus:border-teal-400/30",
                    prefix ? "pl-7 pr-4" : suffix ? "pl-4 pr-10" : "px-4"
                )}
            />
            {suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                    {suffix}
                </span>
            )}
        </div>
    </div>
);
