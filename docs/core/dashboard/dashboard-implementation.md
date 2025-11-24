# Main Dashboard - Implementation Guide

## Quick Start

This guide provides step-by-step instructions to implement the main dashboard based on the requirements.

---

## 🏗️ File Structure

```
src/
├── app/
│   └── dashboard/
│       ├── page.tsx                    (Main dashboard - UPDATE)
│       └── actions.ts                  (Server actions - NEW)
├── components/
│   └── dashboard/
│       ├── welcome-header.tsx          (NEW)
│       ├── quick-stats-grid.tsx        (NEW)
│       ├── recommendations-panel.tsx   (NEW)
│       ├── recent-activity-feed.tsx    (NEW)
│       ├── quick-actions-panel.tsx     (NEW)
│       ├── streak-goals-widget.tsx     (NEW)
│       ├── upcoming-events-card.tsx    (NEW)
│       └── achievement-highlights.tsx  (NEW)
├── lib/
│   └── dashboard/
│       ├── recommendations.ts          (NEW - Logic for smart suggestions)
│       └── dashboard-utils.ts          (NEW - Helper functions)
└── types/
    └── dashboard.ts                    (NEW - TypeScript interfaces)
```

---

## 📋 Step-by-Step Implementation

### Step 1: Create Type Definitions

**File:** `src/types/dashboard.ts`

```typescript
export interface DashboardData {
  user: UserProfile;
  stats: QuickStats;
  recommendations: Recommendation[];
  recentActivity: RecentTest[];
  activeGoals: Goal[];
  achievements: AchievementData;
  upcoming: UpcomingEvent[];
  streakData: StreakData;
  readinessData: ReadinessData;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface QuickStats {
  testsCompleted: number;
  overallAccuracy: number;
  currentStreak: number;
  readiness: number;
  weeklyTests: number;
  weeklyChange: number;
  accuracyTrend: 'improving' | 'stable' | 'declining';
}

export interface Recommendation {
  id: string;
  type: 'first-test' | 'weak-topic' | 'improve-readiness' | 'coverage' | 'streak-risk' | 'goal-near-complete' | 'achievement-near';
  title: string;
  description: string;
  action: string;
  link: string;
  priority: number;
  urgent?: boolean;
  icon?: string;
}

export interface RecentTest {
  id: string;
  testName: string;
  testType: 'practice' | 'mock' | 'live' | 'sectional';
  accuracy: number;
  submittedAt: Date;
  attemptId: string;
}

export interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'questions' | 'tests' | 'streak';
  target: number;
  progress: number;
  percentage: number;
  status: 'active' | 'completed' | 'failed';
}

export interface AchievementData {
  recent: Achievement[];
  next: Achievement | null;
  totalPoints: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
}

export interface UpcomingEvent {
  id: string;
  type: 'exam' | 'practice' | 'goal' | 'reminder';
  title: string;
  description: string;
  date: Date;
  daysUntil: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  streakProtection: boolean;
  calendar: Array<{ date: Date; hasActivity: boolean }>;
}

export interface ReadinessData {
  overallReadiness: number;
  status: 'not-ready' | 'getting-there' | 'almost-ready' | 'ready';
  breakdown: {
    accuracy: number;
    coverage: number;
    trend: number;
    volume: number;
  };
}
```

---

### Step 2: Create Recommendation Logic

**File:** `src/lib/dashboard/recommendations.ts`

