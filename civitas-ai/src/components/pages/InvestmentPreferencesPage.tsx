/**
 * Investment Preferences Page — Redesigned
 * Professional fintech-grade investment criteria management.
 */

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Home, DollarSign, TrendingUp, Target,
    Building2, MapPin, Plus, X, Save, Check, Loader2,
    ChevronDown
} from 'lucide-react';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { cn } from '../../lib/utils';

interface InvestmentPreferencesPageProps {
    onBack: () => void;
}

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

/* ── Reusable Components ── */

const Section: React.FC<{
    icon: React.ElementType;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}> = ({ icon: Icon, title, subtitle, children }) => (
    <div className="rounded bg-[#161618] border border-white/[0.08] p-6">
        <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-white/50" />
            </div>
            <div>
                <h3 className="text-sm font-medium font-sans text-white/90">{title}</h3>
                <p className="text-xs font-sans text-white/40">{subtitle}</p>
            </div>
        </div>
        {children}
    </div>
);

const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    prefix?: string;
    suffix?: string;
}> = ({ label, value, onChange, prefix, suffix }) => (
    <div>
        <label className="block text-xs font-medium font-sans text-white/40 mb-1.5">{label}</label>
        <div className="relative group">
            {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-sans text-white/30">{prefix}</span>}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    'w-full py-2.5 rounded bg-[#0C0C0E] border border-white/[0.1] text-sm font-sans text-white focus:outline-none focus:border-[#C08B5C]/50 transition-colors placeholder-white/20',
                    prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-8' : 'px-3'
                )}
            />
            {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans text-white/30">{suffix}</span>}
        </div>
    </div>
);

const Chip: React.FC<{
    label: string;
    selected: boolean;
    onClick: () => void;
}> = ({ label, selected, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            'px-3 py-1.5 rounded text-xs font-medium transition-all border',
            selected
                ? 'bg-[#C08B5C] border-[#C08B5C] text-[#0C0C0E] shadow-sm'
                : 'bg-[#0C0C0E] border-white/[0.1] text-white/50 hover:border-white/[0.2] hover:text-white/80'
        )}
    >
        {label}
    </button>
);

/* ── Main Component ── */

