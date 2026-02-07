/**
 * Investment Preferences Page — Redesigned
 * Compact, organized investment criteria management
 */

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Home, DollarSign, TrendingUp, Target,
    Building2, MapPin, Plus, X, Save, Check, Loader2
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
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
        <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-md bg-[#C08B5C]/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#D4A27F]" />
            </div>
            <div>
                <h3 className="text-[13px] font-semibold text-white/85">{title}</h3>
                <p className="text-[10px] text-white/35">{subtitle}</p>
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
        <label className="block text-[11px] font-medium text-white/40 mb-1.5">{label}</label>
        <div className="relative">
            {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-white/35">{prefix}</span>}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    'w-full py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] text-white/80 focus:outline-none focus:border-[#C08B5C]/30 transition-colors',
                    prefix ? 'pl-6 pr-3' : suffix ? 'pl-3 pr-8' : 'px-3'
                )}
            />
            {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-white/35">{suffix}</span>}
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
            'px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all',
            selected
                ? 'bg-[#C08B5C]/10 border-[#C08B5C]/25 text-[#D4A27F]'
                : 'bg-white/[0.03] border-white/[0.06] text-white/45 hover:bg-white/[0.05]'
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

    const handleSave = () => {
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

        setFinancialDna({
            down_payment_pct: parseFloat(downPayment) / 100, interest_rate_annual: parseFloat(interestRate) / 100,
            loan_term_years: parseInt(loanTerm), property_management_pct: parseFloat(mgmtFee) / 100,
            maintenance_pct: parseFloat(maintenance) / 100, capex_reserve_pct: parseFloat(capex) / 100,
            vacancy_rate_pct: parseFloat(vacancy) / 100, closing_cost_pct: parseFloat(closingCost) / 100,
        });

        setInvestmentCriteria({
            min_cash_flow: parseInt(minCashFlow), min_coc_pct: parseFloat(minCoC) / 100,
            min_cap_rate_pct: parseFloat(minCapRate) / 100, max_rehab_cost: parseInt(maxRehab),
        });

        setTimeout(() => { setIsSaving(false); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000); }, 500);
    };

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: '#111114' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.08]">
                <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors">
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-white/90">Investment Preferences</h1>
                    <p className="text-[11px] text-white/35">Buy box, strategy, and criteria</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                        showSuccess
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'bg-[#C08B5C] text-white hover:bg-[#A8734A]'
                    }`}
                >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> :
                     showSuccess ? <><Check className="w-3 h-3" /> Saved</> :
                     <><Save className="w-3 h-3" /> Save</>}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="max-w-3xl mx-auto space-y-4">
                    {/* Strategy */}
                    <Section icon={TrendingUp} title="Investment Strategy" subtitle="Primary approach">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { v: 'STR', l: 'Short-Term Rental', d: 'Airbnb, VRBO' },
                                { v: 'LTR', l: 'Long-Term Rental', d: 'Traditional lease' },
                                { v: 'FLIP', l: 'Fix & Flip', d: 'Buy, renovate, sell' },
                            ].map(s => (
                                <button
                                    key={s.v}
                                    onClick={() => setStrategy(s.v as 'STR' | 'LTR' | 'FLIP')}
                                    className={cn(
                                        'p-3 rounded-lg text-left border-2 transition-all',
                                        strategy === s.v
                                            ? 'border-[#C08B5C] bg-[#C08B5C]/10'
                                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                                    )}
                                >
                                    <div className={`text-[12px] font-semibold mb-0.5 ${strategy === s.v ? 'text-[#D4A27F]' : 'text-white/70'}`}>{s.l}</div>
                                    <div className="text-[10px] text-white/35">{s.d}</div>
                                </button>
                            ))}
                        </div>
                    </Section>

                    {/* Budget */}
                    <Section icon={DollarSign} title="Budget Range" subtitle="Target price range">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Minimum</label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-white/35">$</span>
                                    <input type="text" value={fmtCurrency(minBudget)} onChange={(e) => setMinBudget(e.target.value.replace(/,/g, ''))}
                                        className="w-full pl-6 pr-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] text-white/80 focus:outline-none focus:border-[#C08B5C]/30" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Maximum</label>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-white/35">$</span>
                                    <input type="text" value={fmtCurrency(maxBudget)} onChange={(e) => setMaxBudget(e.target.value.replace(/,/g, ''))}
                                        className="w-full pl-6 pr-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[13px] text-white/80 focus:outline-none focus:border-[#C08B5C]/30" />
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Property Criteria */}
                    <Section icon={Home} title="Property Criteria" subtitle="Type and bedroom count">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Bedrooms</label>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {['any', '1', '2', '3', '4', '5+'].map(b => (
                                        <Chip key={b} label={b} selected={bedrooms === b} onClick={() => setBedrooms(b)} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Property Types</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {PROPERTY_TYPES.map(t => (
                                        <Chip key={t} label={t} selected={propertyTypes.includes(t)}
                                            onClick={() => setPropertyTypes(propertyTypes.includes(t) ? propertyTypes.filter(x => x !== t) : [...propertyTypes, t])} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Markets */}
                    <Section icon={MapPin} title="Favorite Markets" subtitle={`${markets.length}/10 cities`}>
                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    type="text" value={marketSearch}
                                    onChange={(e) => { setMarketSearch(e.target.value); setShowDropdown(true); }}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder="Search cities..."
                                    disabled={markets.length >= 10}
                                    className="w-full px-3 py-2 pr-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[12px] text-white/80 placeholder-white/25 focus:outline-none focus:border-[#C08B5C]/30"
                                />
                                <Plus className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                                {showDropdown && marketSearch && filteredMarkets.length > 0 && (
                                    <div className="absolute top-full mt-1 w-full max-h-44 overflow-y-auto bg-[#1e1e24] border border-white/[0.08] rounded-lg shadow-2xl z-10">
                                        {filteredMarkets.slice(0, 8).map(m => (
                                            <button key={m} onClick={() => { setMarkets([...markets, m]); setMarketSearch(''); setShowDropdown(false); }}
                                                className="w-full px-3 py-2 text-left text-[12px] text-white/65 hover:bg-white/[0.05] transition-colors">
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {markets.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {markets.map(m => (
                                        <div key={m} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C08B5C]/10 border border-[#C08B5C]/20">
                                            <span className="text-[11px] text-[#D4A27F]">{m}</span>
                                            <button onClick={() => setMarkets(markets.filter(x => x !== m))} className="p-0.5 hover:bg-[#C08B5C]/15 rounded transition-colors">
                                                <X className="w-3 h-3 text-[#D4A27F]" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* Financial Assumptions */}
                    <Section icon={Building2} title="Financial Assumptions" subtitle="Default underwriting parameters">
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Down Payment" value={downPayment} onChange={setDownPayment} suffix="%" />
                            <InputField label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
                            <InputField label="Loan Term" value={loanTerm} onChange={setLoanTerm} suffix="yrs" />
                            <InputField label="Property Mgmt" value={mgmtFee} onChange={setMgmtFee} suffix="%" />
                            <InputField label="Maintenance" value={maintenance} onChange={setMaintenance} suffix="%" />
                            <InputField label="CapEx Reserve" value={capex} onChange={setCapex} suffix="%" />
                            <InputField label="Vacancy Rate" value={vacancy} onChange={setVacancy} suffix="%" />
                            <InputField label="Closing Costs" value={closingCost} onChange={setClosingCost} suffix="%" />
                        </div>
                    </Section>

                    {/* Investment Goals */}
                    <Section icon={Target} title="Investment Goals" subtitle="Minimum acceptable returns">
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Min Monthly Cash Flow" value={minCashFlow} onChange={setMinCashFlow} prefix="$" />
                            <InputField label="Min Cash-on-Cash" value={minCoC} onChange={setMinCoC} suffix="%" />
                            <InputField label="Min Cap Rate" value={minCapRate} onChange={setMinCapRate} suffix="%" />
                            <InputField label="Max Rehab Budget" value={maxRehab} onChange={setMaxRehab} prefix="$" />
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
};
