'use client';

import { useState, useEffect, useCallback } from 'react';

interface HapticSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
}

const DEFAULT_SETTINGS: HapticSettings = {
  enabled: true,
  intensity: 'medium'
};

const STORAGE_KEY = 'haptic-settings';

export function useHapticFeedback() {
  const [settings, setSettings] = useState<HapticSettings>(DEFAULT_SETTINGS);
  const [isSupported, setIsSupported] = useState(false);

  // Check if haptic feedback is supported
  useEffect(() => {
    const checkSupport = () => {
      // Check for vibration API support
      const hasVibration = 'vibrate' in navigator;
      
      // Check for device type (mobile/tablet)
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsSupported(hasVibration && (isMobile || hasTouch));
    };

    checkSupport();
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.warn('Failed to load haptic settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<HapticSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn('Failed to save haptic settings:', error);
    }
  }, [settings]);

  // Trigger haptic feedback
  const triggerHaptic = useCallback((intensity?: 'light' | 'medium' | 'heavy') => {
    if (!isSupported || !settings.enabled) return;

    const hapticIntensity = intensity || settings.intensity;
    
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      
      try {
        navigator.vibrate(patterns[hapticIntensity]);
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  }, [isSupported, settings]);

  // Trigger specific haptic patterns for different actions
  const triggerActionHaptic = useCallback((action: 'button-press' | 'gesture' | 'success' | 'error') => {
    if (!isSupported || !settings.enabled) return;

    const patterns = {
      'button-press': [15],
      'gesture': [10, 50, 10],
      'success': [20, 100, 20],
      'error': [50, 50, 50]
    };

    try {
      navigator.vibrate(patterns[action]);
    } catch (error) {
      console.warn('Action haptic feedback failed:', error);
    }
  }, [isSupported, settings]);

  return {
    settings,
    updateSettings,
    isSupported,
    triggerHaptic,
    triggerActionHaptic
  };
}