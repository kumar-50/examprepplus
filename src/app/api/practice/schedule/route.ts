import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/db';
import { revisionSchedule } from '@/db/schema';
import { hasActiveSubscription } from '@/lib/subscription-utils';
import { checkAccess, useFeature } from '@/lib/access-control/middleware';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    
    console.log('📅 Schedule practice request:', { userId: user.id, body });
    
    const { scheduledDate, sectionIds, topicIds, questionCount, difficulty } = body;

    // Validate input
    if (!scheduledDate) {
      return NextResponse.json(
        { error: 'Scheduled date is required' },
        { status: 400 }
      );
    }

    // Check scheduled practice limits for free users
    const isPremium = await hasActiveSubscription(user.id);
    if (!isPremium) {
      const accessCheck = await checkAccess(user.id, 'scheduled_practice');
      if (!accessCheck.allowed) {
        return NextResponse.json(
          { 
            error: 'Weekly limit reached', 
            message: `You've used all ${accessCheck.limit} scheduled practice sessions for this week. Upgrade to Premium for unlimited scheduling.`,
            upgradeRequired: true,
            remaining: 0,
            limit: accessCheck.limit
          },
          { status: 403 }
        );
      }
    }

    // Store both sectionIds and topicIds (topicIds stored separately if needed)
    const sectionIdsString = Array.isArray(sectionIds) ? sectionIds.join(',') : (sectionIds || '');
    const topicIdsString = Array.isArray(topicIds) ? topicIds.join(',') : '';

    // Create scheduled session
    const [scheduledSession] = await db
      .insert(revisionSchedule)
      .values({
        userId: user.id,
        scheduledDate: new Date(scheduledDate),
        sectionIds: topicIdsString || sectionIdsString, // Use topicIds if available, otherwise sectionIds
        questionCount: questionCount || 15,
        difficulty: difficulty || 'mixed',
        attemptId: null,
      })
      .returning();

    if (!scheduledSession) {
      return NextResponse.json(
        { error: 'Failed to create scheduled session' },
        { status: 500 }
      );
    }

    // Track usage for free users after successful creation
    if (!isPremium) {
      await useFeature(user.id, 'scheduled_practice', 1);
    }

    console.log('✅ Practice scheduled:', scheduledSession.id);

    return NextResponse.json({ 
      success: true, 
      sessionId: scheduledSession.id 
    });
  } catch (error) {
    console.error('❌ Error scheduling practice:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule practice session' },
      { status: 500 }
    );
  }
}
