'use server';

import { db } from '@/db';
import { tests, testQuestions, questions, userTestAttempts, userAnswers, sections, users } from '@/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/server';
import { updateWeakTopicsAfterTest } from '@/lib/analytics/weak-topic-analyzer';
import { hasActiveSubscription } from '@/lib/subscription-utils';
import { useFeature } from '@/lib/access-control/middleware';

export interface TestFilters {
  search?: string;
  examType?: string;
  difficulty?: string;
  duration?: string;
  language?: string;
  freeOnly?: boolean;
}

/**
 * Get all published tests with optional filters
 */
export async function getTests(filters?: TestFilters) {
  const user = await requireAuth();

  let query = db
    .select({
      id: tests.id,
      title: tests.title,
      description: tests.description,
      testType: tests.testType,
      totalQuestions: tests.totalQuestions,
      totalMarks: tests.totalMarks,
      duration: tests.duration,
      isFree: tests.isFree,
      bannerImage: tests.bannerImage,
      averageRating: tests.averageRating,
      totalRatings: tests.totalRatings,
      totalAttempts: tests.totalAttempts,
      createdAt: tests.createdAt,
    })
    .from(tests)
    .where(eq(tests.isPublished, true));

  // TODO: Apply filters when we have sections linked to tests
  // For now, return all published tests

  const allTests = await query.orderBy(desc(tests.createdAt));

  // Get user's attempt count for each test
  const userAttempts = await db
    .select({
      testId: userTestAttempts.testId,
      attemptCount: sql<number>`count(*)::int`,
    })
    .from(userTestAttempts)
    .where(eq(userTestAttempts.userId, user.id))
    .groupBy(userTestAttempts.testId);

  const attemptMap = new Map(
    userAttempts.map((a) => [a.testId, a.attemptCount])
  );

  return allTests.map((test) => ({
    ...test,
    userAttemptCount: attemptMap.get(test.id) || 0,
  }));
}

/**
 * Get test by ID with full details
 */
export async function getTestById(testId: string) {
  const [test] = await db
    .select()
    .from(tests)
    .where(eq(tests.id, testId))
    .limit(1);

  return test || null;
}

/**
 * Get all questions for a test with their details
 */
export async function getTestQuestions(testId: string) {
  const questionsData = await db
    .select({
      id: questions.id,
      questionText: questions.questionText,
      option1: questions.option1,
      option2: questions.option2,
      option3: questions.option3,
      option4: questions.option4,
      correctAnswer: questions.correctOption, // Rename to match interface
      explanation: questions.explanation,
      imageUrl: questions.imageUrl,
      sectionId: testQuestions.sectionId, // Use section ID from test_questions
      sectionName: sections.name,
      topicId: questions.topicId,
      difficultyLevel: questions.difficultyLevel,
      questionOrder: testQuestions.questionOrder,
      marks: testQuestions.marks,
    })
    .from(testQuestions)
    .innerJoin(questions, eq(testQuestions.questionId, questions.id))
    .leftJoin(sections, eq(testQuestions.sectionId, sections.id))
    .where(
      and(
        eq(testQuestions.testId, testId),
        eq(questions.isActive, true),
        eq(questions.status, 'approved')
      )
    )
    .orderBy(testQuestions.questionOrder);

  // Add Hindi fields as null for now (can be added to schema later)
  return questionsData.map(q => ({
    ...q,
    questionTextHindi: null,
    option1Hindi: null,
    option2Hindi: null,
    option3Hindi: null,
    option4Hindi: null,
    explanationHindi: null,
  }));
}

/**
 * Get test syllabus (sections breakdown)
 */
