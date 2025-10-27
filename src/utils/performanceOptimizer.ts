/**
 * Performance optimization utilities for low-end devices
 */

import { usePerformanceStore, type GraphicsQuality } from '@/store/performanceStore';
import { AdvancedPerformanceMonitor } from './performance';

export interface OptimizationSettings {
  // Graphics optimizations
  reduceParticleCount: boolean;
  disableAnimations: boolean;
  simplifyShaders: boolean;
  reduceShadowQuality: boolean;
  
  // Rendering optimizations
  skipFrames: boolean;
  reduceDrawCalls: boolean;
  cullOffscreenObjects: boolean;
  
  // Memory optimizations
  aggressiveGarbageCollection: boolean;
  textureCompression: boolean;
  audioCompression: boolean;
  
  // CPU optimizations
  reduceUpdateFrequency: boolean;
  simplifyPhysics: boolean;
  batchOperations: boolean;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private performanceMonitor: AdvancedPerformanceMonitor;
  private optimizationSettings: OptimizationSettings;
  private lastOptimizationCheck = 0;
  private readonly CHECK_INTERVAL = 2000; // Check every 2 seconds
  
  private constructor() {
    this.performanceMonitor = new AdvancedPerformanceMonitor();
    this.optimizationSettings = this.getDefaultOptimizationSettings();
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private getDefaultOptimizationSettings(): OptimizationSettings {
    return {
      reduceParticleCount: false,
      disableAnimations: false,
      simplifyShaders: false,
      reduceShadowQuality: false,
      skipFrames: false,
      reduceDrawCalls: false,
      cullOffscreenObjects: true,
      aggressiveGarbageCollection: false,
      textureCompression: false,
      audioCompression: false,
      reduceUpdateFrequency: false,
      simplifyPhysics: false,
      batchOperations: true,
    };
  }

  /**
   * Update performance metrics and apply optimizations if needed
   */
  update(): void {
    const metrics = this.performanceMonitor.update();
    const now = performance.now();
    
    // Update performance store with current metrics
    usePerformanceStore.getState().updateMetrics({
      currentFPS: metrics.fps,
      averageFPS: this.performanceMonitor.getAverageFPS(),
      frameTime: metrics.frameTime,
      isLowPerformance: metrics.isLowPerformance,
      memoryUsage: metrics.memoryUsage,
    });

    // Check if we should adjust quality automatically
    if (now - this.lastOptimizationCheck > this.CHECK_INTERVAL) {
      this.checkAndOptimize();
      this.lastOptimizationCheck = now;
    }
  }

  /**
   * Check performance and apply optimizations if needed
   */
  private checkAndOptimize(): void {
    const { settings, adjustQualityBasedOnPerformance } = usePerformanceStore.getState();
    
    if (settings.autoAdjustQuality) {
      adjustQualityBasedOnPerformance();
    }
    
    // Apply additional optimizations based on current performance
    const metrics = this.performanceMonitor.update();
    this.updateOptimizationSettings(metrics.isLowPerformance, settings.graphicsQuality);
  }

  /**
   * Update optimization settings based on performance and quality level
   */
  private updateOptimizationSettings(isLowPerformance: boolean, quality: GraphicsQuality): void {
    const newSettings = { ...this.optimizationSettings };
    
    if (quality === 'low' || isLowPerformance) {
      // Aggressive optimizations for low-end devices
      newSettings.reduceParticleCount = true;
      newSettings.disableAnimations = true;
      newSettings.simplifyShaders = true;
      newSettings.reduceShadowQuality = true;
      newSettings.skipFrames = isLowPerformance;
      newSettings.reduceDrawCalls = true;
      newSettings.aggressiveGarbageCollection = true;
      newSettings.textureCompression = true;
      newSettings.audioCompression = true;
      newSettings.reduceUpdateFrequency = isLowPerformance;
      newSettings.simplifyPhysics = true;
    } else if (quality === 'medium') {
      // Moderate optimizations
      newSettings.reduceParticleCount = false;
      newSettings.disableAnimations = false;
      newSettings.simplifyShaders = false;
      newSettings.reduceShadowQuality = true;
      newSettings.skipFrames = false;
      newSettings.reduceDrawCalls = true;
      newSettings.aggressiveGarbageCollection = false;
      newSettings.textureCompression = false;
      newSettings.audioCompression = false;
      newSettings.reduceUpdateFrequency = false;
      newSettings.simplifyPhysics = false;
    } else {
      // High quality - minimal optimizations
      newSettings.reduceParticleCount = false;
      newSettings.disableAnimations = false;
      newSettings.simplifyShaders = false;
      newSettings.reduceShadowQuality = false;
      newSettings.skipFrames = false;
      newSettings.reduceDrawCalls = false;
      newSettings.aggressiveGarbageCollection = false;
      newSettings.textureCompression = false;
      newSettings.audioCompression = false;
      newSettings.reduceUpdateFrequency = false;
      newSettings.simplifyPhysics = false;
    }
    
    this.optimizationSettings = newSettings;
  }

  /**
   * Get current optimization settings
   */
  getOptimizationSettings(): OptimizationSettings {
    return { ...this.optimizationSettings };
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.performanceMonitor.update();
  }

  /**
   * Get detailed performance metrics for debugging
   */
  getDetailedMetrics() {
    return this.performanceMonitor.getDetailedMetrics();
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection(): void {
    if (this.optimizationSettings.aggressiveGarbageCollection) {
      // Trigger garbage collection if available
      if ('gc' in window) {
        // @ts-ignore
        window.gc();
      }
      
      // Clear unused textures and audio
      this.clearUnusedAssets();
    }
  }

  /**
   * Clear unused assets to free memory
   */
  private clearUnusedAssets(): void {
    // This would be implemented to work with Phaser's asset management
    // For now, we'll just log that we're clearing assets
    console.log('Performance: Clearing unused assets');
  }

  /**
   * Get recommended settings for the current device
   */
  getRecommendedSettings(): {
    quality: GraphicsQuality;
    frameRateLimit: number;
    lightweightMode: boolean;
  } {
    const metrics = this.performanceMonitor.update();
    const avgFPS = this.performanceMonitor.getAverageFPS();
    
    // Determine recommended quality based on performance
    let quality: GraphicsQuality = 'high';
    let frameRateLimit = 0;
    let lightweightMode = false;
    
    if (avgFPS < 20) {
      quality = 'low';
      frameRateLimit = 30;
      lightweightMode = true;
    } else if (avgFPS < 40) {
      quality = 'low';
      frameRateLimit = 30;
    } else if (avgFPS < 50) {
      quality = 'medium';
      frameRateLimit = 45;
    }
    
    // Consider memory usage
    if (metrics.memoryUsage && metrics.memoryUsage > 100) { // > 100MB
      if (quality === 'high') quality = 'medium';
      if (frameRateLimit === 0) frameRateLimit = 45;
    }
    
    return { quality, frameRateLimit, lightweightMode };
  }

  /**
   * Apply emergency optimizations when performance is critically low
   */
  applyEmergencyOptimizations(): void {
    console.warn('Performance: Applying emergency optimizations');
    
    const { setGraphicsQuality, setFrameRateLimit, setLightweightMode } = usePerformanceStore.getState();
    
    // Force lowest settings
    setGraphicsQuality('low');
    setFrameRateLimit(15);
    setLightweightMode(true);
    
    // Force aggressive optimizations
    this.optimizationSettings = {
      ...this.optimizationSettings,
      reduceParticleCount: true,
      disableAnimations: true,
      simplifyShaders: true,
      reduceShadowQuality: true,
      skipFrames: true,
      reduceDrawCalls: true,
      aggressiveGarbageCollection: true,
      textureCompression: true,
      audioCompression: true,
      reduceUpdateFrequency: true,
      simplifyPhysics: true,
    };
    
    // Force garbage collection
    this.forceGarbageCollection();
  }

  /**
   * Reset optimizations to default state
   */
  resetOptimizations(): void {
    this.optimizationSettings = this.getDefaultOptimizationSettings();
    this.performanceMonitor.reset();
  }

  /**
   * Get optimization recommendations as text
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.performanceMonitor.update();
    const avgFPS = this.performanceMonitor.getAverageFPS();
    
    if (avgFPS < 30) {
      recommendations.push('Consider enabling Lightweight Mode for better performance');
      recommendations.push('Reduce graphics quality to Low');
      recommendations.push('Limit frame rate to 30 FPS to save battery');
    } else if (avgFPS < 45) {
      recommendations.push('Try Medium graphics quality for balanced performance');
      recommendations.push('Consider limiting frame rate to 45 FPS');
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage > 80) {
      recommendations.push('High memory usage detected - consider restarting the game');
      recommendations.push('Disable particle effects to reduce memory usage');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is good! You can try higher quality settings.');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

/**
 * Hook to use performance optimization in React components
 */
export function usePerformanceOptimization() {
  const { settings } = usePerformanceStore();
  const optimizationSettings = performanceOptimizer.getOptimizationSettings();
  
  return {
    settings,
    optimizationSettings,
    shouldReduceParticles: optimizationSettings.reduceParticleCount || !settings.particleEffects,
    shouldDisableAnimations: optimizationSettings.disableAnimations || !settings.animations,
    shouldSkipFrames: optimizationSettings.skipFrames,
    shouldReduceDrawCalls: optimizationSettings.reduceDrawCalls,
    shouldCullOffscreen: optimizationSettings.cullOffscreenObjects,
    shouldSimplifyPhysics: optimizationSettings.simplifyPhysics,
    effectiveFrameRate: settings.frameRateLimit || 60,
    isLightweightMode: settings.lightweightMode,
  };
}