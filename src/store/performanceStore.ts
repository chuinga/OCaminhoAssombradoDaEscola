import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface PerformanceSettings {
  // Graphics quality settings
  graphicsQuality: GraphicsQuality;
  autoAdjustQuality: boolean;
  
  // Specific graphics options
  particleEffects: boolean;
  animations: boolean;
  shadows: boolean;
  antialiasing: boolean;
  
  // Performance thresholds
  targetFPS: number;
  lowPerformanceThreshold: number; // FPS below which quality is reduced
  highPerformanceThreshold: number; // FPS above which quality can be increased
  
  // Lightweight mode for older devices
  lightweightMode: boolean;
  
  // Frame rate limiting
  frameRateLimit: number; // 0 = no limit, otherwise limit to this FPS
}

export interface PerformanceMetrics {
  currentFPS: number;
  averageFPS: number;
  frameTime: number;
  isLowPerformance: boolean;
  memoryUsage?: number;
  lastAdjustment: number;
}

interface PerformanceState {
  settings: PerformanceSettings;
  metrics: PerformanceMetrics;
  
  // Actions
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  setAutoAdjustQuality: (enabled: boolean) => void;
  setParticleEffects: (enabled: boolean) => void;
  setAnimations: (enabled: boolean) => void;
  setShadows: (enabled: boolean) => void;
  setAntialiasing: (enabled: boolean) => void;
  setLightweightMode: (enabled: boolean) => void;
  setFrameRateLimit: (limit: number) => void;
  
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  applyQualityPreset: (quality: GraphicsQuality) => void;
  resetToDefaults: () => void;
  
  // Dynamic adjustment
  adjustQualityBasedOnPerformance: () => void;
}

const defaultSettings: PerformanceSettings = {
  graphicsQuality: 'high',
  autoAdjustQuality: true,
  particleEffects: true,
  animations: true,
  shadows: true,
  antialiasing: true,
  targetFPS: 60,
  lowPerformanceThreshold: 30,
  highPerformanceThreshold: 55,
  lightweightMode: false,
  frameRateLimit: 0,
};

const defaultMetrics: PerformanceMetrics = {
  currentFPS: 60,
  averageFPS: 60,
  frameTime: 16.67,
  isLowPerformance: false,
  lastAdjustment: 0,
};

export const usePerformanceStore = create<PerformanceState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      metrics: defaultMetrics,

      setGraphicsQuality: (quality: GraphicsQuality) =>
        set((state) => {
          const newState = { ...state };
          newState.settings.graphicsQuality = quality;
          // Apply quality preset
          const qualitySettings = getQualityPreset(quality);
          Object.assign(newState.settings, qualitySettings);
          return newState;
        }),

      setAutoAdjustQuality: (enabled: boolean) =>
        set((state) => ({
          settings: { ...state.settings, autoAdjustQuality: enabled }
        })),

      setParticleEffects: (enabled: boolean) =>
        set((state) => ({
          settings: { ...state.settings, particleEffects: enabled }
        })),

      setAnimations: (enabled: boolean) =>
        set((state) => ({
          settings: { ...state.settings, animations: enabled }
        })),

      setShadows: (enabled: boolean) =>
        set((state) => ({
          settings: { ...state.settings, shadows: enabled }
        })),

      setAntialiasing: (enabled: boolean) =>
        set((state) => ({
          settings: { ...state.settings, antialiasing: enabled }
        })),

      setLightweightMode: (enabled: boolean) =>
        set((state) => {
          const newSettings = { ...state.settings, lightweightMode: enabled };
          
          if (enabled) {
            // Apply lightweight optimizations
            newSettings.particleEffects = false;
            newSettings.shadows = false;
            newSettings.antialiasing = false;
            newSettings.frameRateLimit = 30;
            newSettings.graphicsQuality = 'low';
          }
          
          return { settings: newSettings };
        }),

      setFrameRateLimit: (limit: number) =>
        set((state) => ({
          settings: { ...state.settings, frameRateLimit: limit }
        })),

      updateMetrics: (newMetrics: Partial<PerformanceMetrics>) =>
        set((state) => ({
          metrics: { ...state.metrics, ...newMetrics }
        })),

      applyQualityPreset: (quality: GraphicsQuality) =>
        set((state) => {
          const qualitySettings = getQualityPreset(quality);
          return {
            settings: { ...state.settings, ...qualitySettings, graphicsQuality: quality }
          };
        }),

      resetToDefaults: () =>
        set({
          settings: { ...defaultSettings },
          metrics: { ...defaultMetrics }
        }),

      adjustQualityBasedOnPerformance: () => {
        const state = get();
        const { settings, metrics } = state;
        
        if (!settings.autoAdjustQuality) return;
        
        const now = Date.now();
        const timeSinceLastAdjustment = now - metrics.lastAdjustment;
        
        // Only adjust every 5 seconds to avoid flickering
        if (timeSinceLastAdjustment < 5000) return;
        
        const currentQuality = settings.graphicsQuality;
        let newQuality = currentQuality;
        
        // Reduce quality if performance is low
        if (metrics.averageFPS < settings.lowPerformanceThreshold) {
          if (currentQuality === 'high') {
            newQuality = 'medium';
          } else if (currentQuality === 'medium') {
            newQuality = 'low';
          }
        }
        // Increase quality if performance is good
        else if (metrics.averageFPS > settings.highPerformanceThreshold) {
          if (currentQuality === 'low') {
            newQuality = 'medium';
          } else if (currentQuality === 'medium') {
            newQuality = 'high';
          }
        }
        
        if (newQuality !== currentQuality) {
          console.log(`Performance: Auto-adjusting quality from ${currentQuality} to ${newQuality} (FPS: ${metrics.averageFPS.toFixed(1)})`);
          
          set((state) => {
            const qualitySettings = getQualityPreset(newQuality);
            return {
              settings: { ...state.settings, ...qualitySettings, graphicsQuality: newQuality },
              metrics: { ...state.metrics, lastAdjustment: now }
            };
          });
        }
      },
    }),
    {
      name: 'performance-settings',
      partialize: (state) => ({ settings: state.settings }), // Only persist settings, not metrics
    }
  )
);

/**
 * Get quality preset settings for a given quality level
 */
function getQualityPreset(quality: GraphicsQuality): Partial<PerformanceSettings> {
  switch (quality) {
    case 'low':
      return {
        particleEffects: false,
        animations: false,
        shadows: false,
        antialiasing: false,
        frameRateLimit: 30,
      };
    case 'medium':
      return {
        particleEffects: true,
        animations: true,
        shadows: false,
        antialiasing: false,
        frameRateLimit: 45,
      };
    case 'high':
      return {
        particleEffects: true,
        animations: true,
        shadows: true,
        antialiasing: true,
        frameRateLimit: 60,
      };
  }
}

/**
 * Hook to get current performance settings for game components
 */
export function usePerformanceSettings() {
  const settings = usePerformanceStore((state) => state.settings);
  const metrics = usePerformanceStore((state) => state.metrics);
  
  return {
    settings,
    metrics,
    isLowPerformance: metrics.isLowPerformance,
    shouldDisableParticles: !settings.particleEffects || settings.lightweightMode,
    shouldDisableAnimations: !settings.animations || settings.lightweightMode,
    shouldDisableShadows: !settings.shadows || settings.lightweightMode,
    shouldDisableAntialiasing: !settings.antialiasing || settings.lightweightMode,
    effectiveFrameRate: settings.frameRateLimit || 60,
  };
}