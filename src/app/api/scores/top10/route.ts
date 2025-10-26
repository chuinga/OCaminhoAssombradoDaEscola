import { NextResponse } from 'next/server';
import { LeaderboardResponse } from '@/types';
import { fetchWithRetry, validateAwsConfig, handleAwsError } from '@/lib/aws-api';

export async function GET() {
  try {
    const baseUrl = validateAwsConfig();

    // Make request to AWS Lambda function via API Gateway with retry logic
    const response = await fetchWithRetry(
      `${baseUrl}/scores/top10`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(10000), // 10 second timeout
      },
      {
        maxRetries: 2, // Fewer retries for leaderboard to keep it fast
        baseDelay: 500,
      }
    );

    if (!response.ok) {
      console.error(`AWS API returned ${response.status}: ${response.statusText}`);
      return handleAwsError({ status: response.status, statusText: response.statusText });
    }

    const data: LeaderboardResponse = await response.json();
    
    // Validate response structure
    if (!data.scores || !Array.isArray(data.scores)) {
      console.error('Invalid response structure from AWS API');
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      );
    }

    // Ensure we have at most 10 scores for leaderboard
    if (data.scores.length > 10) {
      data.scores = data.scores.slice(0, 10);
      data.total = Math.min(data.total, 10);
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleAwsError(error);
  }
}