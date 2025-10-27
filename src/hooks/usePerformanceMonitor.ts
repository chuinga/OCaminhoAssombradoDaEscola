'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AdvancedPerformanceMonitor, PerformanceDebugger } from '../utils/performance';

export interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  updateInterval?: number;
  autoProfile?: boolean;
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const {
    enabled = true,
    updateInterval = 100,
    autoProfile = false,
  } = options;

  const monitorRef = useRef<AdvancedPerformanceMonitor | null>(null);
  const perfDebuggerRef = useRef<PerformanceDebugger | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!enabled || !isClient) return;

    // Initialize monitors
    if (!monitorRef.current) {
      monitorRef.current = new AdvancedPerformanceMonitor();
    }
    if (!perfDebuggerRef.current) {
      perfDebuggerRef.current = PerformanceDebugger.getInstance();
    }

    // Set up keyboard shortcut to toggle performance monitor
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P to toggle performance monitor
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [enabled, isClient]);

  // Performance monitoring functions
  const startRenderMeasurement = () => {
    monitorRef.current?.startRenderMeasurement();
  };

  const endRenderMeasurement = () => {
    monitorRef.current?.endRenderMeasurement();
  };

  const startUpdateMeasurement = () => {
    monitorRef.current?.startUpdateMeasurement();
  };

  const endUpdateMeasurement = () => {
    monitorRef.current?.endUpdateMeasurement();
  };

  const recordDrawCall = () => {
    monitorRef.current?.recordDrawCall();
  };

  const recordObjectCount = (count: number) => {
    monitorRef.current?.recordObjectCount(count);
  };

  const updateMetrics = () => {
    if (!monitorRef.current) return null;
    return monitorRef.current.update();
  };

  // Profiling functions
  const startProfile = (name: string) => {
    if (autoProfile) {
      perfDebuggerRef.current?.startProfile(name);
    }
  };

  const endProfile = (name: string) => {
    if (autoProfile) {
      return perfDebuggerRef.current?.endProfile(name);
    }
    return 0;
  };

  const setMarker = (name: string) => {
    perfDebuggerRef.current?.setMarker(name);
  };

  const logPerformance = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
    perfDebuggerRef.current?.log(level, message, data);
  };

  // Toggle visibility
  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  return {
    // Visibility
    isVisible,
    toggleVisibility,
    
    // Measurement functions
    startRenderMeasurement,
    endRenderMeasurement,
    startUpdateMeasurement,
    endUpdateMeasurement,
    recordDrawCall,
    recordObjectCount,
    updateMetrics,
    
    // Profiling functions
    startProfile,
    endProfile,
    setMarker,
    logPerformance,
    
    // Current metrics
    metrics,
    
    // Monitor instances (for advanced usage)
    monitor: monitorRef.current,
    perfDebugger: perfDebuggerRef.current,
  };
}

// Higher-order component for automatic performance monitoring
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  function PerformanceMonitoredComponent(props: T) {
    const { startProfile, endProfile } = usePerformanceMonitor({ autoProfile: true });
    const name = componentName || Component.displayName || Component.name || 'Component';

    useEffect(() => {
      startProfile(`${name}-render`);
      return () => {
        endProfile(`${name}-render`);
      };
    });

    return React.createElement(Component, props);
  }
  
  return PerformanceMonitoredComponent;
}

// Hook for measuring function performance
export function usePerformanceMeasure() {
  const perfDebugger = useRef(PerformanceDebugger.getInstance());

  const measure = <T extends (...args: any[]) => any>(
    fn: T,
    name?: string
  ): T => {
    const functionName = name || fn.name || 'anonymous';
    
    return ((...args: Parameters<T>) => {
      perfDebugger.current.startProfile(functionName);
      try {
        const result = fn(...args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.finally(() => {
            perfDebugger.current.endProfile(functionName);
          });
        }
        
        perfDebugger.current.endProfile(functionName);
        return result;
      } catch (error) {
        perfDebugger.current.endProfile(functionName);
        perfDebugger.current.log('error', `Error in ${functionName}`, error);
        throw error;
      }
    }) as T;
  };

  return { measure };
}