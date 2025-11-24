/**
 * Dashboard Database Queries
 * All database queries needed for the main dashboard
 */

import { db } from '@/db';
import { 
  userTestAttempts, 
  tests, 
  sections,
  userGoals,
  achievements,
  userAchievements,
  users,
  userAnswers,
  questions,
  topics
} from '@/db/schema';
import { eq, desc, and, sql, gte, lt } from 'drizzle-orm';
import { subDays, startOfDay } from 'date-fns';

export interface UserStats {
  testsCompleted: number;
  overallAccuracy: number;
  weeklyTests: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  perfectScores: number;
}

export interface RecentTest {
  id: string;
  testId: string;
  name: string;
  testType: string;
  accuracy: number;
  submittedAt: Date;
  totalQuestions: number;
  correctAnswers: number;
  status: string;
}

export interface WeakTopic {
  id: string;
  name: string;
  accuracy: number;
  questionsAttempted: number;
}

export interface ActiveGoal {
  id: string;
  goalType: string;
  goalCategory: string;
  targetValue: number;
  currentValue: number;
  periodStart: Date;
  periodEnd: Date;
  status: string;
  progress: number;
}

export interface RecentAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  unlockedAt: Date;
}

/**
 * Get user statistics from test attempts
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const sevenDaysAgo = subDays(new Date(), 7);

  const result = await db
    .select({
      testsCompleted: sql<number>`COUNT(*)::int`,
      totalQuestions: sql<number>`SUM(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers} + ${userTestAttempts.unanswered})::int`,
      correctAnswers: sql<number>`SUM(${userTestAttempts.correctAnswers})::int`,
      incorrectAnswers: sql<number>`SUM(${userTestAttempts.incorrectAnswers})::int`,
      weeklyTests: sql<number>`COUNT(CASE WHEN ${userTestAttempts.submittedAt} >= ${sevenDaysAgo.toISOString()} THEN 1 END)::int`,
      perfectScores: sql<number>`COUNT(CASE WHEN ${userTestAttempts.incorrectAnswers} = 0 AND ${userTestAttempts.unanswered} = 0 AND ${userTestAttempts.correctAnswers} > 0 THEN 1 END)::int`,
    })
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.status, 'submitted')
      )
    );

  const stats = result[0];
  
  if (!stats) {
    return {
      testsCompleted: 0,
      overallAccuracy: 0,
      weeklyTests: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      perfectScores: 0,
    };
  }
  
  // Calculate overall accuracy
  const totalAnswered = (stats.correctAnswers || 0) + (stats.incorrectAnswers || 0);
  const overallAccuracy = totalAnswered > 0 
    ? (stats.correctAnswers / totalAnswered) * 100 
    : 0;

  return {
    testsCompleted: stats.testsCompleted || 0,
    overallAccuracy: Math.round(overallAccuracy * 10) / 10, // Round to 1 decimal
    weeklyTests: stats.weeklyTests || 0,
    totalQuestions: stats.totalQuestions || 0,
    correctAnswers: stats.correctAnswers || 0,
    incorrectAnswers: stats.incorrectAnswers || 0,
    perfectScores: stats.perfectScores || 0,
  };
}

/**
 * Get activity dates for streak calculation
 */
export async function getActivityDates(userId: string): Promise<Date[]> {
  const result = await db
    .select({
      activityDate: sql<Date>`${userTestAttempts.submittedAt}::date`,
    })
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.status, 'submitted')
      )
    )
    .groupBy(sql`${userTestAttempts.submittedAt}::date`)
    .orderBy(desc(sql`${userTestAttempts.submittedAt}::date`));

  return result.map(r => new Date(r.activityDate));
}

/**
 * Get recent test attempts (last 5)
 */
