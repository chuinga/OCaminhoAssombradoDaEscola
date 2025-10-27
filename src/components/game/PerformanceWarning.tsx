'use client';

import { useState, useEffect } from 'react';
import { usePerformanceStore } from '@/store/performanceStore';
import { performanceOptimizer } from '@/utils/performanceOptimizer';

interface PerformanceWarningProps {
  className?: string;
}

export function PerformanceWarning({ className = '' }: PerformanceWarningProps) {
  const { metrics, settings } = usePerformanceStore();
  const [showWarning, setShowWarning] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show warning if performance is consistently low and auto-adjust is disabled
    const shouldShow = metrics.isLowPerformance && 
                      metrics.averageFPS < 25 && 
                      !settings.autoAdjustQuality && 
                      !dismissed;
    
    setShowWarning(shouldShow);
    
    if (shouldShow) {
      setRecommendations(performanceOptimizer.getOptimizationRecommendations());
    }
  }, [metrics.isLowPerformance, metrics.averageFPS, settings.autoAdjustQuality, dismissed]);

  const handleApplyRecommended = () => {
    const recommended = performanceOptimizer.getRecommendedSettings();
    const { setGraphicsQuality, setFrameRateLimit, setLightweightMode, setAutoAdjustQuality } = usePerformanceStore.getState();
    
    setGraphicsQuality(recommended.quality);
    setFrameRateLimit(recommended.frameRateLimit);
    setLightweightMode(recommended.lightweightMode);
    setAutoAdjustQuality(true);
    
    setDismissed(true);
    setShowWarning(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full mx-4 ${className}`}>
      <div className="bg-red-900/90 backdrop-blur-md border border-red-600/50 rounded-lg p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-red-200 font-semibold">Low Performance Detected</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-red-300 hover:text-red-100 transition-colors"
            aria-label="Dismiss warning"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Performance Info */}
        <div className="mb-3 text-sm text-red-100">
          <div className="flex justify-between items-center mb-1">
            <span>Current FPS:</span>
            <span className="font-medium">{metrics.currentFPS.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Average FPS:</span>
            <span className="font-medium">{metrics.averageFPS.toFixed(1)}</span>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-4">
            <h4 className="text-red-200 font-medium text-sm mb-2">Recommendations:</h4>
            <ul className="text-xs text-red-100 space-y-1">
              {recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleApplyRecommended}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
          >
            Apply Recommended
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-red-200 hover:text-red-100 text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}