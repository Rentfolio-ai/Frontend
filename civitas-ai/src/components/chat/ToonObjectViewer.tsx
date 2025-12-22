import React from 'react';
import { cn } from '../../lib/utils';
import {
    TrendingUp,
    MapPin,
    DollarSign,
    ShieldCheck,
    AlertCircle,
    Building2,
    PieChart,
    HardHat
} from 'lucide-react';

interface ToonObjectViewerProps {
    data: Record<string, any>;
    className?: string;
}

export const ToonObjectViewer: React.FC<ToonObjectViewerProps> = ({ data, className }) => {
    if (!data || Object.keys(data).length === 0) return null;

    // Helper to render value based on type/key
    const renderValue = (key: string, value: any) => {
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (typeof value === 'number') {
            if (key.toLowerCase().includes('price') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('cost')) {
                return `$${value.toLocaleString()}`;
            }
            if (key.toLowerCase().includes('roi') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('percent')) {
                return `${value}%`;
            }
            return value.toLocaleString();
        }
        if (Array.isArray(value)) {
            return (
                <ul className="list-disc pl-4 mt-1">
                    {value.map((item, i) => (
                        <li key={i} className="text-white/70">{String(item)}</li>
                    ))}
                </ul>
            );
        }
        if (typeof value === 'object' && value !== null) {
            return <ToonObjectViewer data={value} className="mt-2 border-l border-white/10 pl-3" />;
        }
        return String(value);
    };

    // Helper to get icon for key
    const getIcon = (key: string) => {
        const k = key.toLowerCase();
        if (k.includes('price') || k.includes('revenue') || k.includes('cost') || k.includes('cash')) return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
        if (k.includes('roi') || k.includes('rate') || k.includes('yield') || k.includes('return')) return <TrendingUp className="w-3.5 h-3.5 text-blue-400" />;
        if (k.includes('address') || k.includes('location') || k.includes('zone')) return <MapPin className="w-3.5 h-3.5 text-orange-400" />;
        if (k.includes('compliance') || k.includes('rule') || k.includes('legal')) return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
        if (k.includes('risk') || k.includes('issue') || k.includes('alert')) return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
        if (k.includes('property') || k.includes('building') || k.includes('unit')) return <Building2 className="w-3.5 h-3.5 text-cyan-400" />;
        if (k.includes('refurb') || k.includes('renovate') || k.includes('repair')) return <HardHat className="w-3.5 h-3.5 text-yellow-400" />;
        return <PieChart className="w-3.5 h-3.5 text-white/40" />;
    };

    return (
        <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 gap-3 my-4",
            className
        )}>
            {Object.entries(data).map(([key, value]) => (
                <div
                    key={key}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-1"
                >
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                        {getIcon(key)}
                        {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm font-medium text-white/90">
                        {renderValue(key, value)}
                    </div>
                </div>
            ))}
        </div>
    );
};
