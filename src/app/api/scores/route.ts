import { NextRequest, NextResponse } from 'next/server';
import { AllScoresResponse, SubmitScoreRequest, Score } from '@/types';

// Mock data storage - in production this would be replaced with DynamoDB
let mockScores: Score[] = [
  {
    scoreId: '1',
    firstName: 'Ana',
    lastName: 'Silva',
    score: 15420,
    character: 'girl' as const,
    weapon: 'katana',
    difficulty: 'medium' as const,
    createdAt: '2024-10-24T10:30:00Z'
  },
  {
    scoreId: '2',
    firstName: 'João',
    lastName: 'Santos',
    score: 12850,
    character: 'boy' as const,
    weapon: 'laser',
    difficulty: 'easy' as const,
    createdAt: '2024-10-24T09:15:00Z'
  },
  {
    scoreId: '3',
    firstName: 'Maria',
    lastName: 'Costa',
    score: 11200,
    character: 'girl' as const,
    weapon: 'bazooka',
    difficulty: 'impossible' as const,
    createdAt: '2024-10-23T16:45:00Z'
  },
  {
    scoreId: '4',
    firstName: 'Pedro',
    lastName: 'Oliveira',
    score: 9750,
    character: 'boy' as const,
    weapon: 'baseball',
    difficulty: 'medium' as const,
    createdAt: '2024-10-23T14:20:00Z'
  },
  {
    scoreId: '5',
    firstName: 'Sofia',
    lastName: 'Ferreira',
    score: 8900,
    character: 'girl' as const,
    weapon: 'katana',
    difficulty: 'easy' as const,
    createdAt: '2024-10-23T11:30:00Z'
  },
  {
    scoreId: '6',
    firstName: 'Miguel',
    lastName: 'Rodrigues',
    score: 7650,
    character: 'boy' as const,
    weapon: 'laser',
    difficulty: 'medium' as const,
    createdAt: '2024-10-22T18:10:00Z'
  },
  {
    scoreId: '7',
    firstName: 'Beatriz',
    lastName: 'Almeida',
    score: 6800,
    character: 'girl' as const,
    weapon: 'baseball',
    difficulty: 'easy' as const,
    createdAt: '2024-10-22T15:45:00Z'
  },
  {
    scoreId: '8',
    firstName: 'Tiago',
    lastName: 'Pereira',
    score: 5950,
    character: 'boy' as const,
    weapon: 'bazooka',
    difficulty: 'impossible' as const,
    createdAt: '2024-10-22T12:20:00Z'
  },
  {
    scoreId: '9',
    firstName: 'Inês',
    lastName: 'Martins',
    score: 4200,
    character: 'girl' as const,
    weapon: 'katana',
    difficulty: 'medium' as const,
    createdAt: '2024-10-21T20:30:00Z'
  },
  {
    scoreId: '10',
    firstName: 'Rui',
    lastName: 'Carvalho',
    score: 3100,
    character: 'boy' as const,
    weapon: 'laser',
    difficulty: 'easy' as const,
    createdAt: '2024-10-21T17:15:00Z'
  },
  {
    scoreId: '11',
    firstName: 'Catarina',
    lastName: 'Lopes',
    score: 2850,
    character: 'girl' as const,
    weapon: 'baseball',
    difficulty: 'medium' as const,
    createdAt: '2024-10-21T14:30:00Z'
  },
  {
    scoreId: '12',
    firstName: 'André',
    lastName: 'Sousa',
    score: 2400,
    character: 'boy' as const,
    weapon: 'katana',
    difficulty: 'easy' as const,
    createdAt: '2024-10-21T11:45:00Z'
  },
  {
    scoreId: '13',
    firstName: 'Mariana',
    lastName: 'Ribeiro',
    score: 1950,
    character: 'girl' as const,
    weapon: 'laser',
    difficulty: 'impossible' as const,
    createdAt: '2024-10-20T19:20:00Z'
  },
  {
    scoreId: '14',
    firstName: 'Gonçalo',
    lastName: 'Nunes',
    score: 1600,
    character: 'boy' as const,
    weapon: 'bazooka',
    difficulty: 'medium' as const,
    createdAt: '2024-10-20T16:10:00Z'
  },
  {
    scoreId: '15',
    firstName: 'Leonor',
    lastName: 'Gomes',
    score: 1200,
    character: 'girl' as const,
    weapon: 'baseball',
    difficulty: 'easy' as const,
    createdAt: '2024-10-20T13:25:00Z'
  }
];

const ITEMS_PER_PAGE = 10;

// GET /api/scores - Get all scores with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nextToken = searchParams.get('nextToken');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Sort scores by score descending, then by createdAt descending
    const sortedScores = [...mockScores].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Handle pagination
    let startIndex = 0;
    if (nextToken) {
      const tokenIndex = parseInt(nextToken, 10);
      if (!isNaN(tokenIndex)) {
        startIndex = tokenIndex;
      }
    }
    
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedScores = sortedScores.slice(startIndex, endIndex);
    const hasMore = endIndex < sortedScores.length;
    const newNextToken = hasMore ? endIndex.toString() : undefined;
    
    const response: AllScoresResponse = {
      scores: paginatedScores,
      nextToken: newNextToken,
      hasMore
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching all scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}

// POST /api/scores - Submit a new score
export async function POST(request: NextRequest) {
  try {
    const body: SubmitScoreRequest = await request.json();
    
    // Validate required fields
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
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create new score entry
    const newScore: Score = {
      scoreId: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      score: body.score,
      character: body.character,
      weapon: body.weapon,
      difficulty: body.difficulty,
      createdAt: new Date().toISOString()
    };
    
    // Add to mock storage
    mockScores.push(newScore);
    
    return NextResponse.json(newScore, { status: 201 });
  } catch (error) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}