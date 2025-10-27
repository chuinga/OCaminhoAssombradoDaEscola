'use client';

import { useState, useEffect } from 'react';
import { MobileSettings } from './MobileSettings';
import { mobileOptimization } from '@/utils/mobileOptimization';
import { useResponsive } from '@/hooks/useResponsive';

interface MobileSettingsButtonProps {
  className?: string;
}

export function MobileSettingsButton({ className = '' }: MobileSettingsButtonProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  // Only show on mobile/tablet devices
  const shouldShow = isMobile || isTablet;

  // Update status periodically
  useEffect(() => {
    if (!shouldShow) return;

    const updateStatus = () => {
      const status = mobileOptimization.getStatus();
      setBatteryLevel(status.batteryInfo?.level || null);
      setIsFullscreen(status.isFullscreen);
    };

    // Initial update
    updateStatus();

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => clearInterval(interval);
  }, [shouldShow]);

  // Initialize mobile optimization on mount
  useEffect(() => {
    if (shouldShow) {
      mobileOptimization.initialize({
        batteryOptimization: true,
        uiScale: 1
      });
    }
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const getBatteryIcon = () => {
    if (batteryLevel === null) return '🔋';
    
    if (batteryLevel > 0.75) return '🔋';
    if (batteryLevel > 0.5) return '🔋';
    if (batteryLevel > 0.25) return '🪫';
    return '🪫';
  };

  const getBatteryColor = () => {
    if (batteryLevel === null) return 'text-gray-400';
    
    if (batteryLevel > 0.5) return 'text-green-400';
    if (batteryLevel > 0.2) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <>
      {/* Mobile Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className={`
          fixed top-4 right-4 z-30
          bg-black/60 backdrop-blur-sm 
          border border-white/20 
          rounded-lg p-2
          text-white hover:bg-black/80 
          transition-all duration-200
          flex items-center space-x-2
          ${className}
        `}
        aria-label="Mobile Settings"
      >
        {/* Settings Icon */}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>

        {/* Battery Indicator */}
        {batteryLevel !== null && (
          <div className="flex items-center space-x-1">
            <span className={`text-xs ${getBatteryColor()}`}>
              {getBatteryIcon()}
            </span>
            <span className={`text-xs font-medium ${getBatteryColor()}`}>
              {Math.round(batteryLevel * 100)}%
            </span>
          </div>
        )}

        {/* Fullscreen Indicator */}
        {isFullscreen && (
          <div className="text-blue-400 text-xs">
            ⛶
          </div>
        )}
      </button>

      {/* Mobile Settings Modal */}
      <MobileSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}