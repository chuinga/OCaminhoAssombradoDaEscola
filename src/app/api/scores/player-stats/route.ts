import { NextRequest, NextResponse } from 'next/server';
import { PlayerStats } from '@/types';
import { fetchWithRetry, validateAwsConfig, handleAwsError } from '@/lib/aws-api';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = validateAwsConfig();
    const { searchParams } = new URL(request.url);
    
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    
    // Validate required parameters
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required parameters: firstName and lastName' },
        { status: 400 }
      );
    }
    
    // Validate name parameters
    if (firstName.trim().length === 0 || lastName.trim().length === 0) {
      return NextResponse.json(
        { error: 'firstName and lastName cannot be empty' },
        { status: 400 }
      );
    }
    
    // Build AWS API URL with query parameters
    const awsUrl = new URL(`${baseUrl}/scores/player-stats`);
    awsUrl.searchParams.set('firstName', firstName.trim());
    awsUrl.searchParams.set('lastName', lastName.trim());

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

    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    if (!response.ok) {
      console.error(`AWS API returned ${response.status}: ${response.statusText}`);
      return handleAwsError({ status: response.status, statusText: response.statusText });
    }

    const data: PlayerStats = await response.json();
    
    // Validate response structure
    if (!data.playerId || !data.firstName || !data.lastName) {
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