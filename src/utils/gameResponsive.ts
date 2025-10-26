/**
 * Responsive game configuration utilities
 * Handles different screen sizes and device types for optimal game experience
 */

export interface GameDimensions {
  width: number;
  height: number;
  scale: number;
  aspectRatio: number;
}

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  pixelRatio: number;
}

/**
 * Calculate optimal game dimensions based on viewport size
 */
export function calculateGameDimensions(
  viewportWidth: number,
  viewportHeight: number,
  targetAspectRatio: number = 16/9
): GameDimensions {
  // Base game dimensions (logical pixels)
  const baseWidth = 1200;
  const baseHeight = Math.round(baseWidth / targetAspectRatio);
  
  // Calculate available space (leave room for UI)
  const availableWidth = viewportWidth * 0.95;
  const availableHeight = viewportHeight * 0.85;
  
  // Calculate scale to fit within available space
  const scaleX = availableWidth / baseWidth;
  const scaleY = availableHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1x
  
  // Final dimensions
  const width = Math.round(baseWidth * scale);
  const height = Math.round(baseHeight * scale);
  
  return {
    width: Math.max(width, 320), // Minimum width
    height: Math.max(height, 240), // Minimum height
    scale,
    aspectRatio: width / height,
  };
}

/**
 * Get device information for responsive behavior
 */
export function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isLandscape: width > height,
    isPortrait: height >= width,
    pixelRatio: window.devicePixelRatio || 1,
  };
}

/**
 * Get Phaser scale configuration for responsive behavior
 */
export function getPhaserScaleConfig(dimensions: GameDimensions) {
  return {
    mode: Phaser.Scale.FIT,
    parent: 'game-container',
    width: dimensions.width,
    height: dimensions.height,
    min: {
      width: 320,
      height: 240,
    },
    max: {
      width: 1920,
      height: 1080,
    },
    autoCenter: Phaser.Scale.CENTER_BOTH,
  };
}

/**
 * Calculate UI element sizes based on screen size
 */
export function getUIScaling(deviceInfo: DeviceInfo): {
  hudScale: number;
  touchControlScale: number;
  fontSize: number;
} {
  if (deviceInfo.isMobile) {
    return {
      hudScale: 0.8,
      touchControlScale: 1.0,
      fontSize: 14,
    };
  }
  
  if (deviceInfo.isTablet) {
    return {
      hudScale: 1.0,
      touchControlScale: 1.2,
      fontSize: 16,
    };
  }
  
  // Desktop
  return {
    hudScale: 1.2,
    touchControlScale: 0, // No touch controls
    fontSize: 18,
  };
}

/**
 * Get performance settings based on device capabilities
 */
export function getPerformanceSettings(deviceInfo: DeviceInfo): {
  antialias: boolean;
  pixelArt: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
  maxParticles: number;
  enableShadows: boolean;
} {
  // Mobile devices - optimize for battery and performance
  if (deviceInfo.isMobile) {
    return {
      antialias: false,
      pixelArt: true,
      powerPreference: 'low-power',
      maxParticles: 20,
      enableShadows: false,
    };
  }
  
  // Tablets - balanced settings
  if (deviceInfo.isTablet) {
    return {
      antialias: true,
      pixelArt: false,
      powerPreference: 'default',
      maxParticles: 50,
      enableShadows: true,
    };
  }
  
  // Desktop - high quality settings
  return {
    antialias: true,
    pixelArt: false,
    powerPreference: 'high-performance',
    maxParticles: 100,
    enableShadows: true,
  };
}

/**
 * Debounced resize handler for game responsiveness
 */
export function createResizeHandler(
  callback: (dimensions: GameDimensions, deviceInfo: DeviceInfo) => void,
  delay: number = 250
): () => void {
  let timeoutId: NodeJS.Timeout;
  
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const deviceInfo = getDeviceInfo();
      const dimensions = calculateGameDimensions(
        window.innerWidth,
        window.innerHeight
      );
      callback(dimensions, deviceInfo);
    }, delay);
  };
}