export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: string;
  features: string[];
}

export interface SubscriptionTierDetails {
  price: number;
  popular?: boolean;
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierDetails> = {
  free: {
    price: 0,
    features: [
      'View up to 3 properties',
      'Basic analytics',
      'Monthly reports',
    ]
  },
  pro: {
    price: 29,
    popular: true,
    features: [
      'Unlimited properties',
      'Advanced AI insights',
      'Real-time market alerts',
      'Custom reports',
      'Priority support',
    ]
  },
  enterprise: {
    price: 99,
    features: [
      'Everything in Pro',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced security features',
    ]
  }
};

export const SUBSCRIPTION_FEATURES = {
  free: [
    'View up to 3 properties',
    'Basic analytics',
    'Monthly reports',
  ],
  pro: [
    'Unlimited properties',
    'Advanced AI insights',
    'Real-time market alerts',
    'Custom reports',
    'Priority support',
  ],
  enterprise: [
    'Everything in Pro',
    'API access',
    'Custom integrations',
    'Dedicated account manager',
    'Advanced security features',
  ],
} as const;

export const SUBSCRIPTION_LIMITS = {
  free: {
    maxProperties: 3,
    maxReports: 5,
    aiInsights: false,
    realTimeAlerts: false,
  },
  pro: {
    maxProperties: Infinity,
    maxReports: Infinity,
    aiInsights: true,
    realTimeAlerts: true,
  },
  enterprise: {
    maxProperties: Infinity,
    maxReports: Infinity,
    aiInsights: true,
    realTimeAlerts: true,
  },
} as const;
