// FILE: src/components/hunter/ToolResultCard.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ActionButton {
    id: string;
    label: string;
    icon?: React.ReactNode;
    variant: 'primary' | 'secondary' | 'outline';
    context?: any;
}

interface ToolResultCardProps {
    title: string;
    icon: React.ReactNode;
    status?: 'success' | 'warning' | 'danger' | 'info';
    summary: string;
    children: React.ReactNode;
    actions?: ActionButton[];
    onAction?: (actionId: string, context?: any) => void;
    collapsible?: boolean;
    defaultExpanded?: boolean;
}

const statusStyles = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
};

const statusIconStyles = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
};

export const ToolResultCard: React.FC<ToolResultCardProps> = ({
    title,
    icon,
    status = 'info',
    summary,
    children,
    actions = [],
    onAction,
    collapsible = true,
    defaultExpanded = true,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className={cn(
            'rounded-lg border-2 overflow-hidden transition-all duration-200',
            statusStyles[status]
        )}>
            {/* Header */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        <div className={cn('mt-0.5', statusIconStyles[status])}>
                            {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-lg">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {summary}
                            </p>
                        </div>
                    </div>
                    {collapsible && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-black/50 rounded transition-colors"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Children content */}
                    <div className="bg-black/50 rounded-lg p-3">
                        {children}
                    </div>

                    {/* Action Buttons */}
                    {actions.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                                What would you like to do?
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {actions.map((action) => (
                                    <ActionButtonComponent
                                        key={action.id}
                                        action={action}
                                        onClick={() => onAction?.(action.id, action.context)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface ActionButtonComponentProps {
    action: ActionButton;
    onClick: () => void;
}

const ActionButtonComponent: React.FC<ActionButtonComponentProps> = ({
    action,
    onClick,
}) => {
    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200',
        outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 font-medium text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]',
                variantStyles[action.variant]
            )}
        >
            {action.icon && <span className="w-4 h-4">{action.icon}</span>}
            <span className="text-left flex-1">{action.label}</span>
        </button>
    );
};
