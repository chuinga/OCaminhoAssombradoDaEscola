import { NextResponse } from 'next/server';
import { LeaderboardResponse } from '@/types';

// Mock data for development - this will be replaced with real AWS integration later
const mockScores = [
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
  }
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response: LeaderboardResponse = {
      scores: mockScores,
      total: mockScores.length
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching top 10 scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}