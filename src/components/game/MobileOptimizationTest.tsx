'use client';

import { useState, useEffect } from 'react';
import { 
  mobileOptimization, 
  orientationManager, 
  fullscreenManager, 
  mobileUIScaler, 
  batteryOptimizer 
} from '@/utils/mobileOptimization';

/**
 * Test component for mobile optimization features
 * This component can be used to verify all mobile features work correctly
 */
export function MobileOptimizationTest() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: Record<string, boolean> = {};

    try {
      // Test 1: Orientation Manager
      console.log('Testing orientation manager...');
      const currentOrientation = orientationManager.getCurrentOrientation();
      results.orientationDetection = typeof currentOrientation === 'string';

      // Test 2: Fullscreen Manager
      console.log('Testing fullscreen manager...');
      const isFullscreenSupported = document.fullscreenEnabled || 
        !!(document as any).webkitFullscreenEnabled ||
        !!(document as any).msFullscreenEnabled ||
        !!(document as any).mozFullScreenEnabled;
      results.fullscreenSupport = isFullscreenSupported;

      // Test 3: UI Scaler
      console.log('Testing UI scaler...');
      const optimalScale = mobileUIScaler.calculateOptimalScale();
      results.uiScaling = typeof optimalScale === 'number' && optimalScale > 0;

      // Test 4: Battery Optimizer
      console.log('Testing battery optimizer...');
      await batteryOptimizer.initialize();
      const optimizationLevel = batteryOptimizer.getOptimizationLevel();
      results.batteryOptimization = typeof optimizationLevel === 'string';

      // Test 5: Mobile Optimization Manager
      console.log('Testing mobile optimization manager...');
      await mobileOptimization.initialize({
        batteryOptimization: true,
        uiScale: 1
      });
      const status = mobileOptimization.getStatus();
      results.mobileOptimizationManager = typeof status === 'object' && status !== null;

      // Test 6: Device Orientation Lock (if supported)
      console.log('Testing orientation lock...');
      if (screen.orientation && screen.orientation.lock) {
        results.orientationLock = true;
      } else {
        results.orientationLock = false; // Not supported, but not an error
      }

      console.log('All tests completed:', results);
    } catch (error) {
      console.error('Test failed:', error);
      results.error = false;
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getTestStatusIcon = (result: boolean | undefined) => {
    if (result === undefined) return '⏳';
    return result ? '✅' : '❌';
  };

  const getTestStatusText = (result: boolean | undefined) => {
    if (result === undefined) return 'Pending';
    return result ? 'Passed' : 'Failed';
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700 p-6 max-w-md">
      <h2 className="text-xl font-bold text-white mb-4">Mobile Optimization Test</h2>
      
      <button
        onClick={runTests}
        disabled={isRunning}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors mb-4 ${
          isRunning 
            ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isRunning ? 'Running Tests...' : 'Run Mobile Tests'}
      </button>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Orientation Detection:</span>
          <span className="flex items-center space-x-2">
            <span>{getTestStatusIcon(testResults.orientationDetection)}</span>
            <span className="text-white">{getTestStatusText(testResults.orientationDetection)}</span>
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300">Fullscreen Support:</span>
          <span className="flex items-center space-x-2">
            <span>{getTestStatusIcon(testResults.fullscreenSupport)}</span>
            <span className="text-white">{getTestStatusText(testResults.fullscreenSupport)}</span>
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300">UI Scaling:</span>
          <span className="flex items-center space-x-2">
            <span>{getTestStatusIcon(testResults.uiScaling)}</span>
            <span className="text-white">{getTestStatusText(testResults.uiScaling)}</span>
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300">Battery Optimization:</span>
          <span className="flex items-center space-x-2">
            <span>{getTestStatusIcon(testResults.batteryOptimization)}</span>
            <span className="text-white">{getTestStatusText(testResults.batteryOptimization)}</span>
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300">Optimization Manager:</span>
          <span className="flex items-center space-x-2">
            <span>{getTestStatusIcon(testResults.mobileOptimizationManager)}</span>
            <span className="text-white">{getTestStatusText(testResults.mobileOptimizationManager)}</span>
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300">Orientation Lock:</span>
          <span className="flex items-center space-x-2">
            <span>{getTestStatusIcon(testResults.orientationLock)}</span>
            <span className="text-white">
              {testResults.orientationLock === false ? 'Not Supported' : getTestStatusText(testResults.orientationLock)}
            </span>
          </span>
        </div>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <p>Tests completed. Check console for detailed logs.</p>
            {testResults.orientationLock === false && (
              <p className="mt-1 text-yellow-400">
                Note: Orientation lock requires HTTPS and modern browser support.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}