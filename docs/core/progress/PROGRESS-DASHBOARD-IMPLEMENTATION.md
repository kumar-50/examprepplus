# Progress Dashboard - Implementation Guide

## Overview
Progress Dashboard is a comprehensive feature that tracks user learning journey, exam readiness, goal achievement, and provides motivational feedback. It transforms raw test data into actionable insights and gamified progress tracking.

**Route:** `/dashboard/progress`

## Architecture Pattern

Following the established practice mode architecture:
- **Server Component** for main page with async data fetching
- **Direct Drizzle ORM queries** for data aggregation
- **Client Components** for interactive visualizations
- **Card-based layout** with consistent design system
- **Empty states** for first-time users

## Features Implemented

### Phase 1: Core Progress Features (HIGH PRIORITY)

#### 1. Exam Readiness Card (`/dashboard/progress`)

**Purpose:** Give users a clear answer to "Am I ready for my exam?"

**Visual Elements:**
- Circular progress indicator (0-100%)
- Status text: Not Ready / Getting There / Almost Ready / Ready
- Exam countdown timer (if exam date set)
- Section-wise readiness breakdown
- Color-coded status (red <50%, orange 50-74%, green 75-89%, blue 90%+)

**Calculation Logic:**
```typescript
function calculateReadiness(userData: UserStats) {
  // Factor 1: Overall Accuracy (40% weight)
  const accuracyScore = (userData.avgAccuracy / 100) * 40;
  
  // Factor 2: Section Coverage (30% weight)
  const coverageScore = (userData.sectionsPracticed / userData.totalSections) * 30;
  
  // Factor 3: Recent Improvement Trend (20% weight)
  const trendScore = calculateTrendScore(userData.recentAttempts) * 20;
  
  // Factor 4: Practice Volume (10% weight)
  const volumeScore = Math.min(userData.testsCompleted / 50, 1) * 10;
  
  return Math.round(accuracyScore + coverageScore + trendScore + volumeScore);
}

function getReadinessStatus(score: number): string {
  if (score >= 90) return 'Ready';
  if (score >= 75) return 'Almost Ready';
  if (score >= 50) return 'Getting There';
  return 'Not Ready';
}
```

**Data Query:**
```typescript
// Overall stats
const overallStats = await db
  .select({
    avgAccuracy: sql<number>`AVG((${userTestAttempts.correctAnswers}::float / ${tests.totalQuestions}) * 100)`,
    sectionsPracticed: sql<number>`COUNT(DISTINCT ${tests.sectionId})`,
    totalTests: sql<number>`COUNT(*)`,
    totalTime: sql<number>`SUM(${userTestAttempts.timeSpent})`
  })
  .from(userTestAttempts)
  .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
  .where(
    and(
      eq(userTestAttempts.userId, userId),
      eq(userTestAttempts.status, 'submitted')
    )
  );

// Section-wise readiness
const sectionStats = await db
  .select({
    sectionId: sections.id,
    sectionName: sections.name,
    accuracy: sql<number>`AVG(CASE WHEN ${userAnswers.isCorrect} THEN 100 ELSE 0 END)`,
    totalQuestions: sql<number>`COUNT(${userAnswers.id})`,
    daysPracticed: sql<number>`COUNT(DISTINCT DATE(${userAnswers.answeredAt}))`
  })
  .from(userAnswers)
  .innerJoin(questions, eq(userAnswers.questionId, questions.id))
  .innerJoin(sections, eq(questions.sectionId, sections.id))
  .where(eq(userAnswers.userId, userId))
  .groupBy(sections.id, sections.name);
```

**Component Location:** `/src/components/progress/exam-readiness-card.tsx`

**Empty State:**
```tsx
<div className="text-center py-8">
  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 mx-auto mb-4">
    <Target className="h-8 w-8 text-orange-500" />
  </div>
  <h3 className="text-lg font-semibold mb-2">Start Your Journey</h3>
  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
    Complete your first test to see your exam readiness score
  </p>
  <Button asChild>
    <Link href="/dashboard/tests">Browse Tests</Link>
  </Button>
</div>
```

---

#### 2. Study Streak Tracker

**Purpose:** Motivate consistent daily practice through streak visualization

