'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_LIMITS } from '@/lib/subscription';
import { BarChart3, FileText, Zap, TrendingUp } from 'lucide-react';

interface UsageItemProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  limit: number | boolean;
  color: string;
}

function UsageItem({ icon, label, current, limit, color }: UsageItemProps) {
  const percentage = typeof limit === 'number' && limit !== Infinity ?
    Math.min((current / limit) * 100, 100) : 0;

  const isUnlimited = limit === Infinity || limit === true;
  const isAtLimit = typeof limit === 'number' && current >= limit;

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <span className="text-white font-medium">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-white font-semibold">
            {current}
          </span>
          <span className="text-gray-400">
            {isUnlimited ? ' / Unlimited' : ` / ${limit}`}
          </span>
        </div>
      </div>

      {!isUnlimited && (
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isAtLimit ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isAtLimit && (
        <p className="text-red-400 text-xs mt-2">
          Limit reached. Upgrade to add more {label.toLowerCase()}.
        </p>
      )}
    </div>
  );
}

export default function UsageTracker() {
  const { subscription, isLoading } = useSubscription();

  if (isLoading || !subscription) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const limits = SUBSCRIPTION_LIMITS[subscription.tier];

  // Mock current usage data - in production, fetch from your API
  const currentUsage = {
    properties: subscription.tier === 'free' ? 3 : subscription.tier === 'pro' ? 12 : 45,
    reports: subscription.tier === 'free' ? 4 : subscription.tier === 'pro' ? 25 : 150,
    aiInsights: subscription.tier === 'free' ? 0 : subscription.tier === 'pro' ? 18 : 75,
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Usage Overview</h3>
        <div className="text-sm text-gray-300 capitalize">
          {subscription.tier} Plan
        </div>
      </div>

      <div className="space-y-4">
        <UsageItem
          icon={<FileText className="w-5 h-5 text-blue-400" />}
          label="Properties"
          current={currentUsage.properties}
          limit={limits.maxProperties}
          color="bg-blue-500/20"
        />

        <UsageItem
          icon={<BarChart3 className="w-5 h-5 text-green-400" />}
          label="Reports"
          current={currentUsage.reports}
          limit={limits.maxReports}
          color="bg-green-500/20"
        />

        <UsageItem
          icon={<Zap className="w-5 h-5 text-purple-400" />}
          label="AI Insights"
          current={limits.aiInsights ? currentUsage.aiInsights : 0}
          limit={limits.aiInsights ? Infinity : 0}
          color="bg-purple-500/20"
        />
      </div>

      {subscription.tier === 'free' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-300 font-medium">Ready to grow?</p>
              <p className="text-amber-200/70 text-sm">Upgrade for unlimited access to all features</p>
            </div>
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
                             text-white px-4 py-2 rounded-lg font-medium transition-all duration-200
                             transform hover:scale-105 shadow-lg">
              Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
