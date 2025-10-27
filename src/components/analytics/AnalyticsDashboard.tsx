'use client';

import React, { useState, useEffect } from 'react';
import { analyticsService } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AnalyticsSummary {
  session: {
    sessionId: string;
    startTime: number;
    character: string | null;
    weapon: string | null;
    difficulty: string | null;
  };
  completionRates: {
    easy: number;
    medium: number;
    impossible: number;
  };
  averageScores: {
    easy: number;
    medium: number;
    impossible: number;
  };
  weaponUsage: Array<{
    weapon: string;
    count: number;
    percentage: number;
  }>;
  performance: {
    averageFPS: number;
    averageLoadTime: number;
    currentFPS: number;
  };
  totalGames: number;
  totalProgressionEvents: number;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadAnalytics();
    
    // Refresh analytics every 5 seconds when visible
    const interval = setInterval(() => {
      if (isVisible) {
        loadAnalytics();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const loadAnalytics = () => {
    const summary = analyticsService.getAnalyticsSummary();
    setAnalytics(summary);
  };

  const clearAnalytics = () => {
    analyticsService.clearData();
    loadAnalytics();
  };

  const exportAnalytics = () => {
    const data = analyticsService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getPerformanceColor = (fps: number) => {
    if (fps >= 50) return 'text-green-600';
    if (fps >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 70) return 'bg-green-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-purple-900/80 text-white border-purple-600 hover:bg-purple-800"
        >
          📊 Analytics
        </Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 bg-gray-900/95 text-white border-purple-600">
          <CardContent className="p-4">
            <div className="text-center">Loading analytics...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-h-[80vh] overflow-y-auto">
      <Card className="w-96 bg-gray-900/95 text-white border-purple-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-purple-300">Game Analytics</CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Session Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-purple-300">Current Session</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Duration:</span>
                <div className="text-white">
                  {formatDuration(Date.now() - analytics.session.startTime)}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Games:</span>
                <div className="text-white">{analytics.totalGames}</div>
              </div>
              {analytics.session.character && (
                <div>
                  <span className="text-gray-400">Character:</span>
                  <div className="text-white capitalize">{analytics.session.character}</div>
                </div>
              )}
              {analytics.session.weapon && (
                <div>
                  <span className="text-gray-400">Weapon:</span>
                  <div className="text-white capitalize">{analytics.session.weapon}</div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-purple-300">Performance</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Current FPS:</span>
                <div className={`font-mono ${getPerformanceColor(analytics.performance.currentFPS)}`}>
                  {analytics.performance.currentFPS}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Avg FPS:</span>
                <div className={`font-mono ${getPerformanceColor(analytics.performance.averageFPS)}`}>
                  {analytics.performance.averageFPS}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Avg Load Time:</span>
                <div className="text-white font-mono">
                  {analytics.performance.averageLoadTime}ms
                </div>
              </div>
            </div>
          </div>

          {/* Completion Rates */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-purple-300">Completion Rates</h3>
            <div className="space-y-2">
              {Object.entries(analytics.completionRates).map(([difficulty, rate]) => (
                <div key={difficulty} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-gray-300">{difficulty}</span>
                    <span className="text-white">{rate.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={rate} 
                    className="h-2"
                    style={{
                      '--progress-background': getCompletionRateColor(rate)
                    } as React.CSSProperties}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Average Scores */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-purple-300">Average Scores</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(analytics.averageScores).map(([difficulty, score]) => (
                <div key={difficulty} className="text-center">
                  <div className="text-gray-400 capitalize">{difficulty}</div>
                  <div className="text-white font-mono">{Math.round(score)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weapon Usage */}
          {analytics.weaponUsage.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-purple-300">Weapon Usage</h3>
              <div className="space-y-1">
                {analytics.weaponUsage.map(({ weapon, count, percentage }) => (
                  <div key={weapon} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-gray-300">{weapon}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {count}
                      </Badge>
                      <span className="text-white w-10 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            <Button
              onClick={exportAnalytics}
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-purple-600 text-purple-300 hover:bg-purple-900"
            >
              Export
            </Button>
            <Button
              onClick={clearAnalytics}
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-red-600 text-red-300 hover:bg-red-900"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}