'use client';

import { useSession } from 'next-auth/react';
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from '@/lib/subscription';
import { ReactNode } from 'react';
import UpgradePrompt from './UpgradePrompt';

interface FeatureGateProps {
  feature: keyof typeof SUBSCRIPTION_LIMITS.free;
  tier: SubscriptionTier;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function FeatureGate({ feature, tier, children, fallback }: FeatureGateProps) {
  const { data: session } = useSession();

  // For demo purposes, assume user has the tier they're viewing
  // In production, get this from your user/subscription API
  const userTier: SubscriptionTier = tier; // session?.user?.subscription?.tier || 'free';

  const limits = SUBSCRIPTION_LIMITS[userTier];
  const hasAccess = limits[feature] === true || limits[feature] === Infinity;

  if (!hasAccess) {
    return fallback || <UpgradePrompt feature={feature} currentTier={userTier} />;
  }

  return <>{children}</>;
}
