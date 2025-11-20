'use server';

import { analyzeUserWeakTopics } from '@/lib/analytics/weak-topic-analyzer';
import { revalidatePath } from 'next/cache';

/**
 * Analyzes weak topics after a test is submitted
 * Call this from the test submission action
 */
export async function analyzeWeakTopicsAction(userId: string) {
  try {
    await analyzeUserWeakTopics(userId);
    
    // Revalidate the practice page to show updated weak topics
    revalidatePath('/dashboard/practice');
    
    return { success: true };
  } catch (error) {
    console.error('Error analyzing weak topics:', error);
    return { success: false, error: 'Failed to analyze weak topics' };
  }
}