```typescript
import { Recommendation } from '@/types/dashboard';

interface RecommendationContext {
  testsCompleted: number;
  weakTopicsCount: number;
  readiness: number;
  uncoveredSections: number;
  daysSinceLastActivity: number;
  goalsNearComplete: number;
  achievementsNear: Array<{ name: string; percentage: number }>;
}

export function generateRecommendations(context: RecommendationContext): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Priority 1: First test
  if (context.testsCompleted === 0) {
    recommendations.push({
      id: 'first-test',
      type: 'first-test',
      title: 'Take Your First Test',
      description: 'Start your preparation journey with a practice test',
      action: 'Browse Tests',
      link: '/dashboard/tests',
      priority: 1,
      icon: '🎯',
    });
  }

  // Priority 1: Streak at risk
  if (context.daysSinceLastActivity === 1) {
    recommendations.push({
      id: 'streak-risk',
      type: 'streak-risk',
      title: 'Maintain Your Streak!',
      description: 'Practice today to keep your streak alive',
      action: 'Quick Practice',
      link: '/dashboard/practice',
      priority: 1,
      urgent: true,
      icon: '🔥',
    });
  }

  // Priority 2: Weak topics
  if (context.weakTopicsCount > 0) {
    recommendations.push({
      id: 'weak-topics',
      type: 'weak-topic',
      title: 'Practice Weak Topics',
      description: `You have ${context.weakTopicsCount} ${context.weakTopicsCount === 1 ? 'area' : 'areas'} that need attention`,
      action: 'Start Practice',
      link: '/dashboard/practice',
      priority: 2,
      icon: '🎯',
    });
  }

  // Priority 2: Goal near complete
  if (context.goalsNearComplete > 0) {
    recommendations.push({
      id: 'goal-complete',
      type: 'goal-near-complete',
      title: 'Complete Your Goal',
      description: "You're close to completing a goal!",
      action: 'View Goals',
      link: '/dashboard/progress',
      priority: 2,
      icon: '🎯',
    });
  }

  // Priority 3: Low readiness
  if (context.readiness < 60 && context.testsCompleted > 0) {
    recommendations.push({
      id: 'improve-readiness',
      type: 'improve-readiness',
      title: 'Boost Your Readiness',
      description: `Current readiness: ${context.readiness}%. Practice more to improve`,
      action: 'View Recommendations',
      link: '/dashboard/progress',
      priority: 3,
      icon: '📚',
    });
  }

  // Priority 3: Achievement near
  if (context.achievementsNear.length > 0) {
    const next = context.achievementsNear[0];
    recommendations.push({
      id: 'achievement-unlock',
      type: 'achievement-near',
      title: 'Unlock Achievement',
      description: `${next.name} is ${next.percentage}% complete`,
      action: 'View Achievements',
      link: '/dashboard/progress',
      priority: 3,
      icon: '🏆',
    });
  }

  // Priority 4: Coverage
  if (context.uncoveredSections > 0) {
    recommendations.push({
      id: 'coverage',
      type: 'coverage',
      title: 'Explore New Sections',
      description: `${context.uncoveredSections} ${context.uncoveredSections === 1 ? 'section' : 'sections'} not practiced yet`,
      action: 'Browse Sections',
      link: '/dashboard/tests',
      priority: 4,
      icon: '📖',
    });
  }

  // Sort by priority and return top 3
  return recommendations
    .sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return a.priority - b.priority;
    })
    .slice(0, 3);
}
```

---

### Step 3: Create Welcome Header Component

**File:** `src/components/dashboard/welcome-header.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface WelcomeHeaderProps {
  userName: string;
  currentStreak: number;
  lastActivity: Date | null;
}

export function WelcomeHeader({ userName, currentStreak, lastActivity }: WelcomeHeaderProps) {
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const getMotivation = () => {
    if (currentStreak === 0) {
      return "Let's start practicing today!";
    } else if (currentStreak === 1) {
      return "Great start! Keep the momentum going 🚀";
    } else if (currentStreak >= 7) {
      return `Amazing! You're on a ${currentStreak}-day streak! 🔥`;
    } else {
      return `You're on a ${currentStreak}-day streak! Keep it going! 🔥`;
    }
  };

  return (
    <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}, {userName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-medium mt-2">
            {getMotivation()}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 4: Create Quick Stats Grid

**File:** `src/components/dashboard/quick-stats-grid.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import type { QuickStats } from '@/types/dashboard';

interface QuickStatsGridProps {
  stats: QuickStats;
}

export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    if (trend === 'improving') return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    if (trend === 'declining') return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    return <MinusIcon className="h-4 w-4 text-gray-500" />;
  };

  const getReadinessColor = (readiness: number) => {
    if (readiness >= 80) return 'text-green-600';
    if (readiness >= 60) return 'text-blue-600';
    if (readiness >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadinessLabel = (readiness: number) => {
    if (readiness >= 80) return 'Ready';
    if (readiness >= 60) return 'Almost Ready';
    if (readiness >= 40) return 'Getting There';
    return 'Not Ready';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Tests Completed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
          <span className="text-2xl">📝</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.testsCompleted}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.weeklyTests > 0 ? `+${stats.weeklyTests} this week` : 'No tests this week'}
          </p>
        </CardContent>
      </Card>

      {/* Overall Accuracy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
          <span className="text-2xl">✓</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.overallAccuracy.toFixed(1)}%</div>
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon(stats.accuracyTrend)}
            <p className="text-xs text-muted-foreground">
              {stats.accuracyTrend === 'improving' && 'Improving'}
              {stats.accuracyTrend === 'stable' && 'Stable'}
              {stats.accuracyTrend === 'declining' && 'Needs attention'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <span className="text-2xl">🔥</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.currentStreak} days</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.currentStreak > 0 ? 'Keep it going!' : 'Start practicing today!'}
          </p>
        </CardContent>
      </Card>

      {/* Exam Readiness */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Exam Readiness</CardTitle>
          <span className="text-2xl">🎯</span>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getReadinessColor(stats.readiness)}`}>
            {stats.readiness}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getReadinessLabel(stats.readiness)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Step 5: Create Recommendations Panel