export async function getRecentTests(userId: string, limit: number = 5): Promise<RecentTest[]> {
  const result = await db
    .select({
      id: userTestAttempts.id,
      testId: tests.id,
      name: tests.title,
      testType: tests.testType,
      correctAnswers: userTestAttempts.correctAnswers,
      incorrectAnswers: userTestAttempts.incorrectAnswers,
      unanswered: userTestAttempts.unanswered,
      totalQuestions: tests.totalQuestions,
      submittedAt: userTestAttempts.submittedAt,
      status: userTestAttempts.status,
    })
    .from(userTestAttempts)
    .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.status, 'submitted')
      )
    )
    .orderBy(desc(userTestAttempts.submittedAt))
    .limit(limit);

  return result.map(r => {
    const totalAnswered = (r.correctAnswers || 0) + (r.incorrectAnswers || 0);
    const accuracy = totalAnswered > 0 
      ? ((r.correctAnswers || 0) / totalAnswered) * 100 
      : 0;

    return {
      id: r.id,
      testId: r.testId,
      name: r.name,
      testType: r.testType,
      accuracy: Math.round(accuracy * 10) / 10,
      submittedAt: r.submittedAt!,
      totalQuestions: r.totalQuestions,
      correctAnswers: r.correctAnswers || 0,
      status: r.status,
    };
  });
}

/**
 * Get weak topics (sections with accuracy < 50%)
 * Note: Currently returns empty as tests don't have sectionId field
 * TODO: Implement based on test patterns or question topics
 */
export async function getWeakTopics(userId: string, limit: number = 5): Promise<WeakTopic[]> {
  // Query user answers joined with questions and topics
  // Calculate accuracy per topic from user's answer history
  const result = await db
    .select({
      topicId: topics.id,
      topicName: topics.name,
      totalAnswers: sql<number>`COUNT(*)::int`,
      correctAnswers: sql<number>`SUM(CASE WHEN ${userAnswers.isCorrect} = true THEN 1 ELSE 0 END)::int`,
    })
    .from(userAnswers)
    .innerJoin(userTestAttempts, eq(userAnswers.attemptId, userTestAttempts.id))
    .innerJoin(questions, eq(userAnswers.questionId, questions.id))
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.status, 'submitted')
      )
    )
    .groupBy(topics.id, topics.name)
    .having(sql`COUNT(*) >= 3`); // Only consider topics with at least 3 questions attempted

  // Calculate accuracy and filter weak topics (<50%)
  const weakTopics = result
    .map(r => ({
      id: r.topicId,
      name: r.topicName,
      accuracy: Math.round((r.correctAnswers / r.totalAnswers) * 100),
      questionsAttempted: r.totalAnswers,
    }))
    .filter(t => t.accuracy < 50) // Topics with <50% accuracy
    .sort((a, b) => a.accuracy - b.accuracy) // Sort by worst accuracy first
    .slice(0, limit);

  return weakTopics;
}

/**
 * Get active goals (top 2 by deadline)
 */
export async function getActiveGoals(userId: string, limit: number = 2): Promise<ActiveGoal[]> {
  const result = await db
    .select()
    .from(userGoals)
    .where(
      and(
        eq(userGoals.userId, userId),
        eq(userGoals.status, 'active')
      )
    )
    .orderBy(userGoals.periodEnd)
    .limit(limit);

  return result.map(g => {
    const targetValue = parseFloat(g.targetValue);
    const currentValue = parseFloat(g.currentValue);
    const progress = targetValue > 0 
      ? Math.min(Math.round((currentValue / targetValue) * 100), 100)
      : 0;

    return {
      id: g.id,
      goalType: g.goalType,
      goalCategory: g.goalCategory,
      targetValue,
      currentValue,
      periodStart: new Date(g.periodStart),
      periodEnd: new Date(g.periodEnd),
      status: g.status,
      progress,
    };
  });
}

/**
 * Get recent achievements (last 3 unlocked)
 */
export async function getRecentAchievements(userId: string, limit: number = 3): Promise<RecentAchievement[]> {
  const result = await db
    .select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      icon: achievements.icon,
      category: achievements.category,
      points: achievements.points,
      unlockedAt: userAchievements.unlockedAt,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.unlockedAt))
    .limit(limit);

  return result.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description || '',
    icon: r.icon || '🏆',
    category: r.category,
    points: r.points,
    unlockedAt: r.unlockedAt,
  }));
}