export const InvestmentPreferencesPage: React.FC<InvestmentPreferencesPageProps> = ({ onBack }) => {
    const {
        defaultStrategy, budgetRange, preferredBedrooms, preferredPropertyTypes,
        financialDna, investmentCriteria, favoriteMarkets,
        setDefaultStrategy, setBudgetRange, setPreferredBedrooms, setFinancialDna,
        setInvestmentCriteria, toggleFavoriteMarket, togglePropertyType
    } = usePreferencesStore();

    const [strategy, setStrategy] = useState<'STR' | 'LTR' | 'FLIP' | null>(defaultStrategy);
    const [minBudget, setMinBudget] = useState(budgetRange?.min?.toString() || '200000');
    const [maxBudget, setMaxBudget] = useState(budgetRange?.max?.toString() || '400000');
    const [markets, setMarkets] = useState<string[]>(favoriteMarkets);
    const [propertyTypes, setPropertyTypes] = useState<string[]>(preferredPropertyTypes);
    const [bedrooms, setBedrooms] = useState<string>(preferredBedrooms?.toString() || 'any');

    const [downPayment, setDownPayment] = useState(financialDna?.down_payment_pct ? (financialDna.down_payment_pct * 100).toString() : '20');
    const [interestRate, setInterestRate] = useState(financialDna?.interest_rate_annual ? (financialDna.interest_rate_annual * 100).toString() : '7.0');
    const [loanTerm, setLoanTerm] = useState(financialDna?.loan_term_years?.toString() || '30');
    const [mgmtFee, setMgmtFee] = useState(financialDna?.property_management_pct ? (financialDna.property_management_pct * 100).toString() : '10');
    const [maintenance, setMaintenance] = useState(financialDna?.maintenance_pct ? (financialDna.maintenance_pct * 100).toString() : '1');
    const [capex, setCapex] = useState(financialDna?.capex_reserve_pct ? (financialDna.capex_reserve_pct * 100).toString() : '1');
    const [vacancy, setVacancy] = useState(financialDna?.vacancy_rate_pct ? (financialDna.vacancy_rate_pct * 100).toString() : '5');
    const [closingCost, setClosingCost] = useState(financialDna?.closing_cost_pct ? (financialDna.closing_cost_pct * 100).toString() : '3');

    const [minCashFlow, setMinCashFlow] = useState(investmentCriteria?.min_cash_flow?.toString() || '200');
    const [minCoC, setMinCoC] = useState(investmentCriteria?.min_coc_pct ? (investmentCriteria.min_coc_pct * 100).toString() : '8');
    const [minCapRate, setMinCapRate] = useState(investmentCriteria?.min_cap_rate_pct ? (investmentCriteria.min_cap_rate_pct * 100).toString() : '6');
    const [maxRehab, setMaxRehab] = useState(investmentCriteria?.max_rehab_cost?.toString() || '50000');

    const [marketSearch, setMarketSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredMarkets, setFilteredMarkets] = useState<string[]>(POPULAR_MARKETS);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const q = marketSearch.toLowerCase();
        setFilteredMarkets(
            POPULAR_MARKETS.filter(m => (!q || m.toLowerCase().includes(q)) && !markets.includes(m))
        );
    }, [marketSearch, markets]);

    const fmtCurrency = (v: string) => { const n = parseInt(v.replace(/,/g, '')); return isNaN(n) ? '' : n.toLocaleString(); };

    const handleSave = async () => {
        setIsSaving(true);
        if (strategy) setDefaultStrategy(strategy);
        setBudgetRange(parseInt(minBudget.replace(/,/g, '')), parseInt(maxBudget.replace(/,/g, '')));
        setPreferredBedrooms(bedrooms === 'any' ? null : parseInt(bedrooms));

        const curMarkets = favoriteMarkets;
        markets.forEach(m => { if (!curMarkets.includes(m)) toggleFavoriteMarket(m); });
        curMarkets.forEach(m => { if (!markets.includes(m)) toggleFavoriteMarket(m); });

        const curTypes = preferredPropertyTypes;
        propertyTypes.forEach(t => { if (!curTypes.includes(t)) togglePropertyType(t); });
        curTypes.forEach(t => { if (!propertyTypes.includes(t)) togglePropertyType(t); });

        const financialDnaPayload = {
            down_payment_pct: parseFloat(downPayment) / 100, interest_rate_annual: parseFloat(interestRate) / 100,
            loan_term_years: parseInt(loanTerm), property_management_pct: parseFloat(mgmtFee) / 100,
            maintenance_pct: parseFloat(maintenance) / 100, capex_reserve_pct: parseFloat(capex) / 100,
            vacancy_rate_pct: parseFloat(vacancy) / 100, closing_cost_pct: parseFloat(closingCost) / 100,
        };
        setFinancialDna(financialDnaPayload);

        const investmentGoalsPayload = {
            min_cash_flow: parseInt(minCashFlow), min_coc_pct: parseFloat(minCoC) / 100,
            min_cap_rate_pct: parseFloat(minCapRate) / 100, max_rehab_cost: parseInt(maxRehab),
        };
        setInvestmentCriteria(investmentGoalsPayload);

        // Sync to backend Redis + PostgreSQL for agent use
        try {
            const apiBase = import.meta.env.VITE_DATALAYER_API_URL || 'http://localhost:8001';
            const apiKey = import.meta.env.VITE_API_KEY;
            const userId = usePreferencesStore.getState().user_id;
            await fetch(`${apiBase}/api/investment-criteria/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': userId || 'default',
                    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
                },
                body: JSON.stringify({
                    strategy: strategy,
                    budget_min: parseInt(minBudget.replace(/,/g, '')) || undefined,
                    budget_max: parseInt(maxBudget.replace(/,/g, '')) || undefined,
                    favorite_markets: markets,
                    preferred_bedrooms: bedrooms === 'any' ? null : parseInt(bedrooms),
                    preferred_property_types: propertyTypes,
                    financial_dna: financialDnaPayload,
                    investment_goals: investmentGoalsPayload,
                }),
            });
        } catch (err) {
            console.error('[InvestmentPreferences] Criteria sync failed (non-blocking):', err);
        }

        setTimeout(() => { setIsSaving(false); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000); }, 500);
    };

    return (
        <div className="h-full flex flex-col bg-[#0C0C0E]">
            {/* Header */}
            <header className="flex items-center gap-4 px-8 py-6 border-b border-white/[0.08] bg-[#0C0C0E]/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-8 h-8 rounded bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] flex items-center justify-center transition-all group -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-display font-semibold text-white tracking-tight">Investment Preferences</h1>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded text-xs font-semibold transition-all flex items-center gap-2 ${showSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-[#C08B5C] text-[#0C0C0E] hover:bg-[#D4A27F] shadow-lg shadow-[#C08B5C]/20'
                        }`}
                >
                    {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : showSuccess ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Criteria</span>
                        </>
                    )}
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">

                    {/* Strategy Selection */}
                    <Section icon={TrendingUp} title="Investment Strategy" subtitle="Select your primary investment approach">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { v: 'STR', l: 'Short-Term Rental', d: 'Airbnb / VRBO' },
                                { v: 'LTR', l: 'Long-Term Rental', d: 'Traditional Lease' },
                                { v: 'FLIP', l: 'Fix & Flip', d: 'Renovate & Resell' },
                            ].map(s => (
                                <button
                                    key={s.v}
                                    onClick={() => setStrategy(s.v as 'STR' | 'LTR' | 'FLIP')}
                                    className={cn(
                                        'p-4 rounded text-left border transition-all duration-200 relative overflow-hidden group',
                                        strategy === s.v
                                            ? 'bg-[#C08B5C] border-[#C08B5C] shadow-lg shadow-[#C08B5C]/10'
                                            : 'bg-[#0C0C0E] border-white/[0.1] hover:border-white/[0.2]'
                                    )}
                                >
                                    <div className={cn("text-xs font-bold mb-1 font-display tracking-wide uppercase", strategy === s.v ? "text-[#0C0C0E]" : "text-white/80")}>
                                        {s.l}
                                    </div>
                                    <div className={cn("text-[10px] font-sans", strategy === s.v ? "text-[#0C0C0E]/70" : "text-white/40")}>
                                        {s.d}
                                    </div>
                                    {strategy === s.v && (
                                        <div className="absolute top-2 right-2">
                                            <Check className="w-3 h-3 text-[#0C0C0E]" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </Section>

                    {/* Budget & Markets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Budget */}
                        <Section icon={DollarSign} title="Budget Range" subtitle="Target acquisition price">
                            <div className="space-y-4">
                                <InputField label="Minimum Price" value={fmtCurrency(minBudget)} onChange={(v) => setMinBudget(v.replace(/,/g, ''))} prefix="$" />
                                <InputField label="Maximum Price" value={fmtCurrency(maxBudget)} onChange={(v) => setMaxBudget(v.replace(/,/g, ''))} prefix="$" />
                            </div>
                        </Section>

                        {/* Markets */}
                        <Section icon={MapPin} title="Target Markets" subtitle={`${markets.length}/10 selected`}>
                            <div className="space-y-3">
                                <div className="relative group">
                                    <input
                                        type="text" value={marketSearch}
                                        onChange={(e) => { setMarketSearch(e.target.value); setShowDropdown(true); }}
                                        onFocus={() => setShowDropdown(true)}
                                        placeholder="Add a city..."
                                        disabled={markets.length >= 10}
                                        className="w-full px-3 py-2.5 pr-8 rounded bg-[#0C0C0E] border border-white/[0.1] text-sm font-sans text-white placeholder-white/20 focus:outline-none focus:border-[#C08B5C]/50 transition-colors"
                                    />
                                    <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />

                                    {showDropdown && marketSearch && filteredMarkets.length > 0 && (
                                        <div className="absolute top-full mt-1 w-full max-h-48 overflow-y-auto bg-[#1e1e24] border border-white/[0.1] rounded shadow-2xl z-20">
                                            {filteredMarkets.slice(0, 8).map(m => (
                                                <button key={m} onClick={() => { setMarkets([...markets, m]); setMarketSearch(''); setShowDropdown(false); }}
                                                    className="w-full px-4 py-2.5 text-left text-xs font-sans text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors border-b border-white/[0.02] last:border-0">
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {markets.map(m => (
                                        <div key={m} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded bg-white/[0.05] border border-white/[0.05] group hover:border-white/[0.1] transition-colors">
                                            <span className="text-[11px] font-sans text-white/70">{m}</span>
                                            <button onClick={() => setMarkets(markets.filter(x => x !== m))} className="p-0.5 hover:bg-white/[0.1] rounded transition-colors text-white/30 hover:text-white/50">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {markets.length === 0 && (
                                        <span className="text-[11px] font-sans text-white/30 italic px-1">No markets selected</span>
                                    )}
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Property Criteria */}
                    <Section icon={Home} title="Property Criteria" subtitle="Physical characteristics">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-medium font-sans text-white/40 mb-2">Bedroom Count</label>
                                <div className="flex flex-wrap gap-2">
                                    {['any', '1', '2', '3', '4', '5+'].map(b => (
                                        <Chip key={b} label={b === 'any' ? 'Any' : `${b}+ Beds`} selected={bedrooms === b} onClick={() => setBedrooms(b)} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium font-sans text-white/40 mb-2">Property Types</label>
                                <div className="flex flex-wrap gap-2">
                                    {PROPERTY_TYPES.map(t => (
                                        <Chip key={t} label={t} selected={propertyTypes.includes(t)}
                                            onClick={() => setPropertyTypes(propertyTypes.includes(t) ? propertyTypes.filter(x => x !== t) : [...propertyTypes, t])} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Financial DNA */}
                    <Section icon={Building2} title="Financial DNA" subtitle="Underwriting assumptions for analysis">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <InputField label="Down Payment" value={downPayment} onChange={setDownPayment} suffix="%" />
                            <InputField label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
                            <InputField label="Loan Term" value={loanTerm} onChange={setLoanTerm} suffix="yrs" />
                            <InputField label="Closing Costs" value={closingCost} onChange={setClosingCost} suffix="%" />
                            <InputField label="Management Fee" value={mgmtFee} onChange={setMgmtFee} suffix="%" />
                            <InputField label="Maintenance" value={maintenance} onChange={setMaintenance} suffix="%" />
                            <InputField label="CapEx Reserve" value={capex} onChange={setCapex} suffix="%" />
                            <InputField label="Vacancy Rate" value={vacancy} onChange={setVacancy} suffix="%" />
                        </div>
                    </Section>

                    {/* Investment Goals */}
                    <Section icon={Target} title="Investment Goals" subtitle="Minimum return requirements">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <InputField label="Min Cash Flow" value={minCashFlow} onChange={setMinCashFlow} prefix="$" />
                            <InputField label="Min Cash-on-Cash" value={minCoC} onChange={setMinCoC} suffix="%" />
                            <InputField label="Min Cap Rate" value={minCapRate} onChange={setMinCapRate} suffix="%" />
                            <InputField label="Max Rehab Budget" value={maxRehab} onChange={setMaxRehab} prefix="$" />
                        </div>
                    </Section>

                    {/* Bottom Spacer */}
                    <div className="h-4" />
                </div>
            </div>
        </div>
    );
};