export async function getTestSyllabus(testId: string) {
  console.log('🔍 Fetching syllabus for test:', testId);
  
  // Get all sections used in this test
  const testSections = await db
    .select({
      sectionId: testQuestions.sectionId,
      questionCount: sql<number>`count(*)::int`,
    })
    .from(testQuestions)
    .where(eq(testQuestions.testId, testId))
    .groupBy(testQuestions.sectionId);

  console.log('📊 Test sections found:', testSections);

  const sectionIds = testSections
    .map((ts) => ts.sectionId)
    .filter((id): id is string => id !== null);

  if (sectionIds.length === 0) {
    console.log('⚠️  No sections found for test');
    return [];
  }

  const sectionsData = await db
    .select()
    .from(sections)
    .where(inArray(sections.id, sectionIds));

  console.log('📚 Sections data:', sectionsData);

  const countMap = new Map(testSections.map((ts) => [ts.sectionId, ts.questionCount]));

  const result = sectionsData.map((section) => ({
    ...section,
    questionCount: countMap.get(section.id) || 0,
  }));

  console.log('✅ Final syllabus result:', result);
  
  return result;
}

/**
 * Create a new test attempt
 */
export async function createTestAttempt(testId: string, userId: string) {
  const test = await getTestById(testId);
  if (!test) {
    throw new Error('Test not found');
  }

  // Check if test is published
  if (!test.isPublished) {
    throw new Error('Test is not published');
  }

  // Check if user has already completed this test
  const existingAttempts = await db
    .select()
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.testId, testId),
        sql`${userTestAttempts.status} IN ('submitted', 'auto_submitted')`
      )
    )
    .limit(1);

  if (existingAttempts.length > 0) {
    throw new Error('You have already completed this test. Each test can only be attempted once.');
  }

  // TODO: Check subscription access for premium tests
  if (!test.isFree) {
    // Check user subscription
    // For now, allow all tests
  }

  // Track usage for free users when actually starting a test
  const isPremium = await hasActiveSubscription(userId);
  if (!isPremium) {
    await useFeature(userId, 'mock_tests', 1);
  }

  const [attempt] = await db
    .insert(userTestAttempts)
    .values({
      userId,
      testId,
      totalMarks: test.totalMarks,
      status: 'in_progress',
      startedAt: new Date(),
    })
    .returning();

  return attempt;
}

/**
 * Save user's answer for a question
 */
export async function saveAnswer(
  attemptId: string,
  questionId: string,
  selectedOption: number | null,
  timeSpent: number
) {
  const user = await requireAuth();

  // Verify the attempt belongs to the user
  const [attempt] = await db
    .select()
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.id, attemptId),
        eq(userTestAttempts.userId, user.id)
      )
    )
    .limit(1);

  if (!attempt) {
    throw new Error('Attempt not found or unauthorized');
  }

  if (attempt.status !== 'in_progress') {
    throw new Error('Cannot modify submitted attempt');
  }

  // Get correct answer
  const [question] = await db
    .select({ correctOption: questions.correctOption })
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1);

  if (!question) {
    throw new Error('Question not found');
  }

  const isCorrect = selectedOption !== null && selectedOption === question.correctOption;

  // Check if answer already exists
  const [existingAnswer] = await db
    .select()
    .from(userAnswers)
    .where(
      and(
        eq(userAnswers.attemptId, attemptId),
        eq(userAnswers.questionId, questionId)
      )
    )
    .limit(1);

  if (existingAnswer) {
    // Update existing answer
    await db
      .update(userAnswers)
      .set({
        selectedOption,
        isCorrect,
        timeSpent,
        answeredAt: new Date(),
      })
      .where(eq(userAnswers.id, existingAnswer.id));
  } else {
    // Insert new answer
    await db.insert(userAnswers).values({
      attemptId,
      questionId,
      selectedOption,
      isCorrect,
      timeSpent,
      answeredAt: selectedOption !== null ? new Date() : null,
    });
  }

  return { success: true };
}

/**
 * Toggle review flag on a question
 */
