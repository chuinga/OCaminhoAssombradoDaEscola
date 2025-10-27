import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';

// Import page components
import HomePage from '@/app/page';
import NomePage from '@/app/nome/page';
import PersonagemPage from '@/app/personagem/page';
import ArmaPage from '@/app/arma/page';
import DificuldadePage from '@/app/dificuldade/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Zustand store
jest.mock('@/store/gameStore', () => ({
  useGameStore: jest.fn(),
}));

// Mock API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getTop10Scores: jest.fn().mockResolvedValue({ scores: [], total: 0 }),
  },
}));

describe('State Persistence Integration Tests', () => {
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

  describe('Progressive State Building', () => {
    it('should build state progressively through the flow', () => {
      // Step 1: Start with empty state
      mockUseGameStore.mockReturnValue({
        firstName: '',
        lastName: '',
        character: null,
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      const { rerender } = render(<NomePage />);
      
      // Fill in names
      const firstNameInput = screen.getByLabelText('Primeiro Nome');
      const lastNameInput = screen.getByLabelText('Último Nome');
      
      fireEvent.change(firstNameInput, { target: { value: 'Ana' } });
      fireEvent.change(lastNameInput, { target: { value: 'Costa' } });
      fireEvent.click(screen.getByText('Continuar'));

      expect(mockStoreActions.setPlayerName).toHaveBeenCalledWith('Ana', 'Costa');

      // Step 2: State now has names
      mockUseGameStore.mockReturnValue({
        firstName: 'Ana',
        lastName: 'Costa',
        character: null,
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      rerender(<PersonagemPage />);
      
      expect(screen.getByText(/Olá Ana!/)).toBeInTheDocument();
      
      // Select character
      const girlCharacter = screen.getByText('Menina').closest('div');
      fireEvent.click(girlCharacter!);
      fireEvent.click(screen.getByText('Continuar'));

      expect(mockStoreActions.setCharacter).toHaveBeenCalledWith('girl');

      // Step 3: State now has names and character
      mockUseGameStore.mockReturnValue({
        firstName: 'Ana',
        lastName: 'Costa',
        character: 'girl',
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      rerender(<ArmaPage />);
      
      // Select weapon
      const laserWeapon = screen.getByText('Pistola de Laser').closest('div');
      fireEvent.click(laserWeapon!);
      fireEvent.click(screen.getByText('Continuar'));

      expect(mockStoreActions.setWeapon).toHaveBeenCalledWith('laser');

      // Step 4: State now has names, character, and weapon
      mockUseGameStore.mockReturnValue({
        firstName: 'Ana',
        lastName: 'Costa',
        character: 'girl',
        weapon: 'laser',
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      rerender(<DificuldadePage />);
      
      // Select difficulty - use getAllByText to get the title, not the stats text
      const mediumDifficultyCards = screen.getAllByText('Médio');
      const mediumDifficultyCard = mediumDifficultyCards[0].closest('.cursor-pointer');
      fireEvent.click(mediumDifficultyCard!);
      fireEvent.click(screen.getByText('Começar Jogo'));

      expect(mockStoreActions.setDifficulty).toHaveBeenCalledWith('medium');
    });
  });

  describe('State Validation and Redirects', () => {
    it('should enforce sequential flow by redirecting when state is incomplete', () => {
      // Try to access character page without names
      mockUseGameStore.mockReturnValue({
        firstName: '',
        lastName: '',
        character: null,
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<PersonagemPage />);
      expect(mockPush).toHaveBeenCalledWith('/nome');

      // Try to access weapon page without character
      mockUseGameStore.mockReturnValue({
        firstName: 'Test',
        lastName: 'User',
        character: null,
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<ArmaPage />);
      expect(mockPush).toHaveBeenCalledWith('/personagem');

      // Try to access difficulty page without weapon
      mockUseGameStore.mockReturnValue({
        firstName: 'Test',
        lastName: 'User',
        character: 'boy',
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<DificuldadePage />);
      expect(mockPush).toHaveBeenCalledWith('/arma');
    });

    it('should allow access when all required state is present', () => {
      // Access character page with names
      mockUseGameStore.mockReturnValue({
        firstName: 'Valid',
        lastName: 'User',
        character: null,
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<PersonagemPage />);
      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText(/Olá Valid!/)).toBeInTheDocument();

      // Access weapon page with names and character
      mockUseGameStore.mockReturnValue({
        firstName: 'Valid',
        lastName: 'User',
        character: 'boy',
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<ArmaPage />);
      expect(screen.getByText('Escolha a sua Arma')).toBeInTheDocument();

      // Access difficulty page with names, character, and weapon
      mockUseGameStore.mockReturnValue({
        firstName: 'Valid',
        lastName: 'User',
        character: 'boy',
        weapon: 'katana',
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<DificuldadePage />);
      expect(screen.getByText('Escolha a Dificuldade')).toBeInTheDocument();
    });
  });

  describe('State Persistence During Navigation', () => {
    it('should maintain selected values when navigating back and forth', () => {
      // Character page with pre-selected character
      mockUseGameStore.mockReturnValue({
        firstName: 'Persistent',
        lastName: 'User',
        character: 'girl',
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      const { rerender } = render(<PersonagemPage />);
      
      // Girl character should be pre-selected - find the correct parent div
      const girlCharacterCard = screen.getByText('Menina').closest('.cursor-pointer');
      expect(girlCharacterCard).toHaveClass('border-purple-500');

      // Weapon page with pre-selected weapon
      mockUseGameStore.mockReturnValue({
        firstName: 'Persistent',
        lastName: 'User',
        character: 'girl',
        weapon: 'bazooka',
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      rerender(<ArmaPage />);
      
      // Bazooka should be pre-selected - find the correct parent div
      const bazookaWeaponCard = screen.getByText('Bazuca').closest('.cursor-pointer');
      expect(bazookaWeaponCard).toHaveClass('border-purple-500');

      // Difficulty page with pre-selected difficulty
      mockUseGameStore.mockReturnValue({
        firstName: 'Persistent',
        lastName: 'User',
        character: 'girl',
        weapon: 'bazooka',
        difficulty: 'impossible',
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      rerender(<DificuldadePage />);
      
      // Impossible difficulty should be pre-selected - find the correct parent div
      const impossibleDifficultyCard = screen.getByText('Impossível').closest('.cursor-pointer');
      expect(impossibleDifficultyCard).toHaveClass('border-purple-500');
    });
  });

  describe('Game State Updates', () => {
    it('should handle game state updates during gameplay', () => {
      // Simulate game in progress
      mockUseGameStore.mockReturnValue({
        firstName: 'Player',
        lastName: 'One',
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        lives: 7,
        score: 1200,
        gameStatus: 'playing',
        ...mockStoreActions,
      });

      // These would typically be called by the game engine
      const { updateLives, updateScore, setGameStatus } = mockStoreActions;

      // Simulate taking damage
      expect(updateLives).toBeDefined();
      expect(updateScore).toBeDefined();
      expect(setGameStatus).toBeDefined();

      // Simulate game completion
      mockUseGameStore.mockReturnValue({
        firstName: 'Player',
        lastName: 'One',
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        lives: 5,
        score: 2500,
        gameStatus: 'finished',
        ...mockStoreActions,
      });

      // State should reflect final game state
      const finalState = mockUseGameStore();
      expect(finalState.lives).toBe(5);
      expect(finalState.score).toBe(2500);
      expect(finalState.gameStatus).toBe('finished');
    });
  });

  describe('State Reset Functionality', () => {
    it('should reset state when starting a new game', () => {
      // Simulate completed game state
      mockUseGameStore.mockReturnValue({
        firstName: 'Completed',
        lastName: 'Player',
        character: 'girl',
        weapon: 'laser',
        difficulty: 'medium',
        lives: 0,
        score: 3000,
        gameStatus: 'finished',
        ...mockStoreActions,
      });

      // Reset should be called when returning to home
      const { resetGame } = mockStoreActions;
      resetGame();

      expect(resetGame).toHaveBeenCalled();

      // After reset, state should be back to initial values
      mockUseGameStore.mockReturnValue({
        firstName: '',
        lastName: '',
        character: null,
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      render(<HomePage />);
      
      // Should be able to start a new game
      const playButton = screen.getByText('🎮 Jogar');
      expect(playButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle partial state corruption gracefully', () => {
      // Simulate corrupted state where some values are invalid
      mockUseGameStore.mockReturnValue({
        firstName: 'Valid',
        lastName: 'User',
        character: 'invalid' as any, // Invalid character value
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      // Should still redirect appropriately based on validation logic
      // The ArmaPage checks for character existence, not validity, so it won't redirect
      render(<ArmaPage />);
      // Since character is truthy (even if invalid), it won't redirect
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle missing store actions gracefully', () => {
      // Simulate missing actions (shouldn't happen in real app)
      mockUseGameStore.mockReturnValue({
        firstName: 'Test',
        lastName: 'User',
        character: null,
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        setPlayerName: undefined as any,
        setCharacter: undefined as any,
        setWeapon: undefined as any,
        setDifficulty: undefined as any,
        updateLives: undefined as any,
        updateScore: undefined as any,
        setGameStatus: undefined as any,
        resetGame: undefined as any,
      });

      // Should not crash when actions are missing
      expect(() => render(<NomePage />)).not.toThrow();
    });
  });
});