import { render, screen, fireEvent } from '@testing-library/react';
import { TouchControls } from '../TouchControls';

// Mock window properties for mobile detection
const mockWindow = (isMobile: boolean) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: isMobile ? 768 : 1200,
  });
  
  Object.defineProperty(window, 'ontouchstart', {
    writable: true,
    configurable: true,
    value: isMobile ? {} : undefined,
  });
  
  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    configurable: true,
    value: isMobile ? 5 : 0,
  });
};

describe('TouchControls', () => {
  const mockHandlers = {
    onMoveLeft: jest.fn(),
    onMoveRight: jest.fn(),
    onJump: jest.fn(),
    onCrouch: jest.fn(),
    onAttack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset window properties
    delete (window as any).ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  it('should not render on desktop devices', () => {
    mockWindow(false);
    
    const { container } = render(<TouchControls {...mockHandlers} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render on mobile devices', () => {
    mockWindow(true);
    
    render(<TouchControls {...mockHandlers} />);
    
    expect(screen.getByLabelText('Move Left')).toBeInTheDocument();
    expect(screen.getByLabelText('Move Right')).toBeInTheDocument();
    expect(screen.getByLabelText('Jump')).toBeInTheDocument();
    expect(screen.getByLabelText('Crouch')).toBeInTheDocument();
    expect(screen.getByLabelText('Attack')).toBeInTheDocument();
  });

  it('should handle touch events correctly', () => {
    mockWindow(true);
    
    render(<TouchControls {...mockHandlers} />);
    
    const moveLeftButton = screen.getByLabelText('Move Left');
    
    // Test touch start
    fireEvent.touchStart(moveLeftButton);
    expect(mockHandlers.onMoveLeft).toHaveBeenCalledWith(true);
    
    // Test touch end
    fireEvent.touchEnd(moveLeftButton);
    expect(mockHandlers.onMoveLeft).toHaveBeenCalledWith(false);
  });

  it('should handle mouse events for testing', () => {
    mockWindow(true);
    
    render(<TouchControls {...mockHandlers} />);
    
    const jumpButton = screen.getByLabelText('Jump');
    
    // Test mouse down
    fireEvent.mouseDown(jumpButton);
    expect(mockHandlers.onJump).toHaveBeenCalledWith(true);
    
    // Test mouse up
    fireEvent.mouseUp(jumpButton);
    expect(mockHandlers.onJump).toHaveBeenCalledWith(false);
    
    // Test mouse leave
    fireEvent.mouseLeave(jumpButton);
    expect(mockHandlers.onJump).toHaveBeenCalledWith(false);
  });

  it('should handle all control buttons', () => {
    mockWindow(true);
    
    render(<TouchControls {...mockHandlers} />);
    
    // Test all buttons
    fireEvent.touchStart(screen.getByLabelText('Move Left'));
    expect(mockHandlers.onMoveLeft).toHaveBeenCalledWith(true);
    
    fireEvent.touchStart(screen.getByLabelText('Move Right'));
    expect(mockHandlers.onMoveRight).toHaveBeenCalledWith(true);
    
    fireEvent.touchStart(screen.getByLabelText('Jump'));
    expect(mockHandlers.onJump).toHaveBeenCalledWith(true);
    
    fireEvent.touchStart(screen.getByLabelText('Crouch'));
    expect(mockHandlers.onCrouch).toHaveBeenCalledWith(true);
    
    fireEvent.touchStart(screen.getByLabelText('Attack'));
    expect(mockHandlers.onAttack).toHaveBeenCalledWith(true);
  });

  it('should prevent default on touch events', () => {
    mockWindow(true);
    
    render(<TouchControls {...mockHandlers} />);
    
    const moveLeftButton = screen.getByLabelText('Move Left');
    
    const touchStartEvent = new TouchEvent('touchstart', { bubbles: true });
    const preventDefaultSpy = jest.spyOn(touchStartEvent, 'preventDefault');
    
    fireEvent(moveLeftButton, touchStartEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});