**Visual Elements:**
- Current streak count with 🔥 icon
- Longest streak record
- Calendar heatmap (last 30 days)
- Next milestone indicator
- Streak freeze/protection status

**Streak Calculation Logic:**
```typescript
function calculateStreak(activityDates: Date[]): StreakData {
  const today = startOfDay(new Date());
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let currentDate = today;
  
  // Sort dates descending
  const sortedDates = activityDates
    .map(d => startOfDay(d))
    .sort((a, b) => b.getTime() - a.getTime());
  
  // Remove duplicates
  const uniqueDates = Array.from(
    new Set(sortedDates.map(d => d.getTime()))
  ).map(t => new Date(t));
  
  // Calculate current streak
  for (const date of uniqueDates) {
    if (isSameDay(date, currentDate)) {
      currentStreak++;
      currentDate = subDays(currentDate, 1);
    } else if (differenceInDays(currentDate, date) > 1) {
      break; // Streak broken
    }
  }
  
  // Calculate longest streak
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0 || differenceInDays(uniqueDates[i - 1], uniqueDates[i]) === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  return {
    currentStreak,
    longestStreak,
    totalActiveDays: uniqueDates.length,
    activityMap: createActivityMap(uniqueDates)
  };
}
```

**Data Query:**
```typescript
const activityDates = await db
  .select({
    date: sql<Date>`DATE(${userTestAttempts.submittedAt})`
  })
  .from(userTestAttempts)
  .where(
    and(
      eq(userTestAttempts.userId, userId),
      eq(userTestAttempts.status, 'submitted'),
      sql`${userTestAttempts.submittedAt} >= NOW() - INTERVAL '365 days'`
    )
  )
  .groupBy(sql`DATE(${userTestAttempts.submittedAt})`)
  .orderBy(sql`DATE(${userTestAttempts.submittedAt}) DESC`);
```

**Component Location:** `/src/components/progress/streak-calendar.tsx`

**Milestone Badges:**
- 🔥 7-Day Streak
- 🔥🔥 30-Day Streak
- 🔥🔥🔥 100-Day Streak
- 🏆 365-Day Streak (Year Champion)

---

#### 3. Goals Dashboard

**Purpose:** Enable users to set, track, and achieve personalized learning goals

**Goal Types:**

**Daily Goals:**
- Questions per day (default: 20)
- Practice sessions (default: 2)
- Study time (default: 60 minutes)
- Specific section focus

**Weekly Goals:**
- Tests completed (default: 5)
- New topics covered (default: 3)
- Accuracy target (default: 75%)
- All sections covered (yes/no)

**Custom Goals:**
- User-defined targets
- Deadline-based goals
- Section-specific goals
- Improvement goals (e.g., "Improve Math by 10%")

**Visual Elements:**
- Progress bars for each goal
- ✅ Completed, 🔄 In Progress, ❌ Not Started icons
- Today's goals summary card
- Weekly goals summary card
- Goal creation button

**Database Schema:**
```sql
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  goal_category VARCHAR(50) NOT NULL, -- 'questions', 'accuracy', 'time', 'tests', 'sections'
  target_value DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed', 'archived'
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_goals_user_status ON user_goals(user_id, status);
CREATE INDEX idx_goals_period ON user_goals(period_start, period_end);
```