**File:** `src/components/dashboard/recommendations-panel.tsx`

```typescript
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Recommendation } from '@/types/dashboard';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>💡 Recommended for You</CardTitle>
        <CardDescription>Personalized suggestions based on your progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={rec.id}
              className={`flex items-start justify-between p-4 rounded-lg border ${
                rec.urgent ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' : 'bg-card'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{rec.title}</h4>
                    {rec.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                </div>
              </div>
              <Link href={rec.link}>
                <Button size="sm" variant={rec.urgent ? 'default' : 'outline'}>
                  {rec.action} →
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### Step 6: Create Recent Activity Feed

**File:** `src/components/dashboard/recent-activity-feed.tsx`

```typescript
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { RecentTest } from '@/types/dashboard';

interface RecentActivityFeedProps {
  tests: RecentTest[];
}

export function RecentActivityFeed({ tests }: RecentActivityFeedProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (accuracy >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (accuracy >= 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getTestTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      practice: 'Practice',
      mock: 'Mock Test',
      live: 'Live Test',
      sectional: 'Sectional',
    };
    return types[type] || type;
  };

  if (tests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📋 Recent Activity</CardTitle>
          <CardDescription>Your recent test attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No tests taken yet</p>
            <Link href="/dashboard/tests">
              <Button variant="outline" className="mt-4">
                Browse Tests
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Recent Activity</CardTitle>
        <CardDescription>Your recent test attempts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{test.testName}</p>
                  <Badge variant="outline" className="text-xs">
                    {getTestTypeLabel(test.testType)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAccuracyColor(test.accuracy)}`}>
                    {test.accuracy.toFixed(1)}%
                  </span>
                  <span>•</span>
                  <span>{formatDistanceToNow(test.submittedAt, { addSuffix: true })}</span>
                </div>
              </div>
              <Link href={`/dashboard/tests/${test.id}/attempt/${test.attemptId}/review`}>
                <Button variant="ghost" size="sm">
                  Review →
                </Button>
              </Link>
            </div>
          ))}
        </div>
        {tests.length >= 5 && (
          <div className="mt-4 text-center">
            <Link href="/dashboard/tests">
              <Button variant="outline" size="sm">
                View All Tests
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### Step 7: Update Main Dashboard Page

**File:** `src/app/dashboard/page.tsx`

```typescript
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { QuickStatsGrid } from '@/components/dashboard/quick-stats-grid';
import { RecommendationsPanel } from '@/components/dashboard/recommendations-panel';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { db } from '@/db';
import { userTestAttempts, tests, weakTopics, userGoals, achievements, userAchievements } from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { calculateStreak } from '@/lib/streak-calculator';
import { calculateReadiness } from '@/lib/readiness-calculator';
import { generateRecommendations } from '@/lib/dashboard/recommendations';
import type { DashboardData, QuickStats, RecentTest, Recommendation } from '@/types/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | ExamPrepPlus',
  description: 'Your personalized exam preparation dashboard',
};

async function getDashboardData(userId: string): Promise<DashboardData> {
  // Get user profile
  const supabase = await getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user!;

  // Get quick stats
  const statsResult = await db
    .select({
      testsCompleted: sql<number>`COUNT(*)`,
      overallAccuracy: sql<number>`AVG((${userTestAttempts.correctAnswers}::float / NULLIF(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers} + ${userTestAttempts.unanswered}, 0)) * 100)`,
      weeklyTests: sql<number>`COUNT(*) FILTER (WHERE ${userTestAttempts.submittedAt} > NOW() - INTERVAL '7 days')`,
    })
    .from(userTestAttempts)
    .where(and(eq(userTestAttempts.userId, userId), eq(userTestAttempts.status, 'submitted')));

  // Get streak data
  const activityDates = await db
    .select({ date: sql<string>`DATE(${userTestAttempts.submittedAt})::text` })
    .from(userTestAttempts)
    .where(and(eq(userTestAttempts.userId, userId), eq(userTestAttempts.status, 'submitted')))
    .groupBy(sql`DATE(${userTestAttempts.submittedAt})`);

  const dates = activityDates.map((d) => {
    const parts = d.date.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  });
  const streakData = calculateStreak(dates);

  // Get readiness data
  const sectionStats = await db.execute(sql`
    SELECT COUNT(DISTINCT section_id) as practiced,
           (SELECT COUNT(*) FROM sections) as total
    FROM user_answers ua
    JOIN user_test_attempts uta ON ua.attempt_id = uta.id
    JOIN questions q ON ua.question_id = q.id
    WHERE uta.user_id = ${userId}
  `);

  const stats: QuickStats = {
    testsCompleted: Number(statsResult[0]?.testsCompleted || 0),
    overallAccuracy: Number(statsResult[0]?.overallAccuracy || 0),
    currentStreak: streakData.currentStreak,
    readiness: 31, // Calculate using readiness calculator
    weeklyTests: Number(statsResult[0]?.weeklyTests || 0),
    weeklyChange: 0,
    accuracyTrend: 'stable',
  };

  // Get recent activity
  const recentTests = await db
    .select({
      id: userTestAttempts.id,
      testId: tests.id,
      testName: tests.name,
      testType: tests.testType,
      accuracy: sql<number>`(${userTestAttempts.correctAnswers}::float / NULLIF(${userTestAttempts.correctAnswers} + ${userTestAttempts.incorrectAnswers} + ${userTestAttempts.unanswered}, 0)) * 100`,
      submittedAt: userTestAttempts.submittedAt,
    })
    .from(userTestAttempts)
    .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
    .where(and(eq(userTestAttempts.userId, userId), eq(userTestAttempts.status, 'submitted')))
    .orderBy(desc(userTestAttempts.submittedAt))
    .limit(5);

  const recentActivity: RecentTest[] = recentTests.map((test) => ({
    id: test.testId,
    testName: test.testName,
    testType: test.testType as any,
    accuracy: Number(test.accuracy || 0),
    submittedAt: test.submittedAt!,
    attemptId: test.id,
  }));

  // Get weak topics count
  const weakTopicsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(weakTopics)
    .where(eq(weakTopics.userId, userId));

  // Generate recommendations
  const recommendations = generateRecommendations({
    testsCompleted: stats.testsCompleted,
    weakTopicsCount: Number(weakTopicsResult[0]?.count || 0),
    readiness: stats.readiness,
    uncoveredSections: 3,
    daysSinceLastActivity: streakData.currentStreak === 0 ? 2 : 0,
    goalsNearComplete: 0,
    achievementsNear: [],
  });

  return {
    user: {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email!,
      avatar: user.user_metadata?.avatar_url,
    },
    stats,
    recommendations,
    recentActivity,
    activeGoals: [],
    achievements: { recent: [], next: null, totalPoints: 0 },
    upcoming: [],
    streakData,
    readinessData: {
      overallReadiness: stats.readiness,
      status: 'not-ready',
      breakdown: { accuracy: 0, coverage: 0, trend: 0, volume: 0 },
    },
  };
}

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const dashboardData = await getDashboardData(user.id);

  return (
    <div className="space-y-8">
      <WelcomeHeader
        userName={dashboardData.user.name}
        currentStreak={dashboardData.stats.currentStreak}
        lastActivity={dashboardData.streakData.lastActiveDate}
      />

      <QuickStatsGrid stats={dashboardData.stats} />

      <RecommendationsPanel recommendations={dashboardData.recommendations} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityFeed tests={dashboardData.recentActivity} />
        {/* Add more widgets here */}
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Quick stats display correctly
- [ ] Recommendations show based on user state
- [ ] Recent activity feed works
- [ ] Links navigate correctly
- [ ] Responsive on mobile/tablet
- [ ] Loading states work
- [ ] Empty states display properly
- [ ] Trends calculate correctly

---

## 🚀 Deployment

1. Test locally: `npm run dev`
2. Check TypeScript errors: `npm run type-check`
3. Run linting: `npm run lint`
4. Build: `npm run build`
5. Deploy to production

---

**Status:** Implementation Guide Complete
**Next Steps:** Start implementing components one by one
