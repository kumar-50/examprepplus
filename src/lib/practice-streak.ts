/**
 * Practice Streak Tracking Utilities
 * 
 * Manages consecutive day streaks, calendar tracking, and streak statistics.
 */

import { db } from '@/db';
import { practiceStreaks, practiceCalendar } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { format, startOfDay, subDays, differenceInDays, isSameDay } from 'date-fns';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalPracticeDays: number;
  lastPracticeDate: Date | null;
  streakStartDate: Date | null;
}

export interface CalendarDay {
  date: Date;
  questionsAnswered: number;
  correctAnswers: number;
  practiceMinutes: number;
  sessionsCompleted: number;
  accuracy: number;
}

/**
 * Update streak after completing a practice session
 * 
 * @param userId - User ID
 * @param questionsAnswered - Number of questions in this session
 * @param correctAnswers - Number of correct answers
 * @param durationMinutes - Session duration in minutes
 */
export async function updatePracticeStreak(
  userId: string,
  questionsAnswered: number,
  correctAnswers: number,
  durationMinutes: number = 0
): Promise<StreakData> {
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
  
  // Step 1: Update or insert today's calendar entry
  await db
    .insert(practiceCalendar)
    .values({
      userId,
      practiceDate: today,
      questionsAnswered,
      correctAnswers,
      practiceMinutes: durationMinutes,
      sessionsCompleted: 1,
    })
    .onConflictDoUpdate({
      target: [practiceCalendar.userId, practiceCalendar.practiceDate],
      set: {
        questionsAnswered: sql`${practiceCalendar.questionsAnswered} + ${questionsAnswered}`,
        correctAnswers: sql`${practiceCalendar.correctAnswers} + ${correctAnswers}`,
        practiceMinutes: sql`${practiceCalendar.practiceMinutes} + ${durationMinutes}`,
        sessionsCompleted: sql`${practiceCalendar.sessionsCompleted} + 1`,
      },
    });

  // Step 2: Get or create streak record
  let [streakRecord] = await db
    .select()
    .from(practiceStreaks)
    .where(eq(practiceStreaks.userId, userId))
    .limit(1);

  const todayDate = startOfDay(new Date());
  
  if (!streakRecord) {
    // First time practice - create new streak
    const [newStreak] = await db
      .insert(practiceStreaks)
      .values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastPracticeDate: today,
        streakStartDate: today,
        totalPracticeDays: 1,
      })
      .returning();
    
    if (!newStreak) {
      throw new Error('Failed to create streak record');
    }

    return {
      currentStreak: newStreak.currentStreak,
      longestStreak: newStreak.longestStreak,
      totalPracticeDays: newStreak.totalPracticeDays,
      lastPracticeDate: new Date(newStreak.lastPracticeDate!),
      streakStartDate: new Date(newStreak.streakStartDate!),
    };
  }

  // Step 3: Check if already practiced today
  const lastPracticeDate = streakRecord.lastPracticeDate 
    ? startOfDay(new Date(streakRecord.lastPracticeDate))
    : null;

  if (lastPracticeDate && isSameDay(lastPracticeDate, todayDate)) {
    // Already practiced today, don't update streak
    return {
      currentStreak: streakRecord.currentStreak,
      longestStreak: streakRecord.longestStreak,
      totalPracticeDays: streakRecord.totalPracticeDays,
      lastPracticeDate: lastPracticeDate,
      streakStartDate: streakRecord.streakStartDate ? new Date(streakRecord.streakStartDate) : null,
    };
  }

  // Step 4: Calculate new streak
  let newCurrentStreak = streakRecord.currentStreak;
  let newStreakStartDate = streakRecord.streakStartDate;

  if (!lastPracticeDate) {
    // No previous practice, start fresh
    newCurrentStreak = 1;
    newStreakStartDate = today;
  } else {
    const daysSinceLastPractice = differenceInDays(todayDate, lastPracticeDate);

    if (daysSinceLastPractice === 1) {
      // Consecutive day - increment streak
      newCurrentStreak += 1;
    } else if (daysSinceLastPractice > 1) {
      // Streak broken - start new streak
      newCurrentStreak = 1;
      newStreakStartDate = today;
    }
  }

  // Step 5: Update longest streak if needed
  const newLongestStreak = Math.max(streakRecord.longestStreak, newCurrentStreak);
  const newTotalPracticeDays = streakRecord.totalPracticeDays + 1;

  // Step 6: Update database
  const [updatedStreak] = await db
    .update(practiceStreaks)
    .set({
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastPracticeDate: today,
      streakStartDate: newStreakStartDate,
      totalPracticeDays: newTotalPracticeDays,
      updatedAt: new Date(),
    })
    .where(eq(practiceStreaks.userId, userId))
    .returning();

  if (!updatedStreak) {
    throw new Error('Failed to update streak record');
  }

  return {
    currentStreak: updatedStreak.currentStreak,
    longestStreak: updatedStreak.longestStreak,
    totalPracticeDays: updatedStreak.totalPracticeDays,
    lastPracticeDate: new Date(updatedStreak.lastPracticeDate!),
    streakStartDate: updatedStreak.streakStartDate ? new Date(updatedStreak.streakStartDate) : null,
  };
}

