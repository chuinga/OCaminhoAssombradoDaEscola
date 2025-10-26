import { LeaderboardResponse, AllScoresResponse, SubmitScoreRequest, Score } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

// Custom error types for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// API client with comprehensive error handling and retry mechanism
class ApiClient {
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TimeoutError(`Request to ${url} timed out after ${timeout}ms`);
        }
        if (error.message.includes('fetch')) {
          throw new NetworkError(`Network error: ${error.message}`);
        }
      }
      
      throw error;
    }
  }

  private async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    maxRetries: number = MAX_RETRIES
  ): Promise<Response> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new ApiError(
            `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
            response.status
          );
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) or timeout errors
        if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        if (error instanceof TimeoutError) {
          console.warn(`Request timeout on attempt ${attempt + 1}/${maxRetries}`);
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries - 1) {
          break;
        }
        
        // Exponential backoff with jitter for retries
        const baseDelay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        const jitter = Math.random() * 500; // Add up to 500ms jitter
        const delay = baseDelay + jitter;
        
        console.warn(`Retrying request to ${url} in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  private validateScoreData(scoreData: SubmitScoreRequest): void {
    const { firstName, lastName, score, character, weapon, difficulty } = scoreData;
    
    if (!firstName?.trim()) {
      throw new ApiError('First name is required', 400, 'VALIDATION_ERROR');
    }
    
    if (!lastName?.trim()) {
      throw new ApiError('Last name is required', 400, 'VALIDATION_ERROR');
    }
    
    if (typeof score !== 'number' || score < 0 || score > 999999) {
      throw new ApiError('Score must be a number between 0 and 999999', 400, 'VALIDATION_ERROR');
    }
    
    if (!['boy', 'girl'].includes(character)) {
      throw new ApiError('Character must be either "boy" or "girl"', 400, 'VALIDATION_ERROR');
    }
    
    if (!['katana', 'laser', 'baseball', 'bazooka'].includes(weapon)) {
      throw new ApiError('Invalid weapon type', 400, 'VALIDATION_ERROR');
    }
    
    if (!['easy', 'medium', 'impossible'].includes(difficulty)) {
      throw new ApiError('Invalid difficulty level', 400, 'VALIDATION_ERROR');
    }
  }

  async getTop10Scores(): Promise<LeaderboardResponse> {
    try {
      const response = await this.fetchWithRetry(`${API_BASE_URL}/scores/top10`);
      const data = await response.json();
      
      // Validate response structure
      if (!Array.isArray(data.scores)) {
        throw new ApiError('Invalid response format: scores must be an array');
      }
      
      return {
        scores: data.scores,
        total: data.total || data.scores.length
      };
    } catch (error) {
      console.error('Failed to fetch top 10 scores:', error);
      
      // For network/server errors, return empty leaderboard
      if (error instanceof NetworkError || error instanceof TimeoutError || 
          (error instanceof ApiError && error.status && error.status >= 500)) {
        return { scores: [], total: 0 };
      }
      
      // Re-throw client errors (validation, etc.)
      throw error;
    }
  }

  async getAllScores(nextToken?: string, limit: number = 50): Promise<AllScoresResponse> {
    try {
      const params = new URLSearchParams();
      if (nextToken) {
        params.append('nextToken', nextToken);
      }
      if (limit) {
        params.append('limit', limit.toString());
      }
      
      const url = `${API_BASE_URL}/scores${params.toString() ? '?' + params.toString() : ''}`;
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      
      // Validate response structure
      if (!Array.isArray(data.scores)) {
        throw new ApiError('Invalid response format: scores must be an array');
      }
      
      return {
        scores: data.scores,
        nextToken: data.nextToken,
        hasMore: data.hasMore || false
      };
    } catch (error) {
      console.error('Failed to fetch all scores:', error);
      
      // For network/server errors, return empty result
      if (error instanceof NetworkError || error instanceof TimeoutError || 
          (error instanceof ApiError && error.status && error.status >= 500)) {
        return { scores: [], hasMore: false };
      }
      
      // Re-throw client errors
      throw error;
    }
  }

  async submitScore(scoreData: SubmitScoreRequest): Promise<Score> {
    // Validate input data before sending
    this.validateScoreData(scoreData);
    
    try {
      const response = await this.fetchWithRetry(`${API_BASE_URL}/scores`, {
        method: 'POST',
        body: JSON.stringify(scoreData),
      });
      
      const result = await response.json();
      
      // Validate response has required fields
      if (!result.scoreId || typeof result.score !== 'number') {
        throw new ApiError('Invalid response format from server');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to submit score:', error);
      
      // Add context to the error
      if (error instanceof ApiError) {
        error.message = `Score submission failed: ${error.message}`;
      }
      
      throw error;
    }
  }

  // Health check method to test API connectivity
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/health`, {
        method: 'GET'
      }, 5000); // Shorter timeout for health check
      
      return response.ok;
    } catch (error) {
      console.warn('API health check failed:', error);
      return false;
    }
  }
}

// Utility function to get user-friendly error messages
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return error.message;
      default:
        if (error.status && error.status >= 500) {
          return 'Server error. Please try again later.';
        }
        return error.message;
    }
  }
  
  if (error instanceof NetworkError) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (error instanceof TimeoutError) {
    return 'Request timed out. Please try again.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// Utility function to check if an error is retryable
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Don't retry client errors (4xx)
    return !(error.status && error.status >= 400 && error.status < 500);
  }
  
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }
  
  return false;
}

export const apiClient = new ApiClient();