export async function toggleReviewFlag(
  attemptId: string,
  questionId: string,
  isReviewed: boolean
) {
  const user = await requireAuth();

  // Verify the attempt belongs to the user
  const [attempt] = await db
    .select()
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.id, attemptId),
        eq(userTestAttempts.userId, user.id)
      )
    )
    .limit(1);

  if (!attempt) {
    throw new Error('Attempt not found or unauthorized');
  }

  // Get or create answer record
  const [existingAnswer] = await db
    .select()
    .from(userAnswers)
    .where(
      and(
        eq(userAnswers.attemptId, attemptId),
        eq(userAnswers.questionId, questionId)
      )
    )
    .limit(1);

  if (existingAnswer) {
    await db
      .update(userAnswers)
      .set({ isReviewed })
      .where(eq(userAnswers.id, existingAnswer.id));
  } else {
    await db.insert(userAnswers).values({
      attemptId,
      questionId,
      isReviewed,
    });
  }

  return { success: true };
}

/**
 * Submit test attempt and calculate score
 */
export async function submitAttempt(attemptId: string) {
  const user = await requireAuth();

  // Verify the attempt belongs to the user
  const [attempt] = await db
    .select()
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.id, attemptId),
        eq(userTestAttempts.userId, user.id)
      )
    )
    .limit(1);

  if (!attempt) {
    throw new Error('Attempt not found or unauthorized');
  }

  if (attempt.status !== 'in_progress') {
    throw new Error('Attempt already submitted');
  }

  // Get all answers for this attempt
  const answers = await db
    .select()
    .from(userAnswers)
    .where(eq(userAnswers.attemptId, attemptId));

  // Calculate statistics
  const correctAnswers = answers.filter((a) => a.isCorrect === true).length;
  const incorrectAnswers = answers.filter(
    (a) => a.selectedOption !== null && a.isCorrect === false
  ).length;
  
  // Get test to check total questions
  const [testData] = await db
    .select()
    .from(tests)
    .where(eq(tests.id, attempt.testId))
    .limit(1);

  if (!testData) {
    throw new Error('Test not found');
  }

  const unanswered = testData.totalQuestions - correctAnswers - incorrectAnswers;

  // Calculate score (considering negative marking)
  let score = correctAnswers;
  
  if (testData.negativeMarking && testData.negativeMarkingValue) {
    const negativePoints = (incorrectAnswers * testData.negativeMarkingValue) / 100;
    score = correctAnswers - negativePoints;
  }

  // Calculate time spent
  const timeSpent = Math.floor(
    (new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000
  );

  // Update attempt record
  await db
    .update(userTestAttempts)
    .set({
      status: 'submitted',
      score: Math.max(0, score), // Ensure score is not negative
      correctAnswers,
      incorrectAnswers,
      unanswered,
      timeSpent,
      submittedAt: new Date(),
    })
    .where(eq(userTestAttempts.id, attemptId));

  // Update test total attempts count
  await db
    .update(tests)
    .set({
      totalAttempts: sql`${tests.totalAttempts} + 1`,
    })
    .where(eq(tests.id, attempt.testId));

  // Update weak topics based on test performance (for all test types)
  try {
    await updateWeakTopicsAfterTest(user.id, attemptId);
  } catch (error) {
    console.error('Failed to update weak topics:', error);
    // Don't fail the submission if weak topic analysis fails
  }

  // Update ranks and percentiles for this test (async, don't wait)
  updateTestRanks(attempt.testId).catch(error => {
    console.error('Failed to update test ranks:', error);
  });

  return {
    attemptId,
    score: Math.max(0, score),
    correctAnswers,
    incorrectAnswers,
    unanswered,
  };
}

/**
 * Get attempt review data
 */
