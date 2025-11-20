import { db } from '@/db';
import { userAnswers, questions, topics, weakTopics, userTestAttempts } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';

interface TopicPerformance {
  topicId: string;
  topicName: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercentage: number;
  weaknessLevel: 'critical' | 'moderate' | 'improving' | null;
}

/**
 * Analyzes a user's test performance and identifies weak topics
 * This should be called after a user completes a test
 */
export async function analyzeUserWeakTopics(userId: string): Promise<void> {
  // Step 1: Get all user's answers with topic information
  const topicPerformance = await db
    .select({
      topicId: questions.topicId,
      topicName: topics.name,
      totalQuestions: sql<number>`COUNT(*)`,
      correctAnswers: sql<number>`SUM(CASE WHEN ${userAnswers.isCorrect} THEN 1 ELSE 0 END)`,
    })
    .from(userAnswers)
    .innerJoin(
      userTestAttempts,
      eq(userAnswers.attemptId, userTestAttempts.id)
    )
    .innerJoin(
      questions,
      eq(userAnswers.questionId, questions.id)
    )
    .innerJoin(
      topics,
      eq(questions.topicId, topics.id)
    )
    .where(eq(userTestAttempts.userId, userId))
    .groupBy(questions.topicId, topics.name);

  // Step 2: Calculate weakness level for each topic
  const weakTopicData: TopicPerformance[] = topicPerformance
    .filter(topic => topic.topicId !== null)
    .map((topic) => {
    const totalAttempts = Number(topic.totalQuestions);
    const correctAttempts = Number(topic.correctAnswers);
    const accuracyPercentage = totalAttempts > 0
      ? Math.round((correctAttempts / totalAttempts) * 100)
      : 0;

    let weaknessLevel: 'critical' | 'moderate' | 'improving' | null = null;

    // Determine weakness level based on accuracy and attempt count
    if (totalAttempts >= 5) {
      if (accuracyPercentage < 40) {
        weaknessLevel = 'critical';
      } else if (accuracyPercentage < 60) {
        weaknessLevel = 'moderate';
      } else if (accuracyPercentage < 75) {
        weaknessLevel = 'improving';
      }
    } else if (totalAttempts >= 3 && accuracyPercentage < 50) {
      weaknessLevel = 'moderate';
    }

    return {
      topicId: topic.topicId!,
      topicName: topic.topicName,
      totalAttempts,
      correctAttempts,
      accuracyPercentage,
      weaknessLevel,
    };
  });

  // Step 3: Filter only weak topics
  const identifiedWeakTopics = weakTopicData.filter(t => t.weaknessLevel !== null);

  // Step 4: Upsert weak topics into database
  for (const topic of identifiedWeakTopics) {
    const nextReviewDate = calculateNextReviewDate(topic.weaknessLevel!);

    await db
      .insert(weakTopics)
      .values({
        userId,
        sectionId: topic.topicId, // topicId maps to sectionId in the table
        totalAttempts: topic.totalAttempts,
        correctAttempts: topic.correctAttempts,
        accuracyPercentage: topic.accuracyPercentage,
        weaknessLevel: topic.weaknessLevel,
        nextReviewDate,
        lastPracticedAt: null,
        reviewCount: 0,
      })
      .onConflictDoUpdate({
        target: [weakTopics.userId, weakTopics.sectionId],
        set: {
          totalAttempts: topic.totalAttempts,
          correctAttempts: topic.correctAttempts,
          accuracyPercentage: topic.accuracyPercentage,
          weaknessLevel: topic.weaknessLevel,
          nextReviewDate,
          updatedAt: new Date(),
        },
      });
  }

  // Step 5: Remove topics that are no longer weak (>75% accuracy)
  const strongTopics = weakTopicData
    .filter(t => t.weaknessLevel === null && t.totalAttempts >= 5)
    .map(t => t.topicId);

  if (strongTopics.length > 0) {
    await db
      .delete(weakTopics)
      .where(
        and(
          eq(weakTopics.userId, userId),
          sql`${weakTopics.sectionId} = ANY(${strongTopics})`
        )
      );
  }
}

