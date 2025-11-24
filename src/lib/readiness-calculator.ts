/**
 * Exam Readiness Calculator
 * Calculates how ready a user is for their exam
 */

export interface ReadinessData {
  overallReadiness: number; // 0-100
  status: 'not-ready' | 'getting-there' | 'almost-ready' | 'ready';
  breakdown: {
    accuracy: number;
    coverage: number;
    trend: number;
    volume: number;
  };
  sectionReadiness: Array<{
    sectionId: string;
    sectionName: string;
    readiness: number;
    accuracy: number;
    questionsAttempted: number;
  }>;
  daysUntilExam: number | null;
}

export interface UserStats {
  overallAccuracy: number; // percentage
  sectionsPracticed: number;
  totalSections: number;
  testsCompleted: number;
  questionsAnswered: number;
  recentAccuracyTrend: number; // +ve for improving, -ve for declining
  sectionStats: Array<{
    sectionId: string;
    sectionName: string;
    accuracy: number;
    questionsAttempted: number;
    daysPracticed: number;
  }>;
  examDate?: Date;
}

/**
 * Calculate overall exam readiness
 */
export function calculateReadiness(stats: UserStats): ReadinessData {
  // Factor weights
  const ACCURACY_WEIGHT = 0.4;
  const COVERAGE_WEIGHT = 0.3;
  const TREND_WEIGHT = 0.2;
  const VOLUME_WEIGHT = 0.1;

  // Accuracy score (40% weight)
  const accuracyScore = Math.min(stats.overallAccuracy, 100) * ACCURACY_WEIGHT;

  // Coverage score (30% weight)
  const coverageRatio = stats.totalSections > 0 
    ? stats.sectionsPracticed / stats.totalSections 
    : 0;
  const coverageScore = coverageRatio * 30;

  // Trend score (20% weight)
  // Normalize trend from -20 to +20 range to 0-20 score
  const trendScore = Math.max(0, Math.min(20, 10 + stats.recentAccuracyTrend));

  // Volume score (10% weight)
  // Based on tests completed (50 tests = full score)
  const volumeRatio = Math.min(stats.testsCompleted / 50, 1);
  const volumeScore = volumeRatio * 10;

  // Calculate overall readiness
  const overallReadiness = Math.round(
    accuracyScore + coverageScore + trendScore + volumeScore
  );

  // Determine status
  let status: ReadinessData['status'];
  if (overallReadiness >= 80) {
    status = 'ready';
  } else if (overallReadiness >= 60) {
    status = 'almost-ready';
  } else if (overallReadiness >= 40) {
    status = 'getting-there';
  } else {
    status = 'not-ready';
  }

  // Calculate section-wise readiness
  const sectionReadiness = stats.sectionStats.map((section) => {
    // Section readiness based on accuracy and practice volume
    const accuracyFactor = Math.min(section.accuracy, 100) * 0.7;
    const volumeFactor = Math.min(section.questionsAttempted / 100, 1) * 30;
    const readiness = Math.round(accuracyFactor + volumeFactor);

    return {
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      readiness,
      accuracy: section.accuracy,
      questionsAttempted: section.questionsAttempted,
    };
  });

  // Calculate days until exam
  let daysUntilExam: number | null = null;
  if (stats.examDate) {
    const now = new Date();
    const exam = new Date(stats.examDate);
    daysUntilExam = Math.ceil(
      (exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    overallReadiness,
    status,
    breakdown: {
      accuracy: Math.round(accuracyScore),
      coverage: Math.round(coverageScore),
      trend: Math.round(trendScore),
      volume: Math.round(volumeScore),
    },
    sectionReadiness,
    daysUntilExam,
  };
}

/**
 * Get readiness status label and color
 */
export function getReadinessDisplay(status: ReadinessData['status']): {
  label: string;
  color: string;
  emoji: string;
} {
  switch (status) {
    case 'ready':
      return {
        label: 'Ready for Exam',
        color: 'text-green-600',
        emoji: '✅',
      };
    case 'almost-ready':
      return {
        label: 'Almost Ready',
        color: 'text-blue-600',
        emoji: '💪',
      };
    case 'getting-there':
      return {
        label: 'Getting There',
        color: 'text-yellow-600',
        emoji: '📚',
      };
    case 'not-ready':
      return {
        label: 'Keep Practicing',
        color: 'text-gray-600',
        emoji: '🎯',
      };
  }
}

/**
 * Get section readiness color
 */
export function getSectionReadinessColor(readiness: number): string {
  if (readiness >= 80) return 'bg-green-500';
  if (readiness >= 60) return 'bg-blue-500';
  if (readiness >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}
