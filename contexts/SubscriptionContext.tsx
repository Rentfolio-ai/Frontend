'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { SubscriptionTier, UserSubscription, SUBSCRIPTION_LIMITS } from '@/lib/subscription';
import { useToast } from './ToastContext';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  isLoading: boolean;
  hasFeatureAccess: (feature: keyof typeof SUBSCRIPTION_LIMITS.free) => boolean;
  getUsageLimit: (feature: keyof typeof SUBSCRIPTION_LIMITS.free) => number | boolean;
  upgradeSubscription: (tier: SubscriptionTier) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSubscription() {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        // For demo purposes, simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock subscription data - in production, fetch from your API
        const mockSubscription: UserSubscription = {
          tier: 'free', // Default to free tier
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          features: ['View up to 3 properties', 'Basic analytics', 'Monthly reports']
        };

        setSubscription(mockSubscription);
      } catch (error) {
        console.error('Failed to load subscription:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubscription();
  }, [session]);

  const hasFeatureAccess = (feature: keyof typeof SUBSCRIPTION_LIMITS.free): boolean => {
    if (!subscription) return false;

    const limits = SUBSCRIPTION_LIMITS[subscription.tier];
    const limit = limits[feature];

    return limit === true || limit === Infinity;
  };

  const getUsageLimit = (feature: keyof typeof SUBSCRIPTION_LIMITS.free): number | boolean => {
    if (!subscription) return false;

    const limits = SUBSCRIPTION_LIMITS[subscription.tier];
    return limits[feature];
  };

  const upgradeSubscription = async (tier: SubscriptionTier): Promise<void> => {
    try {
      setIsLoading(true);

      // In production, this would call your payment/subscription API
      console.log(`Upgrading to ${tier} tier...`);

      showToast({
        type: 'info',
        title: 'Processing upgrade...',
        message: `Upgrading to ${tier} plan. Please wait.`,
        duration: 2000
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state
      if (subscription) {
        setSubscription({
          ...subscription,
          tier,
          features: tier === 'pro'
            ? ['Unlimited properties', 'Advanced AI insights', 'Real-time market alerts', 'Custom reports', 'Priority support']
            : tier === 'enterprise'
            ? ['Everything in Pro', 'API access', 'Custom integrations', 'Dedicated account manager', 'Advanced security features']
            : subscription.features
        });
      }

      // Show success message
      showToast({
        type: 'success',
        title: 'Upgrade successful!',
        message: `Welcome to the ${tier} plan! Enjoy your new features.`,
        duration: 5000
      });
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      showToast({
        type: 'error',
        title: 'Upgrade failed',
        message: 'Something went wrong. Please try again or contact support.',
        duration: 5000
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    hasFeatureAccess,
    getUsageLimit,
    upgradeSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
