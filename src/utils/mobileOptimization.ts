'use client';

/**
 * Mobile-specific optimization utilities
 * Handles device orientation lock, fullscreen mode, UI scaling, and battery optimization
 */

export interface MobileSettings {
  orientationLock: boolean;
  fullscreenMode: boolean;
  batteryOptimization: boolean;
  uiScale: number;
}

export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

/**
 * Device orientation management
 */
export class OrientationManager {
  private static instance: OrientationManager;
  private isLocked = false;
  private preferredOrientation: string = 'landscape-primary';

  static getInstance(): OrientationManager {
    if (!OrientationManager.instance) {
      OrientationManager.instance = new OrientationManager();
    }
    return OrientationManager.instance;
  }

  /**
   * Lock device to landscape orientation for optimal gaming experience
   */
  async lockToLandscape(): Promise<boolean> {
    try {
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape-primary');
        this.isLocked = true;
        this.preferredOrientation = 'landscape-primary';
        console.log('Orientation locked to landscape');
        return true;
      }
    } catch (error) {
      console.warn('Orientation lock not supported or failed:', error);
    }
    return false;
  }

  /**
   * Unlock orientation to allow natural device rotation
   */
  async unlock(): Promise<void> {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
        this.isLocked = false;
        console.log('Orientation unlocked');
      }
    } catch (error) {
      console.warn('Orientation unlock failed:', error);
    }
  }

  /**
   * Check if orientation is currently locked
   */
  isOrientationLocked(): boolean {
    return this.isLocked;
  }

  /**
   * Get current orientation
   */
  getCurrentOrientation(): string {
    if (screen.orientation) {
      return screen.orientation.type;
    }
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  /**
   * Add orientation change listener
   */
  onOrientationChange(callback: (orientation: string) => void): () => void {
    const handler = () => {
      callback(this.getCurrentOrientation());
    };

    if (screen.orientation) {
      screen.orientation.addEventListener('change', handler);
      return () => screen.orientation.removeEventListener('change', handler);
    } else {
      window.addEventListener('orientationchange', handler);
      return () => window.removeEventListener('orientationchange', handler);
    }
  }
}

/**
 * Fullscreen mode management
 */
export class FullscreenManager {
  private static instance: FullscreenManager;
  private isFullscreen = false;

  static getInstance(): FullscreenManager {
    if (!FullscreenManager.instance) {
      FullscreenManager.instance = new FullscreenManager();
    }
    return FullscreenManager.instance;
  }

  /**
   * Enter fullscreen mode
   */
  async enterFullscreen(element?: HTMLElement): Promise<boolean> {
    try {
      const targetElement = element || document.documentElement;
      
      if (targetElement.requestFullscreen) {
        await targetElement.requestFullscreen();
      } else if ((targetElement as any).webkitRequestFullscreen) {
        await (targetElement as any).webkitRequestFullscreen();
      } else if ((targetElement as any).msRequestFullscreen) {
        await (targetElement as any).msRequestFullscreen();
      } else if ((targetElement as any).mozRequestFullScreen) {
        await (targetElement as any).mozRequestFullScreen();
      }
      
      this.isFullscreen = true;
      console.log('Entered fullscreen mode');
      return true;
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
      return false;
    }
  }

  /**
   * Exit fullscreen mode
   */
  async exitFullscreen(): Promise<void> {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      }
      
      this.isFullscreen = false;
      console.log('Exited fullscreen mode');
    } catch (error) {
      console.warn('Exit fullscreen failed:', error);
    }
  }

  /**
   * Toggle fullscreen mode
   */
  async toggleFullscreen(element?: HTMLElement): Promise<boolean> {
    if (this.isInFullscreen()) {
      await this.exitFullscreen();
      return false;
    } else {
      return await this.enterFullscreen(element);
    }
  }

  /**
   * Check if currently in fullscreen
   */
  isInFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement ||
      (document as any).mozFullScreenElement
    );
  }

  /**
   * Add fullscreen change listener
   */
  onFullscreenChange(callback: (isFullscreen: boolean) => void): () => void {
    const handler = () => {
      const isFullscreen = this.isInFullscreen();
      this.isFullscreen = isFullscreen;
      callback(isFullscreen);
    };

    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    document.addEventListener('msfullscreenchange', handler);
    document.addEventListener('mozfullscreenchange', handler);

    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
      document.removeEventListener('msfullscreenchange', handler);
      document.removeEventListener('mozfullscreenchange', handler);
    };
  }
}

/**
 * Mobile UI scaling optimization
 */
export class MobileUIScaler {
  private static instance: MobileUIScaler;
  private currentScale = 1;
  private baseViewportWidth = 375; // iPhone base width
  private maxScale = 1.5;
  private minScale = 0.7;

