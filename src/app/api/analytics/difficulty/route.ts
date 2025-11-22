import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { getDifficultyBreakdown } from '@/lib/analytics/queries';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await getDifficultyBreakdown(user.id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching difficulty breakdown:', error);
    // Return empty array instead of error object to prevent frontend errors
    return NextResponse.json([]);
  }
}
