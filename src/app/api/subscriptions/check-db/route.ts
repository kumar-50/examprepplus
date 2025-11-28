import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { subscriptions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/subscriptions/check-db
 * Debug endpoint to check subscriptions in database
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

    console.log('🔍 Checking subscriptions for user:', user.id);

    // Get all subscriptions for this user
    const allSubs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id));

    console.log('📊 Found subscriptions:', allSubs.length);
    console.log('📋 Subscription details:', JSON.stringify(allSubs, null, 2));

    // Get user record
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    console.log('👤 User record:', JSON.stringify(userRecord, null, 2));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: userRecord[0]?.subscriptionStatus || null,
      },
      subscriptions: allSubs,
      count: allSubs.length,
    });
  } catch (error: any) {
    console.error('❌ Error checking database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
