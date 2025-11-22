# Progress Dashboard - Technical Specification

## Executive Summary

**Feature:** Progress Dashboard  
**Route:** `/dashboard/progress`  
**Architecture:** Server-side rendering with client components  
**Database:** PostgreSQL + Drizzle ORM  
**Estimated LOC:** ~2,500 lines  
**Dependencies:** Existing user_test_attempts, user_answers, tests, sections, questions tables  
**New Tables:** 3 (user_goals, achievements, user_achievements)  
**API Endpoints:** 6 new routes  
**Components:** 9 client components + 1 server page

---

## System Architecture

### High-Level Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Request                          │
│                  /dashboard/progress                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            Next.js Server Component (RSC)                   │
│  - Authenticate user (requireAuth)                          │
│  - Execute parallel database queries                        │
│  - Calculate aggregations and metrics                       │
│  - Transform data for presentation                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               Database Layer (Drizzle ORM)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Query 1: Overall Stats (readiness calculation)     │    │
│  │ Query 2: Section Performance (coverage map)        │    │
│  │ Query 3: Activity Dates (streak calculation)       │    │
│  │ Query 4: User Goals (goal tracking)                │    │
│  │ Query 5: User Achievements (gamification)          │    │
│  │ Query 6: Monthly Comparison (improvements)         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           Client Components (Hydration)                     │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ ExamReadiness   │  │ StreakCalendar  │                  │
│  │ (Static)        │  │ (Interactive)   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ GoalsDashboard  │  │ Achievements    │                  │
│  │ (Interactive)   │  │ (Static+Modal)  │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Patterns

**Pattern 1: Server-Side Aggregation (Preferred)**
```typescript
// Server Component
async function fetchProgressData(userId: string) {
  // Direct database queries with aggregations
  const stats = await db.select({
    avgAccuracy: sql<number>`AVG(...)`,
    totalTests: sql<number>`COUNT(*)`,
    // ... complex calculations
  }).from(...)...;
  
  return stats;
}

// No client-side data fetching needed
```

**Pattern 2: Client-Side Interaction**
```typescript
// Client Component
'use client';

export function GoalsDashboard({ initialData }) {
  const [goals, setGoals] = useState(initialData);
  
  async function createGoal(data) {
    const response = await fetch('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    // Update state
  }
  
  return <div>...</div>;
}
```

**Pattern 3: Hybrid (Server + Client)**
```typescript
// Server fetches initial data
// Client handles mutations and optimistic updates
export default async function Page() {
  const data = await fetchData();
  return <InteractiveComponent initialData={data} />;
}
```

---

## Database Schema

### New Tables

#### 1. user_goals
**Purpose:** Track user-defined learning goals

```sql
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Goal Definition
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'custom')),
  goal_category VARCHAR(50) NOT NULL CHECK (goal_category IN ('questions', 'accuracy', 'time', 'tests', 'sections', 'topics')),
  
  -- Values
  target_value DECIMAL(10,2) NOT NULL CHECK (target_value > 0),
  current_value DECIMAL(10,2) DEFAULT 0 CHECK (current_value >= 0),
  
  -- Time Range
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  CHECK (period_end >= period_start),
  
  -- Optional Filters
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'archived')),
  completed_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_goals_user_status ON user_goals(user_id, status) WHERE status = 'active';
CREATE INDEX idx_goals_period ON user_goals(period_start, period_end);
CREATE INDEX idx_goals_category ON user_goals(goal_category);

-- Auto-update timestamp trigger
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Expected Volume:** 
- ~3-10 goals per active user
- ~50% completion rate
- Archive after 30 days of completion

#### 2. achievements
**Purpose:** Define all available achievements (seeded data)

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Display
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(50), -- Emoji or icon identifier
  
  -- Classification
  category VARCHAR(50) NOT NULL CHECK (category IN ('milestone', 'performance', 'streak', 'coverage', 'speed', 'social')),
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  -- Unlock Criteria
  requirement_type VARCHAR(50) NOT NULL,
  -- Examples: 'tests_count', 'questions_count', 'test_accuracy', 'streak_days', 
  --          'section_accuracy', 'all_sections_threshold', 'section_improvement'
  requirement_value INT NOT NULL CHECK (requirement_value > 0),
  
  -- Additional Filters (JSON for flexibility)
  requirement_filters JSONB, -- e.g., {"section_id": "uuid", "min_questions": 10}
  
  -- Rewards
  points INT DEFAULT 10 CHECK (points >= 0),
  
  -- Visibility
  is_hidden BOOLEAN DEFAULT FALSE, -- Secret achievements
  is_active BOOLEAN DEFAULT TRUE, -- Can be temporarily disabled
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_requirement ON achievements(requirement_type);
CREATE INDEX idx_achievements_active ON achievements(is_active) WHERE is_active = TRUE;
```

