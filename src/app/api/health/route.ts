import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple health check endpoint
    // In a production environment, this could check:
    // - Database connectivity
    // - AWS service availability
    // - Cache status
    // - Other critical dependencies
    
    return NextResponse.json(
      { 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'caminho-assombrado-escola-api'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}