'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { DollarSign, TrendingUp, Crown, BarChart3, User2, CreditCard } from 'lucide-react';

const demoUser = {
  name: 'Jane Doe',
  email: 'jane.doe@email.com',
  plan: 'Pro',
  renewal: '2025-09-01',
  joinDate: '2024-03-15',
  properties: [
    {
      id: 1,
      address: '123 Main St, Austin, TX',
      value: 445815,
      roi: 5.2,
      cashFlow: 1420,
      status: 'Active',
      purchaseDate: '2023-06-15',
    },
    {
      id: 2,
      address: '456 Oak Ave, Dallas, TX',
      value: 389000,
      roi: 4.8,
      cashFlow: 980,
      status: 'Active',
      purchaseDate: '2023-08-22',
    },
    {
      id: 3,
      address: '789 Pine Rd, Houston, TX',
      value: 512000,
      roi: 6.1,
      cashFlow: 1750,
      status: 'Active',
      purchaseDate: '2024-01-10',
    },
    {
      id: 4,
      address: '321 Elm St, San Antonio, TX',
      value: 425000,
      roi: 5.8,
      cashFlow: 1300,
      status: 'Active',
      purchaseDate: '2024-03-05',
    },
    {
      id: 5,
      address: '654 Maple Dr, Fort Worth, TX',
      value: 398000,
      roi: 4.9,
      cashFlow: 1150,
      status: 'Active',
      purchaseDate: '2024-05-18',
    },
  ],
};

// Calculate totals
const totalValue = demoUser.properties.reduce((sum, prop) => sum + prop.value, 0);
const avgROI = demoUser.properties.reduce((sum, prop) => sum + prop.roi, 0) / demoUser.properties.length;
const totalCashFlow = demoUser.properties.reduce((sum, prop) => sum + prop.cashFlow, 0);

export function AccountContent() {
  const { data: session } = useSession();
  const { subscription, isLoading } = useSubscription();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Account & Portfolio</h1>

      {/* Account Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Personal Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center mb-4">
            <User2 className="w-5 h-5 text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-gray-400 text-sm">Name</div>
              <div className="text-white font-medium">{session?.user?.name || demoUser.name}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Email</div>
              <div className="text-white font-medium">{session?.user?.email || demoUser.email}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Member Since</div>
              <div className="text-white font-medium">{new Date(demoUser.joinDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 text-purple-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Subscription</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-gray-400 text-sm">Current Plan</div>
              <div className="flex items-center">
                <span className="text-white font-medium mr-2">{subscription?.tier || demoUser.plan}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  subscription?.tier === 'pro' ? 'bg-blue-500/20 text-blue-300' :
                  subscription?.tier === 'enterprise' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {subscription?.tier || 'Pro'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Renewal Date</div>
              <div className="text-white font-medium">{demoUser.renewal}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Status</div>
              <div className="text-green-400 font-medium">Active</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-green-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Portfolio Summary</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-gray-400 text-sm">Total Properties</div>
              <div className="text-white font-medium text-xl">{demoUser.properties.length}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Portfolio Value</div>
              <div className="text-white font-medium text-xl">${totalValue.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Avg ROI</div>
              <div className="text-green-400 font-medium text-xl">{avgROI.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-300 text-sm mb-2">Total Portfolio Value</div>
              <div className="text-3xl font-bold text-white">${totalValue.toLocaleString()}</div>
              <div className="text-green-400 mt-2">+2.4% this month</div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-300 text-sm mb-2">Average ROI</div>
              <div className="text-3xl font-bold text-white">{avgROI.toFixed(1)}%</div>
              <div className="text-blue-400 mt-2">+0.3% this month</div>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-300 text-sm mb-2">Monthly Cash Flow</div>
              <div className="text-3xl font-bold text-white">${totalCashFlow.toLocaleString()}</div>
              <div className="text-purple-400 mt-2">+5.2% this month</div>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Crown className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Properties Portfolio Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Your Real Estate Portfolio</h2>
            <p className="text-gray-300 text-sm">
              Showing all {demoUser.properties.length} properties in your portfolio
            </p>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">Portfolio Overview</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-gray-300 font-medium py-3 px-4">Property</th>
                <th className="text-gray-300 font-medium py-3 px-4">Value</th>
                <th className="text-gray-300 font-medium py-3 px-4">ROI</th>
                <th className="text-gray-300 font-medium py-3 px-4">Cash Flow</th>
                <th className="text-gray-300 font-medium py-3 px-4">Purchase Date</th>
                <th className="text-gray-300 font-medium py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {demoUser.properties.map((property) => (
                <tr key={property.id} className="border-b border-gray-700 hover:bg-white/5">
                  <td className="py-4 px-4">
                    <div className="text-white font-medium">{property.address}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white">${property.value.toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`font-medium ${
                      property.roi >= 6 ? 'text-green-400' :
                      property.roi >= 5 ? 'text-blue-400' : 'text-amber-400'
                    }`}>
                      {property.roi}%
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-green-400 font-medium">${property.cashFlow}/month</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-300">{new Date(property.purchaseDate).toLocaleDateString()}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                      {property.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-gray-400 text-xs text-center mt-10 p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
        Demo data shown. Connect your real estate accounts to see your actual portfolio details.
      </div>
    </div>
  );
}