**Goal Progress Calculation:**
```typescript
async function updateGoalProgress(userId: string, goalId: string) {
  const goal = await db.query.userGoals.findFirst({
    where: eq(userGoals.id, goalId)
  });
  
  if (!goal) return;
  
  let currentValue = 0;
  
  switch (goal.goalCategory) {
    case 'questions':
      const questionCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userAnswers)
        .where(
          and(
            eq(userAnswers.userId, userId),
            sql`DATE(${userAnswers.answeredAt}) >= ${goal.periodStart}`,
            sql`DATE(${userAnswers.answeredAt}) <= ${goal.periodEnd}`
          )
        );
      currentValue = questionCount[0]?.count || 0;
      break;
      
    case 'tests':
      const testCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userTestAttempts)
        .where(
          and(
            eq(userTestAttempts.userId, userId),
            eq(userTestAttempts.status, 'submitted'),
            sql`DATE(${userTestAttempts.submittedAt}) >= ${goal.periodStart}`,
            sql`DATE(${userTestAttempts.submittedAt}) <= ${goal.periodEnd}`
          )
        );
      currentValue = testCount[0]?.count || 0;
      break;
      
    case 'accuracy':
      const accuracy = await db
        .select({
          avg: sql<number>`AVG((${userTestAttempts.correctAnswers}::float / ${tests.totalQuestions}) * 100)`
        })
        .from(userTestAttempts)
        .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
        .where(
          and(
            eq(userTestAttempts.userId, userId),
            eq(userTestAttempts.status, 'submitted'),
            sql`DATE(${userTestAttempts.submittedAt}) >= ${goal.periodStart}`,
            sql`DATE(${userTestAttempts.submittedAt}) <= ${goal.periodEnd}`,
            goal.sectionId ? eq(tests.sectionId, goal.sectionId) : sql`1=1`
          )
        );
      currentValue = accuracy[0]?.avg || 0;
      break;
      
    case 'time':
      const timeSpent = await db
        .select({ total: sql<number>`SUM(${userTestAttempts.timeSpent})` })
        .from(userTestAttempts)
        .where(
          and(
            eq(userTestAttempts.userId, userId),
            eq(userTestAttempts.status, 'submitted'),
            sql`DATE(${userTestAttempts.submittedAt}) >= ${goal.periodStart}`,
            sql`DATE(${userTestAttempts.submittedAt}) <= ${goal.periodEnd}`
          )
        );
      currentValue = Math.round((timeSpent[0]?.total || 0) / 60); // Convert to minutes
      break;
  }
  
  // Update goal
  const status = currentValue >= goal.targetValue ? 'completed' : 'active';
  await db
    .update(userGoals)
    .set({
      currentValue,
      status,
      completedAt: status === 'completed' ? new Date() : null,
      updatedAt: new Date()
    })
    .where(eq(userGoals.id, goalId));
}
```

**Component Location:** `/src/components/progress/goals-dashboard.tsx`

---

#### 4. Section Coverage Map

**Purpose:** Visualize progress across all exam sections

**Visual Elements:**
- List of all sections with status badges
- Progress bars showing mastery level
- Color-coded status:
  - ✅ Mastered (≥80%)
  - 🟢 Proficient (60-79%)
  - 🟡 Developing (40-59%)
  - 🔴 Needs Work (<40%)
  - ⚪ Not Attempted
- "Practice Now" button for each section

**Coverage Calculation:**
```typescript
const sectionCoverage = await db
  .select({
    sectionId: sections.id,
    sectionName: sections.name,
    totalQuestions: sql<number>`COUNT(${userAnswers.id})`,
    correctAnswers: sql<number>`SUM(CASE WHEN ${userAnswers.isCorrect} THEN 1 ELSE 0 END)`,
    accuracy: sql<number>`AVG(CASE WHEN ${userAnswers.isCorrect} THEN 100 ELSE 0 END)`,
    lastPracticed: sql<Date>`MAX(${userAnswers.answeredAt})`,
    uniqueTopics: sql<number>`COUNT(DISTINCT ${questions.topicId})`
  })
  .from(sections)
  .leftJoin(questions, eq(sections.id, questions.sectionId))
  .leftJoin(userAnswers, eq(questions.id, userAnswers.questionId))
  .where(sql`${userAnswers.userId} = ${userId} OR ${userAnswers.userId} IS NULL`)
  .groupBy(sections.id, sections.name);

function getCoverageStatus(accuracy: number | null) {
  if (accuracy === null) return { status: 'not-attempted', color: 'gray', icon: '⚪' };
  if (accuracy >= 80) return { status: 'mastered', color: 'blue', icon: '✅' };
  if (accuracy >= 60) return { status: 'proficient', color: 'green', icon: '🟢' };
  if (accuracy >= 40) return { status: 'developing', color: 'yellow', icon: '🟡' };
  return { status: 'needs-work', color: 'red', icon: '🔴' };
}
```

**Component Location:** `/src/components/progress/section-coverage-map.tsx`

---

### Phase 2: Gamification Features (MEDIUM PRIORITY)

#### 5. Achievement System

**Purpose:** Reward progress and milestones to increase engagement

