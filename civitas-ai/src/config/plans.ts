export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for individual investors',
    features: [
      'Up to 10 property analyses',
      'Basic market insights',
      'Email support',
      'Standard reports'
    ],
    current: true
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'For serious real estate professionals',
    features: [
      'Unlimited property analyses',
      'Advanced AI insights',
      'Priority support',
      'Custom reports',
      'Market predictions',
      'Portfolio management'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For teams and large organizations',
    features: [
      'Everything in Professional',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'White-label options'
    ]
  }
];