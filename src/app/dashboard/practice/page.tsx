import { requireAuth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { weakTopics, revisionSchedule, userTestAttempts, tests, sections } from '@/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { PracticeTabs } from '@/components/practice/practice-tabs';
import { QuickQuizSheet } from '@/components/practice/quick-quiz-sheet';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PracticePage() {
  let user;
  try {
    user = await requireAuth();
    console.log('✅ Practice page: User authenticated', user.id);
  } catch (error) {
    redirect('/login?redirect=/dashboard/practice');
  }

  try {
    console.log('📊 Fetching weak topics...');
    // Fetch weak topics for the user with section names
    const userWeakTopics = await db
      .select({
        id: weakTopics.id,
        sectionId: weakTopics.sectionId,
        sectionName: sections.name,
        accuracyPercentage: weakTopics.accuracyPercentage,
        weaknessLevel: weakTopics.weaknessLevel,
        totalAttempts: weakTopics.totalAttempts,
        correctAttempts: weakTopics.correctAttempts,
        nextReviewDate: weakTopics.nextReviewDate,
      })
      .from(weakTopics)
      .innerJoin(sections, eq(weakTopics.sectionId, sections.id))
      .where(eq(weakTopics.userId, user.id))
      .orderBy(weakTopics.accuracyPercentage) // Lowest accuracy first (most critical)
      .limit(10)
      .then(results => {
        console.log('📊 Weak topics raw results:', results.length);
        return results.map(item => ({
          ...item,
          accuracyPercentage: item.accuracyPercentage ?? 0,
          totalAttempts: item.totalAttempts ?? 0,
          correctAttempts: item.correctAttempts ?? 0,
        }));
      });
    
    console.log('✅ Weak topics fetched:', userWeakTopics.length);

    console.log('📅 Fetching upcoming practice...');
    console.log('📅 User ID:', user.id);
    // Fetch upcoming practice quizzes (scheduled attempts - includes overdue ones not yet completed)
    const now = new Date();
    
    // First check if there are ANY records in the table
    const allSchedules = await db.select().from(revisionSchedule).limit(5);
    console.log('📅 Total schedules in DB (any user):', allSchedules.length);
    if (allSchedules.length > 0) {
      console.log('📅 Sample schedule:', allSchedules[0]);
    }
    
    const upcomingPractice = await db
    .select({
      id: revisionSchedule.id,
      scheduledDate: revisionSchedule.scheduledDate,
      topicIds: revisionSchedule.sectionIds,
      difficulty: revisionSchedule.difficulty,
      questionCount: revisionSchedule.questionCount,
      attemptId: revisionSchedule.attemptId,
    })
    .from(revisionSchedule)
    .where(eq(revisionSchedule.userId, user.id))
    .orderBy(revisionSchedule.scheduledDate)
    .limit(10)
    .then(results => results.map(item => ({
      ...item,
      questionCount: item.questionCount ?? 10,
    })));
    
    console.log('✅ Upcoming practice fetched:', upcomingPractice.length);
    console.log('📅 Upcoming practice data:', JSON.stringify(upcomingPractice, null, 2));

    console.log('📜 Fetching revision history...');
    // Fetch revision history (completed practice attempts)
    const revisionHistoryData = await db
    .select({
      id: userTestAttempts.id,
      title: tests.title,
      submittedAt: userTestAttempts.submittedAt,
      totalQuestions: tests.totalQuestions,
      correctAnswers: userTestAttempts.correctAnswers,
      difficulty: tests.description, // Can use a field to store difficulty
    })
    .from(userTestAttempts)
    .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
    .where(
      and(
        eq(userTestAttempts.userId, user.id),
        eq(tests.testType, 'practice'),
        eq(userTestAttempts.status, 'submitted')
      )
    )
    .orderBy(desc(userTestAttempts.submittedAt))
    .limit(10)
    .then(results => results.map(item => ({
      ...item,
      correctAnswers: item.correctAnswers ?? 0
    })));
    
    console.log('✅ Revision history fetched:', revisionHistoryData.length);

    console.log('📅 Fetching calendar schedule...');
    // Fetch calendar data (all scheduled sessions for the month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const calendarSchedule = await db
    .select({
      id: revisionSchedule.id,
      scheduledDate: revisionSchedule.scheduledDate,
      attemptId: revisionSchedule.attemptId,
    })
    .from(revisionSchedule)
    .where(
      and(
        eq(revisionSchedule.userId, user.id),
        gte(revisionSchedule.scheduledDate, startOfMonth)
      )
    );
    
    console.log('✅ Calendar schedule fetched:', calendarSchedule.length);
    console.log('🎉 All data fetched successfully, rendering page...');

    return (
      <div className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Practice Mode</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Master your weak topics through AI-powered spaced repetition
          </p>
        </div>

        {/* Tabbed Interface */}
        <PracticeTabs 
          weakTopics={userWeakTopics}
          upcomingPractice={upcomingPractice}
          revisionHistory={revisionHistoryData}
          userId={user.id}
        />

        {/* Floating Quick Quiz Button */}
        <QuickQuizSheet userId={user.id} />
      </div>
    );
  } catch (error) {
    console.error('❌ Error in Practice Page:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}
