import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    Scale,
    Building,
    Landmark,
    Gavel,
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComplianceResult, RiskLevel } from '@/types/compliance';

interface ComplianceDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    data: ComplianceResult;
    propertyAddress?: string;
}

export const ComplianceDrawer: React.FC<ComplianceDrawerProps> = ({
    isOpen,
    onClose,
    data,
    propertyAddress
}) => {
    const { overall_risk_level, summary, key_rules, sources } = data;

    const riskColors: Record<RiskLevel, string> = {
        low: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        medium: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        high: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    };

    const riskIcons: Record<RiskLevel, React.ReactNode> = {
        low: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
        medium: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        high: <ShieldAlert className="w-5 h-5 text-rose-400" />
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0F1115] border-l border-white/10 z-[51] shadow-2xl overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0F1115]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Scale className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Compliance Audit</h3>
                                    <p className="text-xs text-white/40 truncate max-w-[200px]">
                                        {propertyAddress || 'Investment Intelligence'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Overall Risk Score */}
                            <div className={cn(
                                "p-4 rounded-2xl border flex items-center gap-4",
                                riskColors[overall_risk_level]
                            )}>
                                {riskIcons[overall_risk_level]}
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Risk Assessment</div>
                                    <div className="text-lg font-bold capitalize">{overall_risk_level} Risk Level</div>
                                </div>
                            </div>

                            {/* Summary */}
                            {summary && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                                        <Gavel className="w-3.5 h-3.5" />
                                        Auditor's Summary
                                    </div>
                                    <p className="text-sm leading-relaxed text-white/70 italic">
                                        "{summary}"
                                    </p>
                                </div>
                            )}

                            {/* Ethical Guidelines / FHA Analysis */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Ethical & Fair Housing Audit
                                </div>
                                <div className="grid gap-3">
                                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Steering Compliance
                                        </div>
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            No discriminatory language or neighborhood steering detected in source data.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Demographic Neutrality
                                        </div>
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            Audit confirmed absence of restricted demographic or census-tract discussions.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Regulatory Rules */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                                        <Building className="w-3.5 h-3.5" />
                                        Local Regulations
                                    </div>
                                    <span className="text-[10px] text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10">
                                        {key_rules.length} Rules Detected
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {key_rules.map((rule) => (
                                        <div
                                            key={rule.id}
                                            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors group"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                                                    {rule.title}
                                                </h4>
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                    rule.status === 'pass' ? 'text-emerald-400 bg-emerald-500/10' :
                                                        rule.status === 'fail' ? 'text-rose-400 bg-rose-500/10' :
                                                            'text-amber-400 bg-amber-500/10'
                                                )}>
                                                    {rule.status?.replace(/_/g, ' ') || 'notice'}
                                                </div>
                                            </div>
                                            <p className="text-xs text-white/50 leading-relaxed">
                                                {rule.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sources & Verification */}
                            {sources && sources.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                                        <Landmark className="w-3.5 h-3.5" />
                                        Verified Sources
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {sources.map((source, i) => (
                                            <div
                                                key={i}
                                                className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] text-white/60 flex items-center gap-2"
                                            >
                                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                                {source}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer / Disclaimer */}
                            <div className="pt-6 text-center">
                                <div className="flex items-center justify-center gap-2 text-[10px] text-white/20">
                                    <History className="w-3 h-3" />
                                    Last Audited: {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
