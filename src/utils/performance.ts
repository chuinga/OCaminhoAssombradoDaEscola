/**
 * Advanced performance monitoring and optimization utilities
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  isLowPerformance: boolean;
  // Advanced metrics
  cpuUsage?: number;
  networkLatency?: number;
  renderTime: number;
  updateTime: number;
  drawCalls: number;
  activeObjects: number;
}

export interface NetworkMetrics {
  latency: number;
  downloadSpeed: number;
  uploadSpeed: number;
  connectionType: string;
  isOnline: boolean;
  requestCount: number;
  failedRequests: number;
  averageResponseTime: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  textureMemory: number;
  audioMemory: number;
  objectCount: number;
}

export class AdvancedPerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private frameTime = 16.67;
  private fpsHistory: number[] = [];
  private readonly maxHistorySize = 300; // 5 seconds at 60fps
  
  // Advanced metrics
  private renderTimeHistory: number[] = [];
  private updateTimeHistory: number[] = [];
  private drawCallHistory: number[] = [];
  private objectCountHistory: number[] = [];
  private cpuUsageHistory: number[] = [];
  
  // Performance tracking
  private lastRenderTime = 0;
  private lastUpdateTime = 0;
  private currentDrawCalls = 0;
  private currentObjectCount = 0;
  
  // Network monitoring
  private networkMonitor: NetworkPerformanceMonitor;
  
  constructor() {
    this.lastTime = performance.now();
    this.networkMonitor = new NetworkPerformanceMonitor();
  }

  startRenderMeasurement(): void {
    this.lastRenderTime = performance.now();
  }

  endRenderMeasurement(): void {
    const renderTime = performance.now() - this.lastRenderTime;
    this.renderTimeHistory.push(renderTime);
    if (this.renderTimeHistory.length > this.maxHistorySize) {
      this.renderTimeHistory.shift();
    }
  }

  startUpdateMeasurement(): void {
    this.lastUpdateTime = performance.now();
  }

  endUpdateMeasurement(): void {
    const updateTime = performance.now() - this.lastUpdateTime;
    this.updateTimeHistory.push(updateTime);
    if (this.updateTimeHistory.length > this.maxHistorySize) {
      this.updateTimeHistory.shift();
    }
  }

  recordDrawCall(): void {
    this.currentDrawCalls++;
  }

  recordObjectCount(count: number): void {
    this.currentObjectCount = count;
  }

  update(): PerformanceMetrics {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameTime = deltaTime;
    this.frameCount++;
    
    // Calculate FPS every frame for more accurate readings
    if (deltaTime > 0) {
      const instantFps = 1000 / deltaTime;
      this.fpsHistory.push(instantFps);
      
      // Keep history size manageable
      if (this.fpsHistory.length > this.maxHistorySize) {
        this.fpsHistory.shift();
      }
      
      // Update FPS as rolling average
      this.fps = this.getAverageFPS();
    }
    
    // Record draw calls and object count
    this.drawCallHistory.push(this.currentDrawCalls);
    this.objectCountHistory.push(this.currentObjectCount);
    
    if (this.drawCallHistory.length > this.maxHistorySize) {
      this.drawCallHistory.shift();
    }
    if (this.objectCountHistory.length > this.maxHistorySize) {
      this.objectCountHistory.shift();
    }
    
    // Reset counters
    this.currentDrawCalls = 0;
    
    this.lastTime = currentTime;
    
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      memoryUsage: this.getMemoryUsage(),
      isLowPerformance: this.isLowPerformance(),
      cpuUsage: this.getCPUUsage(),
      networkLatency: this.networkMonitor.getLatency(),
      renderTime: this.getAverageRenderTime(),
      updateTime: this.getAverageUpdateTime(),
      drawCalls: this.getAverageDrawCalls(),
      activeObjects: this.currentObjectCount,
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

  private getCPUUsage(): number | undefined {
    // Estimate CPU usage based on frame time vs ideal frame time
    const idealFrameTime = 16.67; // 60 FPS
    if (this.frameTime > 0) {
      const cpuUsage = Math.min(100, (this.frameTime / idealFrameTime) * 100);
      this.cpuUsageHistory.push(cpuUsage);
      
      if (this.cpuUsageHistory.length > this.maxHistorySize) {
        this.cpuUsageHistory.shift();
      }
      
      return this.cpuUsageHistory.reduce((sum, usage) => sum + usage, 0) / this.cpuUsageHistory.length;
    }
    return undefined;
  }

  private isLowPerformance(): boolean {
    if (this.fpsHistory.length < 30) return false; // Need at least 30 samples
    
    const recentFps = this.fpsHistory.slice(-30);
    const averageFps = recentFps.reduce((sum, fps) => sum + fps, 0) / recentFps.length;
    
    return averageFps < 30; // Consider low performance if below 30 FPS
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
  }

  private getAverageRenderTime(): number {
    if (this.renderTimeHistory.length === 0) return 0;
    return this.renderTimeHistory.reduce((sum, time) => sum + time, 0) / this.renderTimeHistory.length;
  }

  private getAverageUpdateTime(): number {
    if (this.updateTimeHistory.length === 0) return 0;
    return this.updateTimeHistory.reduce((sum, time) => sum + time, 0) / this.updateTimeHistory.length;
  }

  private getAverageDrawCalls(): number {
    if (this.drawCallHistory.length === 0) return 0;
    return this.drawCallHistory.reduce((sum, calls) => sum + calls, 0) / this.drawCallHistory.length;
  }

  getDetailedMetrics() {
    return {
      fps: {
        current: this.fps,
        average: this.getAverageFPS(),
        min: Math.min(...this.fpsHistory.slice(-60)),
        max: Math.max(...this.fpsHistory.slice(-60)),
        history: this.fpsHistory.slice(-60),
      },
      frameTime: {
        current: this.frameTime,
        average: this.fpsHistory.length > 0 ? 1000 / this.getAverageFPS() : 16.67,
        history: this.fpsHistory.slice(-60).map(fps => 1000 / fps),
      },
      render: {
        averageTime: this.getAverageRenderTime(),
        history: this.renderTimeHistory.slice(-60),
      },
      update: {
        averageTime: this.getAverageUpdateTime(),
        history: this.updateTimeHistory.slice(-60),
      },
      drawCalls: {
        average: this.getAverageDrawCalls(),
        history: this.drawCallHistory.slice(-60),
      },
      objects: {
        current: this.currentObjectCount,
        history: this.objectCountHistory.slice(-60),
      },
    };
  }

  getNetworkMetrics(): NetworkMetrics {
    return this.networkMonitor.getMetrics();
  }

  getMemoryMetrics(): MemoryMetrics {
    return MemoryManager.getInstance().getMetrics();
  }

  reset(): void {
    this.fpsHistory = [];
    this.renderTimeHistory = [];
    this.updateTimeHistory = [];
    this.drawCallHistory = [];
    this.objectCountHistory = [];
    this.cpuUsageHistory = [];
    this.frameCount = 0;
    this.lastTime = performance.now();
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
 * Network performance monitoring
 */
