'use client';

import React from 'react';

interface TouchControlsProps {
  onMoveLeft: (pressed: boolean) => void;
  onMoveRight: (pressed: boolean) => void;
  onJump: (pressed: boolean) => void;
  onCrouch: (pressed: boolean) => void;
  onAttack: (pressed: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onJump,
  onCrouch,
  onAttack
}) => {
  const handleTouchStart = (callback: (pressed: boolean) => void) => {
    return (e: React.TouchEvent) => {
      e.preventDefault();
      callback(true);
    };
  };

  const handleTouchEnd = (callback: (pressed: boolean) => void) => {
    return (e: React.TouchEvent) => {
      e.preventDefault();
      callback(false);
    };
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Left side controls - Movement */}
      <div className="absolute left-4 bottom-4 flex flex-col gap-2 pointer-events-auto">
        <div className="flex gap-2">
          {/* Move Left Button */}
          <button
            className="w-16 h-16 bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 
                     text-white font-bold rounded-lg shadow-lg border-2 border-purple-800 
                     flex items-center justify-center text-2xl active:scale-95 transition-transform"
            onTouchStart={handleTouchStart(onMoveLeft)}
            onTouchEnd={handleTouchEnd(onMoveLeft)}
            onMouseDown={() => onMoveLeft(true)}
            onMouseUp={() => onMoveLeft(false)}
            onMouseLeave={() => onMoveLeft(false)}
          >
            ←
          </button>
          
          {/* Move Right Button */}
          <button
            className="w-16 h-16 bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 
                     text-white font-bold rounded-lg shadow-lg border-2 border-purple-800 
                     flex items-center justify-center text-2xl active:scale-95 transition-transform"
            onTouchStart={handleTouchStart(onMoveRight)}
            onTouchEnd={handleTouchEnd(onMoveRight)}
            onMouseDown={() => onMoveRight(true)}
            onMouseUp={() => onMoveRight(false)}
            onMouseLeave={() => onMoveRight(false)}
          >
            →
          </button>
        </div>
      </div>

      {/* Right side controls - Actions */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-2 pointer-events-auto">
        {/* Jump Button */}
        <button
          className="w-16 h-16 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 
                   text-white font-bold rounded-lg shadow-lg border-2 border-orange-800 
                   flex items-center justify-center text-sm active:scale-95 transition-transform"
          onTouchStart={handleTouchStart(onJump)}
          onTouchEnd={handleTouchEnd(onJump)}
          onMouseDown={() => onJump(true)}
          onMouseUp={() => onJump(false)}
          onMouseLeave={() => onJump(false)}
        >
          JUMP
        </button>
        
        <div className="flex gap-2">
          {/* Crouch Button */}
          <button
            className="w-16 h-16 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 
                     text-white font-bold rounded-lg shadow-lg border-2 border-green-800 
                     flex items-center justify-center text-xs active:scale-95 transition-transform"
            onTouchStart={handleTouchStart(onCrouch)}
            onTouchEnd={handleTouchEnd(onCrouch)}
            onMouseDown={() => onCrouch(true)}
            onMouseUp={() => onCrouch(false)}
            onMouseLeave={() => onCrouch(false)}
          >
            CROUCH
          </button>
          
          {/* Attack Button */}
          <button
            className="w-16 h-16 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 
                     text-white font-bold rounded-lg shadow-lg border-2 border-red-800 
                     flex items-center justify-center text-sm active:scale-95 transition-transform"
            onTouchStart={handleTouchStart(onAttack)}
            onTouchEnd={handleTouchEnd(onAttack)}
            onMouseDown={() => onAttack(true)}
            onMouseUp={() => onAttack(false)}
            onMouseLeave={() => onAttack(false)}
          >
            ATTACK
          </button>
        </div>
      </div>
    </div>
  );
};