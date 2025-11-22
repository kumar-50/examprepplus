import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { getLearningInsights } from '@/lib/analytics/queries';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const insights = await getLearningInsights(user.id);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error fetching learning insights:', error);
    // Return empty array instead of error object to prevent frontend errors
    return NextResponse.json([]);
  }
}
