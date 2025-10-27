import { usePerformanceStore, type GraphicsQuality } from '../performanceStore';

describe('Performance Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePerformanceStore.getState().resetToDefaults();
  });

  describe('Graphics Quality Settings', () => {
    it('should set graphics quality and apply preset', () => {
      const store = usePerformanceStore.getState();
      
      store.setGraphicsQuality('low');
      
      const updatedSettings = usePerformanceStore.getState().settings;
      expect(updatedSettings.graphicsQuality).toBe('low');
      expect(updatedSettings.particleEffects).toBe(false);
      expect(updatedSettings.animations).toBe(false);
      expect(updatedSettings.shadows).toBe(false);
      expect(updatedSettings.antialiasing).toBe(false);
      expect(updatedSettings.frameRateLimit).toBe(30);
    });

    it('should apply medium quality preset correctly', () => {
      const store = usePerformanceStore.getState();
      
      store.setGraphicsQuality('medium');
      
      const updatedSettings = usePerformanceStore.getState().settings;
      expect(updatedSettings.graphicsQuality).toBe('medium');
      expect(updatedSettings.particleEffects).toBe(true);
      expect(updatedSettings.animations).toBe(true);
      expect(updatedSettings.shadows).toBe(false);
      expect(updatedSettings.antialiasing).toBe(false);
      expect(updatedSettings.frameRateLimit).toBe(45);
    });

    it('should apply high quality preset correctly', () => {
      const store = usePerformanceStore.getState();
      
      store.setGraphicsQuality('high');
      
      const updatedSettings = usePerformanceStore.getState().settings;
      expect(updatedSettings.graphicsQuality).toBe('high');
      expect(updatedSettings.particleEffects).toBe(true);
      expect(updatedSettings.animations).toBe(true);
      expect(updatedSettings.shadows).toBe(true);
      expect(updatedSettings.antialiasing).toBe(true);
      expect(updatedSettings.frameRateLimit).toBe(60);
    });
  });

  describe('Lightweight Mode', () => {
    it('should enable lightweight mode and apply optimizations', () => {
      const { setLightweightMode, settings } = usePerformanceStore.getState();
      
      setLightweightMode(true);
      
      expect(settings.lightweightMode).toBe(true);
      expect(settings.particleEffects).toBe(false);
      expect(settings.shadows).toBe(false);
      expect(settings.antialiasing).toBe(false);
      expect(settings.frameRateLimit).toBe(30);
      expect(settings.graphicsQuality).toBe('low');
    });

    it('should disable lightweight mode', () => {
      const { setLightweightMode, settings } = usePerformanceStore.getState();
      
      // First enable it
      setLightweightMode(true);
      expect(settings.lightweightMode).toBe(true);
      
      // Then disable it
      setLightweightMode(false);
      expect(settings.lightweightMode).toBe(false);
    });
  });

  describe('Individual Settings', () => {
    it('should toggle particle effects', () => {
      const { setParticleEffects, settings } = usePerformanceStore.getState();
      
      setParticleEffects(false);
      expect(settings.particleEffects).toBe(false);
      
      setParticleEffects(true);
      expect(settings.particleEffects).toBe(true);
    });

    it('should toggle animations', () => {
      const { setAnimations, settings } = usePerformanceStore.getState();
      
      setAnimations(false);
      expect(settings.animations).toBe(false);
      
      setAnimations(true);
      expect(settings.animations).toBe(true);
    });

    it('should set frame rate limit', () => {
      const { setFrameRateLimit, settings } = usePerformanceStore.getState();
      
      setFrameRateLimit(30);
      expect(settings.frameRateLimit).toBe(30);
      
      setFrameRateLimit(0);
      expect(settings.frameRateLimit).toBe(0);
    });
  });

  describe('Auto Quality Adjustment', () => {
    it('should enable auto quality adjustment', () => {
      const { setAutoAdjustQuality, settings } = usePerformanceStore.getState();
      
      setAutoAdjustQuality(true);
      expect(settings.autoAdjustQuality).toBe(true);
      
      setAutoAdjustQuality(false);
      expect(settings.autoAdjustQuality).toBe(false);
    });

    it('should adjust quality based on performance when enabled', () => {
      const { 
        setAutoAdjustQuality, 
        updateMetrics, 
        adjustQualityBasedOnPerformance,
        settings 
      } = usePerformanceStore.getState();
      
      // Enable auto adjustment and set to high quality
      setAutoAdjustQuality(true);
      usePerformanceStore.getState().setGraphicsQuality('high');
      
      // Simulate low performance
      updateMetrics({
        currentFPS: 20,
        averageFPS: 20,
        frameTime: 50,
        isLowPerformance: true,
        lastAdjustment: 0,
      });
      
      // Trigger adjustment
      adjustQualityBasedOnPerformance();
      
      // Should reduce quality
      expect(settings.graphicsQuality).toBe('medium');
    });

    it('should not adjust quality when auto adjustment is disabled', () => {
      const { 
        setAutoAdjustQuality, 
        updateMetrics, 
        adjustQualityBasedOnPerformance,
        settings 
      } = usePerformanceStore.getState();
      
      // Disable auto adjustment and set to high quality
      setAutoAdjustQuality(false);
      usePerformanceStore.getState().setGraphicsQuality('high');
      
      // Simulate low performance
      updateMetrics({
        currentFPS: 20,
        averageFPS: 20,
        frameTime: 50,
        isLowPerformance: true,
        lastAdjustment: 0,
      });
      
      // Trigger adjustment
      adjustQualityBasedOnPerformance();
      
      // Should not change quality
      expect(settings.graphicsQuality).toBe('high');
    });
  });

  describe('Metrics Update', () => {
    it('should update performance metrics', () => {
      const { updateMetrics, metrics } = usePerformanceStore.getState();
      
      const newMetrics = {
        currentFPS: 45,
        averageFPS: 50,
        frameTime: 22,
        isLowPerformance: false,
        memoryUsage: 85,
      };
      
      updateMetrics(newMetrics);
      
      expect(metrics.currentFPS).toBe(45);
      expect(metrics.averageFPS).toBe(50);
      expect(metrics.frameTime).toBe(22);
      expect(metrics.isLowPerformance).toBe(false);
      expect(metrics.memoryUsage).toBe(85);
    });
  });

  describe('Reset to Defaults', () => {
    it('should reset all settings to defaults', () => {
      const { 
        setGraphicsQuality, 
        setLightweightMode, 
        setFrameRateLimit,
        resetToDefaults,
        settings 
      } = usePerformanceStore.getState();
      
      // Change some settings
      setGraphicsQuality('low');
      setLightweightMode(true);
      setFrameRateLimit(15);
      
      // Reset to defaults
      resetToDefaults();
      
      // Should be back to defaults
      expect(settings.graphicsQuality).toBe('high');
      expect(settings.lightweightMode).toBe(false);
      expect(settings.frameRateLimit).toBe(0);
      expect(settings.autoAdjustQuality).toBe(true);
      expect(settings.particleEffects).toBe(true);
      expect(settings.animations).toBe(true);
      expect(settings.shadows).toBe(true);
      expect(settings.antialiasing).toBe(true);
    });
  });
});