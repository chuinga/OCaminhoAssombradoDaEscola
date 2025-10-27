'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdvancedPerformanceMonitor, NetworkPerformanceMonitor, MemoryManager, PerformanceDebugger, type PerformanceMetrics } from '../../utils/performance';

interface PerformanceMonitorProps {
  isVisible: boolean;
  onToggle: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceMonitor({ 
  isVisible, 
  onToggle, 
  position = 'top-right' 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'memory' | 'network' | 'debug'>('overview');
  const performanceMonitorRef = useRef<AdvancedPerformanceMonitor | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!performanceMonitorRef.current) {
      performanceMonitorRef.current = new AdvancedPerformanceMonitor();
    }

    if (isVisible) {
      // Update metrics every 100ms when visible
      intervalRef.current = setInterval(() => {
        if (performanceMonitorRef.current) {
          const basicMetrics = performanceMonitorRef.current.update();
          const detailedMetrics = performanceMonitorRef.current.getDetailedMetrics();
          const networkMetrics = performanceMonitorRef.current.getNetworkMetrics();
          const memoryMetrics = performanceMonitorRef.current.getMemoryMetrics();
          
          setMetrics({
            basic: basicMetrics,
            detailed: detailedMetrics,
            network: networkMetrics,
            memory: memoryMetrics,
          });
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className={`fixed ${getPositionClasses(position)} z-50 bg-black/80 text-white px-2 py-1 rounded text-xs font-mono hover:bg-black/90 transition-colors`}
        title="Show Performance Monitor"
      >
        📊 FPS: {metrics?.basic?.fps?.toFixed(0) || '--'}
      </button>
    );
  }

  return (
    <div className={`fixed ${getPositionClasses(position)} z-50 bg-black/90 text-white rounded-lg shadow-lg max-w-md w-80`}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-600">
        <h3 className="text-sm font-bold">Performance Monitor</h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white transition-colors"
          title="Hide Performance Monitor"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        {(['overview', 'memory', 'network', 'debug'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 py-1 text-xs capitalize transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-2 max-h-80 overflow-y-auto">
        {activeTab === 'overview' && <OverviewTab metrics={metrics} />}
        {activeTab === 'memory' && <MemoryTab metrics={metrics} />}
        {activeTab === 'network' && <NetworkTab metrics={metrics} />}
        {activeTab === 'debug' && <DebugTab />}
      </div>
    </div>
  );
}

function OverviewTab({ metrics }: { metrics: any }) {
  if (!metrics) return <div className="text-gray-400">Loading...</div>;

  const { basic, detailed } = metrics;

  return (
    <div className="space-y-2 text-xs font-mono">
      {/* FPS Display */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-gray-400">FPS</div>
          <div className={`text-lg font-bold ${getFPSColor(basic.fps)}`}>
            {basic.fps?.toFixed(0) || '--'}
          </div>
          <div className="text-gray-500 text-xs">
            Avg: {detailed.fps?.average?.toFixed(0) || '--'}
          </div>
        </div>
        
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-gray-400">Frame Time</div>
          <div className="text-lg font-bold text-blue-400">
            {basic.frameTime?.toFixed(1) || '--'}ms
          </div>
          <div className="text-gray-500 text-xs">
            Target: 16.7ms
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-1">
        <MetricRow label="Render Time" value={`${basic.renderTime?.toFixed(2) || '--'}ms`} />
        <MetricRow label="Update Time" value={`${basic.updateTime?.toFixed(2) || '--'}ms`} />
        <MetricRow label="Draw Calls" value={basic.drawCalls?.toFixed(0) || '--'} />
        <MetricRow label="Active Objects" value={basic.activeObjects?.toString() || '--'} />
        {basic.cpuUsage && (
          <MetricRow 
            label="CPU Usage" 
            value={`${basic.cpuUsage.toFixed(1)}%`}
            color={basic.cpuUsage > 80 ? 'text-red-400' : basic.cpuUsage > 60 ? 'text-yellow-400' : 'text-green-400'}
          />
        )}
      </div>

      {/* FPS Chart (simplified) */}
      {detailed.fps?.history && (
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-gray-400 mb-1">FPS History</div>
          <div className="flex items-end h-8 gap-px">
            {detailed.fps.history.slice(-30).map((fps: number, i: number) => (
              <div
                key={i}
                className={`flex-1 ${getFPSColor(fps)} opacity-70`}
                style={{ height: `${Math.min(100, (fps / 60) * 100)}%` }}
                title={`${fps.toFixed(0)} FPS`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MemoryTab({ metrics }: { metrics: any }) {
  if (!metrics?.memory) return <div className="text-gray-400">Memory data unavailable</div>;

  const { memory } = metrics;

  return (
    <div className="space-y-2 text-xs font-mono">
      {/* Memory Overview */}
      <div className="bg-gray-800 p-2 rounded">
        <div className="text-gray-400 mb-2">JavaScript Heap</div>
        <MetricRow 
          label="Used" 
          value={`${memory.usedJSHeapSize?.toFixed(1) || '--'} MB`}
          color={getMemoryColor(memory.usedJSHeapSize, memory.jsHeapSizeLimit)}
        />
        <MetricRow label="Total" value={`${memory.totalJSHeapSize?.toFixed(1) || '--'} MB`} />
        <MetricRow label="Limit" value={`${memory.jsHeapSizeLimit?.toFixed(1) || '--'} MB`} />
      </div>

      {/* Asset Memory */}
      <div className="bg-gray-800 p-2 rounded">
        <div className="text-gray-400 mb-2">Asset Memory</div>
        <MetricRow label="Textures" value={`${memory.textureMemory?.toFixed(1) || '--'} MB`} />
        <MetricRow label="Audio" value={`${memory.audioMemory?.toFixed(1) || '--'} MB`} />
        <MetricRow label="Objects" value={memory.objectCount?.toString() || '--'} />
      </div>

      {/* Memory Actions */}
      <div className="space-y-1">
        <button
          onClick={() => MemoryManager.getInstance().forceGarbageCollection()}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
        >
          Force Cleanup
        </button>
        <button
          onClick={() => MemoryManager.getInstance().clearAll()}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs transition-colors"
        >
          Clear All Cache
        </button>
      </div>
    </div>
  );
}

function NetworkTab({ metrics }: { metrics: any }) {
  if (!metrics?.network) return <div className="text-gray-400">Network data unavailable</div>;

  const { network } = metrics;

  return (
    <div className="space-y-2 text-xs font-mono">
      {/* Connection Status */}
      <div className="bg-gray-800 p-2 rounded">
        <div className="text-gray-400 mb-2">Connection</div>
        <MetricRow 
          label="Status" 
          value={network.isOnline ? 'Online' : 'Offline'}
          color={network.isOnline ? 'text-green-400' : 'text-red-400'}
        />
        <MetricRow label="Type" value={network.connectionType || 'Unknown'} />
        <MetricRow label="Download" value={`${network.downloadSpeed?.toFixed(1) || '--'} Mbps`} />
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800 p-2 rounded">
        <div className="text-gray-400 mb-2">Performance</div>
        <MetricRow 
          label="Latency" 
          value={network.latency > 0 ? `${network.latency.toFixed(0)}ms` : '--'}
          color={getLatencyColor(network.latency)}
        />
        <MetricRow label="Avg Response" value={`${network.averageResponseTime?.toFixed(0) || '--'}ms`} />
        <MetricRow label="Requests" value={network.requestCount?.toString() || '--'} />
        <MetricRow 
          label="Failed" 
          value={network.failedRequests?.toString() || '--'}
          color={network.failedRequests > 0 ? 'text-red-400' : 'text-green-400'}
        />
      </div>
    </div>
  );
}

function DebugTab() {
  const [debugData, setDebugData] = useState<any>(null);
  const perfDebugger = PerformanceDebugger.getInstance();

  useEffect(() => {
    const interval = setInterval(() => {
      setDebugData({
        profiles: perfDebugger.getAllProfiles(),
        logs: perfDebugger.getLogs(undefined, 10),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [perfDebugger]);

  return (
    <div className="space-y-2 text-xs font-mono">
      {/* Profiles */}
      <div className="bg-gray-800 p-2 rounded">
        <div className="text-gray-400 mb-2">Active Profiles</div>
        {debugData?.profiles?.length > 0 ? (
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {debugData.profiles.slice(0, 5).map((profile: any) => (
              <div key={profile.name} className="flex justify-between">
                <span className="truncate">{profile.name}</span>
                <span className="text-yellow-400">{profile.average.toFixed(2)}ms</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No active profiles</div>
        )}
      </div>

      {/* Recent Logs */}
      <div className="bg-gray-800 p-2 rounded">
        <div className="text-gray-400 mb-2">Recent Logs</div>
        {debugData?.logs?.length > 0 ? (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {debugData.logs.map((log: any, i: number) => (
              <div key={i} className={`text-xs ${getLogColor(log.level)}`}>
                <span className="text-gray-500">[{log.timestamp.toFixed(0)}]</span> {log.message}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No recent logs</div>
        )}
      </div>

      {/* Debug Actions */}
      <div className="space-y-1">
        <button
          onClick={() => {
            const data = perfDebugger.exportPerformanceData();
            console.log('Performance Data:', data);
            // Could also download as JSON file
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
        >
          Export Debug Data
        </button>
        <button
          onClick={() => perfDebugger.clear()}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs transition-colors"
        >
          Clear Debug Data
        </button>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}:</span>
      <span className={color}>{value}</span>
    </div>
  );
}

function getPositionClasses(position: string): string {
  switch (position) {
    case 'top-left': return 'top-4 left-4';
    case 'top-right': return 'top-4 right-4';
    case 'bottom-left': return 'bottom-4 left-4';
    case 'bottom-right': return 'bottom-4 right-4';
    default: return 'top-4 right-4';
  }
}

function getFPSColor(fps: number): string {
  if (fps >= 55) return 'text-green-400';
  if (fps >= 30) return 'text-yellow-400';
  return 'text-red-400';
}

function getMemoryColor(used: number, limit: number): string {
  if (!used || !limit) return 'text-white';
  const percentage = (used / limit) * 100;
  if (percentage >= 80) return 'text-red-400';
  if (percentage >= 60) return 'text-yellow-400';
  return 'text-green-400';
}

function getLatencyColor(latency: number): string {
  if (latency < 0) return 'text-gray-400';
  if (latency <= 50) return 'text-green-400';
  if (latency <= 150) return 'text-yellow-400';
  return 'text-red-400';
}

function getLogColor(level: string): string {
  switch (level) {
    case 'error': return 'text-red-400';
    case 'warn': return 'text-yellow-400';
    case 'info': return 'text-blue-400';
    default: return 'text-white';
  }
}