'use client';

import { useEffect, useState } from 'react';

interface TouchControlsProps {
  onMoveLeft: (pressed: boolean) => void;
  onMoveRight: (pressed: boolean) => void;
  onJump: (pressed: boolean) => void;
  onCrouch: (pressed: boolean) => void;
  onAttack: (pressed: boolean) => void;
  className?: string;
}

export function TouchControls({
  onMoveLeft,
  onMoveRight,
  onJump,
  onCrouch,
  onAttack,
  className = ''
}: TouchControlsProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile or tablet
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1024; // Include tablets
      setIsMobile(isTouchDevice && isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render touch controls on desktop
  if (!isMobile) {
    return null;
  }

  // Handle touch events with proper event handling
  const handleTouchStart = (callback: (pressed: boolean) => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    callback(true);
  };

  const handleTouchEnd = (callback: (pressed: boolean) => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    callback(false);
  };

  // Handle mouse events for testing on desktop
  const handleMouseDown = (callback: (pressed: boolean) => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    callback(true);
  };

  const handleMouseUp = (callback: (pressed: boolean) => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    callback(false);
  };

  const handleMouseLeave = (callback: (pressed: boolean) => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    callback(false);
  };

  return (
    <div className={`fixed inset-0 pointer-events-none z-20 ${className}`}>
      {/* Left side controls - Movement */}
      <div className="absolute left-4 bottom-4 flex flex-col space-y-2 pointer-events-auto">
        {/* Movement controls container */}
        <div className="flex space-x-2">
          {/* Move Left Button */}
          <button
            className="w-16 h-16 sm:w-20 sm:h-20 bg-black/50 backdrop-blur-sm border-2 border-white/30 rounded-lg flex items-center justify-center text-white text-xl font-bold hover:bg-black/70 active:bg-black/80 transition-colors select-none"
            onTouchStart={handleTouchStart(onMoveLeft)}
            onTouchEnd={handleTouchEnd(onMoveLeft)}
            onMouseDown={handleMouseDown(onMoveLeft)}
            onMouseUp={handleMouseUp(onMoveLeft)}
            onMouseLeave={handleMouseLeave(onMoveLeft)}
            aria-label="Move Left"
          >
            ←
          </button>

          {/* Move Right Button */}
          <button
            className="w-16 h-16 sm:w-20 sm:h-20 bg-black/50 backdrop-blur-sm border-2 border-white/30 rounded-lg flex items-center justify-center text-white text-xl font-bold hover:bg-black/70 active:bg-black/80 transition-colors select-none"
            onTouchStart={handleTouchStart(onMoveRight)}
            onTouchEnd={handleTouchEnd(onMoveRight)}
            onMouseDown={handleMouseDown(onMoveRight)}
            onMouseUp={handleMouseUp(onMoveRight)}
            onMouseLeave={handleMouseLeave(onMoveRight)}
            aria-label="Move Right"
          >
            →
          </button>
        </div>
      </div>

      {/* Right side controls - Actions */}
      <div className="absolute right-4 bottom-4 flex flex-col space-y-2 pointer-events-auto">
        {/* Top row - Jump */}
        <div className="flex justify-center">
          <button
            className="w-16 h-16 sm:w-20 sm:h-20 bg-black/50 backdrop-blur-sm border-2 border-white/30 rounded-lg flex items-center justify-center text-white text-sm font-bold hover:bg-black/70 active:bg-black/80 transition-colors select-none"
            onTouchStart={handleTouchStart(onJump)}
            onTouchEnd={handleTouchEnd(onJump)}
            onMouseDown={handleMouseDown(onJump)}
            onMouseUp={handleMouseUp(onJump)}
            onMouseLeave={handleMouseLeave(onJump)}
            aria-label="Jump"
          >
            ↑<br/>JUMP
          </button>
        </div>

        {/* Bottom row - Crouch and Attack */}
        <div className="flex space-x-2">
          {/* Crouch Button */}
          <button
            className="w-16 h-16 sm:w-20 sm:h-20 bg-black/50 backdrop-blur-sm border-2 border-white/30 rounded-lg flex items-center justify-center text-white text-sm font-bold hover:bg-black/70 active:bg-black/80 transition-colors select-none"
            onTouchStart={handleTouchStart(onCrouch)}
            onTouchEnd={handleTouchEnd(onCrouch)}
            onMouseDown={handleMouseDown(onCrouch)}
            onMouseUp={handleMouseUp(onCrouch)}
            onMouseLeave={handleMouseLeave(onCrouch)}
            aria-label="Crouch"
          >
            ↓<br/>CROUCH
          </button>

          {/* Attack Button */}
          <button
            className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600/70 backdrop-blur-sm border-2 border-red-400/50 rounded-lg flex items-center justify-center text-white text-sm font-bold hover:bg-red-600/90 active:bg-red-700/90 transition-colors select-none"
            onTouchStart={handleTouchStart(onAttack)}
            onTouchEnd={handleTouchEnd(onAttack)}
            onMouseDown={handleMouseDown(onAttack)}
            onMouseUp={handleMouseUp(onAttack)}
            onMouseLeave={handleMouseLeave(onAttack)}
            aria-label="Attack"
          >
            ⚔<br/>ATTACK
          </button>
        </div>
      </div>
    </div>
  );
}