/**
 * Get next closest achievement (80%+ progress, not yet unlocked)
 */
export async function getNextAchievement(userId: string, userProgress: any) {
  // Get all achievements
  const allAchievements = await db
    .select()
    .from(achievements);

  // Get unlocked achievement IDs
  const unlockedIds = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const unlockedIdSet = new Set(unlockedIds.map(u => u.achievementId));

  // Filter to locked achievements and calculate progress
  const lockedWithProgress = allAchievements
    .filter(a => !unlockedIdSet.has(a.id))
    .map(a => {
      let progress = 0;
      
      switch (a.requirementType) {
        case 'tests_count':
          progress = (userProgress.testsCompleted / a.requirementValue) * 100;
          break;
        case 'questions_count':
          progress = (userProgress.questionsAnswered / a.requirementValue) * 100;
          break;
        case 'accuracy':
          progress = (userProgress.bestAccuracy / a.requirementValue) * 100;
          break;
        case 'streak_days':
          progress = (userProgress.currentStreak / a.requirementValue) * 100;
          break;
        case 'sections_covered':
          progress = (userProgress.sectionsAttempted / a.requirementValue) * 100;
          break;
        default:
          progress = 0;
      }

      return {
        ...a,
        progress: Math.min(Math.round(progress), 100),
        current: userProgress[a.requirementType] || 0,
      };
    })
    .filter(a => a.progress >= 80) // Only show if 80%+ complete
    .sort((a, b) => b.progress - a.progress); // Sort by closest first

  return lockedWithProgress[0] || null;
}

/**
 * Get total sections and sections attempted
 */
export async function getSectionCoverage(userId: string) {
  // Total sections
  const totalSectionsResult = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(sections);

  // Sections attempted - simplified for now
  // TODO: Implement proper section coverage based on test patterns
  const attemptedSectionsResult = await db
    .select({ 
      testId: userTestAttempts.testId,
    })
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.status, 'submitted')
      )
    )
    .groupBy(userTestAttempts.testId);

  return {
    totalSections: totalSectionsResult[0]?.count || 0,
    sectionsPracticed: attemptedSectionsResult.length,
  };
}

/**
 * Check if user has any in-progress tests
 */
export async function hasInProgressTest(userId: string): Promise<boolean> {
  const result = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.status, 'in_progress')
      )
    );

  return (result[0]?.count || 0) > 0;
}

/**
 * Get user profile data
 */
export async function getUserProfile(userId: string) {
  const result = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      avatarUrl: users.avatarUrl,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get accuracy trend (last 5 tests vs previous 5 tests)
 */
export async function getAccuracyTrend(userId: string): Promise<number> {
  const result = await db
    .select({
      correctAnswers: userTestAttempts.correctAnswers,
      incorrectAnswers: userTestAttempts.incorrectAnswers,
    })
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.status, 'submitted')
      )
    )
    .orderBy(desc(userTestAttempts.submittedAt))
    .limit(10);

  if (result.length < 6) {
    return 0; // Not enough data for trend
  }

  // Calculate recent accuracy (last 5 tests)
  const recent = result.slice(0, 5);
  const recentCorrect = recent.reduce((sum, r) => sum + (r.correctAnswers || 0), 0);
  const recentIncorrect = recent.reduce((sum, r) => sum + (r.incorrectAnswers || 0), 0);
  const recentTotal = recentCorrect + recentIncorrect;
  const recentAccuracy = recentTotal > 0 ? (recentCorrect / recentTotal) * 100 : 0;

  // Calculate previous accuracy (tests 6-10)
  const previous = result.slice(5, 10);
  const previousCorrect = previous.reduce((sum, r) => sum + (r.correctAnswers || 0), 0);
  const previousIncorrect = previous.reduce((sum, r) => sum + (r.incorrectAnswers || 0), 0);
  const previousTotal = previousCorrect + previousIncorrect;
  const previousAccuracy = previousTotal > 0 ? (previousCorrect / previousTotal) * 100 : 0;

  // Return trend (positive = improving, negative = declining)
  return Math.round((recentAccuracy - previousAccuracy) * 10) / 10;
}
