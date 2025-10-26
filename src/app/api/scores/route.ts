import { NextRequest, NextResponse } from 'next/server';
import { AllScoresResponse, SubmitScoreRequest, Score } from '@/types';
import { fetchWithRetry, validateAwsConfig, handleAwsError } from '@/lib/aws-api';

// GET /api/scores - Get all scores with pagination
export async function GET(request: NextRequest) {
  try {
    const baseUrl = validateAwsConfig();
    const { searchParams } = new URL(request.url);
    const nextToken = searchParams.get('nextToken');
    
    // Build AWS API URL with query parameters
    const awsUrl = new URL(`${baseUrl}/scores`);
    if (nextToken) {
      awsUrl.searchParams.set('nextToken', nextToken);
    }

    // Make request to AWS Lambda function via API Gateway with retry logic
    const response = await fetchWithRetry(
      awsUrl.toString(),
      {
        method: 'GET',
        signal: AbortSignal.timeout(15000), // 15 second timeout for pagination
      },
      {
        maxRetries: 3, // More retries for pagination as it's less time-sensitive
        baseDelay: 1000,
      }
    );

    if (!response.ok) {
      console.error(`AWS API returned ${response.status}: ${response.statusText}`);
      return handleAwsError({ status: response.status, statusText: response.statusText });
    }

    const data: AllScoresResponse = await response.json();
    
    // Validate response structure
    if (!data.scores || !Array.isArray(data.scores)) {
      console.error('Invalid response structure from AWS API');
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      );
    }

    // Validate pagination fields
    if (typeof data.hasMore !== 'boolean') {
      console.error('Invalid hasMore field in AWS API response');
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

// POST /api/scores - Submit a new score
export async function POST(request: NextRequest) {
  try {
    const baseUrl = validateAwsConfig();

    let body: SubmitScoreRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Client-side validation before sending to AWS
    if (!body.firstName || !body.lastName || typeof body.score !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, score' },
        { status: 400 }
      );
    }
    
    if (!body.character || !['boy', 'girl'].includes(body.character)) {
      return NextResponse.json(
        { error: 'Invalid character. Must be "boy" or "girl"' },
        { status: 400 }
      );
    }
    
    if (!body.weapon || !['katana', 'laser', 'baseball', 'bazooka'].includes(body.weapon)) {
      return NextResponse.json(
        { error: 'Invalid weapon. Must be one of: katana, laser, baseball, bazooka' },
        { status: 400 }
      );
    }
    
    if (!body.difficulty || !['easy', 'medium', 'impossible'].includes(body.difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be one of: easy, medium, impossible' },
        { status: 400 }
      );
    }
    
    if (body.score < 0 || body.score > 999999) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 999999' },
        { status: 400 }
      );
    }

    // Sanitize input data
    const sanitizedBody: SubmitScoreRequest = {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      score: body.score,
      character: body.character,
      weapon: body.weapon,
      difficulty: body.difficulty
    };

    // Make request to AWS Lambda function via API Gateway with retry logic
    const response = await fetchWithRetry(
      `${baseUrl}/scores`,
      {
        method: 'POST',
        body: JSON.stringify(sanitizedBody),
        signal: AbortSignal.timeout(15000), // 15 second timeout for POST
      },
      {
        maxRetries: 2, // Fewer retries for POST to avoid duplicate submissions
        baseDelay: 1000,
      }
    );

    if (!response.ok) {
      console.error(`AWS API returned ${response.status}: ${response.statusText}`);
      
      // Handle specific AWS error responses
      if (response.status === 400) {
        try {
          const errorData = await response.json();
          return NextResponse.json(
            { error: errorData.error || 'Invalid request data' },
            { status: 400 }
          );
        } catch {
          return NextResponse.json(
            { error: 'Invalid request data' },
            { status: 400 }
          );
        }
      }
      
      return handleAwsError({ status: response.status, statusText: response.statusText });
    }

    const newScore: Score = await response.json();
    
    // Validate response structure
    if (!newScore.scoreId || !newScore.firstName || !newScore.lastName || typeof newScore.score !== 'number') {
      console.error('Invalid response structure from AWS API');
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      );
    }

    return NextResponse.json(newScore, { status: 201 });
  } catch (error) {
    return handleAwsError(error);
  }
}