export async function getAttemptReview(attemptId: string, userId: string) {
  const [attempt] = await db
    .select()
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.id, attemptId),
        eq(userTestAttempts.userId, userId)
      )
    )
    .limit(1);

  if (!attempt) {
    return null;
  }

  const test = await getTestById(attempt.testId);
  if (!test) {
    return null;
  }

  // Get ALL questions for this test with user answers (left join to include unanswered questions)
  const answersData = await db
    .select({
      answerId: userAnswers.id,
      selectedOption: userAnswers.selectedOption,
      isCorrect: userAnswers.isCorrect,
      timeSpent: userAnswers.timeSpent,
      questionId: questions.id,
      questionText: questions.questionText,
      option1: questions.option1,
      option2: questions.option2,
      option3: questions.option3,
      option4: questions.option4,
      correctOption: questions.correctOption,
      explanation: questions.explanation,
      imageUrl: questions.imageUrl,
      questionOrder: testQuestions.questionOrder,
    })
    .from(testQuestions)
    .innerJoin(questions, eq(testQuestions.questionId, questions.id))
    .leftJoin(userAnswers, 
      and(
        eq(userAnswers.questionId, questions.id),
        eq(userAnswers.attemptId, attemptId)
      )
    )
    .where(eq(testQuestions.testId, attempt.testId))
    .orderBy(testQuestions.questionOrder);

  return {
    attempt,
    test,
    answers: answersData,
  };
}

/**
 * Get user's attempt history for a test
 */
export async function getUserAttemptHistory(userId: string, testId: string) {
  const attempts = await db
    .select()
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.testId, testId)
      )
    )
    .orderBy(desc(userTestAttempts.startedAt));

  return attempts;
}

/**
 * Check if user has completed a test
 */
export async function hasUserCompletedTest(userId: string, testId: string): Promise<boolean> {
  const completedAttempts = await db
    .select({ id: userTestAttempts.id })
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.testId, testId),
        sql`${userTestAttempts.status} IN ('submitted', 'auto_submitted')`
      )
    )
    .limit(1);

  return completedAttempts.length > 0;
}

/**
 * Get test analytics for a user
 */
export async function getUserTestAnalytics(userId: string) {
  // Get all submitted attempts
  const attempts = await db
    .select({
      id: userTestAttempts.id,
      testId: userTestAttempts.testId,
      testTitle: tests.title,
      testType: tests.testType,
      score: userTestAttempts.score,
      totalMarks: userTestAttempts.totalMarks,
      correctAnswers: userTestAttempts.correctAnswers,
      incorrectAnswers: userTestAttempts.incorrectAnswers,
      unanswered: userTestAttempts.unanswered,
      timeSpent: userTestAttempts.timeSpent,
      submittedAt: userTestAttempts.submittedAt,
      rank: userTestAttempts.rank,
      percentile: userTestAttempts.percentile,
    })
    .from(userTestAttempts)
    .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        sql`${userTestAttempts.status} IN ('submitted', 'auto_submitted')`
      )
    )
    .orderBy(desc(userTestAttempts.submittedAt));

  // Calculate overall statistics
  const totalTests = attempts.length;
  const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
  const totalPossibleMarks = attempts.reduce((sum, a) => sum + a.totalMarks, 0);
  const averageScore = totalTests > 0 ? totalScore / totalTests : 0;
  const averageAccuracy = totalPossibleMarks > 0 ? (totalScore / totalPossibleMarks) * 100 : 0;
  const totalCorrect = attempts.reduce((sum, a) => sum + (a.correctAnswers || 0), 0);
  const totalIncorrect = attempts.reduce((sum, a) => sum + (a.incorrectAnswers || 0), 0);
  const totalUnanswered = attempts.reduce((sum, a) => sum + (a.unanswered || 0), 0);

  // Calculate test type breakdown
  const testTypeBreakdown = attempts.reduce((acc, attempt) => {
    const type = attempt.testType || 'unknown';
    if (!acc[type]) {
      acc[type] = { count: 0, totalScore: 0, totalMarks: 0 };
    }
    acc[type].count++;
    acc[type].totalScore += attempt.score || 0;
    acc[type].totalMarks += attempt.totalMarks;
    return acc;
  }, {} as Record<string, { count: number; totalScore: number; totalMarks: number }>);

  return {
    attempts,
    statistics: {
      totalTests,
      averageScore: parseFloat(averageScore.toFixed(2)),
      averageAccuracy: parseFloat(averageAccuracy.toFixed(2)),
      totalCorrect,
      totalIncorrect,
      totalUnanswered,
      testTypeBreakdown,
    },
  };
}