  static getInstance(): MobileUIScaler {
    if (!MobileUIScaler.instance) {
      MobileUIScaler.instance = new MobileUIScaler();
    }
    return MobileUIScaler.instance;
  }

  /**
   * Calculate optimal UI scale based on device characteristics
   */
  calculateOptimalScale(): number {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1
    };

    // Base scale calculation
    let scale = viewport.width / this.baseViewportWidth;

    // Adjust for pixel density
    if (viewport.pixelRatio > 2) {
      scale *= 0.9; // Slightly smaller on high-DPI displays
    }

    // Adjust for very small or large screens
    if (viewport.width < 320) {
      scale *= 0.8; // Smaller UI on very small screens
    } else if (viewport.width > 768) {
      scale *= 1.1; // Slightly larger UI on tablets
    }

    // Clamp to reasonable bounds
    return Math.max(this.minScale, Math.min(this.maxScale, scale));
  }

  /**
   * Apply UI scaling to the document
   */
  applyScale(scale?: number): void {
    const targetScale = scale || this.calculateOptimalScale();
    this.currentScale = targetScale;

    // Apply CSS custom property for UI scaling
    document.documentElement.style.setProperty('--mobile-ui-scale', targetScale.toString());
    
    // Apply to specific UI elements
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.style.transform = `scale(${targetScale})`;
      gameContainer.style.transformOrigin = 'center center';
    }

    console.log(`Applied mobile UI scale: ${targetScale.toFixed(2)}`);
  }

  /**
   * Get current UI scale
   */
  getCurrentScale(): number {
    return this.currentScale;
  }

  /**
   * Reset UI scale to default
   */
  resetScale(): void {
    this.applyScale(1);
  }
}

/**
 * Battery usage optimization
 */
export class BatteryOptimizer {
  private static instance: BatteryOptimizer;
  private batteryInfo: BatteryInfo | null = null;
  private optimizationLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
  private updateInterval: NodeJS.Timeout | null = null;

  static getInstance(): BatteryOptimizer {
    if (!BatteryOptimizer.instance) {
      BatteryOptimizer.instance = new BatteryOptimizer();
    }
    return BatteryOptimizer.instance;
  }

  /**
   * Initialize battery monitoring
   */
  async initialize(): Promise<void> {
    try {
      // @ts-ignore - Battery API is experimental
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        this.batteryInfo = {
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };

        // Set up battery event listeners
        battery.addEventListener('levelchange', () => this.updateBatteryInfo(battery));
        battery.addEventListener('chargingchange', () => this.updateBatteryInfo(battery));

        this.determineOptimizationLevel();
        console.log('Battery optimization initialized');
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
  }

  /**
   * Update battery information
   */
  private updateBatteryInfo(battery: any): void {
    this.batteryInfo = {
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime
    };
    this.determineOptimizationLevel();
  }

  /**
   * Determine optimization level based on battery status
   */
  private determineOptimizationLevel(): void {
    if (!this.batteryInfo) return;

    const { level, charging } = this.batteryInfo;

    if (charging) {
      this.optimizationLevel = 'none';
    } else if (level < 0.15) {
      this.optimizationLevel = 'high';
    } else if (level < 0.30) {
      this.optimizationLevel = 'medium';
    } else if (level < 0.50) {
      this.optimizationLevel = 'low';
    } else {
      this.optimizationLevel = 'none';
    }

    console.log(`Battery optimization level: ${this.optimizationLevel} (${Math.round(level * 100)}%)`);
  }

  /**
   * Get current battery information
   */
  getBatteryInfo(): BatteryInfo | null {
    return this.batteryInfo;
  }

  /**
   * Get current optimization level
   */
  getOptimizationLevel(): 'none' | 'low' | 'medium' | 'high' {
    return this.optimizationLevel;
  }

  /**
   * Get optimization settings based on current level
   */
  getOptimizationSettings(): {
    frameRate: number;
    particleCount: number;
    shadowQuality: 'none' | 'low' | 'medium' | 'high';
    audioEnabled: boolean;
    hapticEnabled: boolean;
    backgroundProcessing: boolean;
  } {
    switch (this.optimizationLevel) {
      case 'high':
        return {
          frameRate: 30,
          particleCount: 5,
          shadowQuality: 'none',
          audioEnabled: false,
          hapticEnabled: false,
          backgroundProcessing: false
        };
      case 'medium':
        return {
          frameRate: 45,
          particleCount: 15,
          shadowQuality: 'low',
          audioEnabled: true,
          hapticEnabled: false,
          backgroundProcessing: false
        };
      case 'low':
        return {
          frameRate: 50,
          particleCount: 25,
          shadowQuality: 'medium',
          audioEnabled: true,
          hapticEnabled: true,
          backgroundProcessing: true
        };
      default:
        return {
          frameRate: 60,
          particleCount: 50,
          shadowQuality: 'high',
          audioEnabled: true,
          hapticEnabled: true,
          backgroundProcessing: true
        };
    }
  }

  /**
   * Start battery monitoring
   */
  startMonitoring(interval: number = 30000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.initialize(); // Refresh battery info
    }, interval);
  }

  /**
   * Stop battery monitoring
   */
  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

