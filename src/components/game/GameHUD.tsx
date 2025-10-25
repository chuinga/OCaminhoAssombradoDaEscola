'use client';

import { useGameStore } from '../../store/gameStore';

interface GameHUDProps {
  className?: string;
}

export function GameHUD({ className = '' }: GameHUDProps) {
  const { firstName, lastName, lives, score } = useGameStore();

  // Format player name for display
  const playerName = `${firstName} ${lastName}`.trim() || 'Player';

  return (
    <div className={`absolute top-0 left-0 right-0 z-20 pointer-events-none ${className}`}>
      <div className="flex justify-between items-start p-2 sm:p-4 bg-gradient-to-b from-black/70 to-transparent">
        {/* Left side - Player name */}
        <div className="text-white">
          <div className="text-xs sm:text-sm font-medium opacity-80">Player</div>
          <div className="text-sm sm:text-lg font-bold truncate max-w-[120px] sm:max-w-none">
            {playerName}
          </div>
        </div>

        {/* Right side - Lives and Score */}
        <div className="text-white text-right">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Lives display */}
            <div className="text-center">
              <div className="text-xs sm:text-sm font-medium opacity-80">Lives</div>
              <div className="text-lg sm:text-2xl font-bold text-red-400">{lives}</div>
            </div>

            {/* Score display */}
            <div className="text-center">
              <div className="text-xs sm:text-sm font-medium opacity-80">Score</div>
              <div className="text-lg sm:text-2xl font-bold text-yellow-400">
                {score.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}