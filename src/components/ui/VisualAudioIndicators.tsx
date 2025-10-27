'use client';

import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface VisualIndicator {
  id: string;
  type: 'jump' | 'damage' | 'item_collect' | 'weapon_attack' | 'enemy_nearby' | 'low_health';
  position: { x: number; y: number };
  intensity: 'low' | 'medium' | 'high';
  duration: number;
  timestamp: number;
}

interface VisualAudioIndicatorsProps {
  className?: string;
}

export const VisualAudioIndicators: React.FC<VisualAudioIndicatorsProps> = ({ 
  className = '' 
}) => {
  const { display } = useSettingsStore();
  const [indicators, setIndicators] = useState<VisualIndicator[]>([]);
  const [showIndicators, setShowIndicators] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const handleVisualIndicator = (event: CustomEvent<{
      type: VisualIndicator['type'];
      position?: { x: number; y: number };
      intensity?: VisualIndicator['intensity'];
      weaponType?: string;
    }>) => {
      if (!showIndicators) return;

      const { type, position, intensity = 'medium', weaponType } = event.detail;
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const id = `${type}-${timestamp}-${randomId}`;

      // Default position (center of screen)
      const defaultPosition = { x: 50, y: 50 };

      let duration = 1000;
      let finalIntensity = intensity;

      // Adjust duration and intensity based on type
      switch (type) {
        case 'jump':
          duration = 500;
          finalIntensity = 'low';
          break;
        case 'damage':
          duration = 1500;
          finalIntensity = 'high';
          break;
        case 'item_collect':
          duration = 800;
          finalIntensity = 'medium';
          break;
        case 'weapon_attack':
          duration = 600;
          finalIntensity = weaponType === 'bazooka' ? 'high' : 'medium';
          break;
        case 'enemy_nearby':
          duration = 2000;
          finalIntensity = 'medium';
          break;
        case 'low_health':
          duration = 3000;
          finalIntensity = 'high';
          break;
      }

      const indicator: VisualIndicator = {
        id,
        type,
        position: position || defaultPosition,
        intensity: finalIntensity,
        duration,
        timestamp
      };

      setIndicators(prev => {
        // Remove old indicators of the same type to prevent spam
        const filtered = prev.filter(i => 
          i.type !== type || (timestamp - i.timestamp) > 100
        );
        // Keep maximum of 10 indicators to prevent performance issues
        const limited = [...filtered, indicator].slice(-10);
        return limited;
      });

      // Remove indicator after duration
      setTimeout(() => {
        setIndicators(prev => prev.filter(i => i.id !== id));
      }, duration);
    };

    const handleToggleIndicators = (event: CustomEvent<{ enabled: boolean }>) => {
      setShowIndicators(event.detail.enabled);
    };

    window.addEventListener('visualIndicator', handleVisualIndicator as EventListener);
    window.addEventListener('toggleVisualIndicators', handleToggleIndicators as EventListener);

    return () => {
      window.removeEventListener('visualIndicator', handleVisualIndicator as EventListener);
      window.removeEventListener('toggleVisualIndicators', handleToggleIndicators as EventListener);
    };
  }, [showIndicators]);

  if (!isClient || !showIndicators) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-20 ${className}`}
      aria-hidden="true"
    >
      {indicators.map((indicator) => {
        const getIndicatorStyles = () => {
          const baseClasses = "absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full";
          
          switch (indicator.type) {
            case 'jump':
              return {
                className: `${baseClasses} bg-blue-400/60 animate-ping`,
                size: indicator.intensity === 'high' ? 'w-16 h-16' : 'w-12 h-12'
              };
            case 'damage':
              return {
                className: `${baseClasses} bg-red-500/80 animate-pulse`,
                size: indicator.intensity === 'high' ? 'w-24 h-24' : 'w-16 h-16'
              };
            case 'item_collect':
              return {
                className: `${baseClasses} bg-yellow-400/70 animate-bounce`,
                size: 'w-14 h-14'
              };
            case 'weapon_attack':
              return {
                className: `${baseClasses} bg-orange-500/70 animate-pulse`,
                size: indicator.intensity === 'high' ? 'w-20 h-20' : 'w-12 h-12'
              };
            case 'enemy_nearby':
              return {
                className: `${baseClasses} bg-purple-500/60 animate-ping`,
                size: 'w-18 h-18'
              };
            case 'low_health':
              return {
                className: `${baseClasses} bg-red-600/90 animate-pulse`,
                size: 'w-32 h-32'
              };
            default:
              return {
                className: `${baseClasses} bg-gray-400/50 animate-ping`,
                size: 'w-12 h-12'
              };
          }
        };

        const { className: indicatorClassName, size } = getIndicatorStyles();

        return (
          <div
            key={indicator.id}
            className={`${indicatorClassName} ${size}`}
            style={{
              left: `${indicator.position.x}%`,
              top: `${indicator.position.y}%`,
              animationDuration: `${indicator.duration}ms`
            }}
          >
            {/* Inner glow effect */}
            <div 
              className={`absolute inset-0 rounded-full ${
                indicator.type === 'damage' ? 'bg-red-300/40' :
                indicator.type === 'item_collect' ? 'bg-yellow-300/40' :
                indicator.type === 'jump' ? 'bg-blue-300/40' :
                indicator.type === 'weapon_attack' ? 'bg-orange-300/40' :
                indicator.type === 'enemy_nearby' ? 'bg-purple-300/40' :
                indicator.type === 'low_health' ? 'bg-red-400/60' :
                'bg-gray-300/40'
              }`}
              style={{
                animation: `pulse ${indicator.duration / 2}ms ease-in-out infinite`
              }}
            />
          </div>
        );
      })}

      {/* Screen flash for high-intensity events */}
      {indicators.some(i => i.intensity === 'high' && i.type === 'damage') && (
        <div 
          className="absolute inset-0 bg-red-500/20 animate-pulse"
          style={{ animationDuration: '200ms', animationIterationCount: '3' }}
        />
      )}

      {/* Health warning overlay */}
      {indicators.some(i => i.type === 'low_health') && (
        <div className="absolute inset-0 border-4 border-red-500/60 animate-pulse" />
      )}
    </div>
  );
};

// Hook for managing visual audio indicators
export const useVisualAudioIndicators = () => {
  const triggerVisualIndicator = (
    type: VisualIndicator['type'],
    options?: {
      position?: { x: number; y: number };
      intensity?: VisualIndicator['intensity'];
      weaponType?: string;
    }
  ) => {
    window.dispatchEvent(new CustomEvent('visualIndicator', {
      detail: { type, ...options }
    }));
  };

  const toggleVisualIndicators = (enabled: boolean) => {
    window.dispatchEvent(new CustomEvent('toggleVisualIndicators', {
      detail: { enabled }
    }));
  };

  return {
    triggerVisualIndicator,
    toggleVisualIndicators
  };
};