import { useEffect, useRef } from 'react';
import { usePerformanceStore } from '@/store/performanceStore';
import { performanceOptimizer } from '@/utils/performanceOptimizer';

interface UsePerformanceMonitoringOptions {
  enabled?: boolean;
  updateInterval?: number;
  autoOptimize?: boolean;
}

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const {
    enabled = true,
    updateInterval = 1000, // Update every second
    autoOptimize = true,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { updateMetrics, settings } = usePerformanceStore();

  useEffect(() => {
    if (!enabled) return;

    // Start performance monitoring
    intervalRef.current = setInterval(() => {
      // Update performance metrics
      const metrics = performanceOptimizer.getMetrics();
      
      updateMetrics({
        currentFPS: metrics.fps,
        averageFPS: performanceOptimizer.getDetailedMetrics().fps.average,
        frameTime: metrics.frameTime,
        isLowPerformance: metrics.isLowPerformance,
        memoryUsage: metrics.memoryUsage,
      });

      // Auto-optimize if enabled and performance is low
      if (autoOptimize && settings.autoAdjustQuality && metrics.isLowPerformance) {
        console.log('Performance monitoring: Triggering auto-optimization');
        usePerformanceStore.getState().adjustQualityBasedOnPerformance();
      }
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, updateInterval, autoOptimize, updateMetrics, settings.autoAdjustQuality]);

  return {
    metrics: usePerformanceStore((state) => state.metrics),
    settings: usePerformanceStore((state) => state.settings),
    optimizationSettings: performanceOptimizer.getOptimizationSettings(),
  };
}