**Achievement Categories:**

**Milestone Achievements:**
```typescript
const milestoneAchievements = [
  { id: 1, name: 'First Step', icon: '🎯', description: 'Complete your first test', requirement: 1 },
  { id: 2, name: 'Getting Started', icon: '📝', description: 'Complete 10 tests', requirement: 10 },
  { id: 3, name: 'Dedicated Learner', icon: '📚', description: 'Complete 50 tests', requirement: 50 },
  { id: 4, name: 'Century', icon: '💯', description: 'Complete 100 tests', requirement: 100 },
  { id: 5, name: 'Question Master', icon: '❓', description: 'Answer 1,000 questions', requirement: 1000 },
];
```

**Performance Achievements:**
```typescript
const performanceAchievements = [
  { id: 6, name: 'Perfect Score', icon: '⭐', description: 'Score 100% on any test', requirement: 100 },
  { id: 7, name: 'Excellence', icon: '🏆', description: 'Score 90%+ on a test', requirement: 90 },
  { id: 8, name: 'Improvement', icon: '💪', description: 'Improve section by 20%', requirement: 20 },
  { id: 9, name: 'All-Rounder', icon: '🎓', description: 'Score 75%+ in all sections', requirement: 75 },
];
```

**Streak Achievements:**
```typescript
const streakAchievements = [
  { id: 10, name: 'Week Warrior', icon: '🔥', description: '7-day study streak', requirement: 7 },
  { id: 11, name: 'Month Master', icon: '🔥🔥', description: '30-day study streak', requirement: 30 },
  { id: 12, name: 'Century Streak', icon: '🔥🔥🔥', description: '100-day study streak', requirement: 100 },
  { id: 13, name: 'Year Champion', icon: '🏆', description: '365-day study streak', requirement: 365 },
];
```

**Database Schema:**
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50) NOT NULL, -- 'milestone', 'performance', 'streak', 'coverage', 'speed'
  requirement_type VARCHAR(50) NOT NULL, -- 'tests_count', 'accuracy', 'streak_days', 'questions_count'
  requirement_value INT NOT NULL,
  points INT DEFAULT 10,
  rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  progress DECIMAL DEFAULT 0, -- Track partial progress
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at);
```

**Achievement Unlock Logic:**
```typescript
async function checkAndUnlockAchievements(userId: string, eventType: string, value: number) {
  // Get all relevant achievements for this event
  const achievements = await db.query.achievements.findMany({
    where: eq(achievements.requirementType, eventType)
  });
  
  for (const achievement of achievements) {
    // Check if user already has this achievement
    const existing = await db.query.userAchievements.findFirst({
      where: and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievement.id)
      )
    });
    
    if (!existing) {
      // Check if requirement is met
      if (value >= achievement.requirementValue) {
        // Unlock achievement
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
          progress: 100,
          unlockedAt: new Date()
        });
        
        // Trigger celebration notification
        await triggerAchievementNotification(userId, achievement);
      } else {
        // Update progress
        const progress = (value / achievement.requirementValue) * 100;
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
          progress
        }).onConflictDoUpdate({
          target: [userAchievements.userId, userAchievements.achievementId],
          set: { progress }
        });
      }
    }
  }
}
```

**Component Location:** `/src/components/progress/achievements-grid.tsx`

**Achievement Notification:**
```tsx
<Alert className="border-gold-500 bg-gold-500/10">
  <Trophy className="h-5 w-5 text-gold-500" />
  <AlertTitle>Achievement Unlocked! 🎉</AlertTitle>
  <AlertDescription>
    <strong>{achievement.icon} {achievement.name}</strong>
    <p className="text-sm mt-1">{achievement.description}</p>
  </AlertDescription>
