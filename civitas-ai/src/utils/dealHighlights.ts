import type { ScoutedProperty } from '../types/backendTools';
import { TrendingUp, Banknote, Percent, Award } from 'lucide-react';

export interface DealHighlight {
    id: string;
    label: string;
    icon: any; // Lucide icon component
    type: 'financial' | 'market' | 'value';
    color: string; // Tailwind color class for text/border
    bgColor: string; // Tailwind color class for background
}

import type { InvestmentCriteria } from '../stores/preferencesStore';
import { Target } from 'lucide-react';

export const getWinningHighlights = (property: ScoutedProperty, criteria?: InvestmentCriteria | null): DealHighlight[] => {
    const highlights: DealHighlight[] = [];
    const { price, financial_snapshot, cash_on_cash_roi, value_grade } = property;

    if (!price) return highlights;

    const monthlyRent = financial_snapshot?.estimated_rent || 0;
    const cashFlow = financial_snapshot?.estimated_monthly_cash_flow || 0;
    const grossYield = (monthlyRent * 12) / price;
    const coc = cash_on_cash_roi ? cash_on_cash_roi / 100 : grossYield; // approx if missing

    // --- 0. Criteria Check (Target Hit) ---
    if (criteria) {
        let meetsAll = true;
        let hasCriteria = false;

        if (criteria.min_cash_flow != null) {
            hasCriteria = true;
            if (cashFlow < criteria.min_cash_flow) meetsAll = false;
        }
        if (criteria.min_coc_pct != null) {
            hasCriteria = true;
            // criteria.min_coc_pct is decimal (0.10 for 10%), coc is decimal
            if (coc < criteria.min_coc_pct) meetsAll = false;
        }
        if (criteria.min_cap_rate_pct != null) {
            hasCriteria = true;
            // approx cap rate as gross yield for now if not explicitly calculated on property
            // or use grossYield as a proxy if cap_rate missing
            if (grossYield < criteria.min_cap_rate_pct) meetsAll = false;
        }
        if (criteria.max_rehab_cost != null) {
            hasCriteria = true;
            // We don't have rehab cost in ScoutedProperty yet usually, skip for now or assume 0
        }

        if (hasCriteria && meetsAll) {
            highlights.push({
                id: 'target-hit',
                label: 'Target Hit 🎯',
                icon: Target,
                type: 'value',
                color: 'text-white',
                bgColor: 'bg-gradient-to-r from-blue-600 to-purple-600 border border-white/20 shadow-lg shadow-purple-500/20'
            });
        }
    }

    // 1. Cash Flow King (> $500/mo) - Only if not redundant with Target Hit?
    // Let's keep distinct badges but limit total count.
    if (cashFlow > 500) {
        highlights.push({
            id: 'cash-flow',
            label: 'Cash Flow King',
            icon: Banknote,
            type: 'financial',
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/20'
        });
    }

    // 2. 1% Rule (Rent >= 1% of Price)
    const rentToPrice = monthlyRent / price;
    if (rentToPrice >= 0.01) {
        highlights.push({
            id: '1-percent',
            label: '1% Rule',
            icon: Percent,
            type: 'financial',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20'
        });
    }

    // 3. High Yield (> 8% Gross Yield or CoC)
    if (coc > 0.08) {
        highlights.push({
            id: 'high-yield',
            label: 'High Yield',
            icon: TrendingUp,
            type: 'financial',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/20'
        });
    }

    // 4. Value Grade A
    if (value_grade === 'A') {
        highlights.push({
            id: 'top-rated',
            label: 'Top Rated',
            icon: Award,
            type: 'value',
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/20'
        });
    }

    // Limit to top 2 highlights (Target Hit always wins + 1 other)
    return highlights.slice(0, 2);
};
