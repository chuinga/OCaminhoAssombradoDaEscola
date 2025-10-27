import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent } from '@/lib/analytics';

// In-memory storage for demo purposes
// In production, this would be stored in a database
let analyticsData: AnalyticsEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json();
    
    // Validate the event structure
    if (!event.type || !event.timestamp || !event.sessionId) {
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      );
    }

    // Store the event
    analyticsData.push(event);
    
    // Keep only the last 1000 events to prevent memory issues
    if (analyticsData.length > 1000) {
      analyticsData = analyticsData.slice(-1000);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to store analytics event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');

    let filteredData = analyticsData;

    // Filter by session ID if provided
    if (sessionId) {
      filteredData = filteredData.filter(event => event.sessionId === sessionId);
    }

    // Filter by event type if provided
    if (type) {
      filteredData = filteredData.filter(event => event.type === type);
    }

    // Apply limit
    const limitedData = filteredData.slice(-limit);

    // Calculate summary statistics
    const summary = {
      totalEvents: filteredData.length,
      eventTypes: [...new Set(filteredData.map(e => e.type))],
      sessions: [...new Set(filteredData.map(e => e.sessionId))].length,
      timeRange: filteredData.length > 0 ? {
        start: Math.min(...filteredData.map(e => e.timestamp)),
        end: Math.max(...filteredData.map(e => e.timestamp))
      } : null
    };

    return NextResponse.json({
      events: limitedData,
      summary
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics data' },
      { status: 500 }
    );
  }
}

// Clear analytics data (for testing purposes)
export async function DELETE() {
  try {
    analyticsData = [];
    return NextResponse.json({ success: true, message: 'Analytics data cleared' });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to clear analytics data' },
      { status: 500 }
    );
  }
}