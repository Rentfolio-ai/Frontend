'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Tooltip } from 'recharts';
import { TrendingUp, Brain, Sparkles } from 'lucide-react';

interface PredictionData {
  month: string;
  actualROI: number;
  predictedROI: number;
  confidence: number;
  marketSentiment: number;
}

export function AIPredictionTrends() {
  const [data, setData] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generatePredictionData = (): PredictionData[] => [
      { month: 'Jan', actualROI: 8.2, predictedROI: 8.5, confidence: 92, marketSentiment: 75 },
      { month: 'Feb', actualROI: 9.1, predictedROI: 8.9, confidence: 89, marketSentiment: 78 },
      { month: 'Mar', actualROI: 7.8, predictedROI: 8.2, confidence: 94, marketSentiment: 72 },
      { month: 'Apr', actualROI: 10.2, predictedROI: 9.8, confidence: 87, marketSentiment: 82 },
      { month: 'May', actualROI: 11.5, predictedROI: 11.2, confidence: 91, marketSentiment: 86 },
      { month: 'Jun', actualROI: 9.7, predictedROI: 10.1, confidence: 88, marketSentiment: 79 },
      { month: 'Jul', actualROI: 12.3, predictedROI: 12.0, confidence: 93, marketSentiment: 88 },
      { month: 'Aug', actualROI: 0, predictedROI: 11.8, confidence: 90, marketSentiment: 85 },
    ];

    setTimeout(() => {
      setData(generatePredictionData());
      setLoading(false);
    }, 1200);
  }, []);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Prediction Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-700/30 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const accuracy = data.length > 0 ?
    data.filter(d => d.actualROI > 0).reduce((acc, curr) => {
      const diff = Math.abs(curr.actualROI - curr.predictedROI);
      const accuracy = Math.max(0, 100 - (diff / curr.actualROI) * 100);
      return acc + accuracy;
    }, 0) / data.filter(d => d.actualROI > 0).length : 0;

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Prediction Accuracy
          <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
          <Badge variant="secondary" className="ml-auto bg-purple-500/20 text-purple-300">
            {accuracy.toFixed(1)}% Accurate
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                label={{ value: 'ROI %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Actual ROI Line */}
              <Line
                type="monotone"
                dataKey="actualROI"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Actual ROI"
              />

              {/* Predicted ROI Line */}
              <Line
                type="monotone"
                dataKey="predictedROI"
                stroke="#8B5CF6"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                name="AI Predicted ROI"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence Chart */}
        <Card className="bg-slate-700/30 border-slate-600/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Model Confidence & Market Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="url(#confidenceGradient)"
                    name="AI Confidence"
                  />
                  <Area
                    type="monotone"
                    dataKey="marketSentiment"
                    stackId="2"
                    stroke="#F59E0B"
                    fill="url(#sentimentGradient)"
                    name="Market Sentiment"
                  />

                  <defs>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
