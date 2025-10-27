/**
 * Enhanced Touch Controls Tests
 * Tests for haptic feedback, gesture controls, and visual feedback
 * Requirements: 10.2
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { TouchControls } from '../TouchControls';

// Mock the hooks
jest.mock('@/hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: true,
    isTablet: false,
    isPortrait: true,
    width: 375,
    height: 667
  })
}));

jest.mock('@/hooks/useHapticFeedback', () => ({
  useHapticFeedback: () => ({
    triggerActionHaptic: jest.fn(),
    settings: { enabled: true, intensity: 'medium' },
    isSupported: true
  })
}));

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn()
});

// Mock touch support
Object.defineProperty(window, 'ontouchstart', {
  writable: true,
  value: true
});

Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  value: 5
});

describe('TouchControls Enhanced Features', () => {
  const mockHandlers = {
    onMoveLeft: jest.fn(),
    onMoveRight: jest.fn(),
    onJump: jest.fn(),
    onCrouch: jest.fn(),
    onAttack: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with enhanced visual feedback', () => {
    render(<TouchControls {...mockHandlers} />);
    
    // Check that buttons have the enhanced styling
    const moveLeftButton = screen.getByLabelText('Move Left');
    expect(moveLeftButton).toHaveAttribute('data-touch-control');
    expect(moveLeftButton.className).toContain('transition-all');
    expect(moveLeftButton.className).toContain('duration-150');
  });

  it('should show gesture help indicator', () => {
    render(<TouchControls {...mockHandlers} />);
    
    // Check for gesture help text
    expect(screen.getByText('Swipe gestures: ← → ↑ ↓')).toBeInTheDocument();
    expect(screen.getByText('Or use touch controls')).toBeInTheDocument();
  });

  it('should handle touch events with visual feedback', () => {
    render(<TouchControls {...mockHandlers} />);
    
    const moveLeftButton = screen.getByLabelText('Move Left');
    
    // Test touch start - should trigger visual feedback
    fireEvent.touchStart(moveLeftButton);
    expect(mockHandlers.onMoveLeft).toHaveBeenCalledWith(true);
    
    // Test touch end - should reset visual feedback
    fireEvent.touchEnd(moveLeftButton);
    expect(mockHandlers.onMoveLeft).toHaveBeenCalledWith(false);
  });

  it('should prevent event propagation on touch events', () => {
    render(<TouchControls {...mockHandlers} />);
    
    const moveLeftButton = screen.getByLabelText('Move Left');
    
    const touchStartEvent = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [{ clientX: 100, clientY: 100 } as Touch]
    });
    
    const preventDefaultSpy = jest.spyOn(touchStartEvent, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(touchStartEvent, 'stopPropagation');
    
    fireEvent(moveLeftButton, touchStartEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should handle different button types with appropriate styling', () => {
    render(<TouchControls {...mockHandlers} />);
    
    // Movement buttons should have standard styling
    const moveLeftButton = screen.getByLabelText('Move Left');
    expect(moveLeftButton.className).toContain('bg-black/50');
    
    // Attack button should have red accent styling
    const attackButton = screen.getByLabelText('Attack');
    expect(attackButton.className).toContain('bg-red-600/70');
  });

  it('should render with optimized positioning', () => {
    render(<TouchControls {...mockHandlers} />);
    
    // Check that controls have proper positioning attributes
    const leftControls = screen.getByLabelText('Move Left').closest('[data-touch-control="movement"]');
    const rightControls = screen.getByLabelText('Attack').closest('[data-touch-control="actions"]');
    
    expect(leftControls).toHaveClass('absolute');
    expect(rightControls).toHaveClass('absolute');
  });

  it('should handle gesture detection area', () => {
    render(<TouchControls {...mockHandlers} />);
    
    // The main container should have a ref for gesture detection
    const container = document.querySelector('.fixed.inset-0');
    expect(container).toBeInTheDocument();
  });
});