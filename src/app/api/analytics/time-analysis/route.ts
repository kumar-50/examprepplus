import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { getTimeAnalysis } from '@/lib/analytics/queries';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await getTimeAnalysis(user.id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching time analysis:', error);
    // Return default empty data structure
    return NextResponse.json({
      hourPerformance: [],
      dayOfWeekPerformance: [],
      bestTime: null,
    });
  }
}
