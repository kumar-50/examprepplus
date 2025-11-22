import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { getAccuracyTrend } from '@/lib/analytics/queries';
import type { DateRange } from '@/lib/analytics/types';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = req.nextUrl.searchParams;
    const preset = (searchParams.get('range') as DateRange['preset']) || '30d';

    const data = await getAccuracyTrend(user.id, {
      preset,
      startDate: new Date(),
      endDate: new Date(),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching accuracy trend:', error);
    // Return empty array instead of error object to prevent frontend errors
    return NextResponse.json([]);
  }
}
