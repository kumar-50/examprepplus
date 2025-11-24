import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ExamReadinessCard } from '@/components/progress/exam-readiness-card';
import { StreakCalendar } from '@/components/progress/streak-calendar';
import { GoalsDashboard } from '@/components/progress/goals-dashboard';
import { AchievementsGrid } from '@/components/progress/achievements-grid';
import { SectionCoverageMap } from '@/components/progress/section-coverage-map';
import { ImprovementMetrics } from '@/components/progress/improvement-metrics';
import { db } from '@/db';
import {
  userTestAttempts,
  userAnswers,
  sections,
  questions,
  userGoals,
  achievements,
  userAchievements,
} from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { calculateReadiness, type UserStats } from '@/lib/readiness-calculator';
import { calculateStreak, getStreakCalendar, getStreakMilestone } from '@/lib/streak-calculator';
import {
  checkAchievements,
  getAchievementProgress,
  type UserProgress,
  type Achievement,
} from '@/lib/achievements';
import { refreshProgressPage } from './actions';

export const metadata: Metadata = {
  title: 'Progress Dashboard | ExamPrepPlus',
  description: 'Track your exam preparation progress, goals, and achievements',
};

async function getProgressData(userId: string, allSections: any[]) {
  try {
    // Get readiness data
    const overallStats = await db
      .select({
        avgAccuracy: sql<number>`AVG((${userTestAttempts.correctAnswers}::float / NULLIF(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers} + ${userTestAttempts.unanswered}, 0)) * 100)`,
        testsCompleted: sql<number>`COUNT(*)`,
        questionsAnswered: sql<number>`SUM(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers})`,
      })
      .from(userTestAttempts)
      .where(
        and(
          eq(userTestAttempts.userId, userId),
          eq(userTestAttempts.status, 'submitted')
        )
      );

    const sectionsPracticedResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${sections.id})`,
      })
      .from(userAnswers)
      .leftJoin(questions, eq(userAnswers.questionId, questions.id))
      .leftJoin(sections, eq(questions.sectionId, sections.id))
      .leftJoin(userTestAttempts, eq(userAnswers.attemptId, userTestAttempts.id))
      .where(eq(userTestAttempts.userId, userId));

    const totalSectionsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(sections);

    const sectionStats = await db
      .select({
        sectionId: sections.id,
        sectionName: sections.name,
        accuracy: sql<number>`AVG(CASE WHEN ${userAnswers.isCorrect} THEN 100 ELSE 0 END)`,
        questionsAttempted: sql<number>`COUNT(*)`,
        daysPracticed: sql<number>`COUNT(DISTINCT DATE(${userAnswers.createdAt}))`,
      })
      .from(userAnswers)
      .leftJoin(questions, eq(userAnswers.questionId, questions.id))
      .leftJoin(sections, eq(questions.sectionId, sections.id))
      .leftJoin(userTestAttempts, eq(userAnswers.attemptId, userTestAttempts.id))
      .where(eq(userTestAttempts.userId, userId))
      .groupBy(sections.id, sections.name);

    const recentTests = await db
      .select({
        accuracy: sql<number>`(${userTestAttempts.correctAnswers}::float / NULLIF(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers} + ${userTestAttempts.unanswered}, 0)) * 100`,
        submittedAt: userTestAttempts.submittedAt,
      })
      .from(userTestAttempts)
      .where(
        and(
          eq(userTestAttempts.userId, userId),
          eq(userTestAttempts.status, 'submitted')
        )
      )
      .orderBy(desc(userTestAttempts.submittedAt))
      .limit(20);

    let recentTrend = 0;
    if (recentTests.length >= 10) {
      const recent10 = recentTests.slice(0, 10);
      const previous10 = recentTests.slice(10, 20);
      const recentAvg = recent10.reduce((sum, t) => sum + (t.accuracy || 0), 0) / recent10.length;
      const previousAvg = previous10.reduce((sum, t) => sum + (t.accuracy || 0), 0) / previous10.length;
      recentTrend = recentAvg - previousAvg;
    }

    const stats: UserStats = {
      overallAccuracy: overallStats[0]?.avgAccuracy || 0,
      sectionsPracticed: sectionsPracticedResult[0]?.count || 0,
      totalSections: totalSectionsResult[0]?.count || 0,
      testsCompleted: overallStats[0]?.testsCompleted || 0,
      questionsAnswered: overallStats[0]?.questionsAnswered || 0,
      recentAccuracyTrend: recentTrend,
      sectionStats: sectionStats.map((s) => ({
        sectionId: s.sectionId || '',
        sectionName: s.sectionName || '',
        accuracy: s.accuracy || 0,
        questionsAttempted: s.questionsAttempted || 0,
        daysPracticed: s.daysPracticed || 0,
      })),
    };

    const readiness = calculateReadiness(stats);

    // Get streak data
    const activityDates = await db
      .select({
        date: sql<string>`DATE(${userTestAttempts.submittedAt})::text`,
      })
      .from(userTestAttempts)
      .where(
        and(
          eq(userTestAttempts.userId, userId),
          eq(userTestAttempts.status, 'submitted')
        )
      )
      .groupBy(sql`DATE(${userTestAttempts.submittedAt})`);

    // Parse date strings correctly to avoid timezone issues
    const dates = activityDates.map((d) => {
      const dateStr = d.date;
      if (!dateStr) return new Date();
      const parts = dateStr.split('-').map(Number);
      const [year = 0, month = 1, day = 1] = parts;
      return new Date(year, month - 1, day); // Create date in local timezone
    });
    const streakData = calculateStreak(dates);
    const calendar = getStreakCalendar(dates, 30);
    const milestone = getStreakMilestone(streakData.currentStreak);

    const streak = {
      ...streakData,
      calendar,
      milestone,
    };

    // Get goals
    const goals = await db
      .select()
      .from(userGoals)
      .where(and(eq(userGoals.userId, userId), eq(userGoals.status, 'active')));

    // Get achievements
    const allAchievements = await db.select().from(achievements);
    const unlocked = await db
      .select({
        achievementId: userAchievements.achievementId,
        unlockedAt: userAchievements.unlockedAt,
      })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const unlockedIds = unlocked.map((u) => u.achievementId);

    const progress: UserProgress = {
      testsCompleted: overallStats[0]?.testsCompleted || 0,
      questionsAnswered: overallStats[0]?.questionsAnswered || 0,
      bestAccuracy: stats.overallAccuracy,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      sectionsAttempted: sectionsPracticedResult[0]?.count || 0,
      totalSections: totalSectionsResult[0]?.count || 0,
      perfectScores: 0,
      averageAccuracy: stats.overallAccuracy,
    };

    const achievementsWithProgress = allAchievements.map((achievement) => {
      const isUnlocked = unlockedIds.includes(achievement.id);
      const progressData = getAchievementProgress(achievement as Achievement, progress);
      const unlockedData = unlocked.find((u) => u.achievementId === achievement.id);

      return {
        ...achievement,
        isUnlocked,
        unlockedAt: unlockedData?.unlockedAt || null,
        progress: progressData,
      };
    });

    const achievementsData = {
      achievements: achievementsWithProgress,
      totalPoints: unlocked.length * 10,
      unlockedCount: unlocked.length,
      totalCount: allAchievements.length,
    };

    return { readiness, streak, goals, achievements: achievementsData, sections: allSections };
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return { readiness: null, streak: null, goals: [], achievements: null, sections: [] };
  }
}

function getSectionStatus(accuracy: number, questionsAttempted: number) {
  if (questionsAttempted === 0) return 'not-attempted';
  if (accuracy >= 80) return 'mastered';
  if (accuracy >= 60) return 'proficient';
  if (accuracy >= 40) return 'developing';
  return 'needs-work';
}

export default async function ProgressPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all sections
  const allSections = await db.select().from(sections);
  
  const { readiness, streak, goals, achievements, sections: sectionsData } = await getProgressData(user.id, allSections);

  // Prepare section coverage data
  const sectionCoverageData =
    readiness?.sectionReadiness?.map((section: any) => ({
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      accuracy: Number(section.accuracy) || 0,
      questionsAttempted: section.questionsAttempted,
      status: getSectionStatus(Number(section.accuracy) || 0, section.questionsAttempted) as 'mastered' | 'proficient' | 'developing' | 'needs-work' | 'not-attempted',
    })) || [];

  // Filter today's goals (for simplicity, showing active goals)
  const todayGoals = goals.filter((g: any) => g.goalType === 'daily');

  // Mock improvement metrics (would need historical data)
  const improvementMetrics = {
    thisMonth: {
      accuracy: readiness?.overallReadiness || 0,
      testsCompleted: 0, // Would need monthly aggregation
      currentStreak: streak?.currentStreak || 0,
    },
    lastMonth: {
      accuracy: 0,
      testsCompleted: 0,
      currentStreak: 0,
    },
    mostImprovedSections: [],
    consistencyScore: streak ? Math.min((streak.currentStreak / 30) * 10, 10) : 0,
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your exam readiness and celebrate your achievements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1: Readiness and Streak */}
        <div className="lg:col-span-2">
          {readiness ? (
            <ExamReadinessCard readiness={readiness} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Complete some tests to see your readiness score</p>
            </div>
          )}
        </div>

        <div>
          {streak ? (
            <StreakCalendar streakData={streak} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Start practicing to build your streak</p>
            </div>
          )}
        </div>

        {/* Row 2: Goals */}
        <div className="lg:col-span-3">
          <GoalsDashboard 
            goals={goals} 
            todayGoals={todayGoals}
            sections={allSections}
            onGoalChanged={refreshProgressPage}
          />
        </div>

        {/* Row 3: Achievements and Section Coverage */}
        <div className="lg:col-span-2">
          {achievements ? (
            <AchievementsGrid
              achievements={achievements.achievements}
              totalPoints={achievements.totalPoints}
              unlockedCount={achievements.unlockedCount}
              totalCount={achievements.totalCount}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Achievements loading...</p>
            </div>
          )}
        </div>

        <div>
          {sectionCoverageData.length > 0 ? (
            <SectionCoverageMap sections={sectionCoverageData} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Practice to see section coverage</p>
            </div>
          )}
        </div>

        {/* Row 4: Improvement Metrics */}
        <div className="lg:col-span-3">
          <ImprovementMetrics {...improvementMetrics} />
        </div>
      </div>
    </div>
  );
}
