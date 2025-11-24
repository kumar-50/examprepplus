/**
 * Dashboard Recommendations Engine
 * Generates personalized recommendations based on user activity and performance
 */

import { StreakData } from '@/lib/streak-calculator';
import { WeakTopic, ActiveGoal } from './queries';
import { differenceInDays } from 'date-fns';

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  action: string;
  link: string;
  priority: number;
  urgent?: boolean;
}

export type RecommendationType =
  | 'first-test'
  | 'weak-topic'
  | 'improve-readiness'
  | 'coverage'
  | 'streak-risk'
  | 'goal-near-complete'
  | 'achievement-near'
  | 'inactive-return'
  | 'daily-challenge'
  | 'section-recommendation'
  | 'morning-boost'
  | 'evening-review'
  | 'weekend-focus'
  | 'consistency-reminder'
  | 'milestone-proximity';

export interface UserRecommendationData {
  testsCompleted: number;
  overallAccuracy: number;
  readiness: number;
  currentStreak: number;
  streakData: StreakData;
  weakTopics: WeakTopic[];
  activeGoals: ActiveGoal[];
  totalSections: number;
  sectionsPracticed: number;
  lastActivityDate: Date | null;
  weeklyTests: number;
  nextAchievement?: {
    name: string;
    progress: number;
    requirementValue: number;
  };
}

/**
 * Generate personalized recommendations
 */
