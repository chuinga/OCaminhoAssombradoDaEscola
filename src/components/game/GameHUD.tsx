'use client';

import { useGameStore } from '../../store/gameStore';

interface GameHUDProps {
  className?: string;
}

export function GameHUD({ className = '' }: GameHUDProps) {
  const { firstName, lastName, lives, score, character, weapon, difficulty } = useGameStore();

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
      {/* Main HUD */}
      <div className="flex justify-between items-start p-2 sm:p-4">
        {/* Left side - Player info */}
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-orange-500/30">
          <div className="text-orange-400 text-xs sm:text-sm font-medium mb-1">
            🎃 Player
          </div>
          <div className="text-white text-sm sm:text-lg font-bold truncate max-w-[120px] sm:max-w-none mb-1">
            {playerName}
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
            <span>{characterEmoji}</span>
            <span>•</span>
            <span>{weaponEmoji}</span>
            <span>•</span>
            <span className={difficultyColor}>
              {difficulty?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right side - Lives and Score */}
        <div className="flex gap-2 sm:gap-3">
          {/* Lives display */}
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-red-500/30 text-center min-w-[60px] sm:min-w-[80px]">
            <div className="text-red-400 text-xs sm:text-sm font-medium mb-1">
              💀 Lives
            </div>
            <div className="text-lg sm:text-2xl font-bold text-red-400">
              {lives}
            </div>
          </div>

          {/* Score display */}
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-yellow-500/30 text-center min-w-[80px] sm:min-w-[100px]">
            <div className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">
              ⭐ Score
            </div>
            <div className="text-lg sm:text-2xl font-bold text-yellow-400">
              {score.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Health bar visualization */}
      <div className="absolute top-16 sm:top-20 right-2 sm:right-4">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-red-500/30">
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-4 sm:w-3 sm:h-5 rounded-sm ${
                  i < lives 
                    ? lives > 6 
                      ? 'bg-green-500' 
                      : lives > 3 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}