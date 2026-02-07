// FILE: src/components/hunter/NeighborhoodTrajectoryCard.tsx
import React from 'react';
import { TrendingUp, MapPin, Users, Eye } from 'lucide-react';
import { ToolResultCard, type ActionButton } from './ToolResultCard';

interface Signal {
    category: string;
    signal: string;
    strength: 'Strong' | 'Moderate' | 'Weak';
    impact: string;
}

interface NeighborhoodTrajectoryData {
    address: string;
    trajectory: 'Early Gentrification' | 'Improving' | 'Stable' | 'Plateau' | 'Decline';
    investment_grade: 'A' | 'B' | 'C' | 'D';
    confidence_score: number;
    summary: string;
    signals: Signal[];
    investment_recommendation: string;
    key_indicators?: {
        price_growth_1yr?: number;
        new_businesses?: number;
        building_permits?: number;
        demographic_shift?: string;
    };
}

interface NeighborhoodTrajectoryCardProps {
    data: NeighborhoodTrajectoryData;
    onAction?: (query: string) => void;
}

const trajectoryConfig = {
    'Early Gentrification': {
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        icon: '🚀',
        description: 'High growth potential',
    },
    'Improving': {
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        icon: '📈',
        description: 'Positive momentum',
    },
    'Stable': {
        color: 'from-gray-500 to-slate-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        icon: '➡️',
        description: 'Consistent performance',
    },
    'Plateau': {
        color: 'from-yellow-500 to-amber-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        icon: '📊',
        description: 'Limited upside',
    },
    'Decline': {
        color: 'from-red-500 to-rose-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        icon: '📉',
        description: 'Weakening market',
    },
};

const gradeConfig = {
    'A': { color: 'bg-green-600 text-white', label: 'Excellent' },
    'B': { color: 'bg-blue-600 text-white', label: 'Good' },
    'C': { color: 'bg-yellow-600 text-white', label: 'Fair' },
    'D': { color: 'bg-red-600 text-white', label: 'Poor' },
};

const strengthColors = {
    'Strong': 'bg-green-100 text-green-800 border-green-200',
    'Moderate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Weak': 'bg-gray-100 text-gray-800 border-gray-200',
};