</Alert>
```

---

#### 6. Improvement Metrics

**Purpose:** Show progress trends and motivate continued learning

**Visual Elements:**
- Month-over-month comparison cards
- Most improved sections list
- Consistency score gauge
- Trend arrows (↗️ improving, ↘️ declining, → stable)

**Metrics Calculation:**
```typescript
async function calculateImprovementMetrics(userId: string) {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  
  // This month stats
  const thisMonth = await getMonthStats(userId, thisMonthStart, now);
  
  // Last month stats
  const lastMonth = await getMonthStats(userId, lastMonthStart, lastMonthEnd);
  
  // Calculate improvements
  const improvements = {
    accuracy: {
      current: thisMonth.avgAccuracy,
      previous: lastMonth.avgAccuracy,
      change: thisMonth.avgAccuracy - lastMonth.avgAccuracy,
      percentChange: ((thisMonth.avgAccuracy - lastMonth.avgAccuracy) / lastMonth.avgAccuracy) * 100
    },
    tests: {
      current: thisMonth.testsCompleted,
      previous: lastMonth.testsCompleted,
      change: thisMonth.testsCompleted - lastMonth.testsCompleted
    },
    streak: {
      current: await calculateCurrentStreak(userId),
      // Compare with same point last month
    }
  };
  
  // Most improved sections
  const sectionImprovements = await db
    .select({
      sectionName: sections.name,
      thisMonth: sql<number>`AVG(CASE WHEN DATE(${userAnswers.answeredAt}) >= ${thisMonthStart} THEN CASE WHEN ${userAnswers.isCorrect} THEN 100 ELSE 0 END END)`,
      lastMonth: sql<number>`AVG(CASE WHEN DATE(${userAnswers.answeredAt}) >= ${lastMonthStart} AND DATE(${userAnswers.answeredAt}) <= ${lastMonthEnd} THEN CASE WHEN ${userAnswers.isCorrect} THEN 100 ELSE 0 END END)`
    })
    .from(userAnswers)
    .innerJoin(questions, eq(userAnswers.questionId, questions.id))
    .innerJoin(sections, eq(questions.sectionId, sections.id))
    .where(eq(userAnswers.userId, userId))
    .groupBy(sections.id, sections.name)
    .having(sql`COUNT(*) >= 10`); // Minimum 10 questions for meaningful comparison
  
  const mostImproved = sectionImprovements
    .map(s => ({
      ...s,
      improvement: s.thisMonth - s.lastMonth,
      percentImprovement: ((s.thisMonth - s.lastMonth) / s.lastMonth) * 100
    }))
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 3);
  
  return {
    improvements,
    mostImproved,
    consistencyScore: calculateConsistencyScore(userId)
  };
}

function calculateConsistencyScore(activityDates: Date[]): number {
  // Score based on regularity of practice
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  
  const activeDaysCount = activityDates.filter(date =>
    isWithinInterval(date, { start: last30Days[0], end: last30Days[last30Days.length - 1] })
  ).length;
  
  // Ideal is 5-6 days per week (20-24 days per month)
  const idealDays = 22;
  const score = Math.min((activeDaysCount / idealDays) * 10, 10);
  
  return Math.round(score * 10) / 10; // Round to 1 decimal
}
```

**Component Location:** `/src/components/progress/improvement-metrics.tsx`

---

#### 7. Progress Timeline

**Purpose:** Visual journey of learning milestones

**Visual Elements:**
- Vertical timeline with markers
- Key events (first test, best score, achievements)
- Date labels
- Event icons and descriptions

**Timeline Events:**
```typescript
async function getProgressTimeline(userId: string) {
  const events: TimelineEvent[] = [];
  
  // First test completed
  const firstTest = await db.query.userTestAttempts.findFirst({
    where: and(
      eq(userTestAttempts.userId, userId),
      eq(userTestAttempts.status, 'submitted')
    ),
    orderBy: asc(userTestAttempts.submittedAt),
    with: { test: true }
  });
  
  if (firstTest) {
    events.push({
      type: 'first_test',
      date: firstTest.submittedAt,
      title: 'First Test Completed',
      description: `Scored ${firstTest.score}/${firstTest.totalMarks} (${Math.round((firstTest.score / firstTest.totalMarks) * 100)}%)`,
      icon: '🎯'
    });
  }
  
  // Best score achieved
  const bestScore = await db.query.userTestAttempts.findFirst({
    where: and(
      eq(userTestAttempts.userId, userId),
      eq(userTestAttempts.status, 'submitted')
    ),
    orderBy: desc(sql`(${userTestAttempts.score}::float / ${userTestAttempts.totalMarks})`),
    with: { test: true }
  });
  
  if (bestScore) {
    const percentage = Math.round((bestScore.score / bestScore.totalMarks) * 100);
    events.push({
      type: 'best_score',
      date: bestScore.submittedAt,
      title: 'Best Score Achieved',
      description: `${percentage}% on ${bestScore.test?.title}`,
      icon: '⭐'
    });
  }
  
  // Achievements unlocked
  const achievements = await db.query.userAchievements.findMany({
    where: and(
      eq(userAchievements.userId, userId),
      isNotNull(userAchievements.unlockedAt)
    ),
    orderBy: desc(userAchievements.unlockedAt),
    with: { achievement: true },
    limit: 5
  });
  
  achievements.forEach(ua => {
    events.push({
      type: 'achievement',
      date: ua.unlockedAt!,
      title: 'Achievement Unlocked',
      description: `${ua.achievement.icon} ${ua.achievement.name}`,
      icon: '🏆'
    });
  });
  
  // Milestones (every 10 tests)
  const milestoneTests = await db
    .select({
      count: sql<number>`ROW_NUMBER() OVER (ORDER BY ${userTestAttempts.submittedAt})`,
      date: userTestAttempts.submittedAt
    })
    .from(userTestAttempts)
    .where(and(
      eq(userTestAttempts.userId, userId),
      eq(userTestAttempts.status, 'submitted')
    ))
    .having(sql`MOD(ROW_NUMBER() OVER (ORDER BY ${userTestAttempts.submittedAt}), 10) = 0`);
  
  milestoneTests.forEach(m => {
    events.push({
      type: 'milestone',
      date: m.date,
      title: `${m.count} Tests Completed`,
      description: 'Milestone reached',
      icon: '📚'
    });
  });
  
  // Sort by date descending
  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}
