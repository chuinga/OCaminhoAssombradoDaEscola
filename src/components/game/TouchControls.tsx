'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { getDeviceInfo, getOptimalTouchControlLayout, optimizeTouchPerformance } from '@/utils/touchControlOptimization';

interface TouchControlsProps {
  onMoveLeft: (pressed: boolean) => void;
  onMoveRight: (pressed: boolean) => void;
  onJump: (pressed: boolean) => void;
  onCrouch: (pressed: boolean) => void;
  onAttack: (pressed: boolean) => void;
  className?: string;
}

// Visual feedback state for buttons
interface ButtonState {
  isPressed: boolean;
  pressStartTime: number;
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
  const { triggerActionHaptic } = useHapticFeedback();
  const [showControls, setShowControls] = useState(false);
  
  // Button state for visual feedback
  const [buttonStates, setButtonStates] = useState<Record<string, ButtonState>>({
    moveLeft: { isPressed: false, pressStartTime: 0 },
    moveRight: { isPressed: false, pressStartTime: 0 },
    jump: { isPressed: false, pressStartTime: 0 },
    crouch: { isPressed: false, pressStartTime: 0 },
    attack: { isPressed: false, pressStartTime: 0 }
  });

  // Gesture detection state
  const gestureRef = useRef<HTMLDivElement>(null);
  const [gestureState, setGestureState] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isGesturing: false,
    gestureType: null as 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | null
  });

  // Show controls on mobile/tablet with touch support
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowControls(isTouchDevice && (isMobile || isTablet));
    
    // Optimize touch performance
    if (isTouchDevice) {
      optimizeTouchPerformance();
    }
  }, [isMobile, isTablet]);

  // Gesture detection handlers
  const handleGestureStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setGestureState(prev => ({
        ...prev,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isGesturing: true,
        gestureType: null
      }));
    }
  }, []);

  const handleGestureMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1 && gestureState.isGesturing) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - gestureState.startX;
      const deltaY = touch.clientY - gestureState.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Only trigger gestures if movement is significant (> 50px)
      if (distance > 50) {
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        let gestureType: typeof gestureState.gestureType = null;
        
        // Determine gesture direction based on angle
        if (angle >= -45 && angle <= 45) {
          gestureType = 'swipe-right';
        } else if (angle >= 135 || angle <= -135) {
          gestureType = 'swipe-left';
        } else if (angle >= 45 && angle <= 135) {
          gestureType = 'swipe-down';
        } else if (angle >= -135 && angle <= -45) {
          gestureType = 'swipe-up';
        }
        
        // Only update if gesture type changed
        if (gestureType && gestureType !== gestureState.gestureType) {
          setGestureState(prev => ({ ...prev, gestureType }));
          
          // Trigger haptic feedback for gesture
          triggerActionHaptic('gesture');
          
          // Execute gesture action
          switch (gestureType) {
            case 'swipe-left':
              onMoveLeft(true);
              setTimeout(() => onMoveLeft(false), 200);
              break;
            case 'swipe-right':
              onMoveRight(true);
              setTimeout(() => onMoveRight(false), 200);
              break;
            case 'swipe-up':
              onJump(true);
              setTimeout(() => onJump(false), 100);
              break;
            case 'swipe-down':
              onCrouch(true);
              setTimeout(() => onCrouch(false), 200);
              break;
          }
        }
      }
      
      setGestureState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY
      }));
    }
  }, [gestureState, onMoveLeft, onMoveRight, onJump, onCrouch]);

  const handleGestureEnd = useCallback(() => {
    setGestureState(prev => ({
      ...prev,
      isGesturing: false,
      gestureType: null
    }));
  }, []);

  // Set up gesture detection
  useEffect(() => {
    const element = gestureRef.current;
    if (!element || !showControls) return;

    element.addEventListener('touchstart', handleGestureStart, { passive: false });
    element.addEventListener('touchmove', handleGestureMove, { passive: false });
    element.addEventListener('touchend', handleGestureEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleGestureStart);
      element.removeEventListener('touchmove', handleGestureMove);
      element.removeEventListener('touchend', handleGestureEnd);
    };
  }, [showControls, handleGestureStart, handleGestureMove, handleGestureEnd]);

  // Don't render touch controls on desktop
  if (!showControls) {
    return null;
  }

  // Get optimal layout using device optimization
  const deviceInfo = getDeviceInfo();
  const layout = getOptimalTouchControlLayout(deviceInfo);

  // Enhanced touch event handlers with haptic and visual feedback
  const createTouchHandlers = (
    buttonKey: string, 
    callback: (pressed: boolean) => void,
    hapticIntensity: 'light' | 'medium' | 'heavy' = 'light'
  ) => {
    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Trigger haptic feedback
      triggerActionHaptic('button-press');
      
      // Update visual state
      setButtonStates(prev => ({
        ...prev,
        [buttonKey]: { isPressed: true, pressStartTime: Date.now() }
      }));
      
      callback(true);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Update visual state
      setButtonStates(prev => ({
        ...prev,
        [buttonKey]: { isPressed: false, pressStartTime: 0 }
      }));
      
      callback(false);
    };

    // Handle mouse events for testing on desktop
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setButtonStates(prev => ({
        ...prev,
        [buttonKey]: { isPressed: true, pressStartTime: Date.now() }
      }));
      
      callback(true);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setButtonStates(prev => ({
        ...prev,
        [buttonKey]: { isPressed: false, pressStartTime: 0 }
      }));
      
      callback(false);
    };

    const handleMouseLeave = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setButtonStates(prev => ({
        ...prev,
        [buttonKey]: { isPressed: false, pressStartTime: 0 }
      }));
      
      callback(false);
    };

    return {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave
    };
  };

  // Helper function to get button styling with visual feedback
  const getButtonStyle = (buttonKey: string, baseColor: string = 'black', accentColor?: string) => {
    const isPressed = buttonStates[buttonKey]?.isPressed;
    const pressedScale = isPressed ? 'scale-95' : 'scale-100';
    const pressedOpacity = isPressed ? 'opacity-90' : `opacity-${Math.round(layout.opacity * 100)}`;
    const pressedShadow = isPressed ? 'shadow-inner' : 'shadow-lg';
    const glowEffect = isPressed ? 'ring-2 ring-white/50' : '';
    
    if (accentColor) {
      return `${layout.buttonSize} bg-${accentColor}-600/70 backdrop-blur-sm border-2 border-${accentColor}-400/50 ${layout.borderRadius} flex items-center justify-center text-white ${layout.fontSize.labels} font-bold hover:bg-${accentColor}-600/90 active:bg-${accentColor}-700/90 transition-all duration-150 select-none ${pressedScale} ${pressedOpacity} ${pressedShadow} ${glowEffect}`;
    }
    
    return `${layout.buttonSize} bg-${baseColor}/50 backdrop-blur-sm border-2 border-white/30 ${layout.borderRadius} flex items-center justify-center text-white ${layout.fontSize.arrows} font-bold hover:bg-${baseColor}/70 active:bg-${baseColor}/80 transition-all duration-150 select-none ${pressedScale} ${pressedOpacity} ${pressedShadow} ${glowEffect}`;
  };

  return (
    <div className={`fixed inset-0 pointer-events-none z-20 ${className}`} ref={gestureRef}>
      {/* Gesture detection overlay */}
      {gestureState.isGesturing && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-2 h-2 bg-white/60 rounded-full animate-pulse"
            style={{
              left: gestureState.currentX - 4,
              top: gestureState.currentY - 4,
              transition: 'all 0.1s ease-out'
            }}
          />
          {gestureState.gestureType && (
            <div 
              className="absolute bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm font-medium"
              style={{
                left: gestureState.currentX + 10,
                top: gestureState.currentY - 20
              }}
            >
              {gestureState.gestureType.replace('-', ' ').toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Left side controls - Movement */}
      <div className={`absolute ${layout.positioning.left} ${layout.positioning.bottom} flex flex-col ${layout.spacing} pointer-events-auto`} data-touch-control="movement">
        {/* Movement controls container */}
        <div className={`flex ${layout.spacing}`}>
          {/* Move Left Button */}
          <button
            className={getButtonStyle('moveLeft')}
            {...createTouchHandlers('moveLeft', onMoveLeft, 'light')}
            aria-label="Mover para a esquerda"
            data-touch-control
            tabIndex={0}
          >
            ←
          </button>

          {/* Move Right Button */}
          <button
            className={getButtonStyle('moveRight')}
            {...createTouchHandlers('moveRight', onMoveRight, 'light')}
            aria-label="Mover para a direita"
            data-touch-control
            tabIndex={0}
          >
            →
          </button>
        </div>
      </div>

      {/* Right side controls - Actions */}
      <div className={`absolute ${layout.positioning.right} ${layout.positioning.bottom} flex flex-col ${layout.spacing} pointer-events-auto`} data-touch-control="actions">
        {/* Top row - Jump */}
        <div className="flex justify-center">
          <button
            className={getButtonStyle('jump').replace(layout.fontSize.arrows, layout.fontSize.labels)}
            {...createTouchHandlers('jump', onJump, 'medium')}
            aria-label="Saltar"
            data-touch-control
            tabIndex={0}
          >
            ↑<br/>SALTAR
          </button>
        </div>

        {/* Bottom row - Crouch and Attack */}
        <div className={`flex ${layout.spacing}`}>
          {/* Crouch Button */}
          <button
            className={getButtonStyle('crouch').replace(layout.fontSize.arrows, layout.fontSize.labels)}
            {...createTouchHandlers('crouch', onCrouch, 'light')}
            aria-label="Agachar"
            data-touch-control
            tabIndex={0}
          >
            ↓<br/>AGACHAR
          </button>

          {/* Attack Button */}
          <button
            className={getButtonStyle('attack', 'red', 'red').replace(layout.fontSize.arrows, layout.fontSize.labels)}
            {...createTouchHandlers('attack', onAttack, 'heavy')}
            aria-label="Atacar"
            data-touch-control
            tabIndex={0}
          >
            ⚔<br/>ATACAR
          </button>
        </div>
      </div>

      {/* Gesture help indicator (shows briefly on first load) */}
      {showControls && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs text-center animate-fade-in-out">
            <p>Swipe gestures: ← → ↑ ↓</p>
            <p className="text-gray-300">Or use touch controls</p>
          </div>
        </div>
      )}
    </div>
  );
}