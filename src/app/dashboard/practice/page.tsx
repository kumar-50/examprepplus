import { requireAuth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { weakTopics, revisionSchedule, userTestAttempts, tests } from '@/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { WeakTopicsSection } from '@/components/practice/weak-topics-section';
import { SpacedRepetitionQueue } from '@/components/practice/spaced-repetition-queue';
import { RevisionHistory } from '@/components/practice/revision-history';
import { RevisionCalendar } from '@/components/practice/revision-calendar';

export default async function PracticePage() {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/login?redirect=/dashboard/practice');
  }

  // Fetch weak topics for the user
  const userWeakTopics = await db
    .select({
      id: weakTopics.id,
      topicId: weakTopics.sectionId,
      topicName: weakTopics.sectionId, // We'll need to join with sections table later
      accuracyPercentage: weakTopics.accuracyPercentage,
      weaknessLevel: weakTopics.weaknessLevel,
      totalAttempts: weakTopics.totalAttempts,
      correctAttempts: weakTopics.correctAttempts,
      nextReviewDate: weakTopics.nextReviewDate,
    })
    .from(weakTopics)
    .where(eq(weakTopics.userId, user.id))
    .orderBy(desc(weakTopics.accuracyPercentage))
    .limit(5);

  // Fetch upcoming practice quizzes (scheduled attempts)
  const now = new Date();
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
    .where(
      and(
        eq(revisionSchedule.userId, user.id),
        gte(revisionSchedule.scheduledDate, now)
      )
    )
    .orderBy(revisionSchedule.scheduledDate)
    .limit(5);

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

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Practice Mode</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Master your weak topics through AI-powered spaced repetition
        </p>
      </div>

      {/* Top Row - Weak Topics & Spaced Repetition */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Weak Topics Section */}
        <WeakTopicsSection weakTopics={userWeakTopics} userId={user.id} />

        {/* Spaced Repetition Queue */}
        <SpacedRepetitionQueue upcomingPractice={upcomingPractice} />
      </div>

      {/* Bottom Row - Revision History & Calendar */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Revision History Table */}
        <RevisionHistory revisionHistory={revisionHistoryData} />

        {/* Revision Calendar */}
        <RevisionCalendar 
          userId={user.id}
          scheduledDates={calendarSchedule}
        />
      </div>
    </div>
  );
}
