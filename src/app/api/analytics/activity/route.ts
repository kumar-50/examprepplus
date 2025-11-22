import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { getActivityData } from '@/lib/analytics/queries';
import { subDays } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '365');
    
    const startDate = subDays(new Date(), days);
    const data = await getActivityData(user.id, startDate);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching activity data:', error);
    // Return empty array instead of error object to prevent frontend errors
    return NextResponse.json([]);
  }
}