**Expected Volume:** 
- ~25-50 achievements total
- Static data, seeded via migration
- Rarely updated

#### 3. user_achievements
**Purpose:** Track user achievement unlocks and progress

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Progress Tracking
  progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  -- 0 = not started, 0-99 = in progress, 100 = completed
  
  -- Unlock Info
  unlocked_at TIMESTAMP, -- NULL until unlocked
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- One achievement per user
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at) WHERE unlocked_at IS NOT NULL;
CREATE INDEX idx_user_achievements_progress ON user_achievements(user_id, progress) WHERE progress < 100;

-- Composite index for dashboard queries
CREATE INDEX idx_user_achievements_dashboard ON user_achievements(user_id, unlocked_at DESC, progress DESC);
```

**Expected Volume:** 
- ~25-50 records per user (one per achievement)
- High read frequency for dashboard
- Low write frequency (only on unlock)

#### 4. user_exams (Optional)
**Purpose:** Store exam dates for countdown feature

```sql
CREATE TABLE user_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Exam Details
  exam_name VARCHAR(100) NOT NULL,
  exam_date DATE NOT NULL,
  target_score INT CHECK (target_score > 0 AND target_score <= 100),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  result_score INT CHECK (result_score >= 0 AND result_score <= 100),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_exams_user ON user_exams(user_id);
CREATE INDEX idx_user_exams_date ON user_exams(exam_date) WHERE is_active = TRUE;
```

**Expected Volume:** 
- ~1-3 exams per user
- Optional feature

---

## Core Algorithms

### 1. Exam Readiness Score

**Inputs:**
- User test attempts (all submitted tests)
- Section coverage
- Recent performance trend
- Total practice volume

**Algorithm:**
```typescript
interface ReadinessData {
  avgAccuracy: number;        // 0-100
  sectionsPracticed: number;  // Count
  totalSections: number;      // Count
  testsCompleted: number;     // Count
  recentTests: Array<{        // Last 10 tests
    score: number;
    totalMarks: number;
    submittedAt: Date;
  }>;
}

function calculateReadiness(data: ReadinessData): number {
  // Factor 1: Overall Accuracy (40% weight)
  const accuracyScore = (data.avgAccuracy / 100) * 40;
  
  // Factor 2: Section Coverage (30% weight)
  const coverageRatio = data.sectionsPracticed / data.totalSections;
  const coverageScore = coverageRatio * 30;
  
  // Factor 3: Recent Improvement Trend (20% weight)
  const trendScore = calculateTrendScore(data.recentTests) * 20;
  
  // Factor 4: Practice Volume (10% weight)
  // Normalized to 50 tests (diminishing returns after)
  const volumeRatio = Math.min(data.testsCompleted / 50, 1);
  const volumeScore = volumeRatio * 10;
  
  // Sum all factors
  const totalScore = accuracyScore + coverageScore + trendScore + volumeScore;
  
  return Math.round(totalScore);
}

function calculateTrendScore(recentTests: Array<{score: number, totalMarks: number}>): number {
  if (recentTests.length < 2) return 0.5; // Neutral if insufficient data
  
  // Calculate percentage for each test
  const percentages = recentTests.map(t => (t.score / t.totalMarks) * 100);
  
  // Linear regression to find slope
  const n = percentages.length;
  const x = Array.from({ length: n }, (_, i) => i); // [0, 1, 2, ...]
  const y = percentages;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Normalize slope to 0-1 range
  // Positive slope = improving, negative = declining
  // Slope of 5 (5% improvement per test) = 1.0
  const normalizedSlope = Math.max(0, Math.min(1, (slope + 5) / 10));
  
  return normalizedSlope;
}

