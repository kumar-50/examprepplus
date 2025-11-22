/**
 * Spaced Repetition System - SM-2 Algorithm Implementation
 * 
 * Calculates optimal review intervals based on performance and repetition count.
 * Used to schedule weak topic reviews for maximum retention.
 */

export interface ReviewData {
  reviewCount: number;
  lastAccuracy: number;
  lastReviewDate: Date;
}

export interface NextReview {
  nextReviewDate: Date;
  interval: number; // days
  reviewCount: number;
}

/**
 * Calculate the next review date using a simplified SM-2 algorithm
 * 
 * @param reviewData - Current review statistics
 * @returns Next review date and interval
 */
export function calculateNextReviewDate(reviewData: ReviewData): NextReview {
  const { reviewCount, lastAccuracy, lastReviewDate } = reviewData;
  
  // Determine easiness factor based on accuracy
  // Higher accuracy = longer intervals
  const easinessFactor = calculateEasinessFactor(lastAccuracy);
  
  // Calculate interval based on review count and easiness
  const interval = calculateInterval(reviewCount, easinessFactor);
  
  // Calculate next review date
  const nextReviewDate = new Date(lastReviewDate);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  return {
    nextReviewDate,
    interval,
    reviewCount: reviewCount + 1,
  };
}

/**
 * Calculate easiness factor based on accuracy percentage
 * Range: 1.3 to 2.5 (standard SM-2 range)
 * 
 * @param accuracy - Accuracy percentage (0-100)
 * @returns Easiness factor
 */
function calculateEasinessFactor(accuracy: number): number {
  // Convert accuracy to quality score (0-5 scale)
  // 0-40%: Poor (0-1)
  // 40-60%: Fair (2-3)
  // 60-80%: Good (3-4)
  // 80-100%: Excellent (4-5)
  
  let quality: number;
  if (accuracy < 40) {
    quality = 0;
  } else if (accuracy < 50) {
    quality = 1;
  } else if (accuracy < 60) {
    quality = 2;
  } else if (accuracy < 70) {
    quality = 3;
  } else if (accuracy < 80) {
    quality = 4;
  } else {
    quality = 5;
  }
  
  // SM-2 formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Simplified: Higher quality = higher EF
  const easinessFactor = 1.3 + (quality * 0.24);
  
  // Clamp between 1.3 and 2.5
  return Math.max(1.3, Math.min(2.5, easinessFactor));
}

/**
 * Calculate interval in days based on review count and easiness factor
 * 
 * @param reviewCount - Number of times reviewed
 * @param easinessFactor - Calculated easiness factor
 * @returns Interval in days
 */
function calculateInterval(reviewCount: number, easinessFactor: number): number {
  if (reviewCount === 0) {
    // First review: 1 day
    return 1;
  } else if (reviewCount === 1) {
    // Second review: 3 days
    return 3;
  } else {
    // Subsequent reviews: previous interval * easiness factor
    // For simplicity, use exponential growth with easiness factor
    const previousInterval = calculateInterval(reviewCount - 1, easinessFactor);
    const newInterval = Math.round(previousInterval * easinessFactor);
    
    // Cap at 60 days maximum
    return Math.min(60, newInterval);
  }
}

/**
 * Determine if a topic needs review based on current date and next review date
 * 
 * @param nextReviewDate - Scheduled next review date
 * @returns Whether review is due
 */
export function isReviewDue(nextReviewDate: Date): boolean {
  const now = new Date();
  return nextReviewDate <= now;
}

/**
 * Get days until next review
 * 
 * @param nextReviewDate - Scheduled next review date
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilReview(nextReviewDate: Date): number {
  const now = new Date();
  const diffTime = nextReviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate optimal review schedule for a weak topic
 * Projects future review dates
 * 
 * @param startDate - Starting date
 * @param accuracy - Current accuracy
 * @param count - Number of future reviews to calculate
 * @returns Array of future review dates
 */
export function projectReviewSchedule(
  startDate: Date,
  accuracy: number,
  count: number = 5
): Date[] {
  const schedule: Date[] = [];
  let currentReview: ReviewData = {
    reviewCount: 0,
    lastAccuracy: accuracy,
    lastReviewDate: startDate,
  };
  
  for (let i = 0; i < count; i++) {
    const nextReview = calculateNextReviewDate(currentReview);
    schedule.push(nextReview.nextReviewDate);
    
    // Update for next iteration (assume same accuracy)
    currentReview = {
      reviewCount: nextReview.reviewCount,
      lastAccuracy: accuracy,
      lastReviewDate: nextReview.nextReviewDate,
    };
  }
  
  return schedule;
}

/**
 * Determine weakness level based on accuracy and review history
 * 
 * @param accuracy - Current accuracy percentage
 * @param reviewCount - Number of reviews completed
 * @returns Weakness level
 */
export function determineWeaknessLevel(
  accuracy: number,
  reviewCount: number
): 'critical' | 'moderate' | 'improving' {
  if (accuracy < 40) {
    return 'critical';
  } else if (accuracy < 60) {
    return 'moderate';
  } else {
    // Even if accuracy is good, if recently reviewed, still improving
    if (reviewCount < 3) {
      return 'improving';
    }
    return 'improving';
  }
}

/**
 * Get human-readable interval description
 * 
 * @param days - Number of days
 * @returns Readable description
 */
export function getIntervalDescription(days: number): string {
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days < 14) return 'In 1 week';
  if (days < 30) return `In ${Math.floor(days / 7)} weeks`;
  if (days < 60) return 'In 1 month';
  return 'In 2 months';
}