```

**Component Location:** `/src/components/progress/progress-timeline.tsx`

---

### Phase 3: Polish & Enhancement (LOW PRIORITY)

#### 8. Motivational Panel

**Purpose:** Keep users motivated with personalized messages

**Message Types:**
- Encouragement based on recent performance
- Next milestone preview
- Comparison with past self
- Streak maintenance reminders
- Goal completion celebrations

**Message Generation:**
```typescript
function generateMotivationalMessage(userData: UserProgressData): string {
  const messages: string[] = [];
  
  // Performance improvement
  if (userData.improvements.accuracy.change > 5) {
    messages.push(`You're ${Math.round(userData.improvements.accuracy.change)}% better than last month! 🎉`);
  }
  
  // Goal proximity
  const nearGoals = userData.goals.filter(g => 
    g.currentValue / g.targetValue >= 0.8 && g.currentValue / g.targetValue < 1
  );
  if (nearGoals.length > 0) {
    const goal = nearGoals[0];
    const remaining = goal.targetValue - goal.currentValue;
    messages.push(`Only ${remaining} more to hit your ${goal.goalCategory} goal!`);
  }
  
  // Streak achievement
  if (userData.streak.currentStreak >= userData.streak.longestStreak) {
    messages.push(`Your streak is at an all-time high! 🔥`);
  }
  
  // Section mastery
  const masteredSections = userData.sections.filter(s => s.accuracy >= 80).length;
  const totalSections = userData.sections.length;
  if (masteredSections > 0) {
    messages.push(`You've mastered ${masteredSections} out of ${totalSections} sections! 💪`);
  }
  
  // Consistency praise
  if (userData.consistencyScore >= 8) {
    messages.push(`Your consistency is impressive! Keep up the great work! 🌟`);
  }
  
  // Default encouraging message
  if (messages.length === 0) {
    messages.push(`Every question you practice brings you closer to success! 📚`);
  }
  
  return messages[Math.floor(Math.random() * messages.length)];
}
```

**Component Location:** `/src/components/progress/motivational-panel.tsx`

---

#### 9. Study Plan Suggestions

**Purpose:** AI-generated personalized study recommendations

**Recommendation Engine:**
```typescript
function generateStudyPlan(userData: UserProgressData, examDate?: Date): StudyPlan {
  const daysUntilExam = examDate ? differenceInDays(examDate, new Date()) : 30;
  const weakSections = userData.sections
    .filter(s => s.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);
  
  const plan: StudyPlan = {
    priority: [],
    schedule: []
  };
  
  // Priority areas
  if (weakSections.length > 0) {
    plan.priority.push({
      title: `Focus on ${weakSections[0].sectionName}`,
      reason: `Current accuracy: ${Math.round(weakSections[0].accuracy)}%`,
      action: 'Practice this section daily'
    });
  }
  
  // Coverage gaps
  const notAttempted = userData.sections.filter(s => s.totalQuestions === 0);
  if (notAttempted.length > 0) {
    plan.priority.push({
      title: `Start ${notAttempted[0].sectionName}`,
      reason: 'Not yet attempted',
      action: 'Complete at least 1 test'
    });
  }
  
  // Time-based recommendations
  if (daysUntilExam <= 7) {
    plan.schedule = [
      { day: 'Today', activity: 'Full-length mock test', duration: '3 hours' },
      { day: 'Tomorrow', activity: 'Review weak topics', duration: '2 hours' },
      { day: 'Day 3', activity: 'Sectional tests', duration: '2 hours' },
      { day: 'Day 4', activity: 'Speed practice', duration: '1.5 hours' },
      { day: 'Day 5', activity: 'Final mock test', duration: '3 hours' },
      { day: 'Day 6', activity: 'Light review', duration: '1 hour' },
      { day: 'Day 7', activity: 'Rest and confidence building', duration: '30 mins' }
    ];
  } else if (daysUntilExam <= 30) {
    plan.schedule = [
      { day: 'Week 1', activity: 'Focus on weak sections', duration: '2 hrs/day' },
      { day: 'Week 2', activity: 'Mock tests + review', duration: '2.5 hrs/day' },
      { day: 'Week 3', activity: 'All topics revision', duration: '2 hrs/day' },
      { day: 'Week 4', activity: 'Final preparations', duration: '1.5 hrs/day' }
    ];
  }
  
  return plan;
}
```

**Component Location:** `/src/components/progress/study-plan-suggestions.tsx`

---

## API Routes

### 1. GET `/api/progress/overview`

**Purpose:** Fetch all progress data for dashboard

**Response:**
```typescript
{
  readiness: {
    score: 78,
    status: 'Getting There',
    breakdown: [
      { section: 'Math', accuracy: 82, status: 'mastered' },
      { section: 'English', accuracy: 75, status: 'proficient' }
    ]
  },
  streak: {
    current: 7,
    longest: 15,
    totalActiveDays: 42,
    activityMap: { '2024-11-20': true, ... }
  },
  goals: {
    daily: [...],
    weekly: [...],
    custom: [...]
  },
  achievements: {
    unlocked: [...],
    inProgress: [...],
    locked: [...]
  },
  improvements: {
    accuracy: { current: 78, change: +5 },
    tests: { current: 12, change: +4 }
  }
}
```

### 2. POST `/api/goals`

**Purpose:** Create new goal

**Request:**
```typescript
{
  goalType: 'daily' | 'weekly' | 'custom',
  goalCategory: 'questions' | 'tests' | 'accuracy' | 'time',
  targetValue: number,
  periodStart: Date,
  periodEnd: Date,
  sectionId?: string
}
```

### 3. PUT `/api/goals/:id`

**Purpose:** Update goal

### 4. DELETE `/api/goals/:id`

**Purpose:** Delete/archive goal

### 5. GET `/api/achievements`

**Purpose:** Get all achievements with unlock status

### 6. POST `/api/progress/check-achievements`

**Purpose:** Check and unlock achievements after test completion

---

## File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── progress/
│   │       ├── page.tsx                    ✨ Main progress page (server component)
│   │       └── loading.tsx                 Loading skeleton
│   └── api/
│       ├── progress/
│       │   ├── overview/route.ts           GET all progress data
│       │   └── readiness/route.ts          GET readiness calculation
│       ├── goals/
│       │   ├── route.ts                    GET/POST goals
│       │   └── [id]/route.ts               PUT/DELETE specific goal
│       └── achievements/
│           ├── route.ts                    GET achievements
│           └── check/route.ts              POST check unlocks
├── components/
│   └── progress/
│       ├── exam-readiness-card.tsx         Readiness display
│       ├── streak-calendar.tsx             Streak visualization
│       ├── goals-dashboard.tsx             Goal tracking
│       ├── achievements-grid.tsx           Achievement cards
│       ├── improvement-metrics.tsx         Month comparisons
│       ├── section-coverage-map.tsx        Section progress
│       ├── progress-timeline.tsx           Milestone timeline
│       ├── motivational-panel.tsx          Encouragement messages
│       └── study-plan-suggestions.tsx      AI recommendations
└── lib/
    └── progress/
        ├── readiness.ts                    Readiness calculations
        ├── streaks.ts                      Streak logic
        ├── goals.ts                        Goal management
        ├── achievements.ts                 Achievement system
        └── recommendations.ts              Study plan generator
```

