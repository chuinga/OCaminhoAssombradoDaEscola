import { apiClient, ApiError, NetworkError, TimeoutError, getErrorMessage, isRetryableError } from '@/lib/api';
import { SubmitScoreRequest } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getTop10Scores', () => {
    it('should fetch top 10 scores successfully', async () => {
      const mockResponse = {
        scores: [
          {
            scoreId: '1',
            firstName: 'John',
            lastName: 'Doe',
            score: 1000,
            character: 'boy' as const,
            weapon: 'katana',
            difficulty: 'easy' as const,
            createdAt: '2023-01-01T00:00:00Z'
          }
        ],
        total: 1
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.getTop10Scores();
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/scores/top10', expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
    });

    it('should return empty leaderboard on network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiClient.getTop10Scores();
      
      expect(result).toEqual({ scores: [], total: 0 });
    });
  });

  describe('getAllScores', () => {
    it('should fetch all scores with pagination', async () => {
      const mockResponse = {
        scores: [],
        nextToken: 'token123',
        hasMore: true
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.getAllScores('prevToken', 25);
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/scores?nextToken=prevToken&limit=25', expect.any(Object));
    });
  });

  describe('submitScore', () => {
    const validScoreData: SubmitScoreRequest = {
      firstName: 'John',
      lastName: 'Doe',
      score: 1000,
      character: 'boy',
      weapon: 'katana',
      difficulty: 'easy'
    };

    it('should submit score successfully', async () => {
      const mockResponse = {
        scoreId: '123',
        ...validScoreData,
        createdAt: '2023-01-01T00:00:00Z'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.submitScore(validScoreData);
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/scores', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(validScoreData)
      }));
    });

    it('should validate score data before submission', async () => {
      const invalidScoreData = {
        ...validScoreData,
        firstName: ''
      };

      await expect(apiClient.submitScore(invalidScoreData)).rejects.toThrow('First name is required');
    });

    it('should validate score range', async () => {
      const invalidScoreData = {
        ...validScoreData,
        score: -1
      };

      await expect(apiClient.submitScore(invalidScoreData)).rejects.toThrow('Score must be a number between 0 and 999999');
    });
  });

  describe('retry mechanism', () => {
    it('should retry on server errors with exponential backoff', async () => {
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Server error'))
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ scores: [], total: 0 })
        });

      const promise = apiClient.getTop10Scores();
      
      // Fast-forward through retry delays
      jest.advanceTimersByTime(10000);
      
      const result = await promise;
      
      expect(result).toEqual({ scores: [], total: 0 });
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on client errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid request')
      });

      await expect(apiClient.getTop10Scores()).rejects.toThrow('HTTP 400');
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('error utilities', () => {
    it('should return user-friendly error messages', () => {
      expect(getErrorMessage(new ApiError('Test error', 500))).toBe('Server error. Please try again later.');
      expect(getErrorMessage(new NetworkError('Network failed'))).toBe('Network error. Please check your internet connection and try again.');
      expect(getErrorMessage(new TimeoutError())).toBe('Request timed out. Please try again.');
      expect(getErrorMessage(new Error('Generic error'))).toBe('Generic error');
    });

    it('should identify retryable errors correctly', () => {
      expect(isRetryableError(new ApiError('Server error', 500))).toBe(true);
      expect(isRetryableError(new ApiError('Client error', 400))).toBe(false);
      expect(isRetryableError(new NetworkError('Network failed'))).toBe(true);
      expect(isRetryableError(new TimeoutError())).toBe(true);
    });
  });
});