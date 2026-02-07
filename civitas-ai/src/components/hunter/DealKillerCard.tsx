// FILE: src/components/hunter/DealKillerCard.tsx
import React from 'react';
import { Shield, Search, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';
import { ToolResultCard, type ActionButton } from './ToolResultCard';

interface Finding {
    category: string;
    severity: 'critical' | 'caution' | 'info';
    finding: string;
    impact: string;
}

interface DealKillerData {
    address: string;
    risk_level: 'GO' | 'CAUTION' | 'STOP';
    summary: string;
    critical_issues: string[];
    caution_issues: string[];
    findings: Finding[];
    recommendation: string;
}

interface DealKillerCardProps {
    data: DealKillerData;
    onAction?: (query: string) => void;
}

const riskLevelConfig = {
    GO: {
        status: 'success' as const,
        icon: '🟢',
        title: 'GO - No Major Issues',
    },
    CAUTION: {
        status: 'warning' as const,
        icon: '🟡',
        title: 'CAUTION - Issues Require Investigation',
    },
    STOP: {
        status: 'danger' as const,
        icon: '🔴',
        title: 'STOP - Critical Deal Killers Found',
    },
};

const severityStyles = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    caution: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const DealKillerCard: React.FC<DealKillerCardProps> = ({ data, onAction }) => {
    const config = riskLevelConfig[data.risk_level];

    // Generate contextual actions based on risk level
    const actions: ActionButton[] = [];

    if (data.risk_level === 'CAUTION' || data.risk_level === 'STOP') {
        // Has issues - offer mitigation actions
        if (data.critical_issues.some(issue => issue.toLowerCase().includes('flood'))) {
            actions.push({
                id: 'get_insurance_quotes',
                label: 'Get flood insurance quotes',
                icon: <Shield className="w-4 h-4" />,
                variant: 'primary',
                context: { address: data.address, issue_type: 'flood' },
            });
        }

        actions.push({
            id: 'check_alternatives',
            label: 'Find similar properties without issues',
            icon: <Search className="w-4 h-4" />,
            variant: 'secondary',
            context: { address: data.address, avoid_issues: [...data.critical_issues, ...data.caution_issues] },
        });

        if (data.risk_level === 'CAUTION') {
            actions.push({
                id: 'analyze_risk',
                label: 'Deep dive on risks',
                icon: <AlertTriangle className="w-4 h-4" />,
                variant: 'outline',
                context: { address: data.address, findings: data.findings },
            });

            actions.push({
                id: 'continue_analysis',
                label: 'Continue with this property',
                icon: <ArrowRight className="w-4 h-4" />,
                variant: 'outline',
                context: { address: data.address },
            });
        }
    } else {
        // No issues - offer next steps
        actions.push({
            id: 'analyze_financials',
            label: 'Analyze financials',
            icon: <DollarSign className="w-4 h-4" />,
            variant: 'primary',
            context: { address: data.address },
        });

        actions.push({
            id: 'check_comps',
            label: 'Find comps with intel',
            icon: <Search className="w-4 h-4" />,
            variant: 'secondary',
            context: { address: data.address },
        });

        actions.push({
            id: 'check_neighborhood',
            label: 'Analyze neighborhood',
            icon: <ArrowRight className="w-4 h-4" />,
            variant: 'outline',
            context: { address: data.address },
        });
    }

    const handleAction = (actionId: string, context?: any) => {
        switch (actionId) {
            case 'get_insurance_quotes':
                onAction?.(`Find flood insurance quotes for ${context.address}`);
                break;
            case 'check_alternatives':
                onAction?.(`Find properties in the same area without flood risk or major issues`);
                break;
            case 'analyze_risk':
                onAction?.(`Analyze the risks in detail for ${context.address}`);
                break;
            case 'continue_analysis':
                onAction?.(`Analyze financials for ${context.address}`);
                break;
            case 'analyze_financials':
                onAction?.(`Analyze the deal for ${context.address}`);
                break;
            case 'check_comps':
                onAction?.(`Find comps with negotiation intel for ${context.address}`);
                break;
            case 'check_neighborhood':
                onAction?.(`Analyze neighborhood trajectory for ${context.address}`);
                break;
        }
    };

    return (
        <ToolResultCard
            title={`${config.icon} ${config.title}`}
            icon={<AlertTriangle className="w-6 h-6" />}
            status={config.status}
            summary={data.summary}
            actions={actions}
            onAction={handleAction}
        >
            <div className="space-y-3">
                {/* Critical Issues */}
                {data.critical_issues.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-red-800 text-sm mb-2">
                            🚨 Critical Issues ({data.critical_issues.length})
                        </h4>
                        <ul className="space-y-1">
                            {data.critical_issues.map((issue, idx) => (
                                <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span>{issue}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Caution Issues */}
                {data.caution_issues.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-yellow-800 text-sm mb-2">
                            ⚠️ Caution Issues ({data.caution_issues.length})
                        </h4>
                        <ul className="space-y-1">
                            {data.caution_issues.map((issue, idx) => (
                                <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                                    <span className="text-yellow-500 mt-0.5">•</span>
                                    <span>{issue}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Detailed Findings */}
                {data.findings.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-2">
                            Detailed Findings
                        </h4>
                        <div className="space-y-2">
                            {data.findings.map((finding, idx) => (
                                <div
                                    key={idx}
                                    className={`p-2 rounded border text-sm ${severityStyles[finding.severity]}`}
                                >
                                    <div className="font-medium">{finding.category}</div>
                                    <div className="mt-1">{finding.finding}</div>
                                    {finding.impact && (
                                        <div className="mt-1 text-xs opacity-80">
                                            Impact: {finding.impact}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendation */}
                <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-700 font-medium">
                        {data.recommendation}
                    </p>
                </div>
            </div>
        </ToolResultCard>
    );
};