export class NetworkPerformanceMonitor {
  private latencyHistory: number[] = [];
  private requestTimes = new Map<string, number>();
  private requestCount = 0;
  private failedRequests = 0;
  private responseTimeHistory: number[] = [];
  private readonly maxHistorySize = 100;

  constructor() {
    this.setupNetworkMonitoring();
  }

  private setupNetworkMonitoring(): void {
    // Monitor network connection changes
    if ('connection' in navigator && (navigator as any).connection) {
      const connection = (navigator as any).connection;
      if (typeof connection.addEventListener === 'function') {
        connection.addEventListener('change', () => {
          this.measureLatency();
        });
      }
    }

    // Monitor online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.measureLatency());
      window.addEventListener('offline', () => this.recordOffline());
    }
  }

  async measureLatency(): Promise<number> {
    try {
      const start = performance.now();
      
      // Use a small image or API endpoint for latency measurement
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const latency = performance.now() - start;
      
      if (response.ok) {
        this.latencyHistory.push(latency);
        if (this.latencyHistory.length > this.maxHistorySize) {
          this.latencyHistory.shift();
        }
        return latency;
      }
      
      return -1;
    } catch (error) {
      this.failedRequests++;
      return -1;
    }
  }

  recordRequest(url: string): string {
    const requestId = `${Date.now()}-${Math.random()}`;
    this.requestTimes.set(requestId, performance.now());
    this.requestCount++;
    return requestId;
  }

  recordResponse(requestId: string, success: boolean): void {
    const startTime = this.requestTimes.get(requestId);
    if (startTime !== undefined) {
      const responseTime = performance.now() - startTime;
      this.responseTimeHistory.push(responseTime);
      
      if (this.responseTimeHistory.length > this.maxHistorySize) {
        this.responseTimeHistory.shift();
      }
      
      if (!success) {
        this.failedRequests++;
      }
      
      this.requestTimes.delete(requestId);
    }
  }

  private recordOffline(): void {
    this.latencyHistory.push(-1); // -1 indicates offline
  }

  getLatency(): number {
    if (this.latencyHistory.length === 0) return 0;
    const validLatencies = this.latencyHistory.filter(l => l > 0);
    if (validLatencies.length === 0) return -1;
    return validLatencies.reduce((sum, l) => sum + l, 0) / validLatencies.length;
  }

  getMetrics(): NetworkMetrics {
    const connection = (navigator as any).connection;
    
    return {
      latency: this.getLatency(),
      downloadSpeed: connection?.downlink || 0,
      uploadSpeed: connection?.uplink || 0,
      connectionType: connection?.effectiveType || 'unknown',
      isOnline: navigator.onLine,
      requestCount: this.requestCount,
      failedRequests: this.failedRequests,
      averageResponseTime: this.responseTimeHistory.length > 0 
        ? this.responseTimeHistory.reduce((sum, time) => sum + time, 0) / this.responseTimeHistory.length 
        : 0,
    };
  }

  reset(): void {
    this.latencyHistory = [];
    this.requestTimes.clear();
    this.requestCount = 0;
    this.failedRequests = 0;
    this.responseTimeHistory = [];
  }
}

