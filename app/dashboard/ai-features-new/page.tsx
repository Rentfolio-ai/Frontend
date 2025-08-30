'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, MessageSquare, Search, FileText, Calculator } from 'lucide-react';
import { AIPropertyAssistant } from '@/components/ai/AIPropertyAssistant';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function AIFeaturesPage() {
  const { subscription } = useSubscription();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-full">
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI Property Assistant
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Natural language property search, valuation, and analysis
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
              <Sparkles className="h-3 w-3 mr-1" />
              Conversational AI
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              <MessageSquare className="h-3 w-3 mr-1" />
              Smart Queries
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
              <FileText className="h-3 w-3 mr-1" />
              Auto Reports
            </Badge>
          </div>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Search className="h-5 w-5 text-purple-400" />
                Natural Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Ask naturally: "Find me properties in Austin under $500k with good cap rates"
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calculator className="h-5 w-5 text-blue-400" />
                Auto Valuations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Get instant valuations for any property with confidence scores and market analysis.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-green-500/30 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-green-400" />
                Smart Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                AI asks contextual follow-ups: "Would you like me to generate a report?" or export data.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Interface */}
        <AIPropertyAssistant />

        {/* Example Queries */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Example Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="text-purple-300 font-medium">Property Search</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• "Find me properties in Austin under $500k"</li>
                  <li>• "Show me high cap rate properties"</li>
                  <li>• "Properties with 3+ bedrooms in good neighborhoods"</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-blue-300 font-medium">Analysis & Reports</h4>
                <ul className="text-gray-400 space-y-1">
                  <li>• "What's the valuation for 123 Main St?"</li>
                  <li>• "Generate a portfolio analysis report"</li>
                  <li>• "Compare ROI for my top 3 properties"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription CTA for Free Users */}
        {subscription?.tier === 'free' && (
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                Unlock Unlimited AI Conversations
              </h3>
              <p className="text-gray-300 mb-4">
                Upgrade to access unlimited queries, advanced analysis, and priority AI processing.
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                Upgrade to Pro
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
