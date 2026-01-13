// FILE: src/components/chat/AppLauncherMessage.tsx
import React from 'react';
import { useBridge } from '../../contexts/BridgeContext';
import { ArrowRight, Box, Calculator, LineChart, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface AppLauncherMessageProps {
    appId: string;
    appName: string;
    context: Record<string, any>;
    reason?: string;
}

export const AppLauncherMessage: React.FC<AppLauncherMessageProps> = ({
    appId,
    appName,
    context,
    reason
}) => {
    const { openApp } = useBridge();

    const handleLaunch = () => {
        openApp(appId, context);
    };

    // Helper to get icon based on app ID
    const getAppIcon = (id: string) => {
        switch (id) {
            case 'deal_analyzer_pro': return <Calculator className="w-5 h-5" />;
            case 'portfolio_manager': return <LineChart className="w-5 h-5" />;
            case 'doc_vault': return <FileText className="w-5 h-5" />;
            default: return <Box className="w-5 h-5" />;
        }
    };

    // Helper to get color based on app ID
    const getAppColor = (id: string) => {
        switch (id) {
            case 'deal_analyzer_pro': return 'from-blue-500 to-indigo-600';
            case 'portfolio_manager': return 'from-emerald-500 to-teal-600';
            default: return 'from-violet-500 to-purple-600';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[85%] mb-4"
        >
            <div className="bg-gradient-to-br from-surface-elevated to-surface border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                {/* Header / Reason */}
                {reason && (
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <p className="text-sm text-gray-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            {reason}
                        </p>
                    </div>
                )}

                {/* Main Content */}
                <div className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAppColor(appId)} flex items-center justify-center shadow-lg text-white`}>
                            {getAppIcon(appId)}
                        </div>
                        <div>
                            <h3 className="font-semibold text-white text-lg">{appName}</h3>
                            <p className="text-sm text-gray-400">
                                {context.address || context.summary || "Ready to launch"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLaunch}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                    >
                        Launch App
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Context Preview (Mini-table) */}
                {Object.keys(context).length > 0 && (
                    <div className="px-5 py-3 bg-black/20 border-t border-white/5">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(context).slice(0, 4).map(([key, value]) => (
                                <div key={key} className="flex flex-col">
                                    <span className="text-gray-500 uppercase tracking-wider text-[10px]">{key.replace(/_/g, ' ')}</span>
                                    <span className="text-gray-300 font-mono truncate">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
