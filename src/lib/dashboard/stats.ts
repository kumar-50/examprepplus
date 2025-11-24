/**
 * Dashboard Statistics Calculator
 * Aggregates and calculates dashboard statistics
 */

import { UserStats } from './queries';
import { calculateReadiness, ReadinessData } from '@/lib/readiness-calculator';
import { calculateStreak, StreakData } from '@/lib/streak-calculator';

export interface DashboardStats {
  testsCompleted: number;
  weeklyTests: number;
  overallAccuracy: number;
  accuracyTrend: number; // +/- percentage change
  currentStreak: number;
  streakActive: boolean;
  readiness: number;
  readinessStatus: 'not-ready' | 'getting-there' | 'almost-ready' | 'ready';
}

/**
 * Calculate all dashboard statistics
 */
export function calculateDashboardStats(
  userStats: UserStats,
  streakData: StreakData,
  readinessData: ReadinessData,
  accuracyTrend: number
): DashboardStats {
  return {
    testsCompleted: userStats.testsCompleted,
    weeklyTests: userStats.weeklyTests,
    overallAccuracy: userStats.overallAccuracy,
    accuracyTrend,
    currentStreak: streakData.currentStreak,
    streakActive: streakData.currentStreak > 0,
    readiness: Math.round(readinessData.overallReadiness),
    readinessStatus: readinessData.status,
  };
}

/**
 * Get time-based greeting
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Get streak message
 */
export function getStreakMessage(streakData: StreakData): string | null {
  if (streakData.currentStreak === 0) {
    return 'Start your learning streak today!';
  }
  
  if (streakData.currentStreak === 1) {
    return "You're on a 1-day streak! Keep it going!";
  }
  
  if (streakData.streakProtection) {
    return `You're on a ${streakData.currentStreak}-day streak! Practice today to keep it alive.`;
  }
  
  return `You're on a ${streakData.currentStreak}-day streak! Keep up the great work!`;
}

/**
 * Get readiness status text
 */
export function getReadinessStatusText(readiness: number): string {
  if (readiness >= 80) return 'Ready';
  if (readiness >= 60) return 'Almost Ready';
  if (readiness >= 40) return 'Getting There';
  return 'Not Ready';
}

/**
 * Get readiness color
 */
export function getReadinessColor(readiness: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (readiness >= 80) return 'green';
  if (readiness >= 60) return 'yellow';
  if (readiness >= 40) return 'orange';
  return 'red';
}

/**
 * Get accuracy trend text
 */
export function getTrendText(trend: number): string {
  if (trend > 0) return `↑ +${trend.toFixed(1)}%`;
  if (trend < 0) return `↓ ${trend.toFixed(1)}%`;
  return '→ Stable';
}

/**
 * Get accuracy color
 */
export function getAccuracyColor(accuracy: number): 'green' | 'yellow' | 'red' {
  if (accuracy >= 70) return 'green';
  if (accuracy >= 40) return 'yellow';
  return 'red';
}