/**
 * Adaptive quality settings based on performance
 */
export class AdaptiveQuality {
  private performanceMonitor: AdvancedPerformanceMonitor;
  private currentQuality: 'low' | 'medium' | 'high' = 'high';
  private lastAdjustment = 0;
  private readonly adjustmentCooldown = 5000; // 5 seconds

  constructor() {
    this.performanceMonitor = new AdvancedPerformanceMonitor();
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
 * Enhanced memory management utilities with detailed tracking
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private textures = new Map<string, { data: any; size: number; lastAccessed: number }>();
  private sounds = new Map<string, { data: any; size: number; lastAccessed: number }>();
  private objects = new Map<string, any>();
  private maxTextureMemory = 50 * 1024 * 1024; // 50MB
  private maxAudioMemory = 20 * 1024 * 1024; // 20MB
  
  // Memory tracking
  private textureMemoryUsage = 0;
  private audioMemoryUsage = 0;
  private memoryHistory: number[] = [];
  private readonly maxHistorySize = 300;
  
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  cacheTexture(key: string, texture: any, estimatedSize?: number): void {
    const size = estimatedSize || this.estimateTextureSize(texture);
    const now = performance.now();
    
    // Remove old texture if it exists
    if (this.textures.has(key)) {
      const old = this.textures.get(key)!;
      this.textureMemoryUsage -= old.size;
    }
    
    this.textures.set(key, { data: texture, size, lastAccessed: now });
    this.textureMemoryUsage += size;
    
    this.checkMemoryUsage();
  }

  getTexture(key: string): any {
    const entry = this.textures.get(key);
    if (entry) {
      entry.lastAccessed = performance.now();
      return entry.data;
    }
    return undefined;
  }

  cacheSound(key: string, sound: any, estimatedSize?: number): void {
    const size = estimatedSize || this.estimateAudioSize(sound);
    const now = performance.now();
    
    // Remove old sound if it exists
    if (this.sounds.has(key)) {
      const old = this.sounds.get(key)!;
      this.audioMemoryUsage -= old.size;
    }
    
    this.sounds.set(key, { data: sound, size, lastAccessed: now });
    this.audioMemoryUsage += size;
    
    this.checkMemoryUsage();
  }

  getSound(key: string): any {
    const entry = this.sounds.get(key);
    if (entry) {
      entry.lastAccessed = performance.now();
      return entry.data;
    }
    return undefined;
  }

  trackObject(key: string, object: any): void {
    this.objects.set(key, object);
  }

  untrackObject(key: string): void {
    this.objects.delete(key);
  }

  private estimateTextureSize(texture: any): number {
    // Rough estimation based on texture properties
    if (texture && texture.width && texture.height) {
      return texture.width * texture.height * 4; // RGBA
    }
    return 1024; // Default estimate
  }

  private estimateAudioSize(sound: any): number {
    // Rough estimation for audio files
    if (sound && sound.duration) {
      return sound.duration * 44100 * 2 * 2; // 44.1kHz, stereo, 16-bit
    }
    return 1024 * 100; // Default estimate ~100KB
  }

  private checkMemoryUsage(): void {
    const memoryInfo = this.getMemoryInfo();
    
    // Record memory usage history
    this.memoryHistory.push(memoryInfo.usedJSHeapSize);
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }
    
    // Clear textures if over limit
    if (this.textureMemoryUsage > this.maxTextureMemory) {
      this.clearOldestTextures();
    }
    
    // Clear audio if over limit
    if (this.audioMemoryUsage > this.maxAudioMemory) {
      this.clearOldestAudio();
    }
  }

