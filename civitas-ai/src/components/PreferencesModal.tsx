/**
 * Preferences Modal Component
 * 
 * Allows users to configure their preferences
 */

import React, { useState } from 'react';
import { X, Settings, Star, DollarSign, Home, Check } from 'lucide-react';
import { usePreferencesStore } from '../stores/preferencesStore';
import { motion, AnimatePresence } from 'framer-motion';

interface PreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose }) => {
    const {
        defaultStrategy,
        budgetRange,
        preferredBedrooms,
        favoriteMarkets,
        setDefaultStrategy,
        setBudgetRange,
        setPreferredBedrooms,
        addFavoriteMarket,
        removeFavoriteMarket
    } = usePreferencesStore();

    const [newMarket, setNewMarket] = useState('');
    const [minBudget, setMinBudget] = useState(budgetRange?.min || 200000);
    const [maxBudget, setMaxBudget] = useState(budgetRange?.max || 400000);

    if (!isOpen) return null;

    const handleAddMarket = () => {
        if (newMarket.trim()) {
            addFavoriteMarket(newMarket.trim());
            setNewMarket('');
        }
    };

    const handleSave = () => {
        setBudgetRange(minBudget, maxBudget);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Preferences</h2>
                                    <p className="text-sm text-white/50">Customize your OmniEstate experience</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Investment Strategy */}
                            <section>
                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-4">
                                    <Home className="w-4 h-4 text-blue-400" />
                                    Default Investment Strategy
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {['STR', 'LTR', 'FLIP'].map((strategy) => (
                                        <button
                                            key={strategy}
                                            onClick={() => setDefaultStrategy(strategy as any)}
                                            className={`relative group p-4 rounded-xl border transition-all duration-300 text-left ${defaultStrategy === strategy
                                                ? 'bg-blue-500/10 border-blue-500/50'
                                                : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`font-semibold ${defaultStrategy === strategy ? 'text-blue-400' : 'text-white'}`}>
                                                    {strategy}
                                                </span>
                                                {defaultStrategy === strategy && (
                                                    <div className="bg-blue-500 rounded-full p-0.5">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                                                {strategy === 'STR' && 'Short-term Rental'}
                                                {strategy === 'LTR' && 'Long-term Rental'}
                                                {strategy === 'FLIP' && 'Fix & Flip'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Budget Range */}
                            <section>
                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-4">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    Budget Range
                                </label>
                                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs text-white/40 uppercase tracking-wider">Minimum</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
                                                <input
                                                    type="number"
                                                    value={minBudget}
                                                    onChange={(e) => setMinBudget(Number(e.target.value))}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-7 pr-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                    step="10000"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-white/40 uppercase tracking-wider">Maximum</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
                                                <input
                                                    type="number"
                                                    value={maxBudget}
                                                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-7 pr-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                    step="10000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-50"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div className="text-center text-sm text-white/50">
                                        Targeting properties between <span className="text-white font-medium">${(minBudget / 1000).toFixed(0)}k</span> and <span className="text-white font-medium">${(maxBudget / 1000).toFixed(0)}k</span>
                                    </div>
                                </div>
                            </section>

                            {/* Preferred Bedrooms */}
                            <section>
                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-4">
                                    <span className="text-lg">🛏️</span>
                                    Preferred Bedrooms
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setPreferredBedrooms(num)}
                                            className={`w-12 h-12 rounded-xl border transition-all duration-200 flex items-center justify-center font-medium ${preferredBedrooms === num
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                                : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05] hover:text-white hover:border-white/20'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPreferredBedrooms(null)}
                                        className={`px-6 h-12 rounded-xl border transition-all duration-200 font-medium ${preferredBedrooms === null
                                            ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                            : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05] hover:text-white hover:border-white/20'
                                            }`}
                                    >
                                        Any
                                    </button>
                                </div>
                            </section>

                            {/* Favorite Markets */}
                            <section>
                                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-4">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    Favorite Markets
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMarket}
                                            onChange={(e) => setNewMarket(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddMarket()}
                                            placeholder="Add a city (e.g. Austin, TX)..."
                                            className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        />
                                        <button
                                            onClick={handleAddMarket}
                                            disabled={!newMarket.trim()}
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {favoriteMarkets.map((market: string) => (
                                            <div
                                                key={market}
                                                className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white/[0.05] border border-white/10 text-white/90 rounded-lg group hover:border-white/20 transition-colors"
                                            >
                                                <Star className="w-3 h-3 text-yellow-500/50 group-hover:text-yellow-400 transition-colors" />
                                                <span className="text-sm">{market}</span>
                                                <button
                                                    onClick={() => removeFavoriteMarket(market)}
                                                    className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {favoriteMarkets.length === 0 && (
                                            <p className="text-sm text-white/30 italic">No favorite markets added yet.</p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
