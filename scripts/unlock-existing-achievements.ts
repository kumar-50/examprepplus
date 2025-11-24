/**
 * Retroactive Achievement Unlock Script
 * 
 * This script checks all users who have completed tests and unlocks
 * achievements they should have earned based on their progress.
 * 
 * Run this once to fix existing users' achievements.
 */

import { db } from '@/db';
import { 
  userTestAttempts, 
  achievements, 
  userAchievements,
  users 
} from '@/db/schema';
import { eq, and, sql, notInArray } from 'drizzle-orm';
import { checkAchievements, type UserProgress } from '@/lib/achievements';

async function unlockAchievementsForUser(userId: string) {
  console.log(`\n🔍 Checking achievements for user: ${userId}`);

  // Get user's current progress
  const [statsResult] = await db
    .select({
      testsCompleted: sql<number>`COUNT(*)::int`,
      totalQuestions: sql<number>`SUM(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers})::int`,
      bestAccuracy: sql<number>`MAX((${userTestAttempts.correctAnswers}::float / NULLIF(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers}, 0)) * 100)`,
      perfectScores: sql<number>`COUNT(CASE WHEN ${userTestAttempts.incorrectAnswers} = 0 AND ${userTestAttempts.unanswered} = 0 AND ${userTestAttempts.correctAnswers} > 0 THEN 1 END)::int`,
    })
    .from(userTestAttempts)
    .where(
      and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.status, 'submitted')
      )
    );

  if (!statsResult || statsResult.testsCompleted === 0) {
    console.log(`  ⏭️  No completed tests found`);
    return 0;
  }

  console.log(`  📊 User stats:`, {
    tests: statsResult.testsCompleted,
    questions: statsResult.totalQuestions,
    bestAccuracy: statsResult.bestAccuracy?.toFixed(1) + '%',
    perfectScores: statsResult.perfectScores,
  });

  const userProgress: UserProgress = {
    testsCompleted: statsResult.testsCompleted,
    questionsAnswered: statsResult.totalQuestions || 0,
    bestAccuracy: statsResult.bestAccuracy || 0,
    currentStreak: 0, // TODO: Could calculate from activity dates
    longestStreak: 0,
    sectionsAttempted: 0, // TODO: Could calculate from test patterns
    totalSections: 0,
    perfectScores: statsResult.perfectScores,
    averageAccuracy: statsResult.bestAccuracy || 0,
  };

  // Get all achievements
  const allAchievements = await db.select().from(achievements);

  // Get already unlocked achievement IDs
  const unlockedAchievements = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const unlockedIds = unlockedAchievements.map(ua => ua.achievementId);

  console.log(`  ✅ Already unlocked: ${unlockedIds.length} achievements`);

  // Map achievements to ensure non-null values
  const achievementsList = allAchievements.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description || '',
    icon: a.icon || '🏆',
    category: a.category,
    requirementType: a.requirementType,
    requirementValue: a.requirementValue,
    points: a.points,
  }));

  // Check which achievements should be unlocked
  const newlyUnlocked = checkAchievements(userProgress, achievementsList as any, unlockedIds);

  if (newlyUnlocked.length > 0) {
    // Unlock new achievements
    await db.insert(userAchievements).values(
      newlyUnlocked.map(achievement => ({
        userId,
        achievementId: achievement.id,
        unlockedAt: new Date(),
      }))
    );

    console.log(`  🏆 Unlocked ${newlyUnlocked.length} new achievement(s):`);
    newlyUnlocked.forEach(achievement => {
      console.log(`     - ${achievement.icon} ${achievement.name} (+${achievement.points} pts)`);
    });

    return newlyUnlocked.length;
  } else {
    console.log(`  ✨ No new achievements to unlock`);
    return 0;
  }
}

async function main() {
  console.log('🚀 Starting retroactive achievement unlock...\n');

  try {
    // Get all users who have completed at least one test
    const usersWithTests = await db
      .selectDistinct({ userId: userTestAttempts.userId })
      .from(userTestAttempts)
      .where(eq(userTestAttempts.status, 'submitted'));

    console.log(`📋 Found ${usersWithTests.length} user(s) with completed tests\n`);

    let totalUnlocked = 0;

    for (const { userId } of usersWithTests) {
      const unlocked = await unlockAchievementsForUser(userId);
      totalUnlocked += unlocked;
    }

    console.log(`\n✅ Complete! Unlocked ${totalUnlocked} total achievement(s) across ${usersWithTests.length} user(s)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n👋 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
