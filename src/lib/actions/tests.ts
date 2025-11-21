'use server';

import { db } from '@/db';
import { tests, testQuestions, questions, userTestAttempts, userAnswers, sections } from '@/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/server';
import { updateWeakTopicsAfterTest } from '@/lib/analytics/weak-topic-analyzer';

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

  // TODO: Check subscription access for premium tests
  if (!test.isFree) {
    // Check user subscription
    // For now, allow all tests
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

  // Get all answers with question details
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
    .from(userAnswers)
    .innerJoin(questions, eq(userAnswers.questionId, questions.id))
    .innerJoin(testQuestions, 
      and(
        eq(testQuestions.questionId, questions.id),
        eq(testQuestions.testId, attempt.testId)
      )
    )
    .where(eq(userAnswers.attemptId, attemptId))
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
