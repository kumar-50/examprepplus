/**
 * Streak Calculation Utilities
 * Calculates study streaks based on user activity
 */

import { startOfDay, differenceInDays, subDays, isSameDay } from 'date-fns';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: Date | null;
  streakProtection: boolean; // True if user has 1-day grace period
}

/**
 * Calculate current and longest streak from activity dates
 */
export function calculateStreak(activityDates: Date[]): StreakData {
  if (!activityDates || activityDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
      streakProtection: false,
    };
  }

  // Normalize all dates to start of day and remove duplicates
  const uniqueDates = Array.from(
    new Set(
      activityDates.map((date) => startOfDay(new Date(date)).getTime())
    )
  )
    .map((time) => new Date(time))
    .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (newest first)

  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  
  // Check if most recent activity is today or yesterday
  const mostRecentActivity = uniqueDates[0];
  if (!mostRecentActivity) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
      streakProtection: false,
    };
  }
  
  const daysSinceLastActivity = differenceInDays(today, mostRecentActivity);
  
  // If last activity is more than 1 day ago, streak is broken
  if (daysSinceLastActivity > 1) {
    // Calculate longest streak from historical data
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = uniqueDates[i];
      const nextDate = uniqueDates[i + 1];
      if (!currentDate || !nextDate) continue;
      
      const daysDiff = differenceInDays(currentDate, nextDate);
      
      if (daysDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return {
      currentStreak: 0, // Streak is broken
      longestStreak,
      totalActiveDays: uniqueDates.length,
      lastActiveDate: mostRecentActivity,
      streakProtection: false,
    };
  }
  
  // Calculate current streak (only if recent activity exists)
  let currentStreak = 0;
  let currentDate = today;
  let hasActivityToday = false;
  
  for (const date of uniqueDates) {
    const daysDiff = differenceInDays(currentDate, date);
    
    if (daysDiff === 0) {
      // Activity on current date
      currentStreak++;
      hasActivityToday = isSameDay(date, today);
      currentDate = subDays(currentDate, 1);
    } else if (daysDiff === 1) {
      // Activity on previous day (streak continues)
      currentStreak++;
      currentDate = subDays(date, 1);
    } else {
      // Gap found, streak broken
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDateItem = uniqueDates[i];
    const nextDateItem = uniqueDates[i + 1];
    if (!currentDateItem || !nextDateItem) continue;
    
    const daysDiff = differenceInDays(currentDateItem, nextDateItem);
    
    if (daysDiff === 1) {
      // Consecutive days - increment streak
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      // Gap found - save longest and reset
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1; // Reset to 1 for the next date
    }
  }
  
  // Final check including current streak
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  // Streak protection: if last activity was yesterday, user has grace period
  const lastActivity = uniqueDates[0];
  const streakProtection =
    !hasActivityToday &&
    lastActivity !== undefined &&
    isSameDay(lastActivity, yesterday);

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: uniqueDates.length,
    lastActiveDate: lastActivity || null,
    streakProtection,
  };
}

/**
 * Get calendar data for streak visualization (last 30 days)
 */
export function getStreakCalendar(
  activityDates: Date[],
  days: number = 30
): Array<{ date: Date; hasActivity: boolean }> {
  const calendar: Array<{ date: Date; hasActivity: boolean }> = [];
  const today = startOfDay(new Date());
  
  const activitySet = new Set(
    activityDates.map((date) => startOfDay(new Date(date)).getTime())
  );

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    calendar.push({
      date,
      hasActivity: activitySet.has(date.getTime()),
    });
  }

  return calendar;
}

/**
 * Get streak milestone info
 */
export function getStreakMilestone(currentStreak: number): {
  current: number;
  next: number;
  remaining: number;
  icon: string;
} {
  const milestones = [7, 14, 30, 50, 100, 365];
  
  let nextMilestone = milestones.find((m) => m > currentStreak);
  
  if (!nextMilestone) {
    // Already passed all milestones
    nextMilestone = currentStreak + 30; // Next milestone is +30 days
  }

  const icon =
    currentStreak >= 100
      ? '🏆'
      : currentStreak >= 30
      ? '💎'
      : currentStreak >= 7
      ? '🔥'
      : '✨';

  return {
    current: currentStreak,
    next: nextMilestone,
    remaining: nextMilestone - currentStreak,
    icon,
  };
}