/**
 * Comprehensive mobile optimization manager
 */
export class MobileOptimizationManager {
  private orientationManager: OrientationManager;
  private fullscreenManager: FullscreenManager;
  private uiScaler: MobileUIScaler;
  private batteryOptimizer: BatteryOptimizer;
  private settings: MobileSettings;

  constructor() {
    this.orientationManager = OrientationManager.getInstance();
    this.fullscreenManager = FullscreenManager.getInstance();
    this.uiScaler = MobileUIScaler.getInstance();
    this.batteryOptimizer = BatteryOptimizer.getInstance();
    
    this.settings = {
      orientationLock: false,
      fullscreenMode: false,
      batteryOptimization: true,
      uiScale: 1
    };
  }

  /**
   * Initialize all mobile optimizations
   */
  async initialize(settings?: Partial<MobileSettings>): Promise<void> {
    if (settings) {
      this.settings = { ...this.settings, ...settings };
    }

    // Initialize battery optimization
    if (this.settings.batteryOptimization) {
      await this.batteryOptimizer.initialize();
      this.batteryOptimizer.startMonitoring();
    }

    // Apply UI scaling
    this.uiScaler.applyScale(this.settings.uiScale);

    // Lock orientation if requested
    if (this.settings.orientationLock) {
      await this.orientationManager.lockToLandscape();
    }

    // Enter fullscreen if requested
    if (this.settings.fullscreenMode) {
      await this.fullscreenManager.enterFullscreen();
    }

    console.log('Mobile optimization manager initialized');
  }

  /**
   * Update settings
   */
  async updateSettings(newSettings: Partial<MobileSettings>): Promise<void> {
    const oldSettings = { ...this.settings };
    this.settings = { ...this.settings, ...newSettings };

    // Handle orientation lock changes
    if (oldSettings.orientationLock !== this.settings.orientationLock) {
      if (this.settings.orientationLock) {
        await this.orientationManager.lockToLandscape();
      } else {
        await this.orientationManager.unlock();
      }
    }

    // Handle fullscreen changes
    if (oldSettings.fullscreenMode !== this.settings.fullscreenMode) {
      if (this.settings.fullscreenMode) {
        await this.fullscreenManager.enterFullscreen();
      } else {
        await this.fullscreenManager.exitFullscreen();
      }
    }

    // Handle UI scale changes
    if (oldSettings.uiScale !== this.settings.uiScale) {
      this.uiScaler.applyScale(this.settings.uiScale);
    }

    // Handle battery optimization changes
    if (oldSettings.batteryOptimization !== this.settings.batteryOptimization) {
      if (this.settings.batteryOptimization) {
        await this.batteryOptimizer.initialize();
        this.batteryOptimizer.startMonitoring();
      } else {
        this.batteryOptimizer.stopMonitoring();
      }
    }
  }

  /**
   * Get current settings
   */
  getSettings(): MobileSettings {
    return { ...this.settings };
  }

  /**
   * Get comprehensive mobile status
   */
  getStatus(): {
    orientation: string;
    isOrientationLocked: boolean;
    isFullscreen: boolean;
    uiScale: number;
    batteryInfo: BatteryInfo | null;
    optimizationLevel: string;
  } {
    return {
      orientation: this.orientationManager.getCurrentOrientation(),
      isOrientationLocked: this.orientationManager.isOrientationLocked(),
      isFullscreen: this.fullscreenManager.isInFullscreen(),
      uiScale: this.uiScaler.getCurrentScale(),
      batteryInfo: this.batteryOptimizer.getBatteryInfo(),
      optimizationLevel: this.batteryOptimizer.getOptimizationLevel()
    };
  }

  /**
   * Cleanup and reset all optimizations
   */
  async cleanup(): Promise<void> {
    await this.orientationManager.unlock();
    await this.fullscreenManager.exitFullscreen();
    this.uiScaler.resetScale();
    this.batteryOptimizer.stopMonitoring();
    
    console.log('Mobile optimizations cleaned up');
  }
}

// Export singleton instances for easy access
export const mobileOptimization = new MobileOptimizationManager();
export const orientationManager = OrientationManager.getInstance();
export const fullscreenManager = FullscreenManager.getInstance();
export const mobileUIScaler = MobileUIScaler.getInstance();
export const batteryOptimizer = BatteryOptimizer.getInstance();