function getReadinessStatus(score: number): {
  status: string;
  color: string;
  message: string;
} {
  if (score >= 90) {
    return {
      status: 'Ready',
      color: 'blue',
      message: "You're well-prepared for your exam!"
    };
  } else if (score >= 75) {
    return {
      status: 'Almost Ready',
      color: 'green',
      message: "Keep up the great work! You're almost there."
    };
  } else if (score >= 50) {
    return {
      status: 'Getting There',
      color: 'orange',
      message: "Good progress! Continue practicing consistently."
    };
  } else {
    return {
      status: 'Not Ready',
      color: 'red',
      message: "Focus on building your foundation. Take more practice tests."
    };
  }
}
```

**Performance:**
- Complexity: O(n) where n = number of recent tests (max 10)
- Database queries: 2 (overall stats + recent tests)
- Estimated execution time: <100ms

---

### 2. Streak Calculator

**Inputs:**
- Array of activity dates (dates when tests were submitted)

**Algorithm:**
```typescript
function calculateStreak(activityDates: Date[]): {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  activityMap: Record<string, boolean>;
} {
  // Helper: Start of day (ignore time)
  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  
  // Normalize and deduplicate dates
  const uniqueDates = Array.from(
    new Set(activityDates.map(d => startOfDay(d).getTime()))
  )
    .map(t => new Date(t))
    .sort((a, b) => b.getTime() - a.getTime()); // Descending
  
  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      activityMap: {}
    };
  }
  
  // Calculate current streak
  let currentStreak = 0;
  const today = startOfDay(new Date());
  let checkDate = today;
  
  for (const date of uniqueDates) {
    const daysDiff = Math.round(
      (checkDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff === 0) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 86400000); // -1 day
    } else if (daysDiff === 1) {
      currentStreak++;
      checkDate = new Date(date.getTime() - 86400000);
    } else {
      break; // Streak broken
    }
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const daysDiff = Math.round(
      (uniqueDates[i - 1].getTime() - uniqueDates[i].getTime()) / 86400000
    );
    
    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  
  // Create activity map for calendar
  const activityMap: Record<string, boolean> = {};
  uniqueDates.forEach(date => {
    const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    activityMap[key] = true;
  });
  
  return {
    currentStreak,
    longestStreak,
    totalActiveDays: uniqueDates.length,
    activityMap
  };
}
```

**Edge Cases:**
- Empty activity dates → All streaks = 0
- Single activity date → Current = 1, Longest = 1
- Gap of 1 day → Streak continues (grace period optional)
- Multiple activities same day → Count as 1 day

**Performance:**
- Complexity: O(n log n) due to sorting
- Best case: O(n) if pre-sorted
- Memory: O(n) for activity map

---

### 3. Goal Progress Calculator

**Inputs:**
- Goal definition (type, category, target, period)
- User activity data

**Algorithm:**
```typescript
async function calculateGoalProgress(
  goal: UserGoal,
  userId: string
): Promise<number> {
  const { goalCategory, periodStart, periodEnd, sectionId, topicId } = goal;
  
  let currentValue = 0;
  
  switch (goalCategory) {
    case 'questions':
      // Count answers in period
      const questionCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userAnswers)
        .where(
          and(
            eq(userAnswers.userId, userId),
            sql`DATE(${userAnswers.answeredAt}) >= ${periodStart}`,
            sql`DATE(${userAnswers.answeredAt}) <= ${periodEnd}`,
            sectionId ? inArray(
              userAnswers.questionId,
              db.select({ id: questions.id })
                .from(questions)
                .where(eq(questions.sectionId, sectionId))
            ) : sql`1=1`
          )
        );
      currentValue = questionCount[0]?.count || 0;
      break;
      
    case 'tests':
      // Count completed tests in period
      const testCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userTestAttempts)
        .where(
          and(
            eq(userTestAttempts.userId, userId),
            eq(userTestAttempts.status, 'submitted'),
            sql`DATE(${userTestAttempts.submittedAt}) >= ${periodStart}`,
            sql`DATE(${userTestAttempts.submittedAt}) <= ${periodEnd}`,
            sectionId ? inArray(
              userTestAttempts.testId,
              db.select({ id: tests.id })
                .from(tests)
                .where(eq(tests.sectionId, sectionId))
            ) : sql`1=1`
          )
        );
      currentValue = testCount[0]?.count || 0;
      break;
      
    case 'accuracy':
      // Calculate average accuracy in period
      const accuracyResult = await db
        .select({
          avg: sql<number>`AVG((${userTestAttempts.correctAnswers}::float / ${tests.totalQuestions}) * 100)`
        })
        .from(userTestAttempts)
        .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
        .where(
          and(
            eq(userTestAttempts.userId, userId),
            eq(userTestAttempts.status, 'submitted'),
            sql`DATE(${userTestAttempts.submittedAt}) >= ${periodStart}`,
            sql`DATE(${userTestAttempts.submittedAt}) <= ${periodEnd}`,
            sectionId ? eq(tests.sectionId, sectionId) : sql`1=1`
          )
        );
      currentValue = accuracyResult[0]?.avg || 0;
      break;
      
    case 'time':
      // Sum time spent (in minutes)
      const timeResult = await db
        .select({
          total: sql<number>`SUM(${userTestAttempts.timeSpent})`
        })
        .from(userTestAttempts)
        .where(
          and(
            eq(userTestAttempts.userId, userId),
            eq(userTestAttempts.status, 'submitted'),
            sql`DATE(${userTestAttempts.submittedAt}) >= ${periodStart}`,
            sql`DATE(${userTestAttempts.submittedAt}) <= ${periodEnd}`
          )
        );
      currentValue = Math.round((timeResult[0]?.total || 0) / 60); // Convert to minutes
      break;
      
    case 'sections':
      // Count unique sections practiced
      const sectionCount = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${tests.sectionId})`
        })
        .from(userTestAttempts)
        .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
        .where(
          and(
            eq(userTestAttempts.userId, userId),
            eq(userTestAttempts.status, 'submitted'),
            sql`DATE(${userTestAttempts.submittedAt}) >= ${periodStart}`,
            sql`DATE(${userTestAttempts.submittedAt}) <= ${periodEnd}`
          )
        );
      currentValue = sectionCount[0]?.count || 0;
      break;
      
    case 'topics':
      // Count unique topics practiced
      const topicCount = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${questions.topicId})`
        })
        .from(userAnswers)
        .innerJoin(questions, eq(userAnswers.questionId, questions.id))
        .where(
          and(
            eq(userAnswers.userId, userId),
            sql`DATE(${userAnswers.answeredAt}) >= ${periodStart}`,
            sql`DATE(${userAnswers.answeredAt}) <= ${periodEnd}`
          )
        );
      currentValue = topicCount[0]?.count || 0;
      break;
  }
  
  return currentValue;
}

