'use client';

import { useEffect, useState } from 'react';
import { PerformanceMonitor as PerfMonitor, PerformanceMetrics } from '@/utils/performance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  className?: string;
}

export function PerformanceMonitor({ enabled = false, className = '' }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isLowPerformance: false,
  });
  const [monitor] = useState(() => new PerfMonitor());

  useEffect(() => {
    if (!enabled) return;

    let animationId: number;

    const updateMetrics = () => {
      const newMetrics = monitor.update();
      setMetrics(newMetrics);
      animationId = requestAnimationFrame(updateMetrics);
    };

    animationId = requestAnimationFrame(updateMetrics);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enabled, monitor]);

  if (!enabled) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceStatus = () => {
    if (metrics.fps >= 50) return { text: 'Excelente', color: 'text-green-400' };
    if (metrics.fps >= 30) return { text: 'Bom', color: 'text-yellow-400' };
    if (metrics.fps >= 20) return { text: 'Baixo', color: 'text-orange-400' };
    return { text: 'Crítico', color: 'text-red-400' };
  };

  const status = getPerformanceStatus();

  return (
    <div className={`
      fixed top-4 left-4 z-50 
      bg-black/80 backdrop-blur-sm 
      rounded-lg p-3 
      text-white text-xs 
      font-mono
      border border-gray-600/50
      ${className}
    `}>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-300">FPS:</span>
          <span className={`font-bold ${getFPSColor(metrics.fps)}`}>
            {Math.round(metrics.fps)}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-300">Frame:</span>
          <span className="text-white">
            {metrics.frameTime.toFixed(1)}ms
          </span>
        </div>

        {metrics.memoryUsage && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-300">Memória:</span>
            <span className="text-white">
              {metrics.memoryUsage.toFixed(1)}MB
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-300">Status:</span>
          <span className={`font-bold ${status.color}`}>
            {status.text}
          </span>
        </div>

        {metrics.isLowPerformance && (
          <div className="mt-2 p-2 bg-red-900/50 rounded border border-red-500/50">
            <div className="text-red-300 text-center">
              ⚠️ Performance Baixa
            </div>
            <div className="text-red-200 text-center text-xs mt-1">
              Qualidade reduzida automaticamente
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Lightweight performance indicator for production
 */
export function PerformanceIndicator({ className = '' }: { className?: string }) {
  const [fps, setFps] = useState(60);
  const [monitor] = useState(() => new PerfMonitor());

  useEffect(() => {
    let animationId: number;
    let lastUpdate = 0;

    const updateFPS = (timestamp: number) => {
      // Update FPS every 500ms to avoid too frequent updates
      if (timestamp - lastUpdate >= 500) {
        const metrics = monitor.update();
        setFps(Math.round(metrics.fps));
        lastUpdate = timestamp;
      }
      animationId = requestAnimationFrame(updateFPS);
    };

    animationId = requestAnimationFrame(updateFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [monitor]);

  const getFPSColor = (fps: number) => {
    if (fps >= 50) return 'bg-green-500';
    if (fps >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50
      flex items-center gap-2
      bg-black/60 backdrop-blur-sm
      rounded-full px-3 py-1
      text-white text-xs font-mono
      ${className}
    `}>
      <div className={`w-2 h-2 rounded-full ${getFPSColor(fps)}`} />
      <span>{fps} FPS</span>
    </div>
  );
}