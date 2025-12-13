import React, { useEffect, useState } from 'react';
import { Card } from '../primitives/Card';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface ComplianceInfo {
    location: string;
    has_data: boolean;
    risk_level: 'compliant' | 'restricted' | 'prohibited' | 'unknown';
    risk_score: number;
    license_required?: boolean;
    max_nights?: number;
    occupancy_tax?: number;
    permit_cost?: number;
    restrictions?: string[];
    notes?: string;
}

interface ComplianceAnalysis {
    address: string;
    location: string;
    strategy: string;
    applicable: boolean;
    compliance_info: ComplianceInfo;
    recommendations: string[];
    warnings: string[];
    action_items: string[];
}

interface ComplianceRiskCardProps {
    city: string;
    state: string;
    address?: string;
    strategy?: string;
}

export const ComplianceRiskCard: React.FC<ComplianceRiskCardProps> = ({
    city,
    state,
    address,
    strategy = 'STR'
}) => {
    const [analysis, setAnalysis] = useState<ComplianceAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCompliance();
    }, [city, state, address]);

    const fetchCompliance = async () => {
        setLoading(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';

            if (address) {
                // Full property analysis
                const response = await fetch(
                    `${apiUrl}/api/compliance/analyze?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&strategy=${strategy}`
                );

                if (!response.ok) throw new Error('Failed to fetch compliance data');

                const data = await response.json();
                setAnalysis(data);
            } else {
                // Just city-level compliance info
                const response = await fetch(
                    `${apiUrl}/api/compliance/city/${encodeURIComponent(city)}/${encodeURIComponent(state)}`
                );

                if (!response.ok) throw new Error('Failed to fetch compliance data');

                const complianceInfo = await response.json();
                setAnalysis({
                    address: '',
                    location: `${city}, ${state}`,
                    strategy,
                    applicable: true,
                    compliance_info: complianceInfo,
                    recommendations: [],
                    warnings: [],
                    action_items: []
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'compliant':
                return 'text-green-400 border-green-500/30 bg-green-500/10';
            case 'restricted':
                return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
            case 'prohibited':
                return 'text-red-400 border-red-500/30 bg-red-500/10';
            default:
                return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
        }
    };

    const getRiskIcon = (riskLevel: string) => {
        switch (riskLevel) {
            case 'compliant':
                return <CheckCircle className="w-6 h-6" />;
            case 'restricted':
                return <AlertTriangle className="w-6 h-6" />;
            case 'prohibited':
                return <XCircle className="w-6 h-6" />;
            default:
                return <Info className="w-6 h-6" />;
        }
    };

    const getRiskLabel = (riskLevel: string) => {
        switch (riskLevel) {
            case 'compliant':
                return 'Compliant';
            case 'restricted':
                return 'Restricted';
            case 'prohibited':
                return 'Prohibited';
            default:
                return 'Unknown';
        }
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
            </Card>
        );
    }

    if (error || !analysis) {
        return (
            <Card className="p-6 border-gray-700">
                <div className="flex items-center gap-3 text-gray-400">
                    <Info className="w-5 h-5" />
                    <span>Compliance data not available for this market</span>
                </div>
            </Card>
        );
    }

    const { compliance_info, recommendations, warnings, action_items } = analysis;

    return (
        <Card className={`p-6 border-2 ${getRiskColor(compliance_info.risk_level)}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={getRiskColor(compliance_info.risk_level)}>
                        {getRiskIcon(compliance_info.risk_level)}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            STR Compliance: {getRiskLabel(compliance_info.risk_level)}
                        </h3>
                        <p className="text-sm text-gray-400">{compliance_info.location}</p>
                    </div>
                </div>

                {compliance_info.has_data && (
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{compliance_info.risk_score}</div>
                        <div className="text-xs text-gray-400">Risk Score</div>
                    </div>
                )}
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    {warnings.map((warning, idx) => (
                        <div key={idx} className="text-sm text-yellow-300">{warning}</div>
                    ))}
                </div>
            )}

            {/* Key Facts */}
            {compliance_info.has_data && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-xs text-gray-400">License Required</div>
                        <div className="text-sm font-medium text-white">
                            {compliance_info.license_required ? 'Yes' : 'No'}
                        </div>
                    </div>

                    {compliance_info.permit_cost !== undefined && compliance_info.permit_cost > 0 && (
                        <div className="p-3 bg-gray-800/50 rounded-lg">
                            <div className="text-xs text-gray-400">Permit Cost</div>
                            <div className="text-sm font-medium text-white">
                                ${compliance_info.permit_cost}
                            </div>
                        </div>
                    )}

                    {compliance_info.max_nights && compliance_info.max_nights < 365 && (
                        <div className="p-3 bg-gray-800/50 rounded-lg">
                            <div className="text-xs text-gray-400">Max Nights/Year</div>
                            <div className="text-sm font-medium text-white">
                                {compliance_info.max_nights} days
                            </div>
                        </div>
                    )}

                    {compliance_info.occupancy_tax && (
                        <div className="p-3 bg-gray-800/50 rounded-lg">
                            <div className="text-xs text-gray-400">Occupancy Tax</div>
                            <div className="text-sm font-medium text-white">
                                {compliance_info.occupancy_tax}%
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Restrictions */}
            {compliance_info.restrictions && compliance_info.restrictions.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Restrictions</h4>
                    <ul className="space-y-1">
                        {compliance_info.restrictions.map((restriction, idx) => (
                            <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                                <span className="text-yellow-400 mt-1">•</span>
                                <span>{restriction}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                        {recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-indigo-400 mt-1">→</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action Items */}
            {action_items.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Action Items</h4>
                    <ul className="space-y-1">
                        {action_items.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                                <input type="checkbox" className="mt-1" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Notes */}
            {compliance_info.notes && (
                <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Additional Notes</div>
                    <div className="text-sm text-gray-300">{compliance_info.notes}</div>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                    This information is for educational purposes only. Regulations change frequently.
                    Consult a local attorney before making investment decisions.
                </p>
            </div>
        </Card>
    );
};
