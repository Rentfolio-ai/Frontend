'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Loader2, Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { llmClient, type PropertyData, type MarketContext } from '@/lib/llm-client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import FeatureGate from '@/components/subscription/FeatureGate';

interface GeneratedReport {
  content: string;
  confidence: number;
  generatedAt: Date;
  property: PropertyData;
  sections: {
    executive_summary: string;
    financial_analysis: string;
    market_analysis: string;
    risk_assessment: string;
    recommendations: string;
  };
}

export function AIReportGenerator() {
  const { subscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);
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

  const handleGenerateReport = async () => {
    if (!propertyData.address || !propertyData.price) {
      alert('Please fill in at least the address and price');
      return;
    }

    setLoading(true);
    try {
      // Mock market context - you can fetch this from your API
      const marketContext: MarketContext = {
        avgPrice: 450000,
        medianCapRate: 5.2,
        marketTrend: 'appreciating',
        neighborhood: propertyData.neighborhood || '',
        zipCode: propertyData.zipCode || ''
      };

      const response = await llmClient.generatePropertyReport(
        propertyData as PropertyData,
        marketContext
      );

      // Parse the LLM response into structured report sections
      const reportSections = parseReportContent(response.content);

      const generatedReport: GeneratedReport = {
        content: response.content,
        confidence: response.confidence || 85,
        generatedAt: new Date(),
        property: propertyData as PropertyData,
        sections: reportSections
      };

      setReport(generatedReport);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parseReportContent = (content: string) => {
    // Basic parsing - you can enhance this based on your LLM output format
    return {
      executive_summary: extractSection(content, 'EXECUTIVE SUMMARY', 'FINANCIAL ANALYSIS'),
      financial_analysis: extractSection(content, 'FINANCIAL ANALYSIS', 'MARKET ANALYSIS'),
      market_analysis: extractSection(content, 'MARKET ANALYSIS', 'RISK ASSESSMENT'),
      risk_assessment: extractSection(content, 'RISK ASSESSMENT', 'RECOMMENDATIONS'),
      recommendations: extractSection(content, 'RECOMMENDATIONS', null)
    };
  };

  const extractSection = (content: string, startMarker: string, endMarker: string | null): string => {
    const start = content.indexOf(startMarker);
    if (start === -1) return '';

    const actualStart = start + startMarker.length;
    const end = endMarker ? content.indexOf(endMarker, actualStart) : content.length;

    return content.substring(actualStart, end === -1 ? content.length : end).trim();
  };

  const downloadReport = () => {
    if (!report) return;

    const reportText = `
PROPERTY INVESTMENT ANALYSIS REPORT
Generated: ${report.generatedAt.toLocaleDateString()}
Confidence Score: ${report.confidence}%

Property: ${report.property.address}
Price: $${report.property.price.toLocaleString()}

${report.content}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <FeatureGate feature="maxReports" tier={subscription?.tier || 'free'}>
      <div className="space-y-6">
        {/* Property Input Form */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-blue-400" />
              AI Property Report Generator
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                Powered by AI
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
                <label htmlFor="price" className="text-gray-200 text-sm font-medium">Price ($)</label>
                <Input
                  id="price"
                  type="number"
                  placeholder="450000"
                  value={propertyData.price || ''}
                  onChange={(e) => setPropertyData(prev => ({ ...prev, price: Number(e.target.value) }))}
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
                  <option value="commercial">Commercial</option>
                </select>
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
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={loading || !propertyData.address || !propertyData.price}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating AI Report...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI Investment Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Report Display */}
        {report && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Investment Analysis Report
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                    {report.confidence}% Confidence
                  </Badge>
                </CardTitle>
                <Button onClick={downloadReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-sm text-gray-400">
                Generated: {report.generatedAt.toLocaleString()} • Property: {report.property.address}
              </div>

              <div className="h-px bg-slate-600" />

              {/* Report Sections */}
              <div className="space-y-6">
                {report.sections.executive_summary && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      Executive Summary
                    </h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{report.sections.executive_summary}</p>
                  </div>
                )}

                {report.sections.financial_analysis && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Financial Analysis</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{report.sections.financial_analysis}</p>
                  </div>
                )}

                {report.sections.market_analysis && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Market Analysis</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{report.sections.market_analysis}</p>
                  </div>
                )}

                {report.sections.risk_assessment && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      Risk Assessment
                    </h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{report.sections.risk_assessment}</p>
                  </div>
                )}

                {report.sections.recommendations && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{report.sections.recommendations}</p>
                  </div>
                )}

                {/* Show full content as fallback */}
                {!report.sections.executive_summary && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">AI Analysis Report</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{report.content}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </FeatureGate>
  );
}
