'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PumpkinIcon, SkullIcon } from '../ui/HalloweenIcons';
import { MobileSettingsButton } from './MobileSettingsButton';

interface GameHUDProps {
  className?: string;
}

export function GameHUD({ className = '' }: GameHUDProps) {
  const { firstName, lastName, lives, score, character, weapon, difficulty } = useGameStore();
  const [isClient, setIsClient] = useState(false);

  // Ensure this only renders on the client to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug: Log the current store values
  console.log('GameHUD render - store values:', {
    firstName, lastName, lives, score, character, weapon, difficulty, isClient
  });

  // Don't render on server or if we don't have the basic game data yet
  if (!isClient || !firstName || !character || !weapon || !difficulty) {
    console.log('GameHUD: Not ready to render', { isClient, firstName, character, weapon, difficulty });
    return null;
  }

  // Format player name for display
  const playerName = `${firstName} ${lastName}`.trim() || 'Player';

  // Get character emoji
  const characterEmoji = character === 'boy' ? '👦' : '👧';

  // Get weapon emoji
  const weaponEmoji = {
    katana: '⚔️',
    laser: '🔫',
    baseball: '⚾',
    bazooka: '🚀'
  }[weapon || 'katana'];

  // Get difficulty color
  const difficultyColor = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    impossible: 'text-red-400'
  }[difficulty || 'easy'];

  return (
    <div className={`absolute top-0 left-0 right-0 z-20 pointer-events-none ${className}`}>
      {/* Main HUD with enhanced Halloween styling */}
      <div className="flex justify-between items-start p-2 sm:p-4">
        {/* Left side - Player info with Halloween theme */}
        <div className="game-hud halloween-card p-2 sm:p-3 rounded-lg">
          <div className="text-orange-400 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1">
            <PumpkinIcon size={16} className="text-orange-500" />
            <span className="spooky-text">Player</span>
          </div>
          <div className="text-white text-sm sm:text-lg font-bold truncate max-w-[120px] sm:max-w-none mb-1 glowing-text">
            {playerName}
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
            <span>{characterEmoji}</span>
            <span className="text-orange-400">•</span>
            <span>{weaponEmoji}</span>
            <span className="text-orange-400">•</span>
            <span className={`${difficultyColor} font-bold`}>
              {difficulty?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right side - Lives and Score with Halloween styling */}
        <div className="flex gap-2 sm:gap-3">
          {/* Lives display with skull icon */}
          <div className="game-hud spooky-card p-2 sm:p-3 rounded-lg text-center min-w-[60px] sm:min-w-[80px]">
            <div className="life-indicator text-xs sm:text-sm font-medium mb-1 flex items-center justify-center gap-1">
              <SkullIcon size={16} className="text-red-500" />
              <span className="spooky-text">Lives</span>
            </div>
            <div className={`text-lg sm:text-2xl font-bold life-indicator ${lives <= 3 ? 'flickering-text' : ''}`}>
              {lives}
            </div>
          </div>

          {/* Score display with enhanced styling */}
          <div className="game-hud halloween-card p-2 sm:p-3 rounded-lg text-center min-w-[80px] sm:min-w-[100px]">
            <div className="score-indicator text-xs sm:text-sm font-medium mb-1 flex items-center justify-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="spooky-text">Score</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold score-indicator glowing-text">
              {score.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced health bar visualization */}
      <div className="absolute top-16 sm:top-20 right-2 sm:right-4">
        <div className="spooky-card p-2 rounded-lg">
          <div className="text-xs text-center mb-1 text-red-400 spooky-text">Health</div>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-4 sm:w-3 sm:h-5 rounded-sm transition-all duration-300 ${i < lives
                  ? lives > 6
                    ? 'bg-green-500 shadow-green-500/50'
                    : lives > 3
                      ? 'bg-yellow-500 shadow-yellow-500/50'
                      : 'bg-red-500 shadow-red-500/50 pulsing'
                  : 'bg-gray-700'
                  }`}
                style={{
                  boxShadow: i < lives ? '0 0 4px currentColor' : 'none'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Warning overlay for low health */}
      {lives <= 3 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-900/20 flickering-text" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-red-400 text-xl sm:text-2xl font-bold spooky-text glowing-text text-center">
              ⚠️ LOW HEALTH ⚠️
            </div>
          </div>
        </div>
      )}

      {/* Mobile Settings Button */}
      <MobileSettingsButton />
    </div>
  );
}