/**
 * Calculate the next review date based on weakness level
 * Uses spaced repetition algorithm
 */
function calculateNextReviewDate(weaknessLevel: 'critical' | 'moderate' | 'improving'): Date {
  const now = new Date();
  const daysToAdd = {
    critical: 1,    // Review daily for critical topics
    moderate: 3,    // Review every 3 days for moderate
    improving: 7,   // Review weekly for improving topics
  };

  const days = daysToAdd[weaknessLevel];
  now.setDate(now.getDate() + days);
  return now;
}

/**
 * Update weak topic after practice session
 * Adjusts the review interval based on performance
 */
export async function updateWeakTopicAfterPractice(
  userId: string,
  topicId: string,
  wasCorrect: boolean
): Promise<void> {
  const [existingWeakTopic] = await db
    .select()
    .from(weakTopics)
    .where(
      and(
        eq(weakTopics.userId, userId),
        eq(weakTopics.sectionId, topicId)
      )
    )
    .limit(1);

  if (!existingWeakTopic) return;

  // Update attempts and accuracy
  const newTotalAttempts = existingWeakTopic.totalAttempts + 1;
  const newCorrectAttempts = existingWeakTopic.correctAttempts + (wasCorrect ? 1 : 0);
  const newAccuracy = Math.round((newCorrectAttempts / newTotalAttempts) * 100);

  // Recalculate weakness level
  let newWeaknessLevel: 'critical' | 'moderate' | 'improving' | null = null;
  if (newAccuracy < 40) {
    newWeaknessLevel = 'critical';
  } else if (newAccuracy < 60) {
    newWeaknessLevel = 'moderate';
  } else if (newAccuracy < 75) {
    newWeaknessLevel = 'improving';
  }

  // Calculate next review with improvement bonus
  let nextReviewDate: Date | null = null;
  if (newWeaknessLevel) {
    const baseInterval = calculateNextReviewDate(newWeaknessLevel);
    
    // If user got it correct, increase interval slightly (reward good performance)
    if (wasCorrect && existingWeakTopic.reviewCount > 2) {
      baseInterval.setDate(baseInterval.getDate() + 1);
    }
    
    nextReviewDate = baseInterval;
  }

  // Update or delete the weak topic
  if (newWeaknessLevel === null && newAccuracy >= 75) {
    // Topic is no longer weak, remove it
    await db
      .delete(weakTopics)
      .where(
        and(
          eq(weakTopics.userId, userId),
          eq(weakTopics.sectionId, topicId)
        )
      );
  } else {
    // Update the weak topic
    await db
      .update(weakTopics)
      .set({
        totalAttempts: newTotalAttempts,
        correctAttempts: newCorrectAttempts,
        accuracyPercentage: newAccuracy,
        weaknessLevel: newWeaknessLevel,
        lastPracticedAt: new Date(),
        nextReviewDate,
        reviewCount: existingWeakTopic.reviewCount + 1,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(weakTopics.userId, userId),
          eq(weakTopics.sectionId, topicId)
        )
      );
  }
}

/**
 * Get recommended topics for practice based on spaced repetition
 */
export async function getRecommendedPracticeTopics(
  userId: string,
  limit: number = 5
): Promise<string[]> {
  const now = new Date();

  const dueTopics = await db
    .select({
      topicId: weakTopics.sectionId,
    })
    .from(weakTopics)
    .where(
      and(
        eq(weakTopics.userId, userId),
        sql`${weakTopics.nextReviewDate} <= ${now}`
      )
    )
    .orderBy(weakTopics.weaknessLevel, weakTopics.nextReviewDate)
    .limit(limit);

  return dueTopics.map(t => t.topicId);
}
