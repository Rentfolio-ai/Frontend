'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Brain, MapPin, Star, DollarSign, TrendingUp } from 'lucide-react';
import { llmClient } from '@/lib/llm-client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import FeatureGate from '@/components/subscription/FeatureGate';

interface ScoutCriteria {
  location: string;
  minPrice: number;
  maxPrice: number;
  propertyType: string;
  investmentGoals: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  additionalRequirements: string;
}

interface ScoutedProperty {
  id: string;
  address: string;
  price: number;
  estimatedROI: number;
  confidence: number;
  reasoning: string;
  highlights: string[];
  risks: string[];
}

interface ScoutResults {
  properties: ScoutedProperty[];
  marketSummary: string;
  confidence: number;
  generatedAt: Date;
}

export function AIPropertyScout() {
  const { subscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScoutResults | null>(null);
  const [criteria, setCriteria] = useState<ScoutCriteria>({
    location: '',
    minPrice: 0,
    maxPrice: 0,
    propertyType: '',
    investmentGoals: [],
    riskTolerance: 'medium',
    additionalRequirements: ''
  });

  const investmentGoalOptions = [
    'Cash Flow',
    'Appreciation',
    'Tax Benefits',
    'Portfolio Diversification',
    'Quick Flip',
    'Long-term Hold'
  ];

  const handleGoalToggle = (goal: string) => {
    setCriteria(prev => ({
      ...prev,
      investmentGoals: prev.investmentGoals.includes(goal)
        ? prev.investmentGoals.filter(g => g !== goal)
        : [...prev.investmentGoals, goal]
    }));
  };

  const handleScoutProperties = async () => {
    if (!criteria.location || !criteria.maxPrice) {
      alert('Please fill in at least location and price range');
      return;
    }

    setLoading(true);
    try {
      const scoutCriteria = {
        location: criteria.location,
        priceRange: { min: criteria.minPrice, max: criteria.maxPrice },
        propertyType: criteria.propertyType,
        investmentGoals: criteria.investmentGoals,
        riskTolerance: criteria.riskTolerance
      };

      const response = await llmClient.scoutProperties(scoutCriteria);

      // Parse the LLM response into structured results
      const scoutResults = parseScoutResults(response.content, response.confidence || 80);
      setResults(scoutResults);
    } catch (error) {
      console.error('Failed to scout properties:', error);
      alert('Failed to scout properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parseScoutResults = (content: string, confidence: number): ScoutResults => {
    // Mock parsing - replace with actual LLM response parsing
    const mockProperties: ScoutedProperty[] = [
      {
        id: '1',
        address: '123 Oak Street, Austin, TX',
        price: 485000,
        estimatedROI: 7.2,
        confidence: 92,
        reasoning: 'Strong rental demand in emerging tech corridor with upcoming infrastructure improvements.',
        highlights: ['High rental demand', 'Growing neighborhood', 'Near tech companies'],
        risks: ['Market volatility', 'Higher property taxes']
      },
      {
        id: '2',
        address: '456 Pine Avenue, Austin, TX',
        price: 425000,
        estimatedROI: 6.8,
        confidence: 87,
        reasoning: 'Established neighborhood with consistent rental income and moderate appreciation potential.',
        highlights: ['Stable rental income', 'Good schools nearby', 'Low vacancy rates'],
        risks: ['Slower appreciation', 'Older property may need repairs']
      }
    ];

    return {
      properties: mockProperties,
      marketSummary: 'Austin market shows strong fundamentals with continued population growth and job creation in the tech sector. Rental demand remains high with low vacancy rates.',
      confidence,
      generatedAt: new Date()
    };
  };

  return (
    <FeatureGate feature="aiInsights" tier={subscription?.tier || 'free'}>
      <div className="space-y-6">
        {/* Scout Criteria Form */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Search className="h-5 w-5 text-green-400" />
              AI Property Scout
              <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                Intelligent Search
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location and Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="location" className="text-gray-200 text-sm font-medium">Location</label>
                <Input
                  id="location"
                  placeholder="City, State or ZIP code"
                  value={criteria.location}
                  onChange={(e) => setCriteria(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="minPrice" className="text-gray-200 text-sm font-medium">Min Price ($)</label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="300000"
                  value={criteria.minPrice || ''}
                  onChange={(e) => setCriteria(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="maxPrice" className="text-gray-200 text-sm font-medium">Max Price ($)</label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="600000"
                  value={criteria.maxPrice || ''}
                  onChange={(e) => setCriteria(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Property Type and Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="propertyType" className="text-gray-200 text-sm font-medium">Property Type</label>
                <select
                  id="propertyType"
                  onChange={(e) => setCriteria(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                >
                  <option value="">Any Type</option>
                  <option value="single-family">Single Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="multi-family">Multi-Family</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="riskTolerance" className="text-gray-200 text-sm font-medium">Risk Tolerance</label>
                <select
                  id="riskTolerance"
                  value={criteria.riskTolerance}
                  onChange={(e) => setCriteria(prev => ({ ...prev, riskTolerance: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
            </div>

            {/* Investment Goals */}
            <div className="space-y-3">
              <label className="text-gray-200 text-sm font-medium">Investment Goals (Select Multiple)</label>
              <div className="flex flex-wrap gap-2">
                {investmentGoalOptions.map(goal => (
                  <Button
                    key={goal}
                    type="button"
                    variant={criteria.investmentGoals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGoalToggle(goal)}
                    className={criteria.investmentGoals.includes(goal)
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-slate-600 text-gray-300 hover:bg-slate-700"
                    }
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>

            {/* Additional Requirements */}
            <div className="space-y-2">
              <label htmlFor="requirements" className="text-gray-200 text-sm font-medium">Additional Requirements (Optional)</label>
              <textarea
                id="requirements"
                placeholder="e.g., Near schools, public transportation, specific neighborhoods..."
                value={criteria.additionalRequirements}
                onChange={(e) => setCriteria(prev => ({ ...prev, additionalRequirements: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white min-h-[80px] resize-none"
              />
            </div>

            <Button
              onClick={handleScoutProperties}
              disabled={loading || !criteria.location || !criteria.maxPrice}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI Scouting Properties...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Scout Properties with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Scout Results */}
        {results && (
          <div className="space-y-6">
            {/* Market Summary */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  Market Analysis
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                    {results.confidence}% Confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{results.marketSummary}</p>
              </CardContent>
            </Card>

            {/* Scouted Properties */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Recommended Properties</h3>
              {results.properties.map((property) => (
                <Card key={property.id} className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{property.address}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-green-400">
                            <DollarSign className="h-4 w-4" />
                            ${property.price.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-blue-400">
                            <TrendingUp className="h-4 w-4" />
                            {property.estimatedROI}% ROI
                          </span>
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-4 w-4" />
                            {property.confidence}% Match
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4">{property.reasoning}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-green-400 mb-2">Highlights</h5>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {property.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-green-400 rounded-full" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-yellow-400 mb-2">Considerations</h5>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {property.risks.map((risk, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-yellow-400 rounded-full" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
