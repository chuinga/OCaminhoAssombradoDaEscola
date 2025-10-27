import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';

// Import page components
import JogarPage from '@/app/jogar/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock Zustand store
jest.mock('@/store/gameStore', () => ({
  useGameStore: jest.fn(),
}));

// Mock game components
jest.mock('@/components/game/ClientOnlyPhaserGame', () => {
  return {
    ClientOnlyPhaserGame: ({ onGameEnd, difficulty }: any) => (
      <div data-testid="phaser-game">
        <p>Game running with difficulty: {difficulty}</p>
        <button onClick={() => onGameEnd(1500, true)}>End Game (Victory)</button>
        <button onClick={() => onGameEnd(800, false)}>End Game (Defeat)</button>
      </div>
    ),
  };
});

jest.mock('@/components/game/ResponsiveGameCanvas', () => {
  return {
    ResponsiveGameCanvas: ({ children }: any) => (
      <div data-testid="responsive-canvas">{children}</div>
    ),
  };
});

jest.mock('@/components/game/PerformanceMonitor', () => {
  return {
    PerformanceIndicator: () => <div data-testid="performance-indicator">Performance: 60 FPS</div>,
  };
});

describe('Navigation Flow Integration Tests', () => {
  const mockPush = jest.fn();
  const mockUseGameStore = useGameStore as jest.MockedFunction<typeof useGameStore>;
  
  const mockStoreActions = {
    setPlayerName: jest.fn(),
    setCharacter: jest.fn(),
    setWeapon: jest.fn(),
    setDifficulty: jest.fn(),
    updateLives: jest.fn(),
    updateScore: jest.fn(),
    setGameStatus: jest.fn(),
    resetGame: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
  });

  describe('Game Page Navigation Validation', () => {
    it('should redirect to name page when firstName is missing', () => {
      mockUseGameStore.mockReturnValue({
        firstName: '',
        lastName: 'Silva',
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<JogarPage />);
      
      expect(mockPush).toHaveBeenCalledWith('/nome');
    });

    it('should redirect to name page when lastName is missing', () => {
      mockUseGameStore.mockReturnValue({
        firstName: 'João',
        lastName: '',
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<JogarPage />);
      
      expect(mockPush).toHaveBeenCalledWith('/nome');
    });

    it('should redirect to character page when character is missing', () => {
      mockUseGameStore.mockReturnValue({
        firstName: 'João',
        lastName: 'Silva',
        character: null,
        weapon: 'katana',
        difficulty: 'easy',
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<JogarPage />);
      
      expect(mockPush).toHaveBeenCalledWith('/personagem');
    });

    it('should redirect to weapon page when weapon is missing', () => {
      mockUseGameStore.mockReturnValue({
        firstName: 'João',
        lastName: 'Silva',
        character: 'boy',
        weapon: null,
        difficulty: 'easy',
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<JogarPage />);
      
      expect(mockPush).toHaveBeenCalledWith('/arma');
    });

    it('should redirect to difficulty page when difficulty is missing', () => {
      mockUseGameStore.mockReturnValue({
        firstName: 'João',
        lastName: 'Silva',
        character: 'boy',
        weapon: 'katana',
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<JogarPage />);
      
      expect(mockPush).toHaveBeenCalledWith('/dificuldade');
    });

    it('should render game when all required state is present', () => {
      mockUseGameStore.mockReturnValue({
        firstName: 'João',
        lastName: 'Silva',
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<JogarPage />);
      
      expect(screen.getByTestId('phaser-game')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('performance-indicator')).toBeInTheDocument();
      expect(screen.getByText('Game running with difficulty: easy')).toBeInTheDocument();
    });
  });

  describe('Game End Navigation', () => {
    beforeEach(() => {
      mockUseGameStore.mockReturnValue({
        firstName: 'Maria',
        lastName: 'Santos',
        character: 'girl',
        weapon: 'laser',
        difficulty: 'medium',
        lives: 10,
        score: 0,
        gameStatus: 'playing',
        ...mockStoreActions,
      });
    });

    it('should navigate to results page with victory parameters', () => {
      render(<JogarPage />);
      
      const victoryButton = screen.getByText('End Game (Victory)');
      fireEvent.click(victoryButton);
      
      expect(mockPush).toHaveBeenCalledWith('/final?score=1500&victory=true');
    });

    it('should navigate to results page with defeat parameters', () => {
      render(<JogarPage />);
      
      const defeatButton = screen.getByText('End Game (Defeat)');
      fireEvent.click(defeatButton);
      
      expect(mockPush).toHaveBeenCalledWith('/final?score=800&victory=false');
    });
  });

  describe('Development Mode Features', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show debug info in development mode', () => {
      process.env.NODE_ENV = 'development';
      
      mockUseGameStore.mockReturnValue({
        firstName: 'Debug',
        lastName: 'User',
        character: 'girl',
        weapon: 'bazooka',
        difficulty: 'impossible',
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<JogarPage />);
      
      expect(screen.getByText('Player Config:')).toBeInTheDocument();
      expect(screen.getByText('Nome: Debug User')).toBeInTheDocument();
      expect(screen.getByText('Personagem: Menina')).toBeInTheDocument();
      expect(screen.getByText('Arma: bazooka')).toBeInTheDocument();
      expect(screen.getByText('Dificuldade: impossible')).toBeInTheDocument();
      
      const backButton = screen.getByText('← Voltar');
      fireEvent.click(backButton);
      
      expect(mockPush).toHaveBeenCalledWith('/dificuldade');
    });

    it('should not show debug info in production mode', () => {
      process.env.NODE_ENV = 'production';
      
      mockUseGameStore.mockReturnValue({
        firstName: 'Prod',
        lastName: 'User',
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<JogarPage />);
      
      expect(screen.queryByText('Player Config:')).not.toBeInTheDocument();
      expect(screen.queryByText('← Voltar')).not.toBeInTheDocument();
    });
  });
});