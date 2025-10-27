'use client';

import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface ColorblindFriendlyUIProps {
  children: React.ReactNode;
  className?: string;
}

export const ColorblindFriendlyUI: React.FC<ColorblindFriendlyUIProps> = ({ 
  children, 
  className = '' 
}) => {
  const { display } = useSettingsStore();

  if (!display.colorBlindFriendlyUI) {
    return <>{children}</>;
  }

  return (
    <div className={`colorblind-friendly-ui ${className}`}>
      {children}
      <style dangerouslySetInnerHTML={{
        __html: `
        .colorblind-friendly-ui {
          /* Enhanced patterns and symbols for colorblind users */
        }

        /* Health indicators with patterns */
        .colorblind-friendly-ui .life-indicator {
          position: relative;
        }

        .colorblind-friendly-ui .life-indicator::before {
          content: '❤️';
          position: absolute;
          left: -20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.8em;
        }

        /* Score indicators with symbols */
        .colorblind-friendly-ui .score-indicator {
          position: relative;
        }

        .colorblind-friendly-ui .score-indicator::before {
          content: '⭐';
          position: absolute;
          left: -20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.8em;
        }

        /* Difficulty indicators with patterns */
        .colorblind-friendly-ui .text-green-400 {
          position: relative;
        }

        .colorblind-friendly-ui .text-green-400::after {
          content: '●';
          margin-left: 4px;
          color: currentColor;
        }

        .colorblind-friendly-ui .text-yellow-400 {
          position: relative;
        }

        .colorblind-friendly-ui .text-yellow-400::after {
          content: '▲';
          margin-left: 4px;
          color: currentColor;
        }

        .colorblind-friendly-ui .text-red-400 {
          position: relative;
        }

        .colorblind-friendly-ui .text-red-400::after {
          content: '■';
          margin-left: 4px;
          color: currentColor;
        }

        /* Button states with patterns */
        .colorblind-friendly-ui button:disabled {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.1) 2px,
            rgba(255, 255, 255, 0.1) 4px
          );
        }

        /* Focus indicators with enhanced visibility */
        .colorblind-friendly-ui button:focus-visible,
        .colorblind-friendly-ui a:focus-visible,
        .colorblind-friendly-ui [tabindex]:focus-visible {
          outline: 4px solid #ffffff !important;
          outline-offset: 2px !important;
          box-shadow: 
            0 0 0 8px rgba(255, 255, 255, 0.3),
            0 0 0 12px rgba(0, 0, 0, 0.5) !important;
        }

        /* Enhanced contrast for interactive elements */
        .colorblind-friendly-ui .bg-orange-600 {
          background-color: #000000 !important;
          border: 2px solid #ffffff !important;
          color: #ffffff !important;
        }

        .colorblind-friendly-ui .bg-gray-600 {
          background-color: #333333 !important;
          border: 2px solid #666666 !important;
          color: #ffffff !important;
        }

        /* Health bar with patterns */
        .colorblind-friendly-ui .bg-green-500 {
          background: repeating-linear-gradient(
            90deg,
            #22c55e,
            #22c55e 2px,
            #16a34a 2px,
            #16a34a 4px
          ) !important;
        }

        .colorblind-friendly-ui .bg-yellow-500 {
          background: repeating-linear-gradient(
            45deg,
            #eab308,
            #eab308 2px,
            #ca8a04 2px,
            #ca8a04 4px
          ) !important;
        }

        .colorblind-friendly-ui .bg-red-500 {
          background: repeating-linear-gradient(
            0deg,
            #ef4444,
            #ef4444 2px,
            #dc2626 2px,
            #dc2626 4px
          ) !important;
        }

        /* Weapon selection with symbols */
        .colorblind-friendly-ui [data-weapon="katana"]::after {
          content: '⚔️';
          margin-left: 8px;
        }

        .colorblind-friendly-ui [data-weapon="laser"]::after {
          content: '🔫';
          margin-left: 8px;
        }

        .colorblind-friendly-ui [data-weapon="baseball"]::after {
          content: '⚾';
          margin-left: 8px;
        }

        .colorblind-friendly-ui [data-weapon="bazooka"]::after {
          content: '🚀';
          margin-left: 8px;
        }

        /* Character selection with symbols */
        .colorblind-friendly-ui [data-character="boy"]::after {
          content: '👦';
          margin-left: 8px;
        }

        .colorblind-friendly-ui [data-character="girl"]::after {
          content: '👧';
          margin-left: 8px;
        }

        /* Status indicators with text labels */
        .colorblind-friendly-ui .status-indicator {
          position: relative;
        }

        .colorblind-friendly-ui .status-indicator[data-status="active"]::before {
          content: 'ATIVO';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: bold;
          color: #ffffff;
          background: #000000;
          padding: 2px 4px;
          border-radius: 2px;
        }

        .colorblind-friendly-ui .status-indicator[data-status="inactive"]::before {
          content: 'INATIVO';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: bold;
          color: #ffffff;
          background: #666666;
          padding: 2px 4px;
          border-radius: 2px;
        }

        /* Progress indicators with text */
        .colorblind-friendly-ui .progress-bar {
          position: relative;
        }

        .colorblind-friendly-ui .progress-bar::after {
          content: attr(data-progress) '%';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          font-weight: bold;
          color: #000000;
          text-shadow: 1px 1px 2px #ffffff;
        }

        /* Enhanced borders for better definition */
        .colorblind-friendly-ui .game-hud,
        .colorblind-friendly-ui .halloween-card,
        .colorblind-friendly-ui .spooky-card {
          border: 2px solid #ffffff !important;
          box-shadow: 0 0 0 1px #000000 !important;
        }

        /* Text enhancement for better readability */
        .colorblind-friendly-ui .text-orange-400,
        .colorblind-friendly-ui .text-yellow-400,
        .colorblind-friendly-ui .text-red-400,
        .colorblind-friendly-ui .text-green-400 {
          text-shadow: 2px 2px 4px #000000 !important;
          font-weight: bold !important;
        }
      `}} />
    </div>
  );
};

// Hook for colorblind-friendly utilities
export const useColorblindFriendly = () => {
  const { display } = useSettingsStore();

  const getStatusSymbol = (status: 'active' | 'inactive' | 'warning' | 'error') => {
    if (!display.colorBlindFriendlyUI) return '';
    
    const symbols = {
      active: '✓',
      inactive: '○',
      warning: '⚠',
      error: '✗'
    };
    
    return symbols[status] || '';
  };

  const getDifficultySymbol = (difficulty: 'easy' | 'medium' | 'impossible') => {
    if (!display.colorBlindFriendlyUI) return '';
    
    const symbols = {
      easy: '●',
      medium: '▲',
      impossible: '■'
    };
    
    return symbols[difficulty] || '';
  };

  const getHealthPattern = (health: number, maxHealth: number) => {
    if (!display.colorBlindFriendlyUI) return '';
    
    const percentage = (health / maxHealth) * 100;
    
    if (percentage > 66) return 'healthy'; // Solid pattern
    if (percentage > 33) return 'warning'; // Diagonal stripes
    return 'critical'; // Vertical stripes
  };

  return {
    isEnabled: display.colorBlindFriendlyUI,
    getStatusSymbol,
    getDifficultySymbol,
    getHealthPattern
  };
};