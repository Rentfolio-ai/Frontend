/**
 * Example: Property Card with GraphQL.
 * 
 * Demonstrates how to use GraphQL queries in React components.
 */

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
    GET_PROPERTY_WITH_PNL,
    TRACK_PROPERTY_VIEW,
} from '@/graphql/queries';

interface PropertyCardProps {
    address: string;
    strategy?: 'LTR' | 'STR' | 'MTR' | 'Flip';
    downPaymentPct?: number;
}

export function PropertyCardGraphQL({
    address,
    strategy = 'LTR',
    downPaymentPct = 20,
}: PropertyCardProps) {
    // GraphQL Query
    const { data, loading, error, refetch } = useQuery(GET_PROPERTY_WITH_PNL, {
        variables: {
            address,
            strategy,
            downPaymentPct,
        },
        skip: !address,
    });

    // GraphQL Mutation
    const [trackView] = useMutation(TRACK_PROPERTY_VIEW);

    // Track view on mount
    React.useEffect(() => {
        if (data?.property?.id) {
            trackView({
                variables: { propertyId: data.property.id },
            });
        }
    }, [data?.property?.id, trackView]);

    if (loading) {
        return (
            <div className="animate-pulse bg-gray-100 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600">Error loading property: {error.message}</p>
                <button
                    onClick={() => refetch()}
                    className="mt-2 text-sm text-red-700 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!data?.property) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-700">Property not found</p>
            </div>
        );
    }

    const { property } = data;
    const pnl = property.pnlAnalysis;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {/* Property Info */}
            <div>
                <h3 className="text-xl font-semibold text-gray-900">
                    {property.address}
                </h3>
                <p className="text-gray-600">
                    {property.city}, {property.state} {property.zipCode}
                </p>
            </div>

            {/* Price & Details */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                        ${property.price.toLocaleString()}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Details</p>
                    <p className="text-lg text-gray-900">
                        {property.bedrooms} bed • {property.bathrooms} bath • {property.sqft.toLocaleString()} sqft
                    </p>
                </div>
            </div>

            {/* P&L Analysis */}
            {pnl && (
                <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold text-gray-900">
                        {pnl.strategy} Analysis
                    </h4>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Monthly Cashflow</p>
                            <p
                                className={`text-xl font-bold ${pnl.monthlyCashflow >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                            >
                                ${pnl.monthlyCashflow.toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Cap Rate</p>
                            <p className="text-xl font-bold text-gray-900">
                                {pnl.capRate.toFixed(2)}%
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Cash on Cash</p>
                            <p className="text-xl font-bold text-gray-900">
                                {pnl.cashOnCash.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Total Investment</p>
                        <p className="text-lg font-semibold text-gray-900">
                            ${pnl.totalInvestment.toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Refresh
                </button>
                <button
                    onClick={() => {
                        // Change strategy
                        refetch({
                            strategy: strategy === 'LTR' ? 'STR' : 'LTR',
                        });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                    Switch Strategy
                </button>
            </div>
        </div>
    );
}

export default PropertyCardGraphQL;
