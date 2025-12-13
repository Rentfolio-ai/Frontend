// FILE: src/components/pages/PropertyAnalysisPage.tsx
/**
 * Property Analysis Page - Unified Component
 * Combines property details viewing with live deal calculator
 * Eliminates redundant "View Details → Analyze" flow
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Home,
    DollarSign,
    Calculator,
    Building2,
    RefreshCw,
    MessageSquare,
    ChevronDown,
    Info,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../primitives/Card';
import { useDealAnalyzer } from '../../hooks/useDealAnalyzer';
import type { ScenarioPreset } from '../../types/pnl';
import { SCENARIO_PRESETS } from '../../types/pnl';
import { AssumptionsPanel } from '../analysis/AssumptionsPanel';
import { ResultsPanel } from '../analysis/ResultsPanel';
import { AIInsightsPanel } from '../analysis/AIInsightsPanel';

interface PropertyAnalysisPageProps {
    property: any; // ScoutedProperty type
    onBack: () => void;
}

export const PropertyAnalysisPage: React.FC<PropertyAnalysisPageProps> = ({ property, onBack }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const [showAIChat, setShowAIChat] = useState(false);
    const [aiQuestion, setAiQuestion] = useState('');

    // Initialize calculator with property data
    const {
        strategy,
        assumptions,
        pnlOutput,
        isLoading,
        error,
        activeScenario,
        aiExplanation,
        isExplaining,
        aiVerdict,
        setStrategy,
        updateAssumption,
        setScenario,
        askAI,
        resetToDefaults,
        isFieldOverridden,
    } = useDealAnalyzer({
        propertyId: property.id || null,
        initialPurchasePrice: property.price || 500000,
        initialStrategy: 'STR',
        autoCalculate: true,
    });

    const images = property.photos || property.images || ['https://images.rentcast.io/s3/photo-placeholder.jpg'];

    // Handle AI question submission
    const handleAskAI = async () => {
        if (!aiQuestion.trim()) return;
        await askAI(aiQuestion);
        setAiQuestion('');
    };

    const quickQuestions = [
        'Is this a good deal?',
        'What are the risks?',
        'How can I improve returns?',
        'Compare STR vs LTR',
    ];

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-white/10 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-teal-500/10" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:drop-shadow-[0_0_6px_rgba(96,165,250,0.5)]" />
                            <span className="text-sm font-medium">Chat</span>
                        </button>
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                            <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Property Analysis</h2>
                            <p className="text-sm text-slate-400 font-medium line-clamp-1">
                                {property.address || property.formattedAddress}
                            </p>
                        </div>
                    </div>

                    {/* Strategy Toggle */}
                    <div className="flex items-center gap-2 p-1 rounded-lg bg-muted/50 border border-border/50">
                        <button
                            onClick={() => setStrategy('STR')}
                            className={cn(
                                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                                strategy === 'STR'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                STR
                            </span>
                        </button>
                        <button
                            onClick={() => setStrategy('LTR')}
                            className={cn(
                                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                                strategy === 'LTR'
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                LTR
                            </span>
                        </button>
                    </div>
                </div>

                {/* Scenario Presets */}
                <div className="flex items-center gap-3 mt-5 relative">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scenario</span>
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
                        {(Object.keys(SCENARIO_PRESETS) as ScenarioPreset[]).map((preset) => (
                            <button
                                key={preset}
                                onClick={() => setScenario(preset)}
                                className={cn(
                                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                                    activeScenario === preset
                                        ? 'bg-indigo-500 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                {SCENARIO_PRESETS[preset].name}
                            </button>
                        ))}
                        {activeScenario === 'custom' && (
                            <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Custom
                            </span>
                        )}
                    </div>
                    <div className="h-4 w-px bg-white/10 mx-1" />
                    <button
                        onClick={resetToDefaults}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Reset to defaults"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex">
                {/* Property Details Sidebar */}
                <motion.div
                    initial={false}
                    animate={{ width: sidebarCollapsed ? 0 : 360 }}
                    className="flex-shrink-0 border-r border-border/50 overflow-hidden bg-slate-50 dark:bg-slate-950"
                >
                    <div className="w-[360px] h-full overflow-y-auto p-6 space-y-6">
                        {/* Photo Gallery */}
                        <div>
                            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden border border-white/10 relative">
                                {images.length > 0 ? (
                                    <img
                                        src={images[imageIndex]}
                                        alt="Property"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-600">
                                        <Home className="w-16 h-16 opacity-20" />
                                    </div>
                                )}
                            </div>
                            {/* Thumbnails */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mt-3">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setImageIndex(idx)}
                                        className={cn(
                                            'w-20 h-14 rounded-lg overflow-hidden border flex-shrink-0',
                                            idx === imageIndex ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-transparent'
                                        )}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Property Stats */}
                        <Card className="p-5 space-y-4">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Property Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{property.bedrooms || property.beds || 0}</div>
                                    <div className="text-xs text-gray-500">Beds</div>
                                </div>
                                <div className="p-3 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{property.bathrooms || property.baths || 0}</div>
                                    <div className="text-xs text-gray-500">Baths</div>
                                </div>
                                <div className="p-3 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{(property.sqft || property.squareFootage || 0).toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">Sqft</div>
                                </div>
                                <div className="p-3 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{property.year_built || property.yearBuilt || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">Year Built</div>
                                </div>
                            </div>
                        </Card>

                        {/* Financial Data */}
                        <Card className="p-5 space-y-4 border-indigo-500/20">
                            <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Financial Data
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">List Price</span>
                                    <span className="text-white font-medium">
                                        ${(property.price || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">Annual Tax</span>
                                    <span className="text-white font-medium">
                                        {property.property_tax_annual || property.taxAnnualAmount
                                            ? `$${(property.property_tax_annual || property.taxAnnualAmount).toLocaleString()}`
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400">Monthly HOA</span>
                                    <span className="text-white font-medium">
                                        {property.hoa_fee || property.hoaFee ? `$${property.hoa_fee || property.hoaFee}` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-indigo-900/20 p-3 rounded text-xs text-indigo-300">
                                These values are auto-populated in the calculator and can be adjusted.
                            </div>
                        </Card>

                        {/* Description */}
                        {property.description && (
                            <Card className="p-5">
                                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {property.description}
                                </p>
                            </Card>
                        )}
                    </div>
                </motion.div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute left-[360px] top-1/2 -translate-y-1/2 z-10 p-1.5 bg-background border border-border rounded-r-lg shadow-lg hover:bg-muted transition-colors"
                    style={{ left: sidebarCollapsed ? 0 : 360 }}
                >
                    {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Calculator Main Area */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Assumptions Panel */}
                    <div className="lg:w-[360px] flex-shrink-0 border-r border-border/50 overflow-y-auto">
                        <AssumptionsPanel
                            strategy={strategy}
                            assumptions={assumptions}
                            onUpdateAssumption={updateAssumption}
                            isFieldOverridden={isFieldOverridden}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Results Panel */}
                    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-950/30">
                        {/* AI Verdict Banner */}
                        {aiVerdict && (
                            <div className="p-6 pb-0">
                                <div
                                    className={cn(
                                        'relative overflow-hidden rounded-2xl border p-5 transition-all duration-500 shadow-xl',
                                        aiVerdict === 'Black'
                                            ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 shadow-emerald-500/5'
                                            : 'bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20 shadow-rose-500/5'
                                    )}
                                >
                                    <div className="flex items-start gap-5 relative z-10">
                                        <div
                                            className={cn(
                                                'flex-shrink-0 p-3 rounded-xl',
                                                aiVerdict === 'Black'
                                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                            )}
                                        >
                                            {aiVerdict === 'Black' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3
                                                    className={cn(
                                                        'text-lg font-bold tracking-tight',
                                                        aiVerdict === 'Black'
                                                            ? 'text-emerald-700 dark:text-emerald-300'
                                                            : 'text-rose-700 dark:text-rose-300'
                                                    )}
                                                >
                                                    {aiVerdict === 'Black' ? 'Excellent Investment Opportunity' : 'High Risk Investment'}
                                                </h3>
                                                <span
                                                    className={cn(
                                                        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border',
                                                        aiVerdict === 'Black'
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                                                    )}
                                                >
                                                    {aiVerdict === 'Black' ? 'Strong Buy' : 'Caution'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/70 leading-relaxed">{aiExplanation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error ? (
                            <div className="p-6">
                                <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger">
                                    <p className="font-medium">Calculation Error</p>
                                    <p className="text-sm mt-1 opacity-80">{error}</p>
                                </div>
                            </div>
                        ) : (
                            <ResultsPanel
                                pnlOutput={pnlOutput}
                                strategy={strategy}
                                isLoading={isLoading}
                                financingSummary={pnlOutput?.financingSummary}
                            />
                        )}

                        {/* AI Insights Panel */}
                        {pnlOutput?.aiInsights && (
                            <div className="p-6 pt-0">
                                <AIInsightsPanel insights={pnlOutput.aiInsights} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Chat Section */}
            <div className="flex-shrink-0 border-t border-border/50 bg-gradient-to-r from-blue-50/30 to-teal-50/30 dark:from-blue-950/20 dark:to-teal-950/20">
                <button
                    onClick={() => setShowAIChat(!showAIChat)}
                    className="w-full px-6 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Ask AI about this deal</span>
                    </div>
                    <ChevronDown className={cn('w-4 h-4 text-foreground/50 transition-transform', showAIChat && 'rotate-180')} />
                </button>

                {showAIChat && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-4 space-y-3">
                            {/* Quick question chips */}
                            <div className="flex flex-wrap gap-2">
                                {quickQuestions.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => askAI(q)}
                                        disabled={isExplaining}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-muted/80 text-foreground/70 hover:text-foreground transition-colors disabled:opacity-50"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>

                            {/* Custom question input */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={aiQuestion}
                                    onChange={(e) => setAiQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                                    placeholder="Ask a question about this investment..."
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                                    disabled={isExplaining}
                                />
                                <button
                                    onClick={handleAskAI}
                                    disabled={!aiQuestion.trim() || isExplaining}
                                    className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isExplaining ? 'Thinking...' : 'Ask'}
                                </button>
                            </div>

                            {/* AI Response */}
                            {aiExplanation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                                            <Info className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{aiExplanation}</div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PropertyAnalysisPage;
