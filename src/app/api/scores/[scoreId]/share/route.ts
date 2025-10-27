import { NextRequest, NextResponse } from 'next/server';
import { ShareableScore } from '@/types';
import { fetchWithRetry, validateAwsConfig, handleAwsError } from '@/lib/aws-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { scoreId: string } }
) {
  try {
    const baseUrl = validateAwsConfig();
    const { scoreId } = params;
    
    // Validate scoreId parameter
    if (!scoreId || scoreId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid scoreId parameter' },
        { status: 400 }
      );
    }
    
    // Build AWS API URL
    const awsUrl = `${baseUrl}/scores/${encodeURIComponent(scoreId)}/share`;

    // Make request to AWS Lambda function via API Gateway with retry logic
    const response = await fetchWithRetry(
      awsUrl,
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
        { error: 'Score not found' },
        { status: 404 }
      );
    }

    if (!response.ok) {
      console.error(`AWS API returned ${response.status}: ${response.statusText}`);
      return handleAwsError({ status: response.status, statusText: response.statusText });
    }

    const data: ShareableScore = await response.json();
    
    // Validate response structure
    if (!data.playerName || typeof data.score !== 'number' || !data.shareUrl) {
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