import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getRemainingFreeUsage } from '@/lib/subscription-utils';

/**
 * GET /api/subscriptions/usage
 * Get user's usage limits and remaining quota
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usage = await getRemainingFreeUsage(user.id);

    return NextResponse.json({
      success: true,
      usage: {
        mockTests: {
          remaining: usage.mockTests,
          limit: usage.isUnlimited ? 'unlimited' : 5,
          isUnlimited: usage.isUnlimited,
        },
        practiceQuestions: {
          remaining: usage.practiceQuestions,
          limit: usage.isUnlimited ? 'unlimited' : 50,
          isUnlimited: usage.isUnlimited,
          resetsAt: usage.isUnlimited
            ? null
            : new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching usage limits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch usage limits' },
      { status: 500 }
    );
  }
}