  private clearOldestTextures(): void {
    const entries = Array.from(this.textures.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    const toRemove = entries.slice(0, Math.ceil(entries.length * 0.3)); // Remove 30%
    
    toRemove.forEach(([key, entry]) => {
      if (entry.data && entry.data.destroy) {
        entry.data.destroy();
      }
      this.textures.delete(key);
      this.textureMemoryUsage -= entry.size;
    });
    
    console.log(`Memory: Cleared ${toRemove.length} textures (${(toRemove.reduce((sum, [, entry]) => sum + entry.size, 0) / 1024 / 1024).toFixed(2)}MB)`);
  }

  private clearOldestAudio(): void {
    const entries = Array.from(this.sounds.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    const toRemove = entries.slice(0, Math.ceil(entries.length * 0.3)); // Remove 30%
    
    toRemove.forEach(([key, entry]) => {
      if (entry.data && entry.data.destroy) {
        entry.data.destroy();
      }
      this.sounds.delete(key);
      this.audioMemoryUsage -= entry.size;
    });
    
    console.log(`Memory: Cleared ${toRemove.length} audio files (${(toRemove.reduce((sum, [, entry]) => sum + entry.size, 0) / 1024 / 1024).toFixed(2)}MB)`);
  }

  private getMemoryInfo() {
    // @ts-ignore
    if (performance.memory) {
      // @ts-ignore
      return performance.memory;
    }
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
    };
  }

  getMetrics(): MemoryMetrics {
    const memoryInfo = this.getMemoryInfo();
    
    return {
      usedJSHeapSize: memoryInfo.usedJSHeapSize / 1024 / 1024, // MB
      totalJSHeapSize: memoryInfo.totalJSHeapSize / 1024 / 1024, // MB
      jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit / 1024 / 1024, // MB
      textureMemory: this.textureMemoryUsage / 1024 / 1024, // MB
      audioMemory: this.audioMemoryUsage / 1024 / 1024, // MB
      objectCount: this.objects.size,
    };
  }

  getDetailedMetrics() {
    const metrics = this.getMetrics();
    
    return {
      ...metrics,
      textureCount: this.textures.size,
      audioCount: this.sounds.size,
      memoryHistory: this.memoryHistory.slice(-60).map(bytes => bytes / 1024 / 1024), // Last 60 samples in MB
      largestTextures: Array.from(this.textures.entries())
        .sort((a, b) => b[1].size - a[1].size)
        .slice(0, 10)
        .map(([key, entry]) => ({ key, size: entry.size / 1024 / 1024 })), // Top 10 in MB
      largestAudio: Array.from(this.sounds.entries())
        .sort((a, b) => b[1].size - a[1].size)
        .slice(0, 10)
        .map(([key, entry]) => ({ key, size: entry.size / 1024 / 1024 })), // Top 10 in MB
    };
  }

  clearAll(): void {
    this.textures.forEach(entry => {
      if (entry.data && entry.data.destroy) {
        entry.data.destroy();
      }
    });
    this.textures.clear();
    this.textureMemoryUsage = 0;
    
    this.sounds.forEach(entry => {
      if (entry.data && entry.data.destroy) {
        entry.data.destroy();
      }
    });
    this.sounds.clear();
    this.audioMemoryUsage = 0;
    
    this.objects.clear();
  }

  forceGarbageCollection(): void {
    // Clear least recently used items
    this.clearOldestTextures();
    this.clearOldestAudio();
    
    // Suggest garbage collection (if available)
    if ('gc' in window) {
      // @ts-ignore
      window.gc();
    }
  }
}

/**
 * Device capability detection
 */
export function getDeviceCapabilities() {
  let webGL = false;
  let webGL2 = false;
  let maxTextureSize = 2048;
  
  // Only try to create canvas in browser environment
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      
      webGL = !!gl;
      webGL2 = !!canvas.getContext('webgl2');
      maxTextureSize = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 2048;
    } catch (error) {
      // Canvas not supported or other error
      console.warn('Could not detect WebGL capabilities:', error);
    }
  }
  
  return {
    webGL,
    webGL2,
    maxTextureSize,
    // @ts-ignore
    deviceMemory: (typeof navigator !== 'undefined' && navigator.deviceMemory) || 4, // GB, fallback to 4GB
    hardwareConcurrency: (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4,
    // @ts-ignore
    connection: (typeof navigator !== 'undefined' && navigator.connection?.effectiveType) || 'unknown',
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

/**
 * Performance debugging and profiling utilities
 */
export class PerformanceDebugger {
  private static instance: PerformanceDebugger;
  private profiles = new Map<string, { start: number; samples: number[] }>();
  private markers = new Map<string, number>();
  private logs: Array<{ timestamp: number; level: string; message: string; data?: any }> = [];
  private readonly maxLogs = 1000;

  static getInstance(): PerformanceDebugger {
    if (!PerformanceDebugger.instance) {
      PerformanceDebugger.instance = new PerformanceDebugger();
    }
    return PerformanceDebugger.instance;
  }

  startProfile(name: string): void {
    this.profiles.set(name, { start: performance.now(), samples: [] });
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  endProfile(name: string): number {
    const profile = this.profiles.get(name);
    if (!profile) {
      console.warn(`Profile '${name}' not found`);
      return 0;
    }

    const duration = performance.now() - profile.start;
    profile.samples.push(duration);
    
    // Keep only last 100 samples
    if (profile.samples.length > 100) {
      profile.samples.shift();
    }

    if (typeof performance !== 'undefined') {
      if (performance.mark) {
        performance.mark(`${name}-end`);
      }
      if (performance.measure) {
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
    }

    return duration;
  }

  getProfileStats(name: string) {
    const profile = this.profiles.get(name);
    if (!profile || profile.samples.length === 0) {
      return null;
    }

    const samples = profile.samples;
    const sum = samples.reduce((a, b) => a + b, 0);
    const avg = sum / samples.length;
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    const median = samples.sort((a, b) => a - b)[Math.floor(samples.length / 2)];

    return {
      name,
      samples: samples.length,
      average: avg,
      min,
      max,
      median,
      total: sum,
      recent: samples.slice(-10), // Last 10 samples
    };
  }

  getAllProfiles() {
    const results: any[] = [];
    this.profiles.forEach((_, name) => {
      const stats = this.getProfileStats(name);
      if (stats) {
        results.push(stats);
      }
    });
    return results.sort((a, b) => b.average - a.average); // Sort by average time desc
  }

  setMarker(name: string): void {
    this.markers.set(name, performance.now());
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  getMarkerDuration(startMarker: string, endMarker?: string): number {
    const start = this.markers.get(startMarker);
    if (!start) return 0;

    const end = endMarker ? this.markers.get(endMarker) : performance.now();
    if (!end) return 0;

    return end - start;
  }

  log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logEntry = {
      timestamp: performance.now(),
      level,
      message,
      data,
    };

    this.logs.push(logEntry);

    // Keep logs manageable
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Also log to console with performance timestamp
    const timeStr = `[${logEntry.timestamp.toFixed(2)}ms]`;
    switch (level) {
      case 'info':
        console.log(`${timeStr} ${message}`, data || '');
        break;
      case 'warn':
        console.warn(`${timeStr} ${message}`, data || '');
        break;
      case 'error':
        console.error(`${timeStr} ${message}`, data || '');
        break;
    }
  }

  getLogs(level?: string, limit?: number) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  exportPerformanceData() {
    return {
      timestamp: Date.now(),
      profiles: this.getAllProfiles(),
      markers: Object.fromEntries(this.markers),
      logs: this.logs.slice(-100), // Last 100 logs
      browserInfo: {
        userAgent: navigator.userAgent,
        memory: (performance as any).memory ? {
          // @ts-ignore
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          // @ts-ignore
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          // @ts-ignore
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        } : null,
        connection: (navigator as any).connection ? {
          // @ts-ignore
          effectiveType: navigator.connection.effectiveType,
          // @ts-ignore
          downlink: navigator.connection.downlink,
        } : null,
      },
    };
  }

  clear(): void {
    this.profiles.clear();
    this.markers.clear();
    this.logs = [];
    
    // Only clear performance marks/measures if available
    if (typeof performance !== 'undefined') {
      if (performance.clearMarks) {
        performance.clearMarks();
      }
      if (performance.clearMeasures) {
        performance.clearMeasures();
      }
    }
  }
}

// Backward compatibility - keep the old PerformanceMonitor as an alias
export const PerformanceMonitor = AdvancedPerformanceMonitor;