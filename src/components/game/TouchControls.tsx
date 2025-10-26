'use client';

import { useEffect, useState } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

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
  const { isMobile, isTablet, isPortrait, width, height } = useResponsive();
  const [showControls, setShowControls] = useState(false);

  // Show controls on mobile/tablet with touch support
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowControls(isTouchDevice && (isMobile || isTablet));
  }, [isMobile, isTablet]);

  // Don't render touch controls on desktop
  if (!showControls) {
    return null;
  }

  // Calculate responsive button sizes and positions
  const getButtonSize = () => {
    if (width < 375) return 'w-12 h-12'; // Very small phones
    if (width < 768) return 'w-14 h-14'; // Regular phones
    if (isTablet) return 'w-20 h-20'; // Tablets
    return 'w-16 h-16'; // Default
  };

  const getSpacing = () => {
    if (width < 375) return 'space-x-1 space-y-1';
    if (width < 768) return 'space-x-2 space-y-2';
    return 'space-x-3 space-y-3';
  };

  const getBottomOffset = () => {
    if (isPortrait && height < 600) return 'bottom-2'; // Very short screens
    if (isPortrait) return 'bottom-4'; // Portrait mode
    return 'bottom-6'; // Landscape mode
  };

  const buttonSize = getButtonSize();
  const spacing = getSpacing();
  const bottomOffset = getBottomOffset();

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
      <div className={`absolute left-2 sm:left-4 ${bottomOffset} flex flex-col ${spacing} pointer-events-auto`}>
        {/* Movement controls container */}
        <div className={`flex ${spacing}`}>
          {/* Move Left Button */}
          <button
            className={`${buttonSize} bg-black/50 backdrop-blur-sm border-2 border-white/30 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl font-bold hover:bg-black/70 active:bg-black/80 transition-colors select-none`}
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
            className={`${buttonSize} bg-black/50 backdrop-blur-sm border-2 border-white/30 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl font-bold hover:bg-black/70 active:bg-black/80 transition-colors select-none`}
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
      <div className={`absolute right-2 sm:right-4 ${bottomOffset} flex flex-col ${spacing} pointer-events-auto`}>
        {/* Top row - Jump */}
        <div className="flex justify-center">
          <button
            className={`${buttonSize} bg-black/50 backdrop-blur-sm border-2 border-white/30 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold hover:bg-black/70 active:bg-black/80 transition-colors select-none`}
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
        <div className={`flex ${spacing}`}>
          {/* Crouch Button */}
          <button
            className={`${buttonSize} bg-black/50 backdrop-blur-sm border-2 border-white/30 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold hover:bg-black/70 active:bg-black/80 transition-colors select-none`}
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
            className={`${buttonSize} bg-red-600/70 backdrop-blur-sm border-2 border-red-400/50 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold hover:bg-red-600/90 active:bg-red-700/90 transition-colors select-none`}
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