export const NeighborhoodTrajectoryCard: React.FC<NeighborhoodTrajectoryCardProps> = ({
    data,
    onAction
}) => {
    const config = trajectoryConfig[data.trajectory];
    const gradeStyle = gradeConfig[data.investment_grade];

    const actions: ActionButton[] = [
        {
            id: 'predict_appreciation',
            label: 'Predict 5-year appreciation',
            icon: <TrendingUp className="w-4 h-4" />,
            variant: 'primary',
            context: { address: data.address },
        },
        {
            id: 'find_similar_neighborhoods',
            label: 'Find similar up-and-coming areas',
            icon: <MapPin className="w-4 h-4" />,
            variant: 'secondary',
            context: {
                trajectory: data.trajectory,
                address: data.address,
            },
        },
        {
            id: 'analyze_rental_demand',
            label: 'Check rental demand',
            icon: <Users className="w-4 h-4" />,
            variant: 'outline',
            context: { address: data.address },
        },
        {
            id: 'view_signals',
            label: 'View all signals',
            icon: <Eye className="w-4 h-4" />,
            variant: 'outline',
            context: { signals: data.signals },
        },
    ];

    const handleAction = (actionId: string, context?: any) => {
        switch (actionId) {
            case 'predict_appreciation':
                onAction?.(`Predict appreciation for ${context.address} over the next 5 years`);
                break;
            case 'find_similar_neighborhoods':
                onAction?.(`Find neighborhoods with ${context.trajectory} signals in the same metro area`);
                break;
            case 'analyze_rental_demand':
                onAction?.(`Analyze rental demand depth for ${context.address}`);
                break;
            case 'view_signals':
                // Expand signals (handled by state)
                break;
        }
    };

    return (
        <ToolResultCard
            title={`${config.icon} Neighborhood Trajectory Analysis`}
            icon={<TrendingUp className="w-6 h-6" />}
            status={data.trajectory === 'Early Gentrification' || data.trajectory === 'Improving' ? 'success' :
                data.trajectory === 'Decline' ? 'danger' : 'info'}
            summary={data.summary}
            actions={actions}
            onAction={handleAction}
        >
            <div className="space-y-4">
                {/* Trajectory & Grade Header */}
                <div className="flex items-center gap-3">
                    <div className={`flex-1 ${config.bgColor} ${config.borderColor} border-2 rounded-lg p-3`}>
                        <div className="text-xs font-medium text-gray-600 mb-1">Trajectory</div>
                        <div className={`text-lg font-bold ${config.textColor}`}>
                            {data.trajectory}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{config.description}</div>
                    </div>

                    <div className={`${gradeStyle.color} rounded-lg p-3 text-center min-w-[80px]`}>
                        <div className="text-xs font-medium opacity-80 mb-1">Grade</div>
                        <div className="text-3xl font-bold">{data.investment_grade}</div>
                        <div className="text-xs opacity-80">{gradeStyle.label}</div>
                    </div>
                </div>

                {/* Confidence Score */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                        <span className="text-sm font-bold text-gray-900">
                            {(data.confidence_score * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${config.color} transition-all duration-500`}
                            style={{ width: `${data.confidence_score * 100}%` }}
                        />
                    </div>
                </div>

                {/* Key Indicators */}
                {data.key_indicators && (
                    <div className="grid grid-cols-2 gap-2">
                        {data.key_indicators.price_growth_1yr !== undefined && (
                            <div className="bg-white border border-gray-200 rounded p-2">
                                <div className="text-xs text-gray-600">1-Year Price Growth</div>
                                <div className={`text-lg font-bold ${data.key_indicators.price_growth_1yr > 5 ? 'text-green-600' :
                                        data.key_indicators.price_growth_1yr > 0 ? 'text-blue-600' :
                                            'text-red-600'
                                    }`}>
                                    {data.key_indicators.price_growth_1yr > 0 ? '+' : ''}
                                    {data.key_indicators.price_growth_1yr.toFixed(1)}%
                                </div>
                            </div>
                        )}

                        {data.key_indicators.new_businesses !== undefined && (
                            <div className="bg-white border border-gray-200 rounded p-2">
                                <div className="text-xs text-gray-600">New Businesses</div>
                                <div className="text-lg font-bold text-blue-600">
                                    {data.key_indicators.new_businesses}
                                </div>
                            </div>
                        )}

                        {data.key_indicators.building_permits !== undefined && (
                            <div className="bg-white border border-gray-200 rounded p-2">
                                <div className="text-xs text-gray-600">Building Permits</div>
                                <div className="text-lg font-bold text-purple-600">
                                    {data.key_indicators.building_permits}
                                </div>
                            </div>
                        )}

                        {data.key_indicators.demographic_shift && (
                            <div className="bg-white border border-gray-200 rounded p-2">
                                <div className="text-xs text-gray-600">Demographics</div>
                                <div className="text-sm font-medium text-gray-900">
                                    {data.key_indicators.demographic_shift}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Signals */}
                <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">
                        Gentrification Signals ({data.signals.length})
                    </h4>
                    <div className="space-y-2">
                        {data.signals.slice(0, 5).map((signal, idx) => (
                            <div
                                key={idx}
                                className={`p-2 rounded border text-sm ${strengthColors[signal.strength]}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="font-medium">{signal.category}</div>
                                        <div className="mt-0.5">{signal.signal}</div>
                                        {signal.impact && (
                                            <div className="text-xs opacity-75 mt-1">
                                                Impact: {signal.impact}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-white/50 rounded">
                                        {signal.strength}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Investment Recommendation */}
                <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-3`}>
                    <div className="flex items-start gap-2">
                        <TrendingUp className={`w-5 h-5 ${config.textColor} mt-0.5`} />
                        <div>
                            <div className="font-semibold text-gray-900 text-sm">Investment Recommendation</div>
                            <div className="text-sm text-gray-700 mt-1">
                                {data.investment_recommendation}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ToolResultCard>
    );
};
