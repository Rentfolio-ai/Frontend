'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Brain, Activity, Cpu, Database, Zap } from 'lucide-react';

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  predictionLatency: number;
  modelsActive: number;
  predictionsToday: number;
  dataPointsProcessed: number;
}

export function AIModelPerformance() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateMetrics = (): ModelMetrics => ({
      accuracy: 94.7,
      precision: 91.2,
      recall: 89.8,
      f1Score: 90.5,
      predictionLatency: 142,
      modelsActive: 7,
      predictionsToday: 1847,
      dataPointsProcessed: 52847,
    });

    setTimeout(() => {
      setMetrics(generateMetrics());
      setLoading(false);
    }, 800);
  }, []);

  if (loading || !metrics) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Cpu className="h-5 w-5 text-blue-400" />
            AI Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-slate-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (value: number, threshold: number = 90) => {
    if (value >= threshold) return 'text-green-400';
    if (value >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Cpu className="h-5 w-5 text-blue-400" />
          AI Model Performance
          <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-300">
            <Activity className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Model Accuracy Metrics */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Accuracy</span>
                <span className={`text-lg font-bold ${getPerformanceColor(metrics.accuracy)}`}>
                  {metrics.accuracy}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${metrics.accuracy}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Precision</span>
                <span className={`text-lg font-bold ${getPerformanceColor(metrics.precision)}`}>
                  {metrics.precision}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${metrics.precision}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Recall</span>
                <span className={`text-lg font-bold ${getPerformanceColor(metrics.recall)}`}>
                  {metrics.recall}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${metrics.recall}%` }}
                />
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Latency</span>
              </div>
              <span className="text-xl font-bold text-white">{metrics.predictionLatency}ms</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-400">Active Models</span>
              </div>
              <span className="text-xl font-bold text-white">{metrics.modelsActive}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-400">Predictions Today</span>
              </div>
              <span className="text-xl font-bold text-white">
                {metrics.predictionsToday.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time status indicators */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Data Processing</span>
            </div>
            <span className="text-white font-mono">
              {metrics.dataPointsProcessed.toLocaleString()} pts
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
