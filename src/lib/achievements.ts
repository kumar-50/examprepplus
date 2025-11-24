/**
 * Achievement System
 * Defines and manages achievement unlocking logic
 */

export type AchievementCategory = 'milestone' | 'performance' | 'streak' | 'coverage' | 'speed';
export type RequirementType =
  | 'tests_count'
  | 'questions_count'
  | 'accuracy'
  | 'streak_days'
  | 'sections_covered'
  | 'perfect_score'
  | 'improvement'
  | 'consecutive_days';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirementType: RequirementType;
  requirementValue: number;
  points: number;
}

export interface UserProgress {
  testsCompleted: number;
  questionsAnswered: number;
  bestAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  sectionsAttempted: number;
  totalSections: number;
  perfectScores: number;
  averageAccuracy: number;
}

/**
 * Default achievements list
 */
export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id'>[] = [
  // Milestone Achievements
  {
    name: 'First Steps',
    description: 'Complete your first test',
    icon: '🎯',
    category: 'milestone',
    requirementType: 'tests_count',
    requirementValue: 1,
    points: 10,
  },
  {
    name: 'Getting Started',
    description: 'Complete 10 tests',
    icon: '📝',
    category: 'milestone',
    requirementType: 'tests_count',
    requirementValue: 10,
    points: 25,
  },
  {
    name: 'Dedicated Learner',
    description: 'Complete 50 tests',
    icon: '📚',
    category: 'milestone',
    requirementType: 'tests_count',
    requirementValue: 50,
    points: 50,
  },
  {
    name: 'Century Club',
    description: 'Complete 100 tests',
    icon: '💯',
    category: 'milestone',
    requirementType: 'tests_count',
    requirementValue: 100,
    points: 100,
  },
  {
    name: 'Question Master',
    description: 'Answer 100 questions',
    icon: '❓',
    category: 'milestone',
    requirementType: 'questions_count',
    requirementValue: 100,
    points: 20,
  },
  {
    name: 'Question Expert',
    description: 'Answer 500 questions',
    icon: '❗',
    category: 'milestone',
    requirementType: 'questions_count',
    requirementValue: 500,
    points: 50,
  },
  {
    name: 'Question Legend',
    description: 'Answer 1,000 questions',
    icon: '⚡',
    category: 'milestone',
    requirementType: 'questions_count',
    requirementValue: 1000,
    points: 100,
  },

  // Performance Achievements
  {
    name: 'Perfect Score',
    description: 'Score 100% on a test',
    icon: '⭐',
    category: 'performance',
    requirementType: 'perfect_score',
    requirementValue: 1,
    points: 50,
  },
  {
    name: 'High Achiever',
    description: 'Score 90% or higher on a test',
    icon: '🏆',
    category: 'performance',
    requirementType: 'accuracy',
    requirementValue: 90,
    points: 30,
  },
  {
    name: 'All-Rounder',
    description: 'Score above 75% in all sections',
    icon: '🎓',
    category: 'performance',
    requirementType: 'accuracy',
    requirementValue: 75,
    points: 75,
  },

  // Streak Achievements
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '🔥',
    category: 'streak',
    requirementType: 'streak_days',
    requirementValue: 7,
    points: 25,
  },
  {
    name: 'Month Master',
    description: 'Maintain a 30-day study streak',
    icon: '🔥',
    category: 'streak',
    requirementType: 'streak_days',
    requirementValue: 30,
    points: 75,
  },
  {
    name: 'Streak Legend',
    description: 'Maintain a 100-day study streak',
    icon: '🔥',
    category: 'streak',
    requirementType: 'streak_days',
    requirementValue: 100,
    points: 200,
  },

  // Coverage Achievements
  {
    name: 'Explorer',
    description: 'Attempt all available sections',
    icon: '🗂️',
    category: 'coverage',
    requirementType: 'sections_covered',
    requirementValue: 100, // 100% of sections
    points: 40,
  },
  {
    name: 'Consistent Learner',
    description: 'Practice every day for a week',
    icon: '📅',
    category: 'coverage',
    requirementType: 'consecutive_days',
    requirementValue: 7,
    points: 30,
  },
];

/**
 * Check which achievements a user has unlocked
 */
export function checkAchievements(
  progress: UserProgress,
  achievements: Achievement[],
  unlockedIds: string[]
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of achievements) {
    // Skip if already unlocked
    if (unlockedIds.includes(achievement.id)) {
      continue;
    }

    let unlocked = false;

    switch (achievement.requirementType) {
      case 'tests_count':
        unlocked = progress.testsCompleted >= achievement.requirementValue;
        break;

      case 'questions_count':
        unlocked = progress.questionsAnswered >= achievement.requirementValue;
        break;

      case 'accuracy':
        unlocked = progress.bestAccuracy >= achievement.requirementValue;
        break;

      case 'streak_days':
        unlocked =
          progress.currentStreak >= achievement.requirementValue ||
          progress.longestStreak >= achievement.requirementValue;
        break;

      case 'sections_covered':
        const coveragePercent =
          progress.totalSections > 0
            ? (progress.sectionsAttempted / progress.totalSections) * 100
            : 0;
        unlocked = coveragePercent >= achievement.requirementValue;
        break;

      case 'perfect_score':
        unlocked = progress.perfectScores >= achievement.requirementValue;
        break;

      case 'consecutive_days':
        unlocked = progress.currentStreak >= achievement.requirementValue;
        break;
    }

    if (unlocked) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

/**
 * Get progress towards an achievement
 */
export function getAchievementProgress(
  achievement: Achievement,
  progress: UserProgress
): { current: number; target: number; percentage: number } {
  let current = 0;

  switch (achievement.requirementType) {
    case 'tests_count':
      current = progress.testsCompleted;
      break;
    case 'questions_count':
      current = progress.questionsAnswered;
      break;
    case 'accuracy':
      current = progress.bestAccuracy;
      break;
    case 'streak_days':
      current = Math.max(progress.currentStreak, progress.longestStreak);
      break;
    case 'sections_covered':
      current = progress.totalSections > 0
        ? (progress.sectionsAttempted / progress.totalSections) * 100
        : 0;
      break;
    case 'perfect_score':
      current = progress.perfectScores;
      break;
    case 'consecutive_days':
      current = progress.currentStreak;
      break;
  }

  const percentage = Math.min(
    Math.round((current / achievement.requirementValue) * 100),
    100
  );

  return {
    current,
    target: achievement.requirementValue,
    percentage,
  };
}
