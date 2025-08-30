'use client';

import { SubscriptionTier, SUBSCRIPTION_TIERS } from '@/lib/subscription';
import { CheckCircle, Zap, Crown } from 'lucide-react';
import { useState } from 'react';

interface UpgradePromptProps {
  feature: string;
  currentTier: SubscriptionTier;
}

export default function UpgradePrompt({ feature, currentTier }: UpgradePromptProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tierIcons = {
    free: CheckCircle,
    pro: Zap,
    enterprise: Crown
  };

  const upgradeTiers = Object.entries(SUBSCRIPTION_TIERS)
    .filter(([tier]) => tier !== currentTier)
    .sort((a, b) => a[1].price - b[1].price);

  return (
    <>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20
                      border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/50 rounded-full">
          <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Upgrade Required
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          The {feature} feature requires a higher subscription tier.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
                     text-white px-6 py-2 rounded-lg font-medium transition-all duration-200
                     transform hover:scale-105 shadow-lg"
        >
          View Upgrade Options
        </button>
      </div>

      {/* Upgrade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Choose Your Plan
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(SUBSCRIPTION_TIERS).map(([tier, details]) => {
                const Icon = tierIcons[tier as SubscriptionTier];
                const isCurrentTier = tier === currentTier;
                const isUpgrade = details.price > SUBSCRIPTION_TIERS[currentTier].price;

                return (
                  <div
                    key={tier}
                    className={`relative border rounded-xl p-6 ${
                      isCurrentTier
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isUpgrade
                        ? 'border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 opacity-60'
                    } transition-all duration-200`}
                  >
                    {details.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 capitalize">
                      {tier}
                    </h3>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${details.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {details.price === 0 ? '' : '/month'}
                      </span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {details.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      disabled={!isUpgrade && !isCurrentTier}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        isCurrentTier
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 cursor-default'
                          : isUpgrade
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transform hover:scale-105 shadow-lg'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {isCurrentTier
                        ? 'Current Plan'
                        : isUpgrade
                        ? `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`
                        : 'Downgrade'
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