async function updateGoalStatus(goal: UserGoal, currentValue: number) {
  const progressPercentage = (currentValue / goal.targetValue) * 100;
  const now = new Date();
  
  let newStatus = goal.status;
  let completedAt = goal.completedAt;
  
  if (progressPercentage >= 100) {
    newStatus = 'completed';
    completedAt = completedAt || now;
  } else if (now > goal.periodEnd) {
    newStatus = 'failed';
  } else {
    newStatus = 'active';
  }
  
  await db
    .update(userGoals)
    .set({
      currentValue,
      status: newStatus,
      completedAt,
      updatedAt: now
    })
    .where(eq(userGoals.id, goal.id));
}
```

**Performance:**
- Each category requires 1 database query
- Queries are simple aggregations with indexes
- Estimated execution time: <50ms per goal

---

### 4. Achievement Unlock System

**Inputs:**
- User ID
- Event type (e.g., 'tests_count', 'test_accuracy')
- Event value (e.g., 10, 95)

**Algorithm:**
```typescript
interface AchievementCheckResult {
  unlocked: Achievement[];
  progress: Array<{ achievement: Achievement; progress: number }>;
}

async function checkAndUnlockAchievements(
  userId: string,
  eventType: string,
  eventValue: number,
  metadata?: Record<string, any>
): Promise<AchievementCheckResult> {
  // Get all achievements for this event type
  const relevantAchievements = await db.query.achievements.findMany({
    where: and(
      eq(achievements.requirementType, eventType),
      eq(achievements.isActive, true)
    )
  });
  
  const unlocked: Achievement[] = [];
  const progress: Array<{ achievement: Achievement; progress: number }> = [];
  
  for (const achievement of relevantAchievements) {
    // Check filters (if any)
    if (achievement.requirementFilters) {
      const filters = achievement.requirementFilters as Record<string, any>;
      let filtersMatch = true;
      
      for (const [key, value] of Object.entries(filters)) {
        if (metadata?.[key] !== value) {
          filtersMatch = false;
          break;
        }
      }
      
      if (!filtersMatch) continue;
    }
    
    // Check existing unlock status
    const existingUnlock = await db.query.userAchievements.findFirst({
      where: and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievement.id)
      )
    });
    
    // Calculate progress
    const progressPercentage = Math.min(
      (eventValue / achievement.requirementValue) * 100,
      100
    );
    
    if (progressPercentage >= 100 && !existingUnlock?.unlockedAt) {
      // Unlock achievement
      if (existingUnlock) {
        await db
          .update(userAchievements)
          .set({
            progress: 100,
            unlockedAt: new Date()
          })
          .where(eq(userAchievements.id, existingUnlock.id));
      } else {
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
          progress: 100,
          unlockedAt: new Date()
        });
      }
      
      unlocked.push(achievement);
      
      // Trigger notification
      await triggerAchievementNotification(userId, achievement);
    } else if (progressPercentage < 100) {
      // Update progress
      if (existingUnlock) {
        await db
          .update(userAchievements)
          .set({ progress: progressPercentage })
          .where(eq(userAchievements.id, existingUnlock.id));
      } else {
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
          progress: progressPercentage
        });
      }
      
      progress.push({ achievement, progress: progressPercentage });
    }
  }
  
  return { unlocked, progress };
}

