'use client';

import { useEffect, useState } from 'react';
import { mobileOptimization, type MobileSettings, type BatteryInfo } from '@/utils/mobileOptimization';
import { useResponsive } from './useResponsive';

interface MobileOptimizationState {
  settings: MobileSettings;
  status: {
    orientation: string;
    isOrientationLocked: boolean;
    isFullscreen: boolean;
    uiScale: number;
    batteryInfo: BatteryInfo | null;
    optimizationLevel: string;
  };
  isInitialized: boolean;
}

export function useMobileOptimization() {
  const { isMobile, isTablet } = useResponsive();
  const shouldOptimize = isMobile || isTablet;

  const [state, setState] = useState<MobileOptimizationState>({
    settings: {
      orientationLock: false,
      fullscreenMode: false,
      batteryOptimization: true,
      uiScale: 1
    },
    status: {
      orientation: 'unknown',
      isOrientationLocked: false,
      isFullscreen: false,
      uiScale: 1,
      batteryInfo: null,
      optimizationLevel: 'none'
    },
    isInitialized: false
  });

  // Initialize mobile optimization
  useEffect(() => {
    if (!shouldOptimize) return;

    const initializeOptimization = async () => {
      try {
        await mobileOptimization.initialize({
          batteryOptimization: true,
          uiScale: 1
        });

        const settings = mobileOptimization.getSettings();
        const status = mobileOptimization.getStatus();

        setState(prev => ({
          ...prev,
          settings,
          status,
          isInitialized: true
        }));

        console.log('Mobile optimization initialized');
      } catch (error) {
        console.error('Failed to initialize mobile optimization:', error);
      }
    };

    initializeOptimization();
  }, [shouldOptimize]);

  // Update status periodically
  useEffect(() => {
    if (!shouldOptimize || !state.isInitialized) return;

    const updateStatus = () => {
      const status = mobileOptimization.getStatus();
      setState(prev => ({
        ...prev,
        status
      }));
    };

    // Update immediately
    updateStatus();

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => clearInterval(interval);
  }, [shouldOptimize, state.isInitialized]);

  // Update settings function
  const updateSettings = async (newSettings: Partial<MobileSettings>) => {
    if (!shouldOptimize) return;

    try {
      await mobileOptimization.updateSettings(newSettings);
      
      const updatedSettings = mobileOptimization.getSettings();
      const updatedStatus = mobileOptimization.getStatus();

      setState(prev => ({
        ...prev,
        settings: updatedSettings,
        status: updatedStatus
      }));
    } catch (error) {
      console.error('Failed to update mobile settings:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (shouldOptimize && state.isInitialized) {
        mobileOptimization.cleanup();
      }
    };
  }, [shouldOptimize, state.isInitialized]);

  return {
    ...state,
    updateSettings,
    shouldOptimize,
    // Convenience methods
    toggleOrientationLock: () => updateSettings({ orientationLock: !state.settings.orientationLock }),
    toggleFullscreen: () => updateSettings({ fullscreenMode: !state.settings.fullscreenMode }),
    toggleBatteryOptimization: () => updateSettings({ batteryOptimization: !state.settings.batteryOptimization }),
    setUIScale: (scale: number) => updateSettings({ uiScale: scale }),
  };
}