import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { apiClient } from '@/lib/api';

// Import page components
import HomePage from '@/app/page';
import NomePage from '@/app/nome/page';
import PersonagemPage from '@/app/personagem/page';
import ArmaPage from '@/app/arma/page';
import DificuldadePage from '@/app/dificuldade/page';
import FinalPage from '@/app/final/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getTop10Scores: jest.fn(),
    getAllScores: jest.fn(),
    submitScore: jest.fn(),
    healthCheck: jest.fn(),
  },
}));

// Mock Zustand store
jest.mock('@/store/gameStore', () => ({
  useGameStore: jest.fn(),
}));

describe('Game Flow Integration Tests', () => {
  const mockPush = jest.fn();
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
  const mockUseGameStore = useGameStore as jest.MockedFunction<typeof useGameStore>;
  
  // Mock store state and actions
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
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });

    // Setup default store state
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

    // Setup default API responses
    mockApiClient.getTop10Scores.mockResolvedValue({
      scores: [],
      total: 0,
    });
  });

  describe('Complete Game Flow - Happy Path', () => {
    it('should complete full game flow from home to results', async () => {
      // Step 1: Home page loads with leaderboard
      mockApiClient.getTop10Scores.mockResolvedValue({
        scores: [
          {
            scoreId: '1',
            firstName: 'Test',
            lastName: 'Player',
            score: 1500,
            character: 'boy',
            weapon: 'katana',
            difficulty: 'easy',
            createdAt: '2025-01-01T00:00:00Z',
          },
        ],
        total: 1,
      });

      const { rerender } = render(<HomePage />);
      
      // Wait for leaderboard to load
      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
      });
      
      // The "Jogar" button is a Link component, not a button that calls router.push
      // So we don't expect mockPush to be called here
      const playButton = screen.getByText('🎮 Jogar');
      expect(playButton).toBeInTheDocument();

      // Step 2: Name input page
      rerender(<NomePage />);
      
      const firstNameInput = screen.getByLabelText('Primeiro Nome');
      const lastNameInput = screen.getByLabelText('Último Nome');
      const continueButton = screen.getByText('Continuar');

      // Fill in names
      fireEvent.change(firstNameInput, { target: { value: 'João' } });
      fireEvent.change(lastNameInput, { target: { value: 'Silva' } });
      fireEvent.click(continueButton);

      expect(mockStoreActions.setPlayerName).toHaveBeenCalledWith('João', 'Silva');
      expect(mockPush).toHaveBeenCalledWith('/personagem');

      // Step 3: Character selection page
      mockUseGameStore.mockReturnValue({
        firstName: 'João',
        lastName: 'Silva',
        character: null,
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      rerender(<PersonagemPage />);
      
      // Select boy character
      const boyCharacter = screen.getByText('Menino').closest('div');
      fireEvent.click(boyCharacter!);
      
      const characterContinueButton = screen.getByText('Continuar');
      fireEvent.click(characterContinueButton);

      expect(mockStoreActions.setCharacter).toHaveBeenCalledWith('boy');
      expect(mockPush).toHaveBeenCalledWith('/arma');

      // Step 4: Weapon selection page
      mockUseGameStore.mockReturnValue({
        firstName: 'João',
        lastName: 'Silva',
        character: 'boy',
        weapon: null,
        difficulty: null,
        lives: 10,
        score: 0,
        gameStatus: 'menu',
        ...mockStoreActions,
      });

      rerender(<ArmaPage />);
      
      // Select katana weapon
      const katanaWeapon = screen.getByText('Katana').closest('div');
      fireEvent.click(katanaWeapon!);
      
      const weaponContinueButton = screen.getByText('Continuar');
      fireEvent.click(weaponContinueButton);

      expect(mockStoreActions.setWeapon).toHaveBeenCalledWith('katana');
      expect(mockPush).toHaveBeenCalledWith('/dificuldade');

      // Step 5: Difficulty selection page
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

      rerender(<DificuldadePage />);
      
      // Select easy difficulty
      const easyDifficulty = screen.getByText('Fácil').closest('div');
      fireEvent.click(easyDifficulty!);
      
      const difficultyContinueButton = screen.getByText('Começar Jogo');
      fireEvent.click(difficultyContinueButton);

      expect(mockStoreActions.setDifficulty).toHaveBeenCalledWith('easy');
      expect(mockPush).toHaveBeenCalledWith('/jogar');

      // Step 6: Game completion and results
      mockUseGameStore.mockReturnValue({
        firstName: 'João',
        lastName: 'Silva',
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        lives: 5,
        score: 2500,
        gameStatus: 'finished',
        ...mockStoreActions,
      });

      mockApiClient.submitScore.mockResolvedValue({
        scoreId: 'new-score-id',
        firstName: 'João',
        lastName: 'Silva',
        score: 2500,
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        createdAt: '2025-01-01T12:00:00Z',
      });

      mockApiClient.getAllScores.mockResolvedValue({
        scores: [
          {
            scoreId: 'new-score-id',
            firstName: 'João',
            lastName: 'Silva',
            score: 2500,
            character: 'boy',
            weapon: 'katana',
            difficulty: 'easy',
            createdAt: '2025-01-01T12:00:00Z',
          },
        ],
        hasMore: false,
      });

      rerender(<FinalPage />);
      
      // Wait for score submission and leaderboard load
      await waitFor(() => {
        expect(mockApiClient.submitScore).toHaveBeenCalledWith({
          firstName: 'João',
          lastName: 'Silva',
          score: 2500,
          character: 'boy',
          weapon: 'katana',
          difficulty: 'easy',
        });
      });

      await waitFor(() => {
        expect(screen.getAllByText('2500')[0]).toBeInTheDocument(); // Use getAllByText since score appears twice
      });

      // Return to home
      const backToHomeButton = screen.getByText('Voltar ao Início');
      fireEvent.click(backToHomeButton);

      expect(mockStoreActions.resetGame).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('State Management Across Navigation', () => {
    it('should maintain state when navigating between pages', () => {
      // Test that state persists across page navigation
      mockUseGameStore.mockReturnValue({
        firstName: 'Maria',
        lastName: 'Santos',
        character: 'girl',
        weapon: 'laser',
        difficulty: 'medium',
        lives: 8,
        score: 1200,
        gameStatus: 'playing',
        ...mockStoreActions,
      });

      // Render character page with existing state
      render(<PersonagemPage />);
      
      // Should show the user's name from state
      expect(screen.getByText(/Olá Maria!/)).toBeInTheDocument();
      
      // Should have girl character pre-selected - need to find the correct parent div
      const girlCharacterCard = screen.getByText('Menina').closest('.cursor-pointer');
      expect(girlCharacterCard).toHaveClass('border-purple-500');
    });

    it('should redirect to name page when required state is missing', () => {
      // Test navigation validation
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
      
      // Should redirect to name page when names are missing
      expect(mockPush).toHaveBeenCalledWith('/nome');
    });

    it('should reset game state when returning to home', async () => {
      mockUseGameStore.mockReturnValue({
        firstName: 'Test',
        lastName: 'User',
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        lives: 0,
        score: 1000,
        gameStatus: 'finished',
        ...mockStoreActions,
      });

      mockApiClient.submitScore.mockResolvedValue({
        scoreId: 'test-id',
        firstName: 'Test',
        lastName: 'User',
        score: 1000,
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        createdAt: '2025-01-01T00:00:00Z',
      });

      mockApiClient.getAllScores.mockResolvedValue({
        scores: [],
        hasMore: false,
      });

      render(<FinalPage />);
      
      const backButton = screen.getByText('Voltar ao Início');
      fireEvent.click(backButton);

      expect(mockStoreActions.resetGame).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('API Integration with Mock Backend', () => {
    it('should handle successful leaderboard loading', async () => {
      const mockScores = [
        {
          scoreId: '1',
          firstName: 'Player',
          lastName: 'One',
          score: 5000,
          character: 'boy' as const,
          weapon: 'bazooka',
          difficulty: 'impossible' as const,
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          scoreId: '2',
          firstName: 'Player',
          lastName: 'Two',
          score: 3000,
          character: 'girl' as const,
          weapon: 'laser',
          difficulty: 'medium' as const,
          createdAt: '2025-01-01T01:00:00Z',
        },
      ];

      mockApiClient.getTop10Scores.mockResolvedValue({
        scores: mockScores,
        total: 2,
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Player One')).toBeInTheDocument();
        expect(screen.getByText('Player Two')).toBeInTheDocument();
        expect(screen.getByText('5000')).toBeInTheDocument(); // No formatting in test
        expect(screen.getByText('3000')).toBeInTheDocument(); // No formatting in test
      });

      expect(mockApiClient.getTop10Scores).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.getTop10Scores.mockRejectedValue(new Error('Network error'));

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Erro ao carregar o leaderboard/)).toBeInTheDocument();
      });

      // Should show retry button
      const retryButton = screen.getByText('Tentar Novamente');
      expect(retryButton).toBeInTheDocument();
    });

    it('should submit score successfully and load results', async () => {
      const gameState = {
        firstName: 'Ana',
        lastName: 'Costa',
        character: 'girl' as const,
        weapon: 'baseball' as const,
        difficulty: 'hard' as const,
        lives: 3,
        score: 4500,
        gameStatus: 'finished' as const,
        ...mockStoreActions,
      };

      mockUseGameStore.mockReturnValue(gameState);

      const submittedScore = {
        scoreId: 'submitted-score',
        firstName: 'Ana',
        lastName: 'Costa',
        score: 4500,
        character: 'girl' as const,
        weapon: 'baseball',
        difficulty: 'hard' as const,
        createdAt: '2025-01-01T15:00:00Z',
      };

      mockApiClient.submitScore.mockResolvedValue(submittedScore);
      mockApiClient.getAllScores.mockResolvedValue({
        scores: [submittedScore],
        hasMore: false,
      });

      render(<FinalPage />);

      await waitFor(() => {
        expect(mockApiClient.submitScore).toHaveBeenCalledWith({
          firstName: 'Ana',
          lastName: 'Costa',
          score: 4500,
          character: 'girl',
          weapon: 'baseball',
          difficulty: 'hard',
        });
      });

      await waitFor(() => {
        expect(screen.getAllByText('Ana Costa')[0]).toBeInTheDocument(); // Use getAllByText since name appears twice
        expect(screen.getAllByText('4500')[0]).toBeInTheDocument(); // Use getAllByText since score appears twice
      });
    });

    it('should handle score submission errors', async () => {
      mockUseGameStore.mockReturnValue({
        firstName: 'Error',
        lastName: 'Test',
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        lives: 0,
        score: 1000,
        gameStatus: 'finished',
        ...mockStoreActions,
      });

      mockApiClient.submitScore.mockRejectedValue(new Error('Submission failed'));
      mockApiClient.getAllScores.mockResolvedValue({
        scores: [],
        hasMore: false,
      });

      render(<FinalPage />);

      await waitFor(() => {
        expect(screen.getByText(/Falha ao enviar pontuação automaticamente/)).toBeInTheDocument();
      });
    });

    it('should handle pagination in all scores view', async () => {
      const firstPageScores = Array.from({ length: 10 }, (_, i) => ({
        scoreId: `score-${i}`,
        firstName: `Player`,
        lastName: `${i}`,
        score: 1000 - i * 100,
        character: i % 2 === 0 ? 'boy' as const : 'girl' as const,
        weapon: 'katana',
        difficulty: 'easy' as const,
        createdAt: '2025-01-01T00:00:00Z',
      }));

      const secondPageScores = Array.from({ length: 5 }, (_, i) => ({
        scoreId: `score-${i + 10}`,
        firstName: `Player`,
        lastName: `${i + 10}`,
        score: 500 - i * 50,
        character: i % 2 === 0 ? 'boy' as const : 'girl' as const,
        weapon: 'laser',
        difficulty: 'medium' as const,
        createdAt: '2025-01-01T01:00:00Z',
      }));

      mockUseGameStore.mockReturnValue({
        firstName: 'Test',
        lastName: 'User',
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        lives: 5,
        score: 800,
        gameStatus: 'finished',
        ...mockStoreActions,
      });

      mockApiClient.submitScore.mockResolvedValue({
        scoreId: 'new-score',
        firstName: 'Test',
        lastName: 'User',
        score: 800,
        character: 'boy',
        weapon: 'katana',
        difficulty: 'easy',
        createdAt: '2025-01-01T12:00:00Z',
      });

      // First call returns first page with nextToken
      mockApiClient.getAllScores
        .mockResolvedValueOnce({
          scores: firstPageScores,
          nextToken: 'next-page-token',
          hasMore: true,
        })
        .mockResolvedValueOnce({
          scores: secondPageScores,
          hasMore: false,
        });

      render(<FinalPage />);

      // Wait for first page to load
      await waitFor(() => {
        expect(screen.getByText('Player 0')).toBeInTheDocument();
      });

      // Should show "Carregar Mais" button when there are more scores
      const loadMoreButton = screen.getByText('Carregar Mais');
      expect(loadMoreButton).toBeInTheDocument();

      // Click load more
      fireEvent.click(loadMoreButton);

      // Wait for second page to load
      await waitFor(() => {
        expect(screen.getByText('Player 10')).toBeInTheDocument();
      });

      // Should have called getAllScores twice
      expect(mockApiClient.getAllScores).toHaveBeenCalledTimes(2);
      expect(mockApiClient.getAllScores).toHaveBeenNthCalledWith(2, 'next-page-token');
    });
  });

  describe('Form Validation and Error Handling', () => {
    it('should validate name input form', () => {
      render(<NomePage />);

      const continueButton = screen.getByText('Continuar');
      
      // Try to submit without filling fields
      fireEvent.click(continueButton);

      expect(screen.getByText('Primeiro nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Último nome é obrigatório')).toBeInTheDocument();
      expect(mockStoreActions.setPlayerName).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should require character selection before continuing', () => {
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

      render(<PersonagemPage />);

      const continueButton = screen.getByText('Selecione um personagem');
      expect(continueButton).toBeDisabled();
    });
  });
});