---

## Database Migration

```sql
-- Create goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL,
  goal_category VARCHAR(50) NOT NULL,
  target_value DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_goals_user_status ON user_goals(user_id, status);
CREATE INDEX idx_goals_period ON user_goals(period_start, period_end);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50) NOT NULL,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INT NOT NULL,
  points INT DEFAULT 10,
  rarity VARCHAR(20) DEFAULT 'common',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  progress DECIMAL DEFAULT 0,
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at);

-- Optional: Exam dates table
CREATE TABLE IF NOT EXISTS user_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exam_name VARCHAR(100) NOT NULL,
  exam_date DATE NOT NULL,
  target_score INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed initial achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points, rarity) VALUES
-- Milestones
('First Step', 'Complete your first test', '🎯', 'milestone', 'tests_count', 1, 10, 'common'),
('Getting Started', 'Complete 10 tests', '📝', 'milestone', 'tests_count', 10, 20, 'common'),
('Dedicated Learner', 'Complete 50 tests', '📚', 'milestone', 'tests_count', 50, 50, 'rare'),
('Century', 'Complete 100 tests', '💯', 'milestone', 'tests_count', 100, 100, 'epic'),
('Question Master', 'Answer 1,000 questions', '❓', 'milestone', 'questions_count', 1000, 150, 'epic'),

-- Performance
('Perfect Score', 'Score 100% on any test', '⭐', 'performance', 'test_accuracy', 100, 100, 'legendary'),
('Excellence', 'Score 90%+ on a test', '🏆', 'performance', 'test_accuracy', 90, 50, 'rare'),
('Improvement', 'Improve section by 20%', '💪', 'performance', 'section_improvement', 20, 30, 'common'),
('All-Rounder', 'Score 75%+ in all sections', '🎓', 'performance', 'all_sections_threshold', 75, 75, 'epic'),

-- Streaks
('Week Warrior', '7-day study streak', '🔥', 'streak', 'streak_days', 7, 25, 'common'),
('Month Master', '30-day study streak', '🔥🔥', 'streak', 'streak_days', 30, 75, 'rare'),
('Century Streak', '100-day study streak', '🔥🔥🔥', 'streak', 'streak_days', 100, 200, 'epic'),
('Year Champion', '365-day study streak', '🏆', 'streak', 'streak_days', 365, 500, 'legendary'),

-- Coverage
('Explorer', 'Attempt all sections', '🗂️', 'coverage', 'sections_attempted', 100, 30, 'common'),
('Topic Hunter', 'Practice 50 different topics', '🌟', 'coverage', 'topics_practiced', 50, 50, 'rare');
```

---

## Next Steps

1. **Review database schema** - Ensure all tables and indexes are created
2. **Build core queries** - Implement readiness, streak, goals calculations
3. **Create main page** - Server component with all data fetching
4. **Develop components** - Build individual cards and visualizations
5. **Add API routes** - Implement goal and achievement endpoints
6. **Test thoroughly** - Use checklist above
7. **Deploy** - Push to production with migration

---

## Future Enhancements

- **Peer Comparison** (optional) - Compare with other users
- **Study Buddy System** - Connect with other learners
- **Social Sharing** - Share progress on social media
- **AI Coaching** - Personalized tips and recommendations
- **Virtual Study Rooms** - Collaborative learning spaces
- **Progress Challenges** - Weekly/monthly challenges
- **Leaderboards** - Top performers showcase
- **Progress Export** - PDF reports of learning journey
