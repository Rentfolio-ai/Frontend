'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, Loader2, Brain, DollarSign, TrendingUp, Home, AlertCircle } from 'lucide-react';
import { llmClient, type PropertyData, type MarketContext } from '@/lib/llm-client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import FeatureGate from '@/components/subscription/FeatureGate';

interface ValuationResult {
  estimatedValue: number;
  confidence: number;
  valuationRange: {
    low: number;
    high: number;
  };
  rentalIncome: {
    monthly: number;
    annual: number;
  };
  investmentMetrics: {
    capRate: number;
    cashOnCash: number;
    grossYield: number;
  };
  comparableProperties: Array<{
    address: string;
    price: number;
    pricePerSqft: number;
  }>;
  marketFactors: string[];
  reasoning: string;
  generatedAt: Date;
}

export function AIPropertyValuator() {
  const { subscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [propertyData, setPropertyData] = useState<Partial<PropertyData>>({
    address: '',
    price: 0,
    sqft: 0,
    bedrooms: 0,
    bathrooms: 0,
    yearBuilt: 0,
    propertyType: '',
    neighborhood: '',
    zipCode: ''
  });

  const handleGetValuation = async () => {
    if (!propertyData.address || !propertyData.sqft) {
      alert('Please fill in at least the address and square footage');
      return;
    }

    setLoading(true);
    try {
      // Mock market context - replace with actual data
      const marketContext: MarketContext = {
        avgPrice: 450000,
        medianCapRate: 5.2,
        marketTrend: 'appreciating',
        neighborhood: propertyData.neighborhood || '',
        zipCode: propertyData.zipCode || '',
        comparableProperties: [
          {
            id: '1',
            address: '123 Similar St',
            price: 475000,
            sqft: 2100,
            bedrooms: 3,
            bathrooms: 2,
            yearBuilt: 2010,
            propertyType: 'single-family',
            neighborhood: 'Similar Area',
            zipCode: '78701'
          }
        ]
      };

      const response = await llmClient.getPropertyValuation(
        propertyData as PropertyData,
        marketContext
      );

      // Parse the LLM response into structured valuation
      const valuationResult = parseValuationResult(response.content, response.confidence || 85);
      setValuation(valuationResult);
    } catch (error) {
      console.error('Failed to get valuation:', error);
      alert('Failed to get property valuation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parseValuationResult = (content: string, confidence: number): ValuationResult => {
    // Mock parsing - replace with actual LLM response parsing
    const estimatedValue = propertyData.sqft ? propertyData.sqft * 225 : 450000;
    const monthlyRent = estimatedValue * 0.008; // 0.8% rule

    return {
      estimatedValue,
      confidence,
      valuationRange: {
        low: estimatedValue * 0.9,
        high: estimatedValue * 1.1
      },
      rentalIncome: {
        monthly: monthlyRent,
        annual: monthlyRent * 12
      },
      investmentMetrics: {
        capRate: (monthlyRent * 12) / estimatedValue * 100,
        cashOnCash: 8.5,
        grossYield: 9.6
      },
      comparableProperties: [
        {
          address: '123 Similar Street',
          price: 465000,
          pricePerSqft: 221
        },
        {
          address: '456 Nearby Ave',
          price: 485000,
          pricePerSqft: 230
        },
        {
          address: '789 Close Road',
          price: 455000,
          pricePerSqft: 218
        }
      ],
      marketFactors: [
        'Strong neighborhood appreciation trend',
        'High rental demand in area',
        'Proximity to employment centers',
        'Good school district ratings'
      ],
      reasoning: 'Valuation based on recent comparable sales, rental income potential, and market fundamentals. The property shows strong investment potential with favorable cap rate and cash-on-cash returns.',
      generatedAt: new Date()
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  return (
    <FeatureGate feature="aiInsights" tier={subscription?.tier || 'free'}>
      <div className="space-y-6">
        {/* Valuation Input Form */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calculator className="h-5 w-5 text-purple-400" />
              AI Property Valuator
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                Instant Valuation
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="address" className="text-gray-200 text-sm font-medium">Property Address</label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State"
                  value={propertyData.address}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sqft" className="text-gray-200 text-sm font-medium">Square Feet</label>
                <Input
                  id="sqft"
                  type="number"
                  placeholder="2000"
                  value={propertyData.sqft || ''}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, sqft: Number(e.target.value) }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="bedrooms" className="text-gray-200 text-sm font-medium">Bedrooms</label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="3"
                  value={propertyData.bedrooms || ''}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="bathrooms" className="text-gray-200 text-sm font-medium">Bathrooms</label>
                <Input
                  id="bathrooms"
                  type="number"
                  step="0.5"
                  placeholder="2"
                  value={propertyData.bathrooms || ''}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="yearBuilt" className="text-gray-200 text-sm font-medium">Year Built</label>
                <Input
                  id="yearBuilt"
                  type="number"
                  placeholder="2010"
                  value={propertyData.yearBuilt || ''}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, yearBuilt: Number(e.target.value) }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="propertyType" className="text-gray-200 text-sm font-medium">Property Type</label>
                <select
                  id="propertyType"
                  onChange={(e) => setPropertyData(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                >
                  <option value="">Select type</option>
                  <option value="single-family">Single Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="multi-family">Multi-Family</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleGetValuation}
              disabled={loading || !propertyData.address || !propertyData.sqft}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Property Value...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Get AI Valuation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Valuation Results */}
        {valuation && (
          <div className="space-y-6">
            {/* Primary Valuation */}
            <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Home className="h-5 w-5 text-purple-400" />
                  AI Property Valuation
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                    {valuation.confidence}% Confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {formatCurrency(valuation.estimatedValue)}
                    </div>
                    <div className="text-purple-300 text-sm">Estimated Market Value</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Range: {formatCurrency(valuation.valuationRange.low)} - {formatCurrency(valuation.valuationRange.high)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      {formatCurrency(valuation.rentalIncome.monthly)}
                    </div>
                    <div className="text-green-300 text-sm">Monthly Rental Income</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Annual: {formatCurrency(valuation.rentalIncome.annual)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {formatPercent(valuation.investmentMetrics.capRate)}
                    </div>
                    <div className="text-blue-300 text-sm">Cap Rate</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Cash-on-Cash: {formatPercent(valuation.investmentMetrics.cashOnCash)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Metrics */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Investment Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-lg font-semibold text-white">
                      {formatPercent(valuation.investmentMetrics.capRate)}
                    </div>
                    <div className="text-gray-400 text-sm">Cap Rate</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-lg font-semibold text-white">
                      {formatPercent(valuation.investmentMetrics.cashOnCash)}
                    </div>
                    <div className="text-gray-400 text-sm">Cash-on-Cash ROI</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-lg font-semibold text-white">
                      {formatPercent(valuation.investmentMetrics.grossYield)}
                    </div>
                    <div className="text-gray-400 text-sm">Gross Yield</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparable Properties */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Comparable Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {valuation.comparableProperties.map((comp, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-white">{comp.address}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-400">{formatCurrency(comp.price)}</span>
                        <span className="text-gray-400">${comp.pricePerSqft}/sqft</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Analysis */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Market Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">{valuation.reasoning}</p>

                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    Market Factors
                  </h4>
                  <ul className="space-y-2">
                    {valuation.marketFactors.map((factor, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <div className="w-1 h-1 bg-blue-400 rounded-full" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs text-gray-500 pt-4 border-t border-slate-600">
                  Generated: {valuation.generatedAt.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
