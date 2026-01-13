import React from 'react';
import { FileText, BarChart3, TrendingUp, Download, Eye } from 'lucide-react';

interface ReportCardProps {
    id: string;
    title: string;
    type: 'monthly' | 'tax' | 'market' | 'property' | 'goal';
    date: string;
    stats: {
        label: string;
        value: string;
    }[];
    onView?: (id: string) => void;
    onDownload?: (id: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
    id,
    title,
    type,
    date,
    stats,
    onView,
    onDownload
}) => {
    const getIcon = () => {
        switch (type) {
            case 'monthly':
                return <BarChart3 className="w-8 h-8" />;
            case 'tax':
                return <FileText className="w-8 h-8" />;
            case 'market':
                return <TrendingUp className="w-8 h-8" />;
            default:
                return <FileText className="w-8 h-8" />;
        }
    };

    return (
        <div
            className="p-5 rounded-lg transition-all duration-200"
            style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-default)',
                fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-emphasis)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Icon */}
            <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-accent-teal-400)'
                }}
            >
                {getIcon()}
            </div>

            {/* Title & Date */}
            <div className="mb-4">
                <h3
                    className="text-lg font-medium mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {title}
                </h3>
                <p
                    className="text-sm"
                    style={{ color: 'var(--color-text-tertiary)' }}
                >
                    {date}
                </p>
            </div>

            {/* Stats Preview */}
            {stats.length > 0 && (
                <div
                    className="grid grid-cols-2 gap-3 mb-4 pb-4"
                    style={{ borderBottom: '1px solid var(--color-border-default)' }}
                >
                    {stats.slice(0, 2).map((stat, index) => (
                        <div key={index}>
                            <div
                                className="text-xs uppercase tracking-wider mb-1"
                                style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}
                            >
                                {stat.label}
                            </div>
                            <div
                                className="text-base font-medium"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onView?.(id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors"
                    style={{
                        background: 'var(--color-accent-teal-500)',
                        border: '1px solid var(--color-accent-teal-500)',
                        color: 'var(--color-bg-primary)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-accent-teal-400)';
                        e.currentTarget.style.borderColor = 'var(--color-accent-teal-400)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-accent-teal-500)';
                        e.currentTarget.style.borderColor = 'var(--color-accent-teal-500)';
                    }}
                >
                    <Eye className="w-4 h-4" />
                    View Report
                </button>

                <button
                    onClick={() => onDownload?.(id)}
                    className="px-3 py-2 rounded transition-colors"
                    style={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-default)',
                        color: 'var(--color-text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-primary)';
                        e.currentTarget.style.borderColor = 'var(--color-border-emphasis)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-elevated)';
                        e.currentTarget.style.borderColor = 'var(--color-border-default)';
                    }}
                    title="Download PDF"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
