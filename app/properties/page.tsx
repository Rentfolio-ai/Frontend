import { Suspense } from 'react';
import { Navbar, FilterPanel } from '@/shared/components';
import { PropertiesTable } from '@/features/properties';

export const metadata = {
  title: 'AI Property Intelligence - Smart Real Estate Analytics',
  description: 'Browse AI-curated real estate investment properties with predictive analytics and intelligent scoring.',
};

const demoProperties = [
  {
    address: '123 Main St, Austin, TX',
    value: 445815,
    roi: 5.2,
    cashFlow: 1420,
    status: 'Active',
  },
  {
    address: '456 Oak Ave, Dallas, TX',
    value: 389000,
    roi: 4.8,
    cashFlow: 980,
    status: 'Active',
  },
  {
    address: '789 Pine Rd, Houston, TX',
    value: 512000,
    roi: 6.1,
    cashFlow: 1750,
    status: 'Active',
  },
];

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Your Properties</h1>
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="pb-2">Address</th>
              <th className="pb-2">Value</th>
              <th className="pb-2">ROI</th>
              <th className="pb-2">Cash Flow</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {demoProperties.map((property) => (
              <tr key={property.address} className="border-t border-slate-700">
                <td className="py-2 text-white">{property.address}</td>
                <td className="py-2 text-green-300">${property.value.toLocaleString()}</td>
                <td className="py-2 text-blue-300">{property.roi}%</td>
                <td className="py-2 text-purple-300">${property.cashFlow.toLocaleString()}</td>
                <td className="py-2 text-gray-300">{property.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-gray-400 text-xs text-center mt-10">Demo data shown. Connect your account to see your real properties.</div>
    </div>
  );
}

function PropertiesTableSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      <div className="p-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-100">
            <div className="h-16 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
