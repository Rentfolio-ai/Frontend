'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Send,
  Download,
  FileText,
  DollarSign,
  MapPin,
  TrendingUp,
  Loader2,
  User,
  Bot,
  ExternalLink
} from 'lucide-react';
import { llmClient, type PropertyData } from '@/lib/llm-client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import FeatureGate from '@/components/subscription/FeatureGate';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: {
    properties?: PropertyData[];
    valuations?: any[];
    reportGenerated?: boolean;
    actions?: Array<{
      type: 'generate-report' | 'export-data' | 'view-property' | 'schedule-viewing';
      label: string;
      data: any;
    }>;
  };
}

interface PropertyCard {
  property: PropertyData;
  valuation?: {
    estimatedValue: number;
    confidence: number;
    monthlyRent: number;
    capRate: number;
  };
}

export function AIPropertyAssistant() {
  const { subscription } = useSubscription();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI property investment assistant. I can help you find properties, provide valuations, generate reports, and answer any real estate questions. Try asking me something like:\n\n• \"Find me properties in Austin under $500k\"\n• \"What's the valuation for 123 Main St?\"\n• \"Show me high-cap rate properties\"\n• \"Generate a report for my portfolio\"",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock property data - in real app, this would come from your properties API
  const mockProperties: PropertyData[] = [
    {
      id: '1',
      address: '123 Cedar Park Dr, Austin, TX',
      price: 425000,
      sqft: 1850,
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: 2018,
      propertyType: 'single-family',
      neighborhood: 'Cedar Park',
      zipCode: '78613',
      capRate: 6.2,
      cashOnCash: 8.5
    },
    {
      id: '2',
      address: '456 Downtown Loft, Austin, TX',
      price: 485000,
      sqft: 1200,
      bedrooms: 2,
      bathrooms: 2,
      yearBuilt: 2020,
      propertyType: 'condo',
      neighborhood: 'Downtown',
      zipCode: '78701',
      capRate: 5.8,
      cashOnCash: 7.2
    }
  ];

  const generateValuation = (property: PropertyData) => {
    const monthlyRent = property.price * 0.008; // 0.8% rule
    const capRate = property.capRate || ((monthlyRent * 12) / property.price * 100);

    return {
      estimatedValue: property.price,
      confidence: 87,
      monthlyRent,
      capRate
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Process the query intelligently
      const response = await processUserQuery(inputValue);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        data: response.data,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing query:', error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const processUserQuery = async (query: string): Promise<{ content: string; data?: any }> => {
    const lowerQuery = query.toLowerCase();

    // Property search queries
    if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('show me')) {
      const filteredProperties = filterPropertiesByQuery(query, mockProperties);
      const propertiesWithValuations = filteredProperties.map(property => ({
        property,
        valuation: generateValuation(property)
      }));

      return {
        content: `I found ${filteredProperties.length} properties matching your criteria. Here are the results with valuations:`,
        data: {
          properties: filteredProperties,
          valuations: propertiesWithValuations,
          actions: [
            { type: 'generate-report', label: 'Generate Investment Report', data: filteredProperties },
            { type: 'export-data', label: 'Export to Excel', data: propertiesWithValuations }
          ]
        }
      };
    }

    // Valuation queries
    if (lowerQuery.includes('valuation') || lowerQuery.includes('value') || lowerQuery.includes('worth')) {
      const property = extractPropertyFromQuery(query, mockProperties);
      if (property) {
        const valuation = generateValuation(property);
        return {
          content: `Here's the AI valuation for ${property.address}:`,
          data: {
            properties: [property],
            valuations: [{ property, valuation }],
            actions: [
              { type: 'generate-report', label: 'Generate Detailed Report', data: [property] },
              { type: 'view-property', label: 'View Property Details', data: property }
            ]
          }
        };
      }
    }

    // Report generation queries
    if (lowerQuery.includes('report') || lowerQuery.includes('analysis')) {
      return {
        content: "I can generate comprehensive investment reports for your properties. Which properties would you like me to analyze?",
        data: {
          properties: mockProperties,
          actions: [
            { type: 'generate-report', label: 'Generate Portfolio Report', data: mockProperties },
            { type: 'generate-report', label: 'Generate Single Property Report', data: mockProperties.slice(0, 1) }
          ]
        }
      };
    }

    // Default LLM response for other queries
    try {
      const response = await llmClient.chatWithAI(query);
      return {
        content: response.content,
        data: {
          actions: [
            { type: 'view-property', label: 'View My Properties', data: mockProperties }
          ]
        }
      };
    } catch (error) {
      return {
        content: "I can help you with property searches, valuations, and investment analysis. Try asking me about specific properties or locations you're interested in!"
      };
    }
  };

  const filterPropertiesByQuery = (query: string, properties: PropertyData[]): PropertyData[] => {
    const lowerQuery = query.toLowerCase();

    return properties.filter(property => {
      // Location filtering
      if (lowerQuery.includes('austin') && property.address.toLowerCase().includes('austin')) return true;
      if (lowerQuery.includes('cedar park') && property.neighborhood.toLowerCase().includes('cedar park')) return true;
      if (lowerQuery.includes('downtown') && property.neighborhood.toLowerCase().includes('downtown')) return true;

      // Price filtering
      if (lowerQuery.includes('under 500k') && property.price < 500000) return true;
      if (lowerQuery.includes('under 400k') && property.price < 400000) return true;

      // Cap rate filtering
      if (lowerQuery.includes('high cap') && (property.capRate || 0) > 6) return true;

      return true; // Default to showing all properties
    });
  };

  const extractPropertyFromQuery = (query: string, properties: PropertyData[]): PropertyData | null => {
    const lowerQuery = query.toLowerCase();

    return properties.find(property =>
      lowerQuery.includes(property.address.toLowerCase()) ||
      lowerQuery.includes(property.neighborhood.toLowerCase())
    ) || properties[0]; // Default to first property
  };

  const handleAction = async (action: any) => {
    setLoading(true);

    try {
      if (action.type === 'generate-report') {
        // Generate report
        const response = await llmClient.generatePropertyReport(action.data[0]);

        const reportMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `📊 **Investment Report Generated**\n\n${response.content}\n\n*Would you like me to export this report as a PDF?*`,
          timestamp: new Date(),
          data: {
            reportGenerated: true,
            actions: [
              { type: 'export-data', label: 'Export as PDF', data: response }
            ]
          }
        };

        setMessages(prev => [...prev, reportMessage]);
      }

      if (action.type === 'export-data') {
        const exportMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: '📄 Export prepared! Your data has been formatted and is ready for download. (In a real app, this would trigger a file download)',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, exportMessage]);
      }
    } catch (error) {
      console.error('Error handling action:', error);
    } finally {
      setLoading(false);
    }
  };

  const PropertyResultCard = ({ property, valuation }: PropertyCard) => (
    <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-white font-medium">{property.address}</h4>
          <p className="text-gray-400 text-sm">{property.neighborhood} • {property.yearBuilt}</p>
        </div>
        <Badge variant="secondary" className="bg-green-500/20 text-green-300">
          ${property.price.toLocaleString()}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-gray-400">Beds/Baths</span>
          <p className="text-white">{property.bedrooms}bd / {property.bathrooms}ba</p>
        </div>
        <div>
          <span className="text-gray-400">Sqft</span>
          <p className="text-white">{property.sqft.toLocaleString()}</p>
        </div>
        {valuation && (
          <>
            <div>
              <span className="text-gray-400">Monthly Rent</span>
              <p className="text-green-400">${valuation.monthlyRent.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-400">Cap Rate</span>
              <p className="text-blue-400">{valuation.capRate.toFixed(1)}%</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <FeatureGate feature="aiInsights" tier={subscription?.tier || 'free'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Chat Interface */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-purple-400" />
              AI Property Assistant
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                Smart Query
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-900/30 rounded-lg">
              {messages.map((message) => (
                <div key={message.id} className="space-y-3">
                  <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-2 rounded-full ${
                        message.type === 'user'
                          ? 'bg-purple-600'
                          : 'bg-slate-700'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-purple-400" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-gray-200'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                        {/* Property Results */}
                        {message.data?.properties && (
                          <div className="mt-3 space-y-2">
                            {message.data.valuations?.map((item: any, index: number) => (
                              <PropertyResultCard
                                key={index}
                                property={item.property}
                                valuation={item.valuation}
                              />
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        {message.data?.actions && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.data.actions.map((action: any, index: number) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(action)}
                                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                              >
                                {action.type === 'generate-report' && <FileText className="h-3 w-3 mr-1" />}
                                {action.type === 'export-data' && <Download className="h-3 w-3 mr-1" />}
                                {action.type === 'view-property' && <ExternalLink className="h-3 w-3 mr-1" />}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="p-2 rounded-full bg-slate-700">
                    <Bot className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="bg-slate-700 text-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyzing your request...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me about properties, valuations, or reports..."
                className="bg-slate-700/50 border-slate-600 text-white"
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("Find me properties in Austin under $500k")}
                className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
              >
                <MapPin className="h-3 w-3 mr-1" />
                Find Properties
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("Show me high cap rate properties")}
                className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                High Cap Rate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("Generate a portfolio report")}
                className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
              >
                <FileText className="h-3 w-3 mr-1" />
                Generate Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputValue("What's the valuation for my properties?")}
                className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                Get Valuations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGate>
  );
}