/**
 * Get current streak data for a user
 */
export async function getStreakData(userId: string): Promise<StreakData> {
  const [streakRecord] = await db
    .select()
    .from(practiceStreaks)
    .where(eq(practiceStreaks.userId, userId))
    .limit(1);

  if (!streakRecord) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalPracticeDays: 0,
      lastPracticeDate: null,
      streakStartDate: null,
    };
  }

  // Check if streak is still active (practiced today or yesterday)
  const today = startOfDay(new Date());
  const lastPractice = streakRecord.lastPracticeDate 
    ? startOfDay(new Date(streakRecord.lastPracticeDate))
    : null;

  let currentStreak = streakRecord.currentStreak;
  
  if (lastPractice) {
    const daysSinceLastPractice = differenceInDays(today, lastPractice);
    
    // If more than 1 day has passed, streak is broken
    if (daysSinceLastPractice > 1) {
      currentStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak: streakRecord.longestStreak,
    totalPracticeDays: streakRecord.totalPracticeDays,
    lastPracticeDate: streakRecord.lastPracticeDate ? new Date(streakRecord.lastPracticeDate) : null,
    streakStartDate: streakRecord.streakStartDate ? new Date(streakRecord.streakStartDate) : null,
  };
}

/**
 * Get practice calendar data for a date range
 * 
 * @param userId - User ID
 * @param startDate - Start date (default: 30 days ago)
 * @param endDate - End date (default: today)
 */
export async function getCalendarData(
  userId: string,
  startDate: Date = subDays(new Date(), 30),
  endDate: Date = new Date()
): Promise<CalendarDay[]> {
  const startDateStr = format(startOfDay(startDate), 'yyyy-MM-dd');
  const endDateStr = format(startOfDay(endDate), 'yyyy-MM-dd');

  const calendarEntries = await db
    .select()
    .from(practiceCalendar)
    .where(
      and(
        eq(practiceCalendar.userId, userId),
        gte(practiceCalendar.practiceDate, startDateStr),
        lte(practiceCalendar.practiceDate, endDateStr)
      )
    )
    .orderBy(practiceCalendar.practiceDate);

  return calendarEntries.map(entry => ({
    date: new Date(entry.practiceDate),
    questionsAnswered: entry.questionsAnswered,
    correctAnswers: entry.correctAnswers,
    practiceMinutes: entry.practiceMinutes,
    sessionsCompleted: entry.sessionsCompleted,
    accuracy: entry.questionsAnswered > 0 
      ? Math.round((entry.correctAnswers / entry.questionsAnswered) * 100)
      : 0,
  }));
}

/**
 * Check if user practiced on a specific date
 */
export async function didPracticeOnDate(userId: string, date: Date): Promise<boolean> {
  const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
  
  const [entry] = await db
    .select()
    .from(practiceCalendar)
    .where(
      and(
        eq(practiceCalendar.userId, userId),
        eq(practiceCalendar.practiceDate, dateStr)
      )
    )
    .limit(1);

  return !!entry;
}

/**
 * Get streak statistics for display
 */
export async function getStreakStats(userId: string) {
  const streakData = await getStreakData(userId);
  const today = startOfDay(new Date());
  const lastPractice = streakData.lastPracticeDate 
    ? startOfDay(streakData.lastPracticeDate)
    : null;

  let streakStatus: 'active' | 'at-risk' | 'broken' = 'broken';
  
  if (lastPractice) {
    const daysSince = differenceInDays(today, lastPractice);
    if (daysSince === 0) {
      streakStatus = 'active';
    } else if (daysSince === 1) {
      streakStatus = 'at-risk';
    } else {
      streakStatus = 'broken';
    }
  }

  return {
    ...streakData,
    streakStatus,
    isActiveToday: lastPractice ? isSameDay(lastPractice, today) : false,
  };
}