/**
 * Get leaderboard for a specific test
 */
export async function getTestLeaderboard(testId: string, limit: number = 100) {
  const leaderboard = await db
    .select({
      attemptId: userTestAttempts.id,
      userId: userTestAttempts.userId,
      userName: sql<string>`COALESCE(${users.fullName}, ${users.email})`,
      score: userTestAttempts.score,
      totalMarks: userTestAttempts.totalMarks,
      correctAnswers: userTestAttempts.correctAnswers,
      incorrectAnswers: userTestAttempts.incorrectAnswers,
      timeSpent: userTestAttempts.timeSpent,
      submittedAt: userTestAttempts.submittedAt,
      rank: userTestAttempts.rank,
    })
    .from(userTestAttempts)
    .innerJoin(users, eq(userTestAttempts.userId, users.id))
    .where(
      and(
        eq(userTestAttempts.testId, testId),
        sql`${userTestAttempts.status} IN ('submitted', 'auto_submitted')`
      )
    )
    .orderBy(desc(userTestAttempts.score), sql`${userTestAttempts.timeSpent} ASC`)
    .limit(limit);

  // Add rank based on order
  return leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    percentage: entry.totalMarks > 0 ? parseFloat(((entry.score || 0) / entry.totalMarks * 100).toFixed(2)) : 0,
  }));
}

/**
 * Get global leaderboard across all tests
 */
export async function getGlobalLeaderboard(limit: number = 100) {
  const leaderboard = await db
    .select({
      userId: userTestAttempts.userId,
      userName: sql<string>`COALESCE(${users.fullName}, ${users.email})`,
      totalTests: sql<number>`COUNT(DISTINCT ${userTestAttempts.testId})::int`,
      totalScore: sql<number>`SUM(${userTestAttempts.score})::int`,
      averageScore: sql<number>`AVG(${userTestAttempts.score})::float`,
      totalCorrect: sql<number>`SUM(${userTestAttempts.correctAnswers})::int`,
      totalIncorrect: sql<number>`SUM(${userTestAttempts.incorrectAnswers})::int`,
    })
    .from(userTestAttempts)
    .innerJoin(users, eq(userTestAttempts.userId, users.id))
    .where(sql`${userTestAttempts.status} IN ('submitted', 'auto_submitted')`)
    .groupBy(userTestAttempts.userId, users.fullName, users.email)
    .orderBy(desc(sql`AVG(${userTestAttempts.score})`), desc(sql`COUNT(*)`))
    .limit(limit);

  return leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    averageScore: parseFloat(entry.averageScore.toFixed(2)),
  }));
}

/**
 * Update ranks and percentiles for all attempts of a test
 */
export async function updateTestRanks(testId: string) {
  // Get all submitted attempts ordered by score
  const attempts = await db
    .select({
      id: userTestAttempts.id,
      score: userTestAttempts.score,
    })
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.testId, testId),
        sql`${userTestAttempts.status} IN ('submitted', 'auto_submitted')`
      )
    )
    .orderBy(desc(userTestAttempts.score));

  const totalAttempts = attempts.length;

  // Update each attempt with rank and percentile
  for (let i = 0; i < attempts.length; i++) {
    const rank = i + 1;
    const percentile = totalAttempts > 1 
      ? Math.round(((totalAttempts - rank) / (totalAttempts - 1)) * 10000) // Store as basis points
      : 10000; // 100% if only one attempt

    const attemptId = attempts[i]?.id;
    if (attemptId) {
      await db
        .update(userTestAttempts)
        .set({ rank, percentile })
        .where(eq(userTestAttempts.id, attemptId));
    }
  }

  return { updated: totalAttempts };
}
