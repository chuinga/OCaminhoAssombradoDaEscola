import { render, screen } from '@testing-library/react';
import { GameHUD } from '../GameHUD';
import { useGameStore } from '../../../store/gameStore';

// Mock the game store
jest.mock('../../../store/gameStore');
const mockUseGameStore = useGameStore as jest.MockedFunction<typeof useGameStore>;

describe('GameHUD', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockUseGameStore.mockReset();
  });

  it('displays player name, lives, and score correctly', () => {
    // Mock store state
    mockUseGameStore.mockReturnValue({
      firstName: 'João',
      lastName: 'Silva',
      lives: 8,
      score: 1250,
      character: null,
      weapon: null,
      difficulty: null,
      gameStatus: 'playing',
      setPlayerName: jest.fn(),
      setCharacter: jest.fn(),
      setWeapon: jest.fn(),
      setDifficulty: jest.fn(),
      updateLives: jest.fn(),
      updateScore: jest.fn(),
      setGameStatus: jest.fn(),
      resetGame: jest.fn(),
    });

    render(<GameHUD />);

    // Check if player name is displayed
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    
    // Check if lives are displayed
    expect(screen.getByText('Lives')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    
    // Check if score is displayed
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('1250')).toBeInTheDocument();
  });

  it('displays "Player" as fallback when no name is provided', () => {
    // Mock store state with empty names
    mockUseGameStore.mockReturnValue({
      firstName: '',
      lastName: '',
      lives: 10,
      score: 0,
      character: null,
      weapon: null,
      difficulty: null,
      gameStatus: 'playing',
      setPlayerName: jest.fn(),
      setCharacter: jest.fn(),
      setWeapon: jest.fn(),
      setDifficulty: jest.fn(),
      updateLives: jest.fn(),
      updateScore: jest.fn(),
      setGameStatus: jest.fn(),
      resetGame: jest.fn(),
    });

    render(<GameHUD />);

    // Check if fallback name is displayed (look for the specific player name element)
    expect(screen.getAllByText('Player')).toHaveLength(2); // Label and name
  });

  it('displays large scores correctly', () => {
    // Mock store state with large score
    mockUseGameStore.mockReturnValue({
      firstName: 'Test',
      lastName: 'User',
      lives: 5,
      score: 123456,
      character: null,
      weapon: null,
      difficulty: null,
      gameStatus: 'playing',
      setPlayerName: jest.fn(),
      setCharacter: jest.fn(),
      setWeapon: jest.fn(),
      setDifficulty: jest.fn(),
      updateLives: jest.fn(),
      updateScore: jest.fn(),
      setGameStatus: jest.fn(),
      resetGame: jest.fn(),
    });

    render(<GameHUD />);

    // Check if score is displayed (use regex to match formatted number)
    expect(screen.getByText(/123[\s,]456/)).toBeInTheDocument();
  });

  it('has correct CSS classes for responsive design', () => {
    mockUseGameStore.mockReturnValue({
      firstName: 'Test',
      lastName: 'User',
      lives: 10,
      score: 0,
      character: null,
      weapon: null,
      difficulty: null,
      gameStatus: 'playing',
      setPlayerName: jest.fn(),
      setCharacter: jest.fn(),
      setWeapon: jest.fn(),
      setDifficulty: jest.fn(),
      updateLives: jest.fn(),
      updateScore: jest.fn(),
      setGameStatus: jest.fn(),
      resetGame: jest.fn(),
    });

    const { container } = render(<GameHUD />);
    
    // Check if the main container has the correct positioning classes
    const hudContainer = container.firstChild as HTMLElement;
    expect(hudContainer).toHaveClass('absolute', 'top-0', 'left-0', 'right-0', 'z-20', 'pointer-events-none');
  });
});