'use client';

import { useState, useEffect } from 'react';
import { mobileOptimization, type MobileSettings, type BatteryInfo } from '@/utils/mobileOptimization';

interface MobileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function MobileSettings({ isOpen, onClose, className = '' }: MobileSettingsProps) {
  const [settings, setSettings] = useState<MobileSettings>({
    orientationLock: false,
    fullscreenMode: false,
    batteryOptimization: true,
    uiScale: 1
  });
  
  const [status, setStatus] = useState({
    orientation: 'unknown',
    isOrientationLocked: false,
    isFullscreen: false,
    uiScale: 1,
    batteryInfo: null as BatteryInfo | null,
    optimizationLevel: 'none'
  });

  const [isApplying, setIsApplying] = useState(false);

  // Load current settings and status
  useEffect(() => {
    if (isOpen) {
      const currentSettings = mobileOptimization.getSettings();
      const currentStatus = mobileOptimization.getStatus();
      setSettings(currentSettings);
      setStatus(currentStatus);
    }
  }, [isOpen]);

  // Update status periodically
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const currentStatus = mobileOptimization.getStatus();
      setStatus(currentStatus);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSettingChange = async (key: keyof MobileSettings, value: any) => {
    setIsApplying(true);
    
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      await mobileOptimization.updateSettings({ [key]: value });
      
      // Update status after applying changes
      setTimeout(() => {
        const updatedStatus = mobileOptimization.getStatus();
        setStatus(updatedStatus);
      }, 500);
    } catch (error) {
      console.error('Failed to apply mobile setting:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const formatBatteryLevel = (level: number): string => {
    return `${Math.round(level * 100)}%`;
  };

  const getBatteryColor = (level: number): string => {
    if (level > 0.5) return 'text-green-400';
    if (level > 0.2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getOptimizationLevelColor = (level: string): string => {
    switch (level) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Mobile Settings</h2>
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
          {/* Device Status */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Device Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Orientation:</span>
                <span className="text-white font-medium">
                  {status.orientation.replace('-', ' ').toUpperCase()}
                  {status.isOrientationLocked && (
                    <span className="ml-2 text-blue-400">🔒</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Fullscreen:</span>
                <span className={`font-medium ${status.isFullscreen ? 'text-green-400' : 'text-gray-400'}`}>
                  {status.isFullscreen ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">UI Scale:</span>
                <span className="text-white font-medium">{status.uiScale.toFixed(2)}x</span>
              </div>
              {status.batteryInfo && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Battery:</span>
                    <span className={`font-medium ${getBatteryColor(status.batteryInfo.level)}`}>
                      {formatBatteryLevel(status.batteryInfo.level)}
                      {status.batteryInfo.charging && (
                        <span className="ml-1 text-green-400">⚡</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Optimization:</span>
                    <span className={`font-medium ${getOptimizationLevelColor(status.optimizationLevel)}`}>
                      {status.optimizationLevel.toUpperCase()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Orientation Lock */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Landscape Lock</h4>
                <p className="text-gray-400 text-sm">Lock device to landscape mode for optimal gaming</p>
              </div>
              <button
                onClick={() => handleSettingChange('orientationLock', !settings.orientationLock)}
                disabled={isApplying}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.orientationLock ? 'bg-blue-600' : 'bg-gray-600'
                } ${isApplying ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.orientationLock ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Fullscreen Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Fullscreen Mode</h4>
                <p className="text-gray-400 text-sm">Hide browser UI for immersive gaming experience</p>
              </div>
              <button
                onClick={() => handleSettingChange('fullscreenMode', !settings.fullscreenMode)}
                disabled={isApplying}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.fullscreenMode ? 'bg-blue-600' : 'bg-gray-600'
                } ${isApplying ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.fullscreenMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* UI Scale */}
          <div className="space-y-3">
            <div>
              <h4 className="text-white font-medium">UI Scale</h4>
              <p className="text-gray-400 text-sm">Adjust interface size for your device</p>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={settings.uiScale}
                onChange={(e) => handleSettingChange('uiScale', parseFloat(e.target.value))}
                disabled={isApplying}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Small (0.7x)</span>
                <span>Normal (1.0x)</span>
                <span>Large (1.5x)</span>
              </div>
            </div>
          </div>

          {/* Battery Optimization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Battery Optimization</h4>
                <p className="text-gray-400 text-sm">Automatically adjust performance based on battery level</p>
              </div>
              <button
                onClick={() => handleSettingChange('batteryOptimization', !settings.batteryOptimization)}
                disabled={isApplying}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.batteryOptimization ? 'bg-blue-600' : 'bg-gray-600'
                } ${isApplying ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.batteryOptimization ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {settings.batteryOptimization && status.batteryInfo && (
              <div className="bg-gray-800/30 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Current Level:</span>
                  <span className={`font-medium ${getBatteryColor(status.batteryInfo.level)}`}>
                    {formatBatteryLevel(status.batteryInfo.level)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Optimization:</span>
                  <span className={`font-medium ${getOptimizationLevelColor(status.optimizationLevel)}`}>
                    {status.optimizationLevel.toUpperCase()}
                  </span>
                </div>
                {status.optimizationLevel !== 'none' && (
                  <p className="text-gray-400 text-xs mt-2">
                    Performance settings are automatically adjusted to preserve battery life.
                  </p>
                )}
              </div>
            )}
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
            <p className="text-gray-400 text-xs">
              Settings are applied immediately
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Done
            </button>
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