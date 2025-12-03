/**
 * Quick Actions Component
 * 
 * Displays quick action buttons for common queries
 */

import React, { useEffect, useState } from 'react';
import { Home, TrendingUp, CheckCircle, DollarSign } from 'lucide-react';

interface QuickAction {
    label: string;
    query: string;
    placeholder: string;
}

interface QuickActionsProps {
    onSelectAction: (query: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
    '🏠': <Home className="w-5 h-5" />,
    '📊': <TrendingUp className="w-5 h-5" />,
    '✅': <CheckCircle className="w-5 h-5" />,
    '💰': <DollarSign className="w-5 h-5" />,
};

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectAction }) => {
    const [actions, setActions] = useState<QuickAction[]>([]);

    useEffect(() => {
        const fetchActions = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/onboarding/quick-actions`);
                const data = await res.json();
                setActions(data.actions);
            } catch (error) {
                console.error('Failed to load quick actions:', error);
            }
        };

        fetchActions();
    }, []);

    if (actions.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {actions.map((action, index) => {
                const emoji = action.label.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || '🏠';
                const icon = iconMap[emoji] || <Home className="w-5 h-5" />;
                const label = action.label.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();

                return (
                    <button
                        key={index}
                        onClick={() => onSelectAction(action.query)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-blue-600"
                    >
                        {icon}
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    );
};
