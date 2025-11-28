import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { checkAccess, useFeature, getAllUsageStats, getUserTier } from '@/lib/access-control';
import { FeatureKey } from '@/lib/access-control/types';

/**
 * GET /api/usage - Get usage statistics for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tier = await getUserTier(user.id);
    const stats = await getAllUsageStats(user.id);

    return NextResponse.json({
      success: true,
      tier,
      stats,
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/usage - Check or use a feature
 * Body: { feature: string, action: 'check' | 'use', count?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { feature, action = 'check', count = 1 } = body;

    // Validate feature
    const validFeatures: FeatureKey[] = [
      'mock_tests',
      'practice_questions',
      'topic_access',
      'analytics_history',
      'test_history',
      'explanations',
      'weak_topics',
      'leaderboard',
    ];

    if (!feature || !validFeatures.includes(feature as FeatureKey)) {
      return NextResponse.json(
        { error: 'Invalid feature' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'use') {
      result = await useFeature(user.id, feature as FeatureKey, count);
    } else {
      result = await checkAccess(user.id, feature as FeatureKey);
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error checking/using feature:', error);
    return NextResponse.json(
      { error: 'Failed to check feature access' },
      { status: 500 }
    );
  }
}
