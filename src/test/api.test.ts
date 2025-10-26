import { apiClient, ApiError, NetworkError, TimeoutError, getErrorMessage, isRetryableError } from '@/lib/api';
import { SubmitScoreRequest, LeaderboardResponse, AllScoresResponse, Score } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.Mock;

// Mock console methods to suppress output during tests
const mockConsoleWarn = jest.fn();
const mockConsoleError = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console output during tests
    jest.spyOn(console, 'warn').mockImplementation(mockConsoleWarn);
    jest.spyOn(console, 'error').mockImplementation(mockConsoleError);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTop10Scores', () => {
    it('should fetch top 10 scores successfully', async () => {
      const mockResponse: LeaderboardResponse = {
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

      mockFetch.mockResolvedValueOnce({
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
      // Mock all retry attempts to fail with network errors
      mockFetch
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockRejectedValueOnce(new Error('fetch failed'));

      const result = await apiClient.getTop10Scores();
      
      expect(result).toEqual({ scores: [], total: 0 });
      expect(mockFetch).toHaveBeenCalledTimes(3); // Should retry 3 times
    });

    it('should return empty leaderboard on server error (5xx)', async () => {
      // Mock all retry attempts to fail with server error
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.resolve('Server error')
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.resolve('Server error')
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.resolve('Server error')
        });

      const result = await apiClient.getTop10Scores();
      
      expect(result).toEqual({ scores: [], total: 0 });
      expect(mockFetch).toHaveBeenCalledTimes(3); // Should retry 3 times
    });

    it('should throw error on client error (4xx)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Not found')
      });

      await expect(apiClient.getTop10Scores()).rejects.toThrow('HTTP 404');
    });

    it('should validate response format and throw error on invalid structure', async () => {
      const invalidResponse = {
        scores: 'not-an-array',
        total: 1
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(invalidResponse)
      });

      await expect(apiClient.getTop10Scores()).rejects.toThrow('Invalid response format: scores must be an array');
    });

    it('should handle missing total field in response', async () => {
      const responseWithoutTotal = {
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
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithoutTotal)
      });

      const result = await apiClient.getTop10Scores();
      
      expect(result.total).toBe(1); // Should default to scores.length
    });
  });

  describe('getAllScores', () => {
    it('should fetch all scores with pagination', async () => {
      const mockResponse: AllScoresResponse = {
        scores: [
          {
            scoreId: '1',
            firstName: 'Jane',
            lastName: 'Smith',
            score: 850,
            character: 'girl' as const,
            weapon: 'laser',
            difficulty: 'medium' as const,
            createdAt: '2023-01-02T00:00:00Z'
          }
        ],
        nextToken: 'token123',
        hasMore: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.getAllScores('prevToken', 25);
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/scores?nextToken=prevToken&limit=25', expect.any(Object));
    });

    it('should fetch all scores without pagination parameters', async () => {
      const mockResponse: AllScoresResponse = {
        scores: [],
        hasMore: false
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.getAllScores();
      
      expect(result).toEqual(mockResponse);
      // The API client adds default limit=50 even when not specified
      expect(fetch).toHaveBeenCalledWith('/api/scores?limit=50', expect.any(Object));
    });

    it('should return empty result on network error', async () => {
      // Mock all retry attempts to fail
      mockFetch
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockRejectedValueOnce(new NetworkError('Connection failed'));

      const result = await apiClient.getAllScores();
      
      expect(result).toEqual({ scores: [], hasMore: false });
      expect(mockFetch).toHaveBeenCalledTimes(3); // Should retry 3 times
    });

    it('should return empty result on timeout error', async () => {
      // Mock all retry attempts to fail with timeout errors
      mockFetch
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }))
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }))
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }));

      const result = await apiClient.getAllScores();
      
      expect(result).toEqual({ scores: [], hasMore: false });
      expect(mockFetch).toHaveBeenCalledTimes(3); // Will retry timeout errors (current implementation)
    });

    it('should validate response format', async () => {
      const invalidResponse = {
        scores: 'invalid',
        hasMore: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(invalidResponse)
      });

      await expect(apiClient.getAllScores()).rejects.toThrow('Invalid response format: scores must be an array');
    });

    it('should handle missing hasMore field in response', async () => {
      const responseWithoutHasMore = {
        scores: [],
        nextToken: 'token123'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithoutHasMore)
      });

      const result = await apiClient.getAllScores();
      
      expect(result.hasMore).toBe(false); // Should default to false
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
      const mockResponse: Score = {
        scoreId: '123',
        ...validScoreData,
        createdAt: '2023-01-01T00:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.submitScore(validScoreData);
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/scores', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(validScoreData),
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
    });

    describe('validation', () => {
      it('should validate first name is required', async () => {
        const invalidData = { ...validScoreData, firstName: '' };
        await expect(apiClient.submitScore(invalidData)).rejects.toThrow('First name is required');
      });

      it('should validate first name is not just whitespace', async () => {
        const invalidData = { ...validScoreData, firstName: '   ' };
        await expect(apiClient.submitScore(invalidData)).rejects.toThrow('First name is required');
      });

      it('should validate last name is required', async () => {
        const invalidData = { ...validScoreData, lastName: '' };
        await expect(apiClient.submitScore(invalidData)).rejects.toThrow('Last name is required');
      });

      it('should validate last name is not just whitespace', async () => {
        const invalidData = { ...validScoreData, lastName: '   ' };
        await expect(apiClient.submitScore(invalidData)).rejects.toThrow('Last name is required');
      });

      it('should validate score is a number', async () => {
        const invalidData = { ...validScoreData, score: 'not-a-number' as any };
        await expect(apiClient.submitScore(invalidData)).rejects.toThrow('Score must be a number between 0 and 999999');
      });

      it('should validate score minimum value', async () => {
        const invalidData = { ...validScoreData, score: -1 };
        await expect(apiClient.submitScore(invalidData)).rejects.toThrow('Score must be a number between 0 and 999999');
      });

      it('should validate score maximum value', async () => {
        const invalidData = { ...validScoreData, score: 1000000 };
        await expect(apiClient.submitScore(invalidData)).rejects.toThrow('Score must be a number between 0 and 999999');
      });

      it('should validate character options', async () => {
        const invalidData = { ...validScoreData, character: 'invalid' as any };
        await expect(apiClient.submitScore(invalidData)).rejects.toThrow('Character must be either "boy" or "girl"');
      });

      it('should validate weapon options', async () => {
        const invalidData = { ...validScoreData, weapon: 'invalid' };
        await expect(apiClient.submitScore(invalidData)).rejects.toThrow('Invalid weapon type');
      });

      it('should validate difficulty options', async () => {
        const invalidData = { ...validScoreData, difficulty: 'invalid' as any };
        await expect(apiClient.submitScore(invalidData)).rejects.toThrow('Invalid difficulty level');
      });

      it('should accept all valid weapon types', async () => {
        const weapons = ['katana', 'laser', 'baseball', 'bazooka'];
        
        for (const weapon of weapons) {
          const mockResponse: Score = {
            scoreId: `123-${weapon}`,
            ...validScoreData,
            weapon,
            createdAt: '2023-01-01T00:00:00Z'
          };

          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
          });

          const testData = { ...validScoreData, weapon };
          const result = await apiClient.submitScore(testData);
          expect(result.weapon).toBe(weapon);
        }
      });

      it('should accept all valid difficulty levels', async () => {
        const difficulties: Array<'easy' | 'medium' | 'impossible'> = ['easy', 'medium', 'impossible'];
        
        for (const difficulty of difficulties) {
          const mockResponse: Score = {
            scoreId: `123-${difficulty}`,
            ...validScoreData,
            difficulty,
            createdAt: '2023-01-01T00:00:00Z'
          };

          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
          });

          const testData = { ...validScoreData, difficulty };
          const result = await apiClient.submitScore(testData);
          expect(result.difficulty).toBe(difficulty);
        }
      });
    });

    it('should validate server response format', async () => {
      const invalidResponse = {
        // Missing scoreId and score
        firstName: 'John',
        lastName: 'Doe'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(invalidResponse)
      });

      await expect(apiClient.submitScore(validScoreData)).rejects.toThrow('Invalid response format from server');
    });

    it('should add context to API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid data')
      });

      await expect(apiClient.submitScore(validScoreData)).rejects.toThrow('Score submission failed: HTTP 400');
    });
  });

  describe('retry mechanism', () => {
    it('should retry on server errors with exponential backoff', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Server error'))
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ scores: [], total: 0 })
        });

      const result = await apiClient.getTop10Scores();
      
      expect(result).toEqual({ scores: [], total: 0 });
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on client errors (4xx)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid request')
      });

      await expect(apiClient.getTop10Scores()).rejects.toThrow('HTTP 400');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 5xx server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.resolve('Server error')
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ scores: [], total: 0 })
        });

      const result = await apiClient.getTop10Scores();
      
      expect(result).toEqual({ scores: [], total: 0 });
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on network errors', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ scores: [], total: 0 })
        });

      const result = await apiClient.getTop10Scores();
      
      expect(result).toEqual({ scores: [], total: 0 });
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle timeout errors in retry mechanism', async () => {
      // Mock all retry attempts to fail with timeout errors
      mockFetch
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }))
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }))
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }));

      // Timeout errors should return empty result
      const result = await apiClient.getTop10Scores();
      
      expect(result).toEqual({ scores: [], total: 0 });
      expect(fetch).toHaveBeenCalledTimes(3); // Will retry timeout errors (current implementation)
    });

    it('should fail after max retries', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockRejectedValueOnce(new Error('fetch failed'));

      const result = await apiClient.getTop10Scores();
      
      // Should return empty result for network errors
      expect(result).toEqual({ scores: [], total: 0 });
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('timeout handling', () => {
    beforeEach(() => {
      // Mock AbortController
      const mockAbortController = {
        abort: jest.fn(),
        signal: { aborted: false }
      };
      global.AbortController = jest.fn(() => mockAbortController) as any;
    });

    it('should handle timeout errors correctly', async () => {
      // Mock all retry attempts to fail with timeout errors
      mockFetch
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }))
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }))
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }));

      // Timeout errors should return empty result for getTop10Scores
      const result = await apiClient.getTop10Scores();
      
      expect(result).toEqual({ scores: [], total: 0 });
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should use AbortController for timeout handling', async () => {
      const mockAbortController = {
        abort: jest.fn(),
        signal: { aborted: false }
      };
      const AbortControllerSpy = jest.fn(() => mockAbortController);
      global.AbortController = AbortControllerSpy as any;

      mockFetch
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }))
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }))
        .mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }));

      // Timeout errors should return empty result for getTop10Scores
      const result = await apiClient.getTop10Scores();
      
      expect(result).toEqual({ scores: [], total: 0 });
      // Verify AbortController was instantiated (indicating timeout mechanism is in place)
      expect(AbortControllerSpy).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return true for successful health check', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      });

      const result = await apiClient.healthCheck();
      
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/health', expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
    });

    it('should return false for failed health check', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503
      });

      const result = await apiClient.healthCheck();
      
      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await apiClient.healthCheck();
      
      expect(result).toBe(false);
    });

    it('should handle timeout in health check', async () => {
      mockFetch.mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }));

      const result = await apiClient.healthCheck();
      
      expect(result).toBe(false);
    });
  });

  describe('error utilities', () => {
    it('should return user-friendly error messages for API errors', () => {
      expect(getErrorMessage(new ApiError('Test error', 500))).toBe('Server error. Please try again later.');
      expect(getErrorMessage(new ApiError('Test error', 404))).toBe('Test error');
      expect(getErrorMessage(new ApiError('Validation failed', 400, 'VALIDATION_ERROR'))).toBe('Validation failed');
    });

    it('should return user-friendly error messages for network errors', () => {
      expect(getErrorMessage(new NetworkError('Network failed'))).toBe('Network error. Please check your internet connection and try again.');
    });

    it('should return user-friendly error messages for timeout errors', () => {
      expect(getErrorMessage(new TimeoutError())).toBe('Request timed out. Please try again.');
      expect(getErrorMessage(new TimeoutError('Custom timeout message'))).toBe('Request timed out. Please try again.');
    });

    it('should return generic error message for unknown errors', () => {
      expect(getErrorMessage(new Error('Generic error'))).toBe('Generic error');
      expect(getErrorMessage('String error')).toBe('An unexpected error occurred. Please try again.');
      expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    });

    it('should identify retryable errors correctly', () => {
      // Server errors (5xx) are retryable
      expect(isRetryableError(new ApiError('Server error', 500))).toBe(true);
      expect(isRetryableError(new ApiError('Bad Gateway', 502))).toBe(true);
      
      // Client errors (4xx) are not retryable
      expect(isRetryableError(new ApiError('Client error', 400))).toBe(false);
      expect(isRetryableError(new ApiError('Not Found', 404))).toBe(false);
      
      // Network and timeout errors are retryable
      expect(isRetryableError(new NetworkError('Network failed'))).toBe(true);
      expect(isRetryableError(new TimeoutError())).toBe(true);
      
      // Unknown errors are not retryable
      expect(isRetryableError(new Error('Unknown error'))).toBe(false);
      expect(isRetryableError('String error')).toBe(false);
    });

    it('should handle API errors without status codes', () => {
      const errorWithoutStatus = new ApiError('Generic API error');
      expect(isRetryableError(errorWithoutStatus)).toBe(true);
      expect(getErrorMessage(errorWithoutStatus)).toBe('Generic API error');
    });
  });

  describe('data formatting and validation', () => {
    it('should format request data correctly', async () => {
      const scoreData: SubmitScoreRequest = {
        firstName: 'João',
        lastName: 'Silva',
        score: 12345,
        character: 'boy',
        weapon: 'bazooka',
        difficulty: 'impossible'
      };

      const mockResponse: Score = {
        scoreId: 'test-id',
        ...scoreData,
        createdAt: '2023-01-01T00:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await apiClient.submitScore(scoreData);
      
      expect(fetch).toHaveBeenCalledWith('/api/scores', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(scoreData),
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
    });

    it('should handle special characters in names', async () => {
      const scoreData: SubmitScoreRequest = {
        firstName: 'José María',
        lastName: 'González-López',
        score: 500,
        character: 'girl',
        weapon: 'laser',
        difficulty: 'medium'
      };

      const mockResponse: Score = {
        scoreId: 'test-id',
        ...scoreData,
        createdAt: '2023-01-01T00:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.submitScore(scoreData);
      
      expect(result.firstName).toBe('José María');
      expect(result.lastName).toBe('González-López');
    });

    it('should validate edge case scores', async () => {
      // Test minimum valid score
      const minScoreData = {
        firstName: 'Test',
        lastName: 'User',
        score: 0,
        character: 'boy' as const,
        weapon: 'katana',
        difficulty: 'easy' as const
      };

      const mockResponse: Score = {
        scoreId: 'test-id',
        ...minScoreData,
        createdAt: '2023-01-01T00:00:00Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.submitScore(minScoreData);
      expect(result.score).toBe(0);

      // Test maximum valid score
      const maxScoreData = { ...minScoreData, score: 999999 };
      const maxMockResponse = { ...mockResponse, scoreId: 'test-id-2', score: 999999 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(maxMockResponse)
      });

      const maxResult = await apiClient.submitScore(maxScoreData);
      expect(maxResult.score).toBe(999999);
    });
  });
});