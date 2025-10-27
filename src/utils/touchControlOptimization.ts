'use client';

interface DeviceInfo {
  width: number;
  height: number;
  pixelRatio: number;
  isPortrait: boolean;
  isMobile: boolean;
  isTablet: boolean;
  hasNotch: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

interface TouchControlLayout {
  buttonSize: string;
  spacing: string;
  positioning: {
    left: string;
    right: string;
    bottom: string;
  };
  fontSize: {
    arrows: string;
    labels: string;
  };
  opacity: number;
  borderRadius: string;
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      width: 375,
      height: 667,
      pixelRatio: 2,
      isPortrait: true,
      isMobile: true,
      isTablet: false,
      hasNotch: false,
      safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;
  const isPortrait = height > width;
  
  // Device type detection
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android.*Tablet|Windows.*Touch/i.test(userAgent) || 
                   (width >= 768 && width <= 1024);

  // Notch detection (approximate)
  const hasNotch = (
    // iPhone X and newer
    (width === 375 && height === 812) || // iPhone X/XS
    (width === 414 && height === 896) || // iPhone XR/XS Max
    (width === 390 && height === 844) || // iPhone 12/13 mini
    (width === 393 && height === 852) || // iPhone 14/15
    // Or check for safe area insets
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0') > 20
  );

  // Safe area insets
  const safeAreaInsets = {
    top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0'),
    bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left') || '0'),
    right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right') || '0')
  };

  return {
    width,
    height,
    pixelRatio,
    isPortrait,
    isMobile,
    isTablet,
    hasNotch,
    safeAreaInsets
  };
}

export function getOptimalTouchControlLayout(deviceInfo: DeviceInfo): TouchControlLayout {
  const { width, height, isPortrait, isMobile, isTablet, hasNotch, safeAreaInsets } = deviceInfo;
  const screenArea = width * height;
  const aspectRatio = width / height;

  // Base measurements
  let buttonSize: string;
  let spacing: string;
  let fontSize: { arrows: string; labels: string };
  let opacity: number;
  let borderRadius: string;

  // Button size optimization based on screen characteristics
  if (screenArea < 250000) {
    // Very small screens (old phones)
    buttonSize = 'w-10 h-10';
    fontSize = { arrows: 'text-sm', labels: 'text-xs' };
    spacing = 'space-x-1 space-y-1';
    opacity = 0.8;
    borderRadius = 'rounded-md';
  } else if (screenArea < 400000) {
    // Small screens
    buttonSize = 'w-12 h-12';
    fontSize = { arrows: 'text-base', labels: 'text-xs' };
    spacing = 'space-x-1.5 space-y-1.5';
    opacity = 0.85;
    borderRadius = 'rounded-lg';
  } else if (width < 375) {
    // Narrow phones
    buttonSize = 'w-13 h-13';
    fontSize = { arrows: 'text-lg', labels: 'text-xs' };
    spacing = 'space-x-2 space-y-2';
    opacity = 0.85;
    borderRadius = 'rounded-lg';
  } else if (isMobile && aspectRatio > 2.0) {
    // Very tall phones (modern flagships)
    buttonSize = 'w-16 h-16';
    fontSize = { arrows: 'text-xl', labels: 'text-sm' };
    spacing = 'space-x-3 space-y-3';
    opacity = 0.9;
    borderRadius = 'rounded-xl';
  } else if (isMobile && aspectRatio > 1.5) {
    // Wide phones in landscape
    buttonSize = 'w-14 h-14';
    fontSize = { arrows: 'text-lg', labels: 'text-xs' };
    spacing = 'space-x-2 space-y-2';
    opacity = 0.85;
    borderRadius = 'rounded-lg';
  } else if (isMobile) {
    // Regular phones
    buttonSize = 'w-14 h-14';
    fontSize = { arrows: 'text-lg', labels: 'text-sm' };
    spacing = 'space-x-2 space-y-2';
    opacity = 0.9;
    borderRadius = 'rounded-lg';
  } else if (isTablet && aspectRatio > 1.3) {
    // Tablets in landscape
    buttonSize = 'w-18 h-18';
    fontSize = { arrows: 'text-2xl', labels: 'text-base' };
    spacing = 'space-x-4 space-y-4';
    opacity = 0.9;
    borderRadius = 'rounded-xl';
  } else if (isTablet) {
    // Tablets in portrait
    buttonSize = 'w-20 h-20';
    fontSize = { arrows: 'text-2xl', labels: 'text-base' };
    spacing = 'space-x-4 space-y-4';
    opacity = 0.9;
    borderRadius = 'rounded-xl';
  } else {
    // Default/desktop (shouldn't normally show)
    buttonSize = 'w-16 h-16';
    fontSize = { arrows: 'text-xl', labels: 'text-sm' };
    spacing = 'space-x-3 space-y-3';
    opacity = 0.8;
    borderRadius = 'rounded-lg';
  }

  // Position optimization
  const baseOffset = Math.max(safeAreaInsets.bottom + 8, 16);
  const sideOffset = Math.max(safeAreaInsets.left + 8, 8);
  const rightOffset = Math.max(safeAreaInsets.right + 8, 8);

  let bottomOffset: string;
  if (hasNotch && isPortrait) {
    bottomOffset = `bottom-[${baseOffset + 8}px]`;
  } else if (isPortrait && height < 600) {
    bottomOffset = `bottom-[${Math.max(baseOffset, 8)}px]`;
  } else if (isPortrait && height < 800) {
    bottomOffset = `bottom-[${Math.max(baseOffset, 16)}px]`;
  } else if (isPortrait) {
    bottomOffset = `bottom-[${Math.max(baseOffset, 24)}px]`;
  } else {
    // Landscape mode - move controls higher to avoid home indicator
    bottomOffset = `bottom-[${Math.max(baseOffset, 32)}px]`;
  }

  return {
    buttonSize,
    spacing,
    positioning: {
      left: `left-[${sideOffset}px]`,
      right: `right-[${rightOffset}px]`,
      bottom: bottomOffset
    },
    fontSize,
    opacity,
    borderRadius
  };
}

// Thumb reach zones for optimal button placement
export function getThumbReachZones(deviceInfo: DeviceInfo) {
  const { width, height, isPortrait } = deviceInfo;
  
  // Average thumb reach from bottom corners
  const thumbReachRadius = Math.min(width, height) * 0.4;
  
  return {
    left: {
      x: thumbReachRadius * 0.7,
      y: height - thumbReachRadius * 0.8,
      radius: thumbReachRadius
    },
    right: {
      x: width - thumbReachRadius * 0.7,
      y: height - thumbReachRadius * 0.8,
      radius: thumbReachRadius
    }
  };
}

// Performance optimization for touch events
export function optimizeTouchPerformance() {
  // Disable default touch behaviors that can interfere
  if (typeof document !== 'undefined') {
    // Prevent zoom on double tap
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Prevent context menu on long press for game controls
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-touch-control]')) {
        e.preventDefault();
      }
    });

    // Optimize scroll behavior
    document.body.style.touchAction = 'manipulation';
  }
}