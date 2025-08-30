'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscription';
import { CheckCircle, Crown, Zap, Star } from 'lucide-react';
import { useState } from 'react';

export default function SubscriptionPage() {
  const { subscription, isLoading, upgradeSubscription } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    try {
      setIsUpgrading(tier);
      await upgradeSubscription(tier);
      // Show success message
    } catch (error) {
      console.error('Upgrade failed:', error);
      // Show error message
    } finally {
      setIsUpgrading(null);
    }
  };

  const tierIcons = {
    free: CheckCircle,
    pro: Zap,
    enterprise: Crown
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading subscription details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Subscription Plans
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the plan that fits your real estate investment needs
          </p>
        </div>

        {/* Current Subscription Banner */}
        {subscription && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Crown className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Current Plan: {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}</h3>
                  <p className="text-gray-300">
                    {subscription.status === 'active' ? 'Active' : subscription.status}
                    {subscription.currentPeriodEnd && ` • Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  ${SUBSCRIPTION_TIERS[subscription.tier].price}
                  <span className="text-sm text-gray-400">/month</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {Object.entries(SUBSCRIPTION_TIERS).map(([tier, details]) => {
            const Icon = tierIcons[tier as SubscriptionTier];
            const isCurrentTier = subscription?.tier === tier;
            const isUpgrade = subscription ? details.price > SUBSCRIPTION_TIERS[subscription.tier].price : true;
            const isProcessing = isUpgrading === tier;

            return (
              <div
                key={tier}
                className={`relative bg-white/10 backdrop-blur-md rounded-xl p-8 border transition-all duration-300 ${
                  isCurrentTier
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-white/20 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10'
                } ${details.popular ? 'transform scale-105' : ''}`}
              >
                {details.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Tier Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 capitalize">{tier}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">
                      ${details.price}
                    </span>
                    <span className="text-gray-400 text-lg">
                      {details.price === 0 ? '' : '/month'}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {details.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => !isCurrentTier && isUpgrade && handleUpgrade(tier as SubscriptionTier)}
                  disabled={isCurrentTier || !isUpgrade || isProcessing}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    isCurrentTier
                      ? 'bg-blue-500/20 text-blue-300 cursor-default'
                      : isUpgrade
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transform hover:scale-105 shadow-lg'
                      : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                  } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : isCurrentTier ? (
                    'Current Plan'
                  ) : isUpgrade ? (
                    `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`
                  ) : (
                    'Contact Sales'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-300 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-300 text-sm">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-300 text-sm">Yes, all new users start with our free plan. No credit card required to get started.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-300 text-sm">We offer a 30-day money-back guarantee for all paid plans. No questions asked.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Need a custom plan or have questions?</p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
            Contact Sales Team
          </button>
        </div>
      </main>
    </div>
  );
}
