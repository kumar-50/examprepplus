/**
 * INTEGRATION GUIDE: How to Add Weak Topic Analysis to Your Test Submission
 * 
 * This file shows you where to add the weak topic analysis call in your existing code.
 */

// ============================================================================
// EXAMPLE 1: If you're using Server Actions (recommended)
// ============================================================================

// In your existing test submission action file (e.g., src/lib/actions/tests.ts)

import { analyzeWeakTopicsAction } from '@/lib/actions/analyze-weak-topics';

export async function submitAttempt(attemptId: string, userId: string) {
  // Your existing logic...
  
  // 1. Calculate scores
  const scores = await calculateTestScores(attemptId);
  
  // 2. Update attempt status
  await db.update(userTestAttempts)
    .set({
      status: 'submitted',
      score: scores.totalScore,
      submittedAt: new Date(),
      // ... other fields
    })
    .where(eq(userTestAttempts.id, attemptId));
  
  // 3. ✨ NEW: Analyze weak topics after submission ✨
  await analyzeWeakTopicsAction(userId);
  
  // 4. Return result
  return { success: true, attemptId };
}

// ============================================================================
// EXAMPLE 2: If you're using API Routes
// ============================================================================

// In your test submission API route (e.g., src/app/api/tests/submit/route.ts)

import { analyzeUserWeakTopics } from '@/lib/analytics/weak-topic-analyzer';

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const { attemptId } = await req.json();
  
  // Your existing logic...
  
  // Submit the test
  await submitTest(attemptId, user.id);
  
  // ✨ NEW: Analyze weak topics ✨
  try {
    await analyzeUserWeakTopics(user.id);
  } catch (error) {
    // Don't fail the request if analysis fails
    console.error('Weak topic analysis failed:', error);
  }
  
  return NextResponse.json({ success: true });
}

// ============================================================================
// EXAMPLE 3: Real-Time Practice Tracking (Already Implemented!)
// ============================================================================

// This is already integrated in /api/practice/answer
// Every time user answers a practice question, it updates weak topic stats

// You don't need to do anything for this - it's automatic! ✅

// ============================================================================
// EXAMPLE 4: Manual Trigger (for testing or admin panel)
// ============================================================================

// Create a button in your admin panel or user settings to manually analyze

'use client';

import { analyzeWeakTopicsAction } from '@/lib/actions/analyze-weak-topics';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ManualAnalysisButton({ userId }: { userId: string }) {
  const handleAnalyze = async () => {
    const result = await analyzeWeakTopicsAction(userId);
    if (result.success) {
      toast.success('Weak topics analyzed successfully!');
    } else {
      toast.error('Failed to analyze weak topics');
    }
  };
  
  return (
    <Button onClick={handleAnalyze}>
      Analyze My Weak Topics
    </Button>
  );
}

// ============================================================================
// WHERE TO ADD THIS IN YOUR CODEBASE
// ============================================================================

/**
 * Find your test submission handler. It's likely in one of these files:
 * 
 * 1. src/lib/actions/tests.ts (Server Action - most likely)
 * 2. src/app/api/tests/submit/route.ts (API Route)
 * 3. src/components/tests/test-attempt-engine.tsx (Client component)
 * 
 * Look for functions named like:
 * - submitAttempt()
 * - submitTest()
 * - handleSubmit()
 * - finishTest()
 * 
 * Add the analyzeWeakTopicsAction() call right after the test is saved.
 */

// ============================================================================
// VERIFICATION
// ============================================================================

/**
 * To verify it's working:
 * 
 * 1. Take a test and deliberately answer some topics poorly (< 60% correct)
 * 2. Submit the test
 * 3. Go to /dashboard/practice
 * 4. You should see those topics in the "Weak Topics" section
 * 5. Check the database:
 *    SELECT * FROM weak_topics WHERE user_id = 'your-user-id';
 */

// ============================================================================
// EXAMPLE: Checking if it's working
// ============================================================================

export async function debugWeakTopics(userId: string) {
  const weakTopics = await db
    .select()
    .from(weakTopics)
    .where(eq(weakTopics.userId, userId));
    
  console.log('User weak topics:', weakTopics);
  
  // Expected output:
  // [
  //   {
  //     topicId: 'uuid-123',
  //     topicName: 'Algebra',
  //     accuracyPercentage: 45,
  //     weaknessLevel: 'moderate',
  //     nextReviewDate: '2025-11-20T...'
  //   },
  //   ...
  // ]
}
