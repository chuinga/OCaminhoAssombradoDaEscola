/**
 * Performance optimization utilities for mobile and low-end devices
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  isLowPerformance: boolean;
}

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private frameTime = 16.67;
  private fpsHistory: number[] = [];
  private readonly maxHistorySize = 60; // 1 second at 60fps
  
  constructor() {
    this.lastTime = performance.now();
  }

  update(): PerformanceMetrics {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameTime = deltaTime;
    this.frameCount++;
    
    // Calculate FPS every second
    if (this.frameCount >= 60) {
      this.fps = 1000 / (deltaTime / this.frameCount);
      this.fpsHistory.push(this.fps);
      
      // Keep history size manageable
      if (this.fpsHistory.length > this.maxHistorySize) {
        this.fpsHistory.shift();
      }
      
      this.frameCount = 0;
    }
    
    this.lastTime = currentTime;
    
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      memoryUsage: this.getMemoryUsage(),
      isLowPerformance: this.isLowPerformance(),
    };
  }

  private getMemoryUsage(): number | undefined {
    // @ts-ignore - performance.memory is not in all browsers
    if (performance.memory) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return undefined;
  }

  private isLowPerformance(): boolean {
    if (this.fpsHistory.length < 10) return false;
    
    const recentFps = this.fpsHistory.slice(-10);
    const averageFps = recentFps.reduce((sum, fps) => sum + fps, 0) / recentFps.length;
    
    return averageFps < 30; // Consider low performance if below 30 FPS
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
  }
}

/**
 * Object pool for reusing game objects to reduce garbage collection
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize: number = 10,
    maxSize: number = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }

  getPoolSize(): number {
    return this.pool.length;
  }
}

/**
 * Adaptive quality settings based on performance
 */
export class AdaptiveQuality {
  private performanceMonitor: PerformanceMonitor;
  private currentQuality: 'low' | 'medium' | 'high' = 'high';
  private lastAdjustment = 0;
  private readonly adjustmentCooldown = 5000; // 5 seconds

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
  }

  update(): void {
    const metrics = this.performanceMonitor.update();
    const now = performance.now();
    
    // Only adjust quality every few seconds to avoid flickering
    if (now - this.lastAdjustment < this.adjustmentCooldown) {
      return;
    }
    
    const avgFps = this.performanceMonitor.getAverageFPS();
    
    // Adjust quality based on performance
    if (avgFps < 25 && this.currentQuality !== 'low') {
      this.currentQuality = 'low';
      this.lastAdjustment = now;
      console.log('Performance: Switching to low quality');
    } else if (avgFps < 45 && this.currentQuality === 'high') {
      this.currentQuality = 'medium';
      this.lastAdjustment = now;
      console.log('Performance: Switching to medium quality');
    } else if (avgFps > 55 && this.currentQuality !== 'high') {
      this.currentQuality = 'high';
      this.lastAdjustment = now;
      console.log('Performance: Switching to high quality');
    }
  }

  getQuality(): 'low' | 'medium' | 'high' {
    return this.currentQuality;
  }

  getMetrics(): PerformanceMetrics {
    return this.performanceMonitor.update();
  }

  getQualitySettings() {
    switch (this.currentQuality) {
      case 'low':
        return {
          particleCount: 10,
          shadowQuality: 'none',
          textureQuality: 'low',
          animationFPS: 30,
          enablePostProcessing: false,
        };
      case 'medium':
        return {
          particleCount: 25,
          shadowQuality: 'low',
          textureQuality: 'medium',
          animationFPS: 45,
          enablePostProcessing: false,
        };
      case 'high':
        return {
          particleCount: 50,
          shadowQuality: 'high',
          textureQuality: 'high',
          animationFPS: 60,
          enablePostProcessing: true,
        };
    }
  }
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private textures = new Map<string, any>();
  private sounds = new Map<string, any>();
  private maxTextureMemory = 50 * 1024 * 1024; // 50MB
  
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  cacheTexture(key: string, texture: any): void {
    this.textures.set(key, texture);
    this.checkMemoryUsage();
  }

  getTexture(key: string): any {
    return this.textures.get(key);
  }

  cacheSound(key: string, sound: any): void {
    this.sounds.set(key, sound);
  }

  getSound(key: string): any {
    return this.sounds.get(key);
  }

  private checkMemoryUsage(): void {
    // @ts-ignore
    if (performance.memory && performance.memory.usedJSHeapSize > this.maxTextureMemory) {
      this.clearOldestTextures();
    }
  }

  private clearOldestTextures(): void {
    // Simple LRU - remove first half of textures
    const keys = Array.from(this.textures.keys());
    const toRemove = keys.slice(0, Math.floor(keys.length / 2));
    
    toRemove.forEach(key => {
      const texture = this.textures.get(key);
      if (texture && texture.destroy) {
        texture.destroy();
      }
      this.textures.delete(key);
    });
    
    console.log(`Memory: Cleared ${toRemove.length} textures`);
  }

  clearAll(): void {
    this.textures.forEach(texture => {
      if (texture && texture.destroy) {
        texture.destroy();
      }
    });
    this.textures.clear();
    
    this.sounds.forEach(sound => {
      if (sound && sound.destroy) {
        sound.destroy();
      }
    });
    this.sounds.clear();
  }
}

/**
 * Device capability detection
 */
export function getDeviceCapabilities() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
  
  return {
    webGL: !!gl,
    webGL2: !!canvas.getContext('webgl2'),
    maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 2048,
    // @ts-ignore
    deviceMemory: navigator.deviceMemory || 4, // GB, fallback to 4GB
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    // @ts-ignore
    connection: navigator.connection?.effectiveType || 'unknown',
  };
}

/**
 * Throttle function calls for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = performance.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Debounce function calls for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}