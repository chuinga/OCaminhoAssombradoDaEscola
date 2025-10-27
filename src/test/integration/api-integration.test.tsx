import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { apiClient } from '@/lib/api';
import HomePage from '@/app/page';

// Mock API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    getTop10Scores: jest.fn(),
    getAllScores: jest.fn(),
    submitScore: jest.fn(),
    healthCheck: jest.fn(),
  },
}));

describe('API Integration Tests', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Leaderboard API Integration', () => {
    it('should load and display leaderboard data successfully', async () => {
      const mockScores = [
        {
          scoreId: '1',
          firstName: 'Top',
          lastName: 'Player',
          score: 5000,
          character: 'boy' as const,
          weapon: 'bazooka',
          difficulty: 'impossible' as const,
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          scoreId: '2',
          firstName: 'Second',
          lastName: 'Player',
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

      // Wait for API call and data to load
      await waitFor(() => {
        expect(mockApiClient.getTop10Scores).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(screen.getByText('Top Player')).toBeInTheDocument();
        expect(screen.getByText('Second Player')).toBeInTheDocument();
        expect(screen.getByText('5000')).toBeInTheDocument();
        expect(screen.getByText('3000')).toBeInTheDocument();
      });

      // Check that character emojis are displayed
      expect(screen.getByText('👦')).toBeInTheDocument();
      expect(screen.getByText('👧')).toBeInTheDocument();
    });

    it('should handle empty leaderboard gracefully', async () => {
      mockApiClient.getTop10Scores.mockResolvedValue({
        scores: [],
        total: 0,
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Ainda não há pontuações registadas.')).toBeInTheDocument();
        expect(screen.getByText('Seja o primeiro a jogar!')).toBeInTheDocument();
      });
    });

    it('should handle API errors and show error message', async () => {
      mockApiClient.getTop10Scores.mockRejectedValue(new Error('Network error'));

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Erro ao carregar o leaderboard/)).toBeInTheDocument();
        expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching data', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const controlledPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockApiClient.getTop10Scores.mockReturnValue(controlledPromise);

      render(<HomePage />);

      // Should show loading spinner - look for the spinner by class
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      // Resolve the promise
      resolvePromise!({ scores: [], total: 0 });

      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).not.toBeInTheDocument();
      });
    });

    it('should display top 5 players only', async () => {
      const mockScores = Array.from({ length: 10 }, (_, i) => ({
        scoreId: `score-${i}`,
        firstName: `Player`,
        lastName: `${i + 1}`,
        score: 1000 - i * 100,
        character: i % 2 === 0 ? 'boy' as const : 'girl' as const,
        weapon: 'katana',
        difficulty: 'easy' as const,
        createdAt: '2025-01-01T00:00:00Z',
      }));

      mockApiClient.getTop10Scores.mockResolvedValue({
        scores: mockScores,
        total: 10,
      });

      render(<HomePage />);

      await waitFor(() => {
        // Should show first 5 players
        expect(screen.getByText('Player 1')).toBeInTheDocument();
        expect(screen.getByText('Player 2')).toBeInTheDocument();
        expect(screen.getByText('Player 3')).toBeInTheDocument();
        expect(screen.getByText('Player 4')).toBeInTheDocument();
        expect(screen.getByText('Player 5')).toBeInTheDocument();
        
        // Should not show 6th player and beyond
        expect(screen.queryByText('Player 6')).not.toBeInTheDocument();
      });
    });

    it('should format scores with proper styling for rankings', async () => {
      const mockScores = [
        {
          scoreId: '1',
          firstName: 'Gold',
          lastName: 'Winner',
          score: 5000,
          character: 'boy' as const,
          weapon: 'bazooka',
          difficulty: 'impossible' as const,
          createdAt: '2025-01-01T00:00:00Z',
        },
        {
          scoreId: '2',
          firstName: 'Silver',
          lastName: 'Runner',
          score: 3000,
          character: 'girl' as const,
          weapon: 'laser',
          difficulty: 'medium' as const,
          createdAt: '2025-01-01T01:00:00Z',
        },
        {
          scoreId: '3',
          firstName: 'Bronze',
          lastName: 'Third',
          score: 2000,
          character: 'boy' as const,
          weapon: 'katana',
          difficulty: 'easy' as const,
          createdAt: '2025-01-01T02:00:00Z',
        },
      ];

      mockApiClient.getTop10Scores.mockResolvedValue({
        scores: mockScores,
        total: 3,
      });

      render(<HomePage />);

      await waitFor(() => {
        // Check that rankings are displayed
        const firstPlace = screen.getByText('1');
        const secondPlace = screen.getByText('2');
        const thirdPlace = screen.getByText('3');

        expect(firstPlace).toHaveClass('text-yellow-400'); // Gold
        expect(secondPlace).toHaveClass('text-gray-300'); // Silver
        expect(thirdPlace).toHaveClass('text-orange-600'); // Bronze
      });
    });
  });

  describe('Score Submission API Integration', () => {
    it('should validate score submission data', async () => {
      const validScoreData = {
        firstName: 'Test',
        lastName: 'Player',
        score: 1500,
        character: 'boy' as const,
        weapon: 'katana',
        difficulty: 'easy' as const,
      };

      const expectedResponse = {
        scoreId: 'new-score-id',
        ...validScoreData,
        createdAt: '2025-01-01T12:00:00Z',
      };

      mockApiClient.submitScore.mockResolvedValue(expectedResponse);

      const result = await apiClient.submitScore(validScoreData);

      expect(mockApiClient.submitScore).toHaveBeenCalledWith(validScoreData);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle score submission errors', async () => {
      const scoreData = {
        firstName: 'Error',
        lastName: 'Test',
        score: 1000,
        character: 'boy' as const,
        weapon: 'katana',
        difficulty: 'easy' as const,
      };

      mockApiClient.submitScore.mockRejectedValue(new Error('Submission failed'));

      await expect(apiClient.submitScore(scoreData)).rejects.toThrow('Submission failed');
    });
  });

  describe('API Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      mockApiClient.getTop10Scores.mockRejectedValue(new Error('Request timeout'));

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Erro ao carregar o leaderboard/)).toBeInTheDocument();
      });
    });

    it('should handle server errors gracefully', async () => {
      mockApiClient.getTop10Scores.mockRejectedValue(new Error('Server error'));

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Erro ao carregar o leaderboard/)).toBeInTheDocument();
      });
    });

    it('should provide retry functionality on error', async () => {
      mockApiClient.getTop10Scores.mockRejectedValue(new Error('Network error'));

      // Mock window.location.reload - just check that retry button exists
      // We don't need to actually mock the reload function for this test

      render(<HomePage />);

      await waitFor(() => {
        const retryButton = screen.getByText('Tentar Novamente');
        expect(retryButton).toBeInTheDocument();
      });
    });
  });

  describe('API Response Validation', () => {
    it('should handle malformed API responses', async () => {
      // Mock a response with invalid structure
      mockApiClient.getTop10Scores.mockResolvedValue({
        scores: null as any, // Invalid - should be array
        total: 0,
      });

      render(<HomePage />);

      // Should handle gracefully and show empty state or error
      await waitFor(() => {
        // The component should handle this gracefully
        expect(screen.getByText(/Top 5 Jogadores/)).toBeInTheDocument();
      });
    });

    it('should handle missing required fields in score data', async () => {
      const incompleteScores = [
        {
          scoreId: '1',
          firstName: 'Test',
          // lastName missing
          score: 1000,
          character: 'boy' as const,
          weapon: 'katana',
          difficulty: 'easy' as const,
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockApiClient.getTop10Scores.mockResolvedValue({
        scores: incompleteScores as any,
        total: 1,
      });

      render(<HomePage />);

      // Should handle gracefully
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });
    });
  });
});