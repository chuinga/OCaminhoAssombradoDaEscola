import { NextRequest, NextResponse } from 'next/server';
import { FilteredLeaderboardResponse } from '@/types';
import { fetchWithRetry, validateAwsConfig, handleAwsError } from '@/lib/aws-api';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = validateAwsConfig();
    const { searchParams } = new URL(request.url);
    
    const difficulty = searchParams.get('difficulty');
    const period = searchParams.get('period');
    const limit = searchParams.get('limit') || '10';
    
    // Validate difficulty parameter
    if (difficulty && !['easy', 'medium', 'impossible'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be one of: easy, medium, impossible' },
        { status: 400 }
      );
    }
    
    // Validate period parameter
    if (period && !['weekly', 'monthly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be one of: weekly, monthly' },
        { status: 400 }
      );
    }
    
    // Validate limit parameter
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return NextResponse.json(
        { error: 'Invalid limit. Must be a number between 1 and 100' },
        { status: 400 }
      );
    }
    
    // Build AWS API URL with query parameters
    const awsUrl = new URL(`${baseUrl}/scores/leaderboard`);
    if (difficulty) awsUrl.searchParams.set('difficulty', difficulty);
    if (period) awsUrl.searchParams.set('period', period);
    awsUrl.searchParams.set('limit', limit);

    // Make request to AWS Lambda function via API Gateway with retry logic
    const response = await fetchWithRetry(
      awsUrl.toString(),
      {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
      },
      {
        maxRetries: 2,
        baseDelay: 500,
      }
    );

    if (!response.ok) {
      console.error(`AWS API returned ${response.status}: ${response.statusText}`);
      return handleAwsError({ status: response.status, statusText: response.statusText });
    }

    const data: FilteredLeaderboardResponse = await response.json();
    
    // Validate response structure
    if (!data.scores || !Array.isArray(data.scores)) {
      console.error('Invalid response structure from AWS API');
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleAwsError(error);
  }
}