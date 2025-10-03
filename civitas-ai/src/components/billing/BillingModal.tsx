import React from 'react';
import { CreditCard, Check, Crown } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { PLANS } from '../../config/plans';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  nextBillingDate: string | Date;
  priceAmount: number | string;
  billingInterval: string;
  paymentMethod?: {
    cardLastFour: string;
    expiryDate: string;
  };
}

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  planName,
  nextBillingDate,
  priceAmount,
  billingInterval,
  paymentMethod = { cardLastFour: '4242', expiryDate: '12/26' }
}) => {
  // Format the billing date if it's a Date object
  const formattedBillingDate = nextBillingDate instanceof Date
    ? nextBillingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : nextBillingDate;

  // Format the price amount if it's a number
  const formattedPrice = typeof priceAmount === 'number' 
    ? `$${priceAmount}` 
    : priceAmount;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Billing & Plans" size="xl">
      <div className="space-y-6">
        {/* Current Plan */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-foreground">Current Plan</h4>
              <p className="text-lg font-semibold text-primary">{planName}</p>
              <p className="text-sm text-foreground/60">Next billing: {formattedBillingDate}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{formattedPrice}</p>
              <p className="text-sm text-foreground/60">/{billingInterval}</p>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan, index) => (
            <div
              key={index}
              className={`relative border rounded-lg p-6 ${
                plan.current 
                  ? 'border-primary bg-primary/5' 
                  : plan.popular
                  ? 'border-accent-from bg-accent-from/5'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent-from text-white px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-foreground/60 mb-2">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-foreground/60 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-muted text-foreground cursor-default'
                    : plan.popular
                    ? 'bg-accent-from text-white hover:bg-accent-from/90'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        <div className="border-t border-border pt-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Payment Method</h4>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-6 bg-primary rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">•••• •••• •••• {paymentMethod.cardLastFour}</p>
                <p className="text-xs text-foreground/60">Expires {paymentMethod.expiryDate}</p>
              </div>
            </div>
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              Update
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};