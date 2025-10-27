import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const analyticsEvent = await request.json();
    
    // For now, just log the analytics event
    // In a production environment, you would send this to your analytics service
    console.log('Analytics event received:', {
      type: analyticsEvent.type,
      timestamp: analyticsEvent.timestamp,
      sessionId: analyticsEvent.sessionId
    });
    
    // Return success response
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
}