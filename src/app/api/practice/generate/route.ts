import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { db } from '@/db';
import { tests, userTestAttempts, testQuestions, questions } from '@/db/schema';
import { inArray, eq, sql, and } from 'drizzle-orm';
import { hasActiveSubscription } from '@/lib/subscription-utils';
import { checkAccess, useFeature } from '@/lib/access-control/middleware';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    
    console.log('🎯 Practice generate request:', { userId: user.id, body });
    
    const { userId, sectionIds, topicIds, questionCount, difficulty, customTitle } = body;

    // Verify user matches
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check practice quiz limits for free users
    const isPremium = await hasActiveSubscription(user.id);
    if (!isPremium) {
      const accessCheck = await checkAccess(user.id, 'practice_quizzes');
      if (!accessCheck.allowed) {
        return NextResponse.json(
          { 
            error: 'Daily limit reached', 
            message: `You've used all ${accessCheck.limit} practice quizzes for today. Upgrade to Premium for unlimited quizzes.`,
            upgradeRequired: true,
            remaining: 0,
            limit: accessCheck.limit
          },
          { status: 403 }
        );
      }
    }

    // Build filter conditions - only verified and active questions
    const filters = [
      eq(questions.isVerified, true),
      eq(questions.isActive, true),
      eq(questions.status, 'approved')
    ];

    // Filter by topics if provided (takes precedence over sections)
    if (topicIds && topicIds.length > 0) {
      filters.push(inArray(questions.topicId, topicIds));
    } else if (sectionIds && sectionIds.length > 0) {
      // Filter by sections if no topics specified
      filters.push(inArray(questions.sectionId, sectionIds));
    }

    // Filter by difficulty if provided
    if (difficulty && difficulty !== 'mixed') {
      filters.push(eq(questions.difficultyLevel, difficulty));
    }

    console.log('🔍 Fetching questions with filters:', { sectionIds, topicIds, difficulty, questionCount });

    // Fetch random questions
    const availableQuestions = await db
      .select({
        id: questions.id,
        sectionId: questions.sectionId,
        difficulty: questions.difficultyLevel,
      })
      .from(questions)
      .where(and(...filters))
      .orderBy(sql`RANDOM()`)
      .limit(questionCount);

    console.log('📊 Found questions:', availableQuestions.length);

    if (availableQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for the selected criteria' },
        { status: 400 }
      );
    }

    // Create a dynamic practice test
    const [practiceTest] = await db
      .insert(tests)
      .values({
        title: customTitle || `${difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Mixed'} Practice Quiz`,
        description: difficulty || 'mixed',
        testType: 'practice',
        totalQuestions: availableQuestions.length,
        totalMarks: availableQuestions.length, // 1 mark per question
        duration: 0, // Untimed
        negativeMarking: false,
        isPublished: false, // User-generated
        isFree: true,
        testPattern: { sections: sectionIds }, // Store selected sections
        createdBy: user.id,
      })
      .returning();

    if (!practiceTest) {
      return NextResponse.json(
        { error: 'Failed to create practice test' },
        { status: 500 }
      );
    }

    // Create test_questions records (link questions to test)
    const testQuestionValues = availableQuestions.map((q, index) => ({
      testId: practiceTest.id,
      questionId: q.id,
      marks: 1,
      questionOrder: index + 1,
      sectionId: q.sectionId,
    }));

    await db.insert(testQuestions).values(testQuestionValues);

    // Create a practice attempt
    const [attempt] = await db
      .insert(userTestAttempts)
      .values({
        userId: user.id,
        testId: practiceTest.id,
        status: 'in_progress',
        totalMarks: availableQuestions.length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unanswered: availableQuestions.length,
      })
      .returning();

    if (!attempt) {
      return NextResponse.json(
        { error: 'Failed to create practice attempt' },
        { status: 500 }
      );
    }

    // Track usage for free users after successful creation
    if (!isPremium) {
      await useFeature(user.id, 'practice_quizzes', 1);
    }

    return NextResponse.json({ sessionId: attempt.id, testId: practiceTest.id });
  } catch (error) {
    console.error('❌ Error generating quiz:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