// Special achievement types with custom logic

async function checkAllSectionsThreshold(
  userId: string,
  threshold: number
): Promise<boolean> {
  // Check if user has >= threshold accuracy in ALL sections
  const sectionStats = await db
    .select({
      sectionId: sections.id,
      accuracy: sql<number>`AVG(CASE WHEN ${userAnswers.isCorrect} THEN 100 ELSE 0 END)`
    })
    .from(sections)
    .innerJoin(questions, eq(sections.id, questions.sectionId))
    .innerJoin(userAnswers, and(
      eq(questions.id, userAnswers.questionId),
      eq(userAnswers.userId, userId)
    ))
    .groupBy(sections.id);
  
  // Get total sections
  const totalSections = await db.select({ count: sql<number>`COUNT(*)` }).from(sections);
  
  // Check if all sections practiced and meet threshold
  if (sectionStats.length < totalSections[0].count) return false;
  
  return sectionStats.every(s => s.accuracy >= threshold);
}

async function checkSectionImprovement(
  userId: string,
  sectionId: string,
  improvementThreshold: number
): Promise<boolean> {
  // Compare first 10 tests vs last 10 tests in a section
  const firstTests = await db
    .select({
      avg: sql<number>`AVG((${userTestAttempts.correctAnswers}::float / ${tests.totalQuestions}) * 100)`
    })
    .from(userTestAttempts)
    .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
    .where(and(
      eq(userTestAttempts.userId, userId),
      eq(tests.sectionId, sectionId),
      eq(userTestAttempts.status, 'submitted')
    ))
    .orderBy(asc(userTestAttempts.submittedAt))
    .limit(10);
  
  const lastTests = await db
    .select({
      avg: sql<number>`AVG((${userTestAttempts.correctAnswers}::float / ${tests.totalQuestions}) * 100)`
    })
    .from(userTestAttempts)
    .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
    .where(and(
      eq(userTestAttempts.userId, userId),
      eq(tests.sectionId, sectionId),
      eq(userTestAttempts.status, 'submitted')
    ))
    .orderBy(desc(userTestAttempts.submittedAt))
    .limit(10);
  
  const improvement = (lastTests[0]?.avg || 0) - (firstTests[0]?.avg || 0);
  return improvement >= improvementThreshold;
}
```

**Integration Points:**
```typescript
// After test submission
await checkAndUnlockAchievements(
  userId,
  'tests_count',
  totalTestsCompleted
);

await checkAndUnlockAchievements(
  userId,
  'test_accuracy',
  testAccuracyPercentage,
  { sectionId: test.sectionId }
);

// After answering questions
await checkAndUnlockAchievements(
  userId,
  'questions_count',
  totalQuestionsAnswered
);

// Daily cron job
await checkAndUnlockAchievements(
  userId,
  'streak_days',
  currentStreak
);
```

---

## API Specifications

### 1. GET /api/progress/overview

**Purpose:** Fetch comprehensive progress data for dashboard

**Request:**
```
GET /api/progress/overview
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  readiness: {
    score: number;              // 0-100
    status: string;             // 'Not Ready' | 'Getting There' | 'Almost Ready' | 'Ready'
    color: string;              // 'red' | 'orange' | 'green' | 'blue'
    message: string;
    breakdown: Array<{
      sectionId: string;
      sectionName: string;
      accuracy: number;
      status: string;
      totalQuestions: number;
      lastPracticed: Date | null;
    }>;
  };
  
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    activityMap: Record<string, boolean>;
    nextMilestone: {
      name: string;
      daysRemaining: number;
    };
  };
  
  goals: {
    daily: Array<UserGoal & { progressPercentage: number }>;
    weekly: Array<UserGoal & { progressPercentage: number }>;
    custom: Array<UserGoal & { progressPercentage: number }>;
    summary: {
      total: number;
      completed: number;
      inProgress: number;
    };
  };
  
  achievements: {
    unlocked: Achievement[];
    inProgress: Array<{ achievement: Achievement; progress: number }>;
    locked: Achievement[];
    stats: {
      totalUnlocked: number;
      totalAvailable: number;
      totalPoints: number;
    };
  };
  
  improvements: {
    accuracy: {
      current: number;
      previous: number;
      change: number;
      percentChange: number;
    };
    tests: {
      current: number;
      previous: number;
      change: number;
    };
    streak: {
      current: number;
      change: number;
    };
    mostImproved: Array<{
      sectionName: string;
      thisMonth: number;
      lastMonth: number;
      improvement: number;
    }>;
    consistencyScore: number;
  };
  
  timeline: Array<{
    type: string;
    date: Date;
    title: string;
    description: string;
    icon: string;
  }>;
}
```

**Implementation:**
```typescript
// src/app/api/progress/overview/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { calculateReadiness } from '@/lib/progress/readiness';
import { calculateStreak } from '@/lib/progress/streaks';
import { getUserGoals } from '@/lib/progress/goals';
import { getUserAchievements } from '@/lib/progress/achievements';
import { calculateImprovements } from '@/lib/progress/improvements';
import { getProgressTimeline } from '@/lib/progress/timeline';

