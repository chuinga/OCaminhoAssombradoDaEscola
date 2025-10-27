'use client';

import { useState, useEffect } from 'react';
import { usePerformanceStore, type GraphicsQuality } from '@/store/performanceStore';
import { getDeviceCapabilities } from '@/utils/performance';

interface PerformanceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function PerformanceSettings({ isOpen, onClose, className = '' }: PerformanceSettingsProps) {
  const {
    settings,
    metrics,
    setGraphicsQuality,
    setAutoAdjustQuality,
    setParticleEffects,
    setAnimations,
    setShadows,
    setAntialiasing,
    setLightweightMode,
    setFrameRateLimit,
    applyQualityPreset,
    resetToDefaults,
  } = usePerformanceStore();

  const [deviceCapabilities, setDeviceCapabilities] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDeviceCapabilities(getDeviceCapabilities());
    }
  }, [isOpen]);

  const handleQualityChange = async (quality: GraphicsQuality) => {
    setIsApplying(true);
    try {
      setGraphicsQuality(quality);
      // Small delay to show the applying state
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsApplying(false);
    }
  };

  const handlePresetApply = async (quality: GraphicsQuality) => {
    setIsApplying(true);
    try {
      applyQualityPreset(quality);
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsApplying(false);
    }
  };

  const getPerformanceColor = (fps: number): string => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityColor = (quality: GraphicsQuality): string => {
    switch (quality) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
    }
  };

  const getDeviceRating = (): { rating: string; color: string; recommendation: GraphicsQuality } => {
    if (!deviceCapabilities) return { rating: 'Unknown', color: 'text-gray-400', recommendation: 'medium' };
    
    const { deviceMemory, hardwareConcurrency, webGL2, maxTextureSize } = deviceCapabilities;
    
    // Calculate device score
    let score = 0;
    if (deviceMemory >= 8) score += 3;
    else if (deviceMemory >= 4) score += 2;
    else score += 1;
    
    if (hardwareConcurrency >= 8) score += 3;
    else if (hardwareConcurrency >= 4) score += 2;
    else score += 1;
    
    if (webGL2) score += 2;
    else score += 1;
    
    if (maxTextureSize >= 4096) score += 2;
    else if (maxTextureSize >= 2048) score += 1;
    
    if (score >= 8) {
      return { rating: 'High-End', color: 'text-green-400', recommendation: 'high' };
    } else if (score >= 6) {
      return { rating: 'Mid-Range', color: 'text-yellow-400', recommendation: 'medium' };
    } else {
      return { rating: 'Low-End', color: 'text-red-400', recommendation: 'low' };
    }
  };

  if (!isOpen) return null;

  const deviceRating = getDeviceRating();

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Performance Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Performance Status */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Performance Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Current FPS:</span>
                  <span className={`font-medium ${getPerformanceColor(metrics.currentFPS)}`}>
                    {metrics.currentFPS.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Average FPS:</span>
                  <span className={`font-medium ${getPerformanceColor(metrics.averageFPS)}`}>
                    {metrics.averageFPS.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Frame Time:</span>
                  <span className="text-white font-medium">{metrics.frameTime.toFixed(2)}ms</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Quality:</span>
                  <span className={`font-medium ${getQualityColor(settings.graphicsQuality)}`}>
                    {settings.graphicsQuality.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Auto Adjust:</span>
                  <span className={`font-medium ${settings.autoAdjustQuality ? 'text-green-400' : 'text-gray-400'}`}>
                    {settings.autoAdjustQuality ? 'ON' : 'OFF'}
                  </span>
                </div>
                {metrics.memoryUsage && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Memory:</span>
                    <span className="text-white font-medium">{metrics.memoryUsage.toFixed(1)}MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Device Information */}
          {deviceCapabilities && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Device Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Device Rating:</span>
                    <span className={`font-medium ${deviceRating.color}`}>
                      {deviceRating.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Memory:</span>
                    <span className="text-white font-medium">{deviceCapabilities.deviceMemory}GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">CPU Cores:</span>
                    <span className="text-white font-medium">{deviceCapabilities.hardwareConcurrency}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">WebGL 2:</span>
                    <span className={`font-medium ${deviceCapabilities.webGL2 ? 'text-green-400' : 'text-red-400'}`}>
                      {deviceCapabilities.webGL2 ? 'Supported' : 'Not Supported'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Max Texture:</span>
                    <span className="text-white font-medium">{deviceCapabilities.maxTextureSize}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Recommended:</span>
                    <span className={`font-medium ${getQualityColor(deviceRating.recommendation)}`}>
                      {deviceRating.recommendation.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Graphics Quality Presets */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Graphics Quality</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as GraphicsQuality[]).map((quality) => (
                <button
                  key={quality}
                  onClick={() => handleQualityChange(quality)}
                  disabled={isApplying}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.graphicsQuality === quality
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  } ${isApplying ? 'opacity-50' : ''}`}
                >
                  <div className="text-center">
                    <div className={`font-medium ${getQualityColor(quality)}`}>
                      {quality.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {quality === 'low' && 'Best Performance'}
                      {quality === 'medium' && 'Balanced'}
                      {quality === 'high' && 'Best Quality'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Auto Quality Adjustment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Auto Quality Adjustment</h4>
                <p className="text-gray-400 text-sm">Automatically adjust quality based on performance</p>
              </div>
              <button
                onClick={() => setAutoAdjustQuality(!settings.autoAdjustQuality)}
                disabled={isApplying}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoAdjustQuality ? 'bg-blue-600' : 'bg-gray-600'
                } ${isApplying ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoAdjustQuality ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Individual Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Individual Settings</h3>
            
            {/* Particle Effects */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Particle Effects</h4>
                <p className="text-gray-400 text-sm">Visual effects like explosions and sparks</p>
              </div>
              <button
                onClick={() => setParticleEffects(!settings.particleEffects)}
                disabled={isApplying || settings.lightweightMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.particleEffects && !settings.lightweightMode ? 'bg-blue-600' : 'bg-gray-600'
                } ${(isApplying || settings.lightweightMode) ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.particleEffects && !settings.lightweightMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Animations</h4>
                <p className="text-gray-400 text-sm">Character and enemy animations</p>
              </div>
              <button
                onClick={() => setAnimations(!settings.animations)}
                disabled={isApplying || settings.lightweightMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.animations && !settings.lightweightMode ? 'bg-blue-600' : 'bg-gray-600'
                } ${(isApplying || settings.lightweightMode) ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.animations && !settings.lightweightMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Shadows */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Shadows</h4>
                <p className="text-gray-400 text-sm">Character and object shadows</p>
              </div>
              <button
                onClick={() => setShadows(!settings.shadows)}
                disabled={isApplying || settings.lightweightMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.shadows && !settings.lightweightMode ? 'bg-blue-600' : 'bg-gray-600'
                } ${(isApplying || settings.lightweightMode) ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.shadows && !settings.lightweightMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Antialiasing */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Antialiasing</h4>
                <p className="text-gray-400 text-sm">Smooth edges (requires restart)</p>
              </div>
              <button
                onClick={() => setAntialiasing(!settings.antialiasing)}
                disabled={isApplying || settings.lightweightMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.antialiasing && !settings.lightweightMode ? 'bg-blue-600' : 'bg-gray-600'
                } ${(isApplying || settings.lightweightMode) ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.antialiasing && !settings.lightweightMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Frame Rate Limit */}
          <div className="space-y-3">
            <div>
              <h4 className="text-white font-medium">Frame Rate Limit</h4>
              <p className="text-gray-400 text-sm">Limit FPS to save battery (0 = no limit)</p>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="60"
                step="15"
                value={settings.frameRateLimit}
                onChange={(e) => setFrameRateLimit(parseInt(e.target.value))}
                disabled={isApplying}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>No Limit</span>
                <span>15 FPS</span>
                <span>30 FPS</span>
                <span>45 FPS</span>
                <span>60 FPS</span>
              </div>
              <div className="text-center text-white font-medium">
                {settings.frameRateLimit === 0 ? 'No Limit' : `${settings.frameRateLimit} FPS`}
              </div>
            </div>
          </div>

          {/* Lightweight Mode */}
          <div className="space-y-3">
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-yellow-400 font-medium">Lightweight Mode</h4>
                  <p className="text-gray-400 text-sm">Optimized for older devices (overrides other settings)</p>
                </div>
                <button
                  onClick={() => setLightweightMode(!settings.lightweightMode)}
                  disabled={isApplying}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.lightweightMode ? 'bg-yellow-600' : 'bg-gray-600'
                  } ${isApplying ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.lightweightMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {settings.lightweightMode && (
                <div className="text-xs text-yellow-300">
                  ⚠️ Lightweight mode disables particles, animations, shadows, and antialiasing for maximum performance.
                </div>
              )}
            </div>
          </div>

          {/* Apply Status */}
          {isApplying && (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <span className="ml-2 text-gray-400 text-sm">Applying changes...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={resetToDefaults}
              disabled={isApplying}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            >
              Reset to Defaults
            </button>
            <div className="flex space-x-3">
              {deviceRating.recommendation !== settings.graphicsQuality && (
                <button
                  onClick={() => handlePresetApply(deviceRating.recommendation)}
                  disabled={isApplying}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Use Recommended
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
      `}</style>
    </div>
  );
}