export function getRecommendations(data: UserRecommendationData): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. New user - never taken a test
  if (data.testsCompleted === 0) {
    recommendations.push({
      type: 'first-test',
      title: 'Take Your First Test',
      description: 'Start your preparation journey with a practice test',
      action: 'Browse Tests',
      link: '/dashboard/tests',
      priority: 1,
    });
    return recommendations.slice(0, 3); // New users only see this
  }

  // 2. Inactive user - hasn't practiced in 7+ days
  if (data.lastActivityDate) {
    const daysSinceActivity = differenceInDays(new Date(), data.lastActivityDate);
    if (daysSinceActivity >= 7) {
      recommendations.push({
        type: 'inactive-return',
        title: 'Welcome Back!',
        description: `It's been ${daysSinceActivity} days. Let's get back on track!`,
        action: 'Start Practice',
        link: '/dashboard/practice',
        priority: 1,
        urgent: true,
      });
    }
  }

  // 3. Streak at risk - hasn't practiced today and had an active streak
  if (data.streakData.streakProtection && data.currentStreak > 0) {
    recommendations.push({
      type: 'streak-risk',
      title: 'Maintain Your Streak',
      description: `Practice today to keep your ${data.currentStreak}-day streak alive!`,
      action: 'Quick Practice',
      link: '/dashboard/practice',
      priority: 1,
      urgent: true,
    });
  }

  // 4. Goal almost complete (80%+)
  const almostCompleteGoals = data.activeGoals.filter(g => g.progress >= 80 && g.progress < 100);
  if (almostCompleteGoals.length > 0 && almostCompleteGoals[0]) {
    const goal = almostCompleteGoals[0];
    const remaining = Math.ceil(goal.targetValue - goal.currentValue);
    
    recommendations.push({
      type: 'goal-near-complete',
      title: 'Complete Your Goal',
      description: `You're ${goal.progress}% there! Just ${remaining} more to go.`,
      action: 'Continue',
      link: '/dashboard/progress',
      priority: 2,
    });
  }

  // 5. Achievement close to unlocking (80%+)
  if (data.nextAchievement && data.nextAchievement.progress >= 80) {
    recommendations.push({
      type: 'achievement-near',
      title: 'Unlock Achievement',
      description: `"${data.nextAchievement.name}" is ${data.nextAchievement.progress}% complete`,
      action: 'View Achievements',
      link: '/dashboard/progress',
      priority: 2,
    });
  }

  // 6. Weak topics identified (accuracy < 50%)
  if (data.weakTopics.length > 0 && data.weakTopics[0]) {
    const weakestTopic = data.weakTopics[0];
    recommendations.push({
      type: 'weak-topic',
      title: 'Practice Weak Topics',
      description: `${weakestTopic.name} needs attention (${weakestTopic.accuracy.toFixed(1)}% accuracy)`,
      action: 'Start Practice',
      link: `/dashboard/practice?focus=weak`,
      priority: 3,
    });
  }

  // 7. Low readiness score (< 60%)
  if (data.readiness < 60 && data.testsCompleted >= 3) {
    recommendations.push({
      type: 'improve-readiness',
      title: 'Boost Your Readiness',
      description: `Your exam readiness is ${data.readiness}%. Practice more to improve!`,
      action: 'View Recommendations',
      link: '/dashboard/progress',
      priority: 4,
    });
  }

  // 8. Uncovered sections
  const uncoveredSections = data.totalSections - data.sectionsPracticed;
  if (uncoveredSections > 0 && data.sectionsPracticed > 0) {
    recommendations.push({
      type: 'coverage',
      title: 'Explore New Sections',
      description: `${uncoveredSections} section${uncoveredSections > 1 ? 's' : ''} not practiced yet`,
      action: 'Browse Sections',
      link: '/dashboard/tests',
      priority: 5,
    });
  }

  // 9. Low test count but good accuracy - encourage more practice
  if (data.testsCompleted < 5 && data.overallAccuracy > 60) {
    recommendations.push({
      type: 'daily-challenge',
      title: 'Take Another Test',
      description: `You're doing well (${data.overallAccuracy.toFixed(1)}%)! Build momentum with more practice.`,
      action: 'Browse Tests',
      link: '/dashboard/tests',
      priority: 6,
    });
  }

  // 10. Time-based recommendations
  const currentHour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  
  // Morning boost (6am - 11am) - if no practice today
  if (currentHour >= 6 && currentHour < 11 && data.streakData.streakProtection) {
    recommendations.push({
      type: 'morning-boost',
      title: 'Morning Practice Session',
      description: 'Start your day with a quick practice test to boost your focus',
      action: 'Quick Practice',
      link: '/dashboard/practice',
      priority: 7,
    });
  }

  // Evening review (6pm - 10pm) - if practiced today but could do more
  if (currentHour >= 18 && currentHour < 22 && !data.streakData.streakProtection) {
    recommendations.push({
      type: 'evening-review',
      title: 'Evening Review Session',
      description: 'End your day by reviewing weak topics or taking a practice test',
      action: 'Start Review',
      link: '/dashboard/practice?focus=weak',
      priority: 8,
    });
  }

  // Weekend focus (Saturday/Sunday) - more intensive practice
  if ((dayOfWeek === 0 || dayOfWeek === 6) && data.weeklyTests < 3) {
    recommendations.push({
      type: 'weekend-focus',
      title: 'Weekend Focus Session',
      description: 'Use your weekend to take a full-length practice test',
      action: 'Browse Tests',
      link: '/dashboard/tests',
      priority: 7,
    });
  }

  // 11. Consistency reminder - practiced < 3 days this week
  if (data.weeklyTests < 3 && data.testsCompleted >= 5) {
    recommendations.push({
      type: 'consistency-reminder',
      title: 'Build Consistency',
      description: 'Practice 3+ times per week to maintain your progress',
      action: 'Quick Practice',
      link: '/dashboard/practice',
      priority: 4,
    });
  }

  // 12. Milestone proximity - close to round number achievements
  if (data.testsCompleted >= 8 && data.testsCompleted < 10) {
    recommendations.push({
      type: 'milestone-proximity',
      title: 'Reach 10 Tests Milestone',
      description: `Just ${10 - data.testsCompleted} more test${10 - data.testsCompleted > 1 ? 's' : ''} to hit your first major milestone!`,
      action: 'Continue Practice',
      link: '/dashboard/tests',
      priority: 5,
    });
  } else if (data.testsCompleted >= 18 && data.testsCompleted < 20) {
    recommendations.push({
      type: 'milestone-proximity',
      title: 'Reach 20 Tests Milestone',
      description: `Only ${20 - data.testsCompleted} more test${20 - data.testsCompleted > 1 ? 's' : ''} to reach 20 completed tests!`,
      action: 'Continue Practice',
      link: '/dashboard/tests',
      priority: 5,
    });
  }

  // Sort by priority (lower number = higher priority) and return top 3
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}

/**
 * Get recommendation icon
 */
export function getRecommendationIcon(type: RecommendationType): string {
  const icons: Record<RecommendationType, string> = {
    'first-test': '🎯',
    'weak-topic': '📚',
    'improve-readiness': '📈',
    'coverage': '🗺️',
    'streak-risk': '🔥',
    'goal-near-complete': '🎯',
    'achievement-near': '🏆',
    'inactive-return': '👋',
    'daily-challenge': '⚡',
    'section-recommendation': '📝',
    'morning-boost': '🌅',
    'evening-review': '🌙',
    'weekend-focus': '📅',
    'consistency-reminder': '🔄',
    'milestone-proximity': '🎖️',
  };
  
  return icons[type] || '💡';
}

/**
 * Get recommendation color variant
 */
export function getRecommendationVariant(recommendation: Recommendation): 'default' | 'urgent' | 'success' {
  if (recommendation.urgent) return 'urgent';
  if (recommendation.type === 'goal-near-complete' || recommendation.type === 'achievement-near') {
    return 'success';
  }
  return 'default';
}
