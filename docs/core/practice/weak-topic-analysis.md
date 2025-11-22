# Weak Topic Analysis System

## Overview

The weak topic system uses AI-powered performance analysis to identify areas where users struggle and implements spaced repetition for improvement. This document explains the complete logic flow with practical examples.

## Core Logic Components

### 1. Analysis Trigger (`analyze-weak-topics.ts`)
- Called after each test completion via `analyzeWeakTopicsAction(userId)`
- Revalidates the practice page to show updated weak topics

### 2. Main Analysis Logic (`weak-topic-analyzer.ts`)

#### Performance Calculation:
```typescript
// Analyzes user's test performance across all topics
- Joins userAnswers → userTestAttempts → questions → topics
- Calculates accuracy percentage per topic
- Determines weakness level based on accuracy thresholds
```

#### Weakness Level Classification:
- **Critical**: < 40% accuracy (≥5 attempts) or < 50% (≥3 attempts)
- **Moderate**: 40-59% accuracy (≥5 attempts)
- **Improving**: 60-74% accuracy (≥5 attempts)
- **Strong**: ≥75% accuracy (automatically removed from weak topics)

#### Spaced Repetition Intervals:
- **Critical topics**: Review every 1 day
- **Moderate topics**: Review every 3 days  
- **Improving topics**: Review every 7 days

### 3. Database Operations

#### Upsert Logic:
- Updates existing weak topics or inserts new ones
- Tracks: `totalAttempts`, `correctAttempts`, `accuracyPercentage`, `weaknessLevel`, `nextReviewDate`
- Removes topics that improve to >75% accuracy

#### Practice Updates:
- `updateWeakTopicAfterPractice()` adjusts intervals based on performance
- Rewards correct answers with slightly longer intervals
- Removes topics that consistently improve

### 4. UI Components (`weak-topics-section.tsx`)

#### Features:
- **Empty State**: Prompts users to take mock tests when no weak topics identified
- **Topic Cards**: Show accuracy percentage, weakness level badges, and review due dates
- **Progress Bars**: Visual representation of accuracy
- **Action Buttons**: Direct links to practice specific topics

#### Color Coding:
- 🔴 **Critical**: Red styling
- 🟠 **Moderate**: Orange styling  
- 🟢 **Improving**: Green styling

### 5. Recommendation Engine
`getRecommendedPracticeTopics()` returns topics due for review based on:
- Current date vs. `nextReviewDate`
- Ordered by weakness level priority
- Limited to specified count (default 5)

### 6. Database Schema
The `weak_topics` table stores:
- User performance metrics
- Spaced repetition scheduling
- AI-determined weakness levels
- Practice history and review counts

## Practical Example: User "John" Journey

### Initial State
John is a new user preparing for RRB exams. He has no weak topics identified yet.

### Step 1: John Takes His First Mock Test

**Test Results:**
- **Mathematics**: 3/10 questions correct (30% accuracy)
- **General Knowledge**: 7/10 questions correct (70% accuracy) 
- **Reasoning**: 5/10 questions correct (50% accuracy)
- **English**: 8/10 questions correct (80% accuracy)

### Step 2: Weak Topic Analysis Triggered

When John submits the test, `analyzeWeakTopicsAction(userId)` is called:

```typescript
// After test submission
await analyzeWeakTopicsAction("john-user-id");
```

The analyzer processes his performance:

```typescript
// Database query results
topicPerformance = [
  { topicId: "math-001", topicName: "Mathematics", totalQuestions: 10, correctAnswers: 3 },
  { topicId: "gk-001", topicName: "General Knowledge", totalQuestions: 10, correctAnswers: 7 },
  { topicId: "reasoning-001", topicName: "Reasoning", totalQuestions: 10, correctAnswers: 5 },
  { topicId: "english-001", topicName: "English", totalQuestions: 10, correctAnswers: 8 }
];

// Weakness level calculation
Mathematics: 30% accuracy → Too few attempts (need ≥3), no weakness level assigned yet
General Knowledge: 70% accuracy → No weakness
Reasoning: 50% accuracy → Too few attempts, no weakness level assigned yet  
English: 80% accuracy → No weakness
```

**Result:** No weak topics identified yet (need more attempts for reliable analysis).

### Step 3: John Takes 2 More Tests

After 3 total tests:

**Cumulative Results:**
- **Mathematics**: 9/30 questions correct (30% accuracy, 30 attempts)
- **General Knowledge**: 21/30 questions correct (70% accuracy, 30 attempts)
- **Reasoning**: 15/30 questions correct (50% accuracy, 30 attempts)
- **English**: 24/30 questions correct (80% accuracy, 30 attempts)

### Step 4: Weak Topics Identified

Now with ≥5 attempts per topic:

