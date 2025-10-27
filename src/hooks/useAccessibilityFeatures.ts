'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Hook for managing accessibility features
 * Handles the integration of accessibility settings with the DOM and game
 */
export const useAccessibilityFeatures = () => {
  const { display } = useSettingsStore();

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Apply accessibility classes to body
    const accessibilityClasses = [
      display.reducedMotion && 'reduced-motion',
      display.highContrast && 'high-contrast',
      display.colorBlindMode !== 'none' && `colorblind-${display.colorBlindMode}`,
      display.colorBlindFriendlyUI && 'colorblind-friendly-ui',
      !display.particleEffects && 'no-particles',
      !display.screenShake && 'no-screen-shake'
    ].filter(Boolean) as string[];

    // Remove old accessibility classes
    body.classList.remove(
      'reduced-motion',
      'high-contrast',
      'colorblind-protanopia',
      'colorblind-deuteranopia',
      'colorblind-tritanopia',
      'colorblind-friendly-ui',
      'no-particles',
      'no-screen-shake'
    );

    // Add new accessibility classes
    body.classList.add(...accessibilityClasses);

    // Apply respect motion preference class to html
    if (display.reducedMotion) {
      html.classList.add('respect-motion-preference');
    } else {
      html.classList.remove('respect-motion-preference');
    }

    // Set up audio subtitle events
    const handleAudioSubtitleToggle = () => {
      window.dispatchEvent(new CustomEvent('toggleSubtitles', {
        detail: { enabled: display.audioSubtitles }
      }));
    };

    // Set up visual indicator events
    const handleVisualIndicatorToggle = () => {
      window.dispatchEvent(new CustomEvent('toggleVisualIndicators', {
        detail: { enabled: display.visualAudioIndicators }
      }));
    };

    // Trigger initial events
    handleAudioSubtitleToggle();
    handleVisualIndicatorToggle();

    // Set up screen reader announcements for settings changes
    const announceSettingChange = (setting: string, enabled: boolean) => {
      window.dispatchEvent(new CustomEvent('screenReaderAnnounce', {
        detail: {
          message: `${setting} ${enabled ? 'ativado' : 'desativado'}`,
          priority: 'polite'
        }
      }));
    };

    // Announce important accessibility changes
    if (display.highContrast) {
      announceSettingChange('Modo alto contraste', true);
    }
    if (display.reducedMotion) {
      announceSettingChange('Redução de movimento', true);
    }
    if (display.audioSubtitles) {
      announceSettingChange('Legendas de áudio', true);
    }

    return () => {
      // Cleanup on unmount
      body.classList.remove(...accessibilityClasses);
      html.classList.remove('respect-motion-preference');
    };
  }, [
    display.reducedMotion,
    display.highContrast,
    display.colorBlindMode,
    display.colorBlindFriendlyUI,
    display.particleEffects,
    display.screenShake,
    display.audioSubtitles,
    display.visualAudioIndicators
  ]);

  // Utility functions for accessibility
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    window.dispatchEvent(new CustomEvent('screenReaderAnnounce', {
      detail: { message, priority }
    }));
  };

  const triggerVisualIndicator = (
    type: 'jump' | 'damage' | 'item_collect' | 'weapon_attack' | 'enemy_nearby' | 'low_health',
    options?: {
      position?: { x: number; y: number };
      intensity?: 'low' | 'medium' | 'high';
      weaponType?: string;
    }
  ) => {
    if (display.visualAudioIndicators) {
      window.dispatchEvent(new CustomEvent('visualIndicator', {
        detail: { type, ...options }
      }));
    }
  };

  const triggerAudioSubtitle = (
    type: 'jump' | 'damage' | 'item_collect' | 'weapon_attack' | 'background_music',
    weaponType?: string
  ) => {
    if (display.audioSubtitles) {
      window.dispatchEvent(new CustomEvent('audioEvent', {
        detail: { type, weaponType }
      }));
    }
  };

  const getAccessibilityStatus = () => {
    return {
      reducedMotion: display.reducedMotion,
      highContrast: display.highContrast,
      colorBlindMode: display.colorBlindMode,
      colorBlindFriendlyUI: display.colorBlindFriendlyUI,
      audioSubtitles: display.audioSubtitles,
      visualAudioIndicators: display.visualAudioIndicators,
      particleEffects: display.particleEffects,
      screenShake: display.screenShake
    };
  };

  return {
    announceToScreenReader,
    triggerVisualIndicator,
    triggerAudioSubtitle,
    getAccessibilityStatus,
    isReducedMotion: display.reducedMotion,
    isHighContrast: display.highContrast,
    isColorBlindFriendly: display.colorBlindFriendlyUI,
    hasAudioSubtitles: display.audioSubtitles,
    hasVisualIndicators: display.visualAudioIndicators
  };
};