export async function GET() {
  try {
    const user = await requireAuth();
    
    // Fetch all data in parallel
    const [
      readiness,
      streak,
      goals,
      achievements,
      improvements,
      timeline
    ] = await Promise.all([
      calculateReadiness(user.id),
      calculateStreak(user.id),
      getUserGoals(user.id),
      getUserAchievements(user.id),
      calculateImprovements(user.id),
      getProgressTimeline(user.id)
    ]);
    
    return NextResponse.json({
      readiness,
      streak,
      goals,
      achievements,
      improvements,
      timeline
    });
  } catch (error) {
    console.error('Progress overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}
```

**Performance:**
- Expected response time: <500ms
- Parallel execution of independent queries
- Cached for 5 minutes (optional)

---

### 2. POST /api/goals

**Purpose:** Create new goal

**Request:**
```typescript
POST /api/goals
Content-Type: application/json
Authorization: Bearer <token>

{
  goalType: 'daily' | 'weekly' | 'monthly' | 'custom',
  goalCategory: 'questions' | 'accuracy' | 'time' | 'tests' | 'sections' | 'topics',
  targetValue: number,
  periodStart: string,      // ISO date
  periodEnd: string,        // ISO date
  sectionId?: string,
  topicId?: string
}
```

**Response:**
```typescript
{
  id: string,
  ...goalData,
  currentValue: 0,
  status: 'active',
  createdAt: Date
}
```

**Validation:**
- targetValue > 0
- periodEnd >= periodStart
- periodEnd > now (for new goals)
- sectionId exists (if provided)
- topicId exists (if provided)

---

### 3. PUT /api/goals/[id]

**Purpose:** Update existing goal

**Request:**
```typescript
PUT /api/goals/abc-123
Content-Type: application/json

{
  targetValue?: number,
  periodEnd?: string,
  status?: 'active' | 'archived'
}
```

**Note:** Cannot update goalType, goalCategory, or periodStart

---

### 4. DELETE /api/goals/[id]

**Purpose:** Delete/archive goal

**Implementation:** Soft delete (set status = 'archived')

---

### 5. GET /api/achievements

**Purpose:** Get all achievements with user progress

**Response:**
```typescript
{
  achievements: Array<{
    ...Achievement,
    userProgress: number | null,
    unlockedAt: Date | null,
    isUnlocked: boolean
  }>
}
```

---

### 6. POST /api/achievements/check

**Purpose:** Manually trigger achievement check (for testing)

**Request:**
```typescript
POST /api/achievements/check
Content-Type: application/json

{
  eventType: string,
  eventValue: number,
  metadata?: Record<string, any>
}
```

**Response:**
```typescript
{
  unlocked: Achievement[],
  progress: Array<{ achievement: Achievement; progress: number }>
}
```

---

## Component Specifications

### 1. ExamReadinessCard

**Props:**
```typescript
interface ExamReadinessProps {
  score: number;
  status: string;
  color: string;
  message: string;
  breakdown: SectionReadiness[];
  examDate?: Date;
}
```

**Features:**
- Circular progress ring (using SVG or chart library)
- Animated number counting
- Collapsible section breakdown
- Countdown timer
- Empty state for new users

**Interactivity:**
- Client component
- Expand/collapse sections
- Click section → navigate to practice

---

### 2. StreakCalendar

**Props:**
```typescript
interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  activityMap: Record<string, boolean>;
  totalActiveDays: number;
}
```

**Features:**
- Month view with date grid
- Dot indicators for active days
- Hover tooltips
- Next milestone display
- Animation on streak increase

**Interactivity:**
- Client component
- Month navigation
- Hover states
- Click day → show details

---

### 3. GoalsDashboard

**Props:**
```typescript
interface GoalsDashboardProps {
  goals: Array<UserGoal & { progressPercentage: number }>;
}
```

**Features:**
- Tabbed interface (Daily/Weekly/Custom)
- Progress bars for each goal
- Add goal button → sheet/modal
- Edit/delete actions
- Completion animations
- Confetti on goal completion

**Interactivity:**
- Client component
- State management for CRUD operations
- Optimistic updates
- Form validation
- Toast notifications

---

### 4. AchievementsGrid

**Props:**
```typescript
interface AchievementsGridProps {
  unlocked: Achievement[];
  inProgress: Array<{ achievement: Achievement; progress: number }>;
  locked: Achievement[];
}
```

**Features:**
- Grid layout (3-4 columns)
- Badge cards with icons
- Progress indicators for in-progress
- Locked state (grayed out)
- Rarity indicators (color borders)
- Tooltip with description
- "View All" modal

**Interactivity:**
- Client component
- Modal for full list
- Filter by category/rarity
- Search achievements
- Share achievement (social)

---

## Performance Optimization

### Database Indexes

**Critical Indexes:**
```sql
-- Most important for dashboard queries
CREATE INDEX idx_uta_user_status_submitted ON user_test_attempts(user_id, status, submitted_at DESC) 
  WHERE status = 'submitted';

CREATE INDEX idx_ua_user_answered ON user_answers(user_id, answered_at DESC);

CREATE INDEX idx_goals_user_active ON user_goals(user_id, status) 
  WHERE status = 'active';

CREATE INDEX idx_user_achievements_dashboard ON user_achievements(user_id, unlocked_at DESC, progress DESC);
```

### Query Optimization

**1. Aggregate Early:**
```sql
-- Good: Aggregate before joining
SELECT s.name, stats.accuracy
FROM sections s
JOIN (
  SELECT q.section_id, AVG(CASE WHEN ua.is_correct THEN 100 ELSE 0 END) as accuracy
  FROM user_answers ua
  JOIN questions q ON ua.question_id = q.id
  WHERE ua.user_id = ?
  GROUP BY q.section_id
) stats ON s.id = stats.section_id;

-- Bad: Join before aggregating
SELECT s.name, AVG(CASE WHEN ua.is_correct THEN 100 ELSE 0 END)
FROM sections s
JOIN questions q ON s.id = q.section_id
JOIN user_answers ua ON q.id = ua.question_id
WHERE ua.user_id = ?
GROUP BY s.id, s.name;
```

**2. Limit Data Retrieval:**
```sql
-- Only fetch required columns
SELECT id, score, total_marks, submitted_at
FROM user_test_attempts
WHERE user_id = ? AND status = 'submitted'
ORDER BY submitted_at DESC
LIMIT 10;

-- Not: SELECT * FROM ...
```

**3. Use CTEs for Complex Queries:**
```sql
WITH recent_tests AS (
  SELECT * FROM user_test_attempts
  WHERE user_id = ? AND status = 'submitted'
  AND submitted_at >= NOW() - INTERVAL '30 days'
),
stats AS (
  SELECT 
    AVG((correct_answers::float / total_questions) * 100) as avg_accuracy,
    COUNT(*) as test_count
  FROM recent_tests
)
SELECT * FROM stats;
```

### Caching Strategy

**1. Static Data (Long TTL):**
```typescript
// Cache achievements (rarely change)
const achievements = await cache.get('achievements', async () => {
  return await db.query.achievements.findMany();
}, { ttl: 3600 }); // 1 hour
```

**2. User Data (Short TTL):**
```typescript
// Cache progress overview
const progress = await cache.get(`progress:${userId}`, async () => {
  return await fetchProgressData(userId);
}, { ttl: 300 }); // 5 minutes
```

**3. Real-time Data (No Cache):**
- Current goal progress
- Today's activity count
- Live leaderboards (if implemented)

### Component Optimization

**1. Memoization:**
```typescript
'use client';

export const ExamReadinessCard = memo(function ExamReadinessCard({ data }) {
  // Only re-render if data changes
  return <div>...</div>;
});
```

**2. Lazy Loading:**
```typescript
const AchievementsModal = lazy(() => import('./achievements-modal'));

// Load only when opened
{showModal && (
  <Suspense fallback={<Skeleton />}>
    <AchievementsModal />
  </Suspense>
)}
```

**3. Virtual Scrolling:**
```typescript
// For long achievement lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={achievements.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <AchievementCard achievement={achievements[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## Security Considerations

### 1. Authorization
```typescript
// Always verify user owns data
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await requireAuth();
  const goal = await db.query.userGoals.findFirst({
    where: eq(userGoals.id, params.id)
  });
  
  if (!goal || goal.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json(goal);
}
```

### 2. Input Validation
```typescript
import { z } from 'zod';

const goalSchema = z.object({
  goalType: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  goalCategory: z.enum(['questions', 'accuracy', 'time', 'tests']),
  targetValue: z.number().positive(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  sectionId: z.string().uuid().optional()
}).refine(data => new Date(data.periodEnd) >= new Date(data.periodStart), {
  message: 'End date must be after start date'
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = goalSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error },
      { status: 400 }
    );
  }
  
  // Proceed with validated data
}
```

### 3. Rate Limiting
```typescript
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function POST(req: Request) {
  try {
    await limiter.check(10, userId); // 10 requests per minute
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // Handle request
}
```

### 4. SQL Injection Prevention
```typescript
// ✅ Good: Parameterized queries with Drizzle
await db
  .select()
  .from(userGoals)
  .where(eq(userGoals.userId, userId));

// ❌ Bad: String concatenation
await db.execute(sql`SELECT * FROM user_goals WHERE user_id = '${userId}'`);
```

---

## Monitoring & Observability

### Key Metrics to Track

**1. Performance Metrics:**
- Page load time
- API response time (p50, p95, p99)
- Database query duration
- Cache hit rate

**2. Business Metrics:**
- Goals created per user
- Goal completion rate
- Achievement unlock rate
- Daily active users (DAU)
- Streak retention

**3. Error Metrics:**
- API error rate
- Failed database queries
- Client-side errors
- Achievement unlock failures

### Logging Strategy

```typescript
import { logger } from '@/lib/logger';

export async function calculateReadiness(userId: string) {
  const startTime = Date.now();
  
  try {
    const result = await performCalculation(userId);
    
    logger.info('Readiness calculated', {
      userId,
      score: result.score,
      duration: Date.now() - startTime
    });
    
    return result;
  } catch (error) {
    logger.error('Readiness calculation failed', {
      userId,
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime
    });
    
    throw error;
  }
}
```

---

## Deployment Checklist

- [ ] Database migration applied to production
- [ ] Achievements seeded
- [ ] Indexes created
- [ ] Environment variables set
- [ ] Error handling verified
- [ ] Logging configured
- [ ] Monitoring dashboard set up
- [ ] Performance benchmarked
- [ ] Security review completed
- [ ] Documentation updated
- [ ] User guide created
- [ ] Rollback plan ready

---

## Migration Script

```sql
-- Save as: migrations/add-progress-dashboard.sql

BEGIN;

-- Create tables
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'custom')),
  goal_category VARCHAR(50) NOT NULL CHECK (goal_category IN ('questions', 'accuracy', 'time', 'tests', 'sections', 'topics')),
  target_value DECIMAL(10,2) NOT NULL CHECK (target_value > 0),
  current_value DECIMAL(10,2) DEFAULT 0 CHECK (current_value >= 0),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL CHECK (period_end >= period_start),
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'archived')),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(50),
  category VARCHAR(50) NOT NULL CHECK (category IN ('milestone', 'performance', 'streak', 'coverage', 'speed', 'social')),
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INT NOT NULL CHECK (requirement_value > 0),
  requirement_filters JSONB,
  points INT DEFAULT 10 CHECK (points >= 0),
  is_hidden BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS user_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_name VARCHAR(100) NOT NULL,
  exam_date DATE NOT NULL,
  target_score INT CHECK (target_score > 0 AND target_score <= 100),
  is_active BOOLEAN DEFAULT TRUE,
  result_score INT CHECK (result_score >= 0 AND result_score <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_goals_user_status ON user_goals(user_id, status) WHERE status = 'active';
CREATE INDEX idx_goals_period ON user_goals(period_start, period_end);
CREATE INDEX idx_goals_category ON user_goals(goal_category);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_requirement ON achievements(requirement_type);
CREATE INDEX idx_achievements_active ON achievements(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at) WHERE unlocked_at IS NOT NULL;
CREATE INDEX idx_user_achievements_progress ON user_achievements(user_id, progress) WHERE progress < 100;
CREATE INDEX idx_user_achievements_dashboard ON user_achievements(user_id, unlocked_at DESC, progress DESC);

CREATE INDEX idx_user_exams_user ON user_exams(user_id);
CREATE INDEX idx_user_exams_date ON user_exams(exam_date) WHERE is_active = TRUE;

-- Seed achievements (see separate file: seed-achievements.sql)

COMMIT;
```

---

**Document Version:** 1.0  
**Last Updated:** November 22, 2025  
**Author:** Development Team  
**Status:** Ready for Implementation
