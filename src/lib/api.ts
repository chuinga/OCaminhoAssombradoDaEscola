import { LeaderboardResponse, AllScoresResponse, SubmitScoreRequest, Score } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// API client with retry mechanism and error handling
class ApiClient {
  private async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    maxRetries: number = 3
  ): Promise<Response> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          throw error;
        }
        
        // Exponential backoff for retries
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  async getTop10Scores(): Promise<LeaderboardResponse> {
    try {
      const response = await this.fetchWithRetry(`${API_BASE_URL}/scores/top10`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch top 10 scores:', error);
      // Return empty leaderboard on error
      return { scores: [], total: 0 };
    }
  }

  async getAllScores(nextToken?: string): Promise<AllScoresResponse> {
    try {
      const url = nextToken 
        ? `${API_BASE_URL}/scores?nextToken=${encodeURIComponent(nextToken)}`
        : `${API_BASE_URL}/scores`;
      
      const response = await this.fetchWithRetry(url);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch all scores:', error);
      return { scores: [], hasMore: false };
    }
  }

  async submitScore(scoreData: SubmitScoreRequest): Promise<Score> {
    const response = await this.fetchWithRetry(`${API_BASE_URL}/scores`, {
      method: 'POST',
      body: JSON.stringify(scoreData),
    });
    
    return await response.json();
  }
}

export const apiClient = new ApiClient();