```typescript
// Weakness level determination
const weakTopicData = [
  {
    topicId: "math-001",
    topicName: "Mathematics", 
    totalAttempts: 30,
    correctAttempts: 9,
    accuracyPercentage: 30,
    weaknessLevel: 'critical' // <40% accuracy
  },
  {
    topicId: "reasoning-001", 
    topicName: "Reasoning",
    totalAttempts: 30,
    correctAttempts: 15, 
    accuracyPercentage: 50,
    weaknessLevel: 'moderate' // 40-59% accuracy
  }
  // GK (70%) and English (80%) are not weak
];
```

### Step 5: Database Updates

```sql
-- Insert weak topics with spaced repetition schedule
INSERT INTO weak_topics (
  user_id, section_id, total_attempts, correct_attempts, 
  accuracy_percentage, weakness_level, next_review_date
) VALUES 
(
  'john-user-id', 'math-001', 30, 9, 30, 'critical', 
  '2025-11-22'  -- Tomorrow (critical = 1 day interval)
),
(
  'john-user-id', 'reasoning-001', 30, 15, 50, 'moderate',
  '2025-11-24'  -- 3 days later (moderate = 3 day interval)
);
```

### Step 6: UI Display

When John visits `/dashboard/practice`, he sees:

```tsx
<WeakTopicsSection weakTopics={[
  {
    id: "wt-001",
    topicName: "Mathematics",
    accuracyPercentage: 30,
    weaknessLevel: "critical",
    totalAttempts: 30,
    correctAttempts: 9,
    nextReviewDate: "2025-11-22"
  },
  {
    id: "wt-002", 
    topicName: "Reasoning",
    accuracyPercentage: 50,
    weaknessLevel: "moderate", 
    totalAttempts: 30,
    correctAttempts: 15,
    nextReviewDate: "2025-11-24"
  }
]} />
```

**UI Output:**
```
🧠 Focus on Weak Topics
   AI-identified areas for improvement

📚 Mathematics                    🔴 CRITICAL
    9/30 correct • 30% accuracy • Due in 1 day
    [Progress bar: 30% filled, red color]
    [Revise Now →]

📚 Reasoning                      🟠 MODERATE  
    15/30 correct • 50% accuracy • Due in 3 days
    [Progress bar: 50% filled, orange color]
    [Revise Now →]

[🧠 Generate Custom Quiz]
```

### Step 7: John Practices Mathematics

John clicks "Revise Now" for Mathematics and answers 5 practice questions, getting 4 correct.

```typescript
// Update after practice
await updateWeakTopicAfterPractice("john-user-id", "math-001", true); // 4/5 times
await updateWeakTopicAfterPractice("john-user-id", "math-001", false); // 1/5 times

// New calculations
newTotalAttempts = 30 + 5 = 35
newCorrectAttempts = 9 + 4 = 13  
newAccuracy = (13/35) * 100 = 37% // Still critical (<40%)

// Next review with slight bonus for good performance
nextReviewDate = tomorrow + 1 day bonus = '2025-11-23'
```

### Step 8: Long-term Improvement

After 2 weeks of focused practice:

**Mathematics Progress:**
- **Week 1**: 30% → 37% → 45% (becomes **moderate**)
- **Week 2**: 45% → 58% → 65% → 76% (becomes **strong**, removed from weak topics)

```typescript
// When accuracy reaches ≥75%
if (newAccuracy >= 75) {
  // Remove from weak_topics table
  await db.delete(weakTopics).where(
    and(
      eq(weakTopics.userId, "john-user-id"),
      eq(weakTopics.sectionId, "math-001")
    )
  );
}
```

### Step 9: Recommendation System

When John visits practice page on November 22nd:

```typescript
// Get topics due for review
const recommendedTopics = await getRecommendedPracticeTopics("john-user-id", 5);

// Returns: ["math-001"] because nextReviewDate (2025-11-22) <= current date
// Reasoning not due until November 24th
```

## Key Benefits

1. **Adaptive Learning**: Focus shifts automatically as user improves
2. **Spaced Repetition**: Optimal review intervals prevent cramming  
3. **Visual Progress**: Clear UI feedback motivates continued practice
4. **AI-Driven**: No manual topic selection needed
5. **Personalized**: Each user gets their own weakness profile

## Technical Implementation Files

### Core Logic Files:
- `src/lib/analytics/weak-topic-analyzer.ts` - Main analysis engine
- `src/lib/actions/analyze-weak-topics.ts` - Action trigger
- `src/components/practice/weak-topics-section.tsx` - UI component
- `src/db/schema/practice-sessions.ts` - Database schema

### Database Tables:
- `weak_topics` - Stores user weak topic data and spaced repetition schedule
- `revision_schedule` - Manages scheduled practice sessions

## Integration Points

1. **Test Submission**: Calls weak topic analysis after each test
2. **Practice Page**: Displays weak topics and due dates
3. **Custom Quiz**: Can generate quizzes focused on weak areas
4. **Spaced Repetition**: Automatically schedules review sessions

This system creates a data-driven, personalized learning experience that maximizes study efficiency by focusing on areas that need the most attention.