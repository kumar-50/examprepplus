import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { hasReachedMockTestLimit } from '@/lib/subscription-utils';

/**
 * GET /api/tests/check-access
 * Check if user can access a test (based on subscription status)
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

    // Check if user has reached free tier limit
    const hasReachedLimit = await hasReachedMockTestLimit(user.id);

    if (hasReachedLimit) {
      return NextResponse.json({
        success: false,
        canAccess: false,
        message: 'You have reached your free tier limit of 5 tests. Upgrade to continue.',
        requiresUpgrade: true,
      });
    }

    return NextResponse.json({
      success: true,
      canAccess: true,
      requiresUpgrade: false,
    });
  } catch (error) {
    console.error('Error checking test access:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check access' },
      { status: 500 }
    );
  }
}
