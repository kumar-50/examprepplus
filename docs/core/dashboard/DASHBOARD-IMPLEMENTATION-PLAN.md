# Dashboard Implementation Plan

## 📋 Executive Summary

This document provides a detailed, step-by-step implementation plan for building the Main Dashboard based on the requirements defined in `dashboard-requirements.md`.

**Timeline:** 3 weeks (15 working days)  
**Current Status:** Basic navigation cards exist  
**Target:** Full-featured, personalized dashboard with smart recommendations

---

## 🎯 Implementation Strategy

### Approach: Incremental Development
- Build in 3 phases (MVP → Enhanced → Advanced)
- Each phase is deployable and testable
- Backend and frontend developed in parallel
- Test after each component completion

### Architecture: Server-Side First
- Primary: React Server Components (RSC)
- Use Server Actions for mutations
- Client components only for interactivity
- Single API endpoint for efficiency (`/api/dashboard/overview`)

---

## 📦 Phase Breakdown

### **PHASE 1: MVP (Week 1) - Days 1-5**
**Goal:** Replace static dashboard with live data

**Deliverables:**
1. ✅ Welcome Header with user context
2. ✅ Quick Stats Overview (4 metrics)
3. ✅ Action Recommendations (smart suggestions)
4. ✅ Recent Activity Feed (last 5 tests)
5. ✅ API endpoint for dashboard data

### **PHASE 2: Enhanced (Week 2) - Days 6-10**
**Goal:** Add engagement and gamification

**Deliverables:**
1. ✅ Quick Actions Panel (4 buttons)
2. ✅ Streak & Goals Widget (heatmap + goals)
3. ✅ Responsive design (mobile/tablet/desktop)
4. ✅ Loading and error states
5. ✅ Empty state handling

### **PHASE 3: Advanced (Week 3) - Days 11-15**
**Goal:** Polish and optimize

**Deliverables:**
1. ✅ Achievement Highlights
2. ✅ Upcoming Events/Reminders
3. ✅ Advanced recommendations logic
4. ✅ Performance optimization
5. ✅ Analytics tracking
6. ✅ Testing and bug fixes

---

## 🗓️ Detailed Implementation Schedule

### **Week 1: MVP Development**

#### **Day 1: Backend Foundation**
**Tasks:**
1. Create database utility functions
   - `getUserStats()` - Aggregate test statistics
   - `getActivityDates()` - Get all practice dates
   - `getRecentTests()` - Last 5 test attempts
   - `getWeakTopics()` - Calculate weak areas

2. Create API endpoint
   - `src/app/api/dashboard/overview/route.ts`
   - Fetch all required data in parallel
   - Handle errors gracefully
   - Add response caching (5 minutes)

3. Test with mock data
   - Verify queries work
   - Check response times (<500ms)

**Files to Create:**
```
src/lib/dashboard/
├── stats.ts           # Stats calculation utilities
├── recommendations.ts # Recommendation engine
└── queries.ts         # Database queries
```

**Success Criteria:**
- ✅ API returns complete dashboard data
- ✅ Response time < 500ms
- ✅ Works with empty user data (new user)

---

#### **Day 2: Welcome Header & Quick Stats**
**Tasks:**
1. Create `<WelcomeHeader />` component
   - Personalized greeting (Good morning/afternoon/evening)
   - User name display
   - Current date
   - Streak status message

2. Create `<QuickStatsGrid />` component
   - 4 stat cards: Tests, Accuracy, Streak, Readiness
   - Show trend indicators (↑ ↓ →)
   - Color coding (green/yellow/red)
   - Responsive grid layout

3. Integrate existing calculators
   - Use `streak-calculator.ts` for streak data
   - Use `readiness-calculator.ts` for readiness score

**Files to Create:**
```
src/components/dashboard/
├── welcome-header.tsx
├── quick-stats-grid.tsx
└── stat-card.tsx
```

**Component Structure:**
```tsx
<WelcomeHeader 
  userName="Muthu"
  currentStreak={3}
  lastActivity={new Date()}
/>

<QuickStatsGrid 
  stats={{
    testsCompleted: 9,
    weeklyTests: 2,
    overallAccuracy: 9.3,
    accuracyTrend: -5,
    currentStreak: 3,
    readiness: 31
  }}
/>
```

**Success Criteria:**
- ✅ Time-based greeting works (morning/afternoon/evening)
- ✅ Stats show real data from database
- ✅ Responsive on mobile (2x2 grid)
- ✅ Shows 0 gracefully for new users

---

#### **Day 3: Recommendations Engine**
**Tasks:**
1. Build recommendation algorithm
   - Analyze user state
   - Generate contextual suggestions
   - Prioritize by importance
   - Limit to top 3 recommendations

2. Implement recommendation types:
   - ✅ `first-test` - New user nudge
   - ✅ `weak-topic` - Practice weak areas
   - ✅ `improve-readiness` - Boost score
   - ✅ `coverage` - Explore new sections
   - ✅ `streak-risk` - Maintain streak
   - ✅ `goal-near-complete` - Finish goal
   - ✅ `achievement-near` - Unlock achievement

3. Create `<RecommendationsPanel />` component
   - Display top 3 recommendations
   - Show actionable buttons
   - Highlight urgent items (red badge)

**Files to Create:**
```
src/lib/dashboard/recommendations.ts
src/components/dashboard/recommendations-panel.tsx
src/components/dashboard/recommendation-card.tsx
```

**Recommendation Algorithm:**
```typescript
interface Recommendation {
  type: string;
  title: string;
  description: string;
  action: string;
  link: string;
  priority: number;
  urgent?: boolean;
}

function getRecommendations(userData): Recommendation[] {
  const recommendations = [];
  
  // Check conditions and add recommendations
  if (condition1) recommendations.push({...});
  if (condition2) recommendations.push({...});
  
  // Sort by priority and return top 3
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}
```

**Success Criteria:**
- ✅ Shows relevant recommendations based on user state
- ✅ Different recommendations for new vs experienced users
- ✅ Urgent recommendations flagged visually
- ✅ Links work correctly

---

#### **Day 4: Recent Activity Feed**
**Tasks:**
1. Create database query for recent tests
   - Last 5 submitted tests
   - Include test name, type, score, date
   - Order by most recent first

2. Create `<RecentActivityFeed />` component
   - List recent tests
   - Show relative time ("2 hours ago")
   - Color-code by accuracy (red/yellow/green)
   - Link to test review page

3. Handle empty state
   - "No tests yet" message
   - CTA to take first test

**Files to Create:**
```
src/components/dashboard/
├── recent-activity-feed.tsx
└── activity-item.tsx
```

**Component Structure:**
```tsx
<RecentActivityFeed 
  tests={[
    {
      id: "123",
      name: "RRB NTPC Mock Test 1",
      testType: "mock",
      accuracy: 40,
      submittedAt: new Date("2025-11-24T10:00:00"),
      totalQuestions: 100
    }
  ]}
/>
```

**Success Criteria:**
- ✅ Shows last 5 tests
- ✅ Relative time display works ("2 hours ago", "Yesterday")
- ✅ Color coding accurate (0-40% red, 41-70% yellow, 71%+ green)
- ✅ Empty state shows correctly
- ✅ Links to test review page

---

#### **Day 5: Integration & Testing**
**Tasks:**
1. Update main dashboard page
   - Replace static cards with new components
   - Fetch data from API
   - Add loading skeleton
   - Add error boundary

2. Create loading states
   - Skeleton loaders for each section
   - Smooth transitions

3. Test with different user scenarios
   - New user (no data)
   - Active user (10+ tests)
   - Inactive user (last activity > 7 days)

4. Deploy Phase 1 to staging

**Files to Update:**
```
src/app/dashboard/page.tsx         # Main integration
src/app/dashboard/loading.tsx      # Loading state
src/app/dashboard/error.tsx        # Error boundary
```

**Dashboard Layout (Phase 1):**
```tsx
export default async function DashboardPage() {
  const data = await getDashboardData();
  
  return (
    <div className="container py-8 space-y-8">
      <WelcomeHeader {...data.user} {...data.streakData} />
      
      <QuickStatsGrid stats={data.stats} />
      
      <RecommendationsPanel 
        recommendations={data.recommendations} 
      />
      
      <RecentActivityFeed tests={data.recentTests} />
    </div>
  );
}
```

**Success Criteria:**
- ✅ All components integrated
- ✅ Loading states smooth
- ✅ Errors handled gracefully
- ✅ Works on mobile/tablet/desktop
- ✅ Phase 1 deployed to staging

---

### **Week 2: Enhanced Features**

#### **Day 6: Quick Actions Panel**
**Tasks:**
1. Create `<QuickActionsPanel />` component
   - 4 primary action buttons
   - Large, clickable cards
   - Icons for each action

2. Implement actions:
   - "Start Quick Practice" → Opens practice mode
   - "Continue Last Test" → Resume in-progress (conditional)
   - "Take Mock Test" → Browse mock tests
   - "Review Mistakes" → View weak topics

3. Add analytics tracking
   - Track which actions are clicked
   - Log to analytics service

**Files to Create:**
```
src/components/dashboard/quick-actions-panel.tsx
src/lib/analytics/track-dashboard-action.ts
```

**Component Structure:**
```tsx
<QuickActionsPanel 
  hasInProgressTest={false}
  weakTopicsCount={3}
/>
```

**Success Criteria:**
- ✅ All buttons functional
- ✅ "Continue" only shows if test in progress
- ✅ Responsive (2x2 on mobile, 4x1 on desktop)
- ✅ Analytics tracking working

---

#### **Day 7: Streak & Goals Widget**
**Tasks:**
1. Create streak calendar heatmap
   - Show last 7 days
   - Color-code by activity (grey=inactive, green=active)
   - Today indicator

2. Display active goals progress
   - Top 2 active goals
   - Progress bars
   - Percentage completion

3. Create combined widget component

**Files to Create:**
```
src/components/dashboard/
├── streak-goals-widget.tsx
├── streak-calendar.tsx
└── goal-progress-item.tsx
```

**Reuse from Progress Dashboard:**
```
src/components/progress/
├── streak-calendar.tsx  (if exists)
└── goal-card.tsx        (if exists)
```

**Component Structure:**
```tsx
<StreakGoalsWidget 
  streakData={{
    currentStreak: 3,
    activityDates: [/* last 7 days */]
  }}
  activeGoals={[
    {
      id: "1",
      title: "Complete 10 tests",
      progress: 90,
      target: 10,
      current: 9
    }
  ]}
/>
```

**Success Criteria:**
- ✅ Heatmap shows correct activity days
- ✅ Today is highlighted
- ✅ Goals show progress accurately
- ✅ Links to full progress page
- ✅ Responsive design

---

#### **Day 8: Responsive Design**
**Tasks:**
1. Implement responsive layouts
   - Desktop (1024px+): Multi-column grid
   - Tablet (768-1023px): 2-column layout
   - Mobile (<768px): Single column

2. Optimize for mobile
   - Touch-friendly buttons (min 44px)
   - Reduce padding/margins
   - Compact stat cards
   - Stack components vertically

3. Test on different screen sizes
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

**Files to Update:**
```
All dashboard components - Add responsive classes
src/app/dashboard/page.tsx - Grid layouts
```

**Tailwind Responsive Classes:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Quick Stats */}
</div>

<div className="grid gap-6 lg:grid-cols-2">
  <RecentActivityFeed />
  <StreakGoalsWidget />
</div>
```

**Success Criteria:**
- ✅ Desktop: 4 columns for stats, 2 columns for widgets
- ✅ Tablet: 2 columns for stats, stacked widgets
- ✅ Mobile: Single column, all stacked
- ✅ No horizontal scrolling
- ✅ Touch targets adequate size

---

#### **Day 9: Loading & Error States**
**Tasks:**
1. Create skeleton loaders
   - Match component shapes
   - Animate with pulse
   - Show immediately while loading

2. Implement error handling
   - Error boundary for each section
   - Fallback UI with retry button
   - Toast notifications for failures

3. Add empty states
   - New user onboarding messages
   - "No data yet" placeholders
   - CTAs for each empty state

**Files to Create:**
```
src/components/dashboard/
├── skeletons/
│   ├── welcome-skeleton.tsx
│   ├── stats-skeleton.tsx
│   ├── recommendations-skeleton.tsx
│   └── activity-skeleton.tsx
└── empty-states/
    ├── empty-activity.tsx
    └── empty-recommendations.tsx
```

**Loading Pattern:**
```tsx
<Suspense fallback={<StatsSkeleton />}>
  <QuickStatsGrid data={data} />
</Suspense>
```

**Error Pattern:**
```tsx
<ErrorBoundary fallback={<ErrorCard retry={refetch} />}>
  <RecentActivityFeed />
</ErrorBoundary>
```

**Success Criteria:**
- ✅ Smooth skeleton animations
- ✅ Errors don't crash the page
- ✅ Empty states user-friendly
- ✅ Retry functionality works

---

#### **Day 10: Phase 2 Testing & Deployment**
**Tasks:**
1. Manual testing
   - Test all features on real accounts
   - Verify responsiveness
   - Check loading states
   - Test error scenarios

2. Performance optimization
   - Measure API response times
   - Optimize database queries
   - Add caching where appropriate
   - Lazy load non-critical components

3. Deploy to staging
   - Run full test suite
   - Get feedback from team
   - Fix critical bugs

**Performance Targets:**
- Initial load: < 2 seconds
- API response: < 500ms
- Time to interactive: < 3 seconds
- Lighthouse score: > 90

**Success Criteria:**
- ✅ All Phase 2 features working
- ✅ Performance targets met
- ✅ No critical bugs
- ✅ Deployed to staging

---

### **Week 3: Advanced Features & Polish**

#### **Day 11: Achievement Highlights**
**Tasks:**
1. Query recent achievements
   - Last 3 unlocked achievements
   - Next closest achievement (80%+ complete)
   - Total points earned

2. Create `<AchievementHighlights />` component
   - Show unlocked achievements with animation
   - Display progress toward next achievement
   - Link to full achievements page

3. Integrate with achievements system
   - Use `src/lib/achievements.ts`
   - Calculate user progress
   - Check unlock conditions

**Files to Create:**
```
src/components/dashboard/
├── achievement-highlights.tsx
└── achievement-card-compact.tsx
```

**Reuse from Progress Dashboard:**
```
src/components/progress/achievement-badge.tsx
```

**Component Structure:**
```tsx
<AchievementHighlights 
  recent={[
    {
      id: "1",
      name: "First Steps",
      description: "Completed first test",
      icon: "🎯",
      points: 10,
      unlockedAt: new Date()
    }
  ]}
  nextAchievement={{
    name: "Getting Started",
    progress: 90,
    requirement: "Complete 10 tests",
    current: 9,
    target: 10
  }}
  totalPoints={10}
/>
```

**Success Criteria:**
- ✅ Shows last 3 achievements
- ✅ Next achievement displays correctly
- ✅ Progress calculation accurate
- ✅ Links to achievements page
- ✅ Animations smooth

---

#### **Day 12: Upcoming Events/Reminders**
**Tasks:**
1. Create events system
   - Exam date countdown
   - Goal deadlines
   - Scheduled practice sessions
   - Study reminders

2. Create `<UpcomingEventsCard />` component
   - List next 3 upcoming events
   - Color-code by urgency
   - Show countdown timers

3. Database schema for events
   - Add to user settings or create new table
   - Store user preferences

**Files to Create:**
```
src/components/dashboard/
├── upcoming-events-card.tsx
└── event-item.tsx

src/lib/dashboard/events.ts
```

**Optional DB Schema:**
```sql
CREATE TABLE user_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50), -- 'exam' | 'practice' | 'goal_deadline'
  title TEXT,
  scheduled_for TIMESTAMP,
  completed BOOLEAN DEFAULT false
);
```

**Component Structure:**
```tsx
<UpcomingEventsCard 
  events={[
    {
      type: "exam",
      title: "RRB NTPC 2025",
      date: new Date("2026-01-08"),
      daysUntil: 45
    },
    {
      type: "practice",
      title: "Mathematics Practice",
      date: new Date("2025-11-24T18:00"),
      daysUntil: 0
    }
  ]}
/>
```

**Success Criteria:**
- ✅ Exam countdown accurate
- ✅ Events sorted by date
- ✅ Color coding for urgency
- ✅ Responsive design
- ✅ Links to relevant pages

---

#### **Day 13: Advanced Recommendations**
**Tasks:**
1. Enhance recommendation algorithm
   - Machine learning-based suggestions (future)
   - Time-of-day preferences
   - Historical pattern analysis
   - Success rate prediction

2. Add more recommendation types:
   - `daily-challenge` - Today's challenge
   - `section-recommendation` - Best section to practice
   - `time-based` - "You usually practice at 6 PM"
   - `peer-comparison` - "Users like you improved by..."

3. A/B test different recommendation strategies
   - Track conversion rates
   - Measure engagement

**Files to Update:**
```
src/lib/dashboard/recommendations.ts
```

**New Recommendation Types:**
```typescript
// Daily Challenge
if (isActiveUser && !hasCompletedToday) {
  recommendations.push({
    type: 'daily-challenge',
    title: 'Today\'s Challenge',
    description: '20 questions on General Awareness',
    action: 'Start Challenge',
    link: '/dashboard/practice?challenge=daily',
    priority: 1
  });
}

// Time-based
if (isPreferredPracticeTime) {
  recommendations.push({
    type: 'time-based',
    title: 'Perfect Time to Practice',
    description: 'You usually practice around this time',
    action: 'Start Now',
    link: '/dashboard/practice',
    priority: 2
  });
}

// Best section
const bestSection = calculateBestSectionToPractice(userData);
if (bestSection) {
  recommendations.push({
    type: 'section-recommendation',
    title: `Practice ${bestSection.name}`,
    description: `You're ready to improve this section`,
    action: 'Start Practice',
    link: `/dashboard/practice?section=${bestSection.id}`,
    priority: 3
  });
}
```

**Success Criteria:**
- ✅ Recommendations are personalized
- ✅ Conversion tracking implemented
- ✅ New types showing correctly
- ✅ Algorithm is data-driven

---

#### **Day 14: Performance & Analytics**
**Tasks:**
1. Performance optimization
   - Database query optimization
   - Add indexes where needed
   - Implement caching strategy
   - Code splitting for components

2. Analytics integration
   - Track dashboard views
   - Track action clicks
   - Track time on page
   - Track scroll depth

3. Implement caching
   - Redis for API responses (5 min TTL)
   - React Query for client caching
   - Static generation where possible

**Caching Strategy:**
```typescript
// API Route with caching
export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  
  // Check cache
  const cached = await redis.get(`dashboard:${userId}`);
  if (cached) return Response.json(cached);
  
  // Fetch data
  const data = await getDashboardData(userId);
  
  // Cache for 5 minutes
  await redis.setex(`dashboard:${userId}`, 300, data);
  
  return Response.json(data);
}
```

**Analytics Events:**
```typescript
// Track dashboard view
trackEvent('dashboard_viewed', {
  user_id: userId,
  timestamp: new Date()
});

// Track recommendation click
trackEvent('recommendation_clicked', {
  user_id: userId,
  type: recommendation.type,
  link: recommendation.link
});

// Track action click
trackEvent('quick_action_clicked', {
  user_id: userId,
  action: actionName
});
```

**Performance Metrics:**
```typescript
// Database queries
- All queries < 200ms
- Use indexes on user_id, submitted_at
- Limit result sets appropriately

// API response
- Total time < 500ms
- Parallel queries where possible
- Use connection pooling

// Frontend
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3s
```

**Success Criteria:**
- ✅ API response < 500ms
- ✅ Page load < 2s
- ✅ All analytics events firing
- ✅ Caching working correctly
- ✅ Lighthouse score > 90

---

#### **Day 15: Testing, Bug Fixes & Launch**
**Tasks:**
1. Comprehensive testing
   - Unit tests for utilities
   - Integration tests for API
   - E2E tests for user flows
   - Cross-browser testing

2. Bug fixes
   - Address all known issues
   - Fix edge cases
   - Handle error scenarios

3. Documentation
   - Update component docs
   - Add API documentation
   - Create user guide

4. Production deployment
   - Deploy to production
   - Monitor for errors
   - Gather user feedback

**Test Scenarios:**
```
1. New User Flow
   - Sign up → Land on dashboard
   - See "Take First Test" recommendation
   - All stats show 0
   - Empty state messages visible

2. Active User Flow
   - Login → See personalized dashboard
   - Recent tests visible
   - Recommendations relevant
   - Stats accurate

3. Inactive User Flow
   - Login after 7 days
   - See "Come back" message
   - Streak reset notification
   - Recommendation to practice

4. High Performer
   - Accuracy > 80%
   - Sees achievement unlocks
   - Gets challenging recommendations

5. Low Performer
   - Accuracy < 40%
   - Sees improvement suggestions
   - Weak topics highlighted
```

**Testing Checklist:**
- [ ] All components render correctly
- [ ] API returns correct data
- [ ] Loading states work
- [ ] Error handling works
- [ ] Responsive on all devices
- [ ] Accessibility (WCAG AA)
- [ ] Performance targets met
- [ ] Analytics tracking works
- [ ] Empty states handled
- [ ] Links all functional

**Deployment Steps:**
1. Run full test suite
2. Build production bundle
3. Deploy to production
4. Run smoke tests
5. Monitor error logs
6. Gather user feedback

**Success Criteria:**
- ✅ All tests passing
- ✅ Zero critical bugs
- ✅ Performance targets met
- ✅ Successfully deployed to production
- ✅ User feedback positive

---

## 📂 File Structure

```
src/
├── app/
│   ├── api/
│   │   └── dashboard/
│   │       ├── overview/
│   │       │   └── route.ts              # Main API endpoint
│   │       ├── stats/
│   │       │   └── route.ts              # Quick stats only
│   │       └── action/
│   │           └── route.ts              # Track actions
│   └── dashboard/
│       ├── page.tsx                      # Main dashboard page (updated)
│       ├── loading.tsx                   # Loading state
│       └── error.tsx                     # Error boundary
│
├── components/
│   └── dashboard/
│       ├── welcome-header.tsx            # NEW
│       ├── quick-stats-grid.tsx          # NEW
│       ├── stat-card.tsx                 # NEW
│       ├── recommendations-panel.tsx     # NEW
│       ├── recommendation-card.tsx       # NEW
│       ├── recent-activity-feed.tsx      # NEW
│       ├── activity-item.tsx             # NEW
│       ├── quick-actions-panel.tsx       # NEW
│       ├── streak-goals-widget.tsx       # NEW
│       ├── streak-calendar.tsx           # NEW
│       ├── goal-progress-item.tsx        # NEW
│       ├── achievement-highlights.tsx    # NEW
│       ├── achievement-card-compact.tsx  # NEW
│       ├── upcoming-events-card.tsx      # NEW
│       ├── event-item.tsx                # NEW
│       ├── skeletons/
│       │   ├── welcome-skeleton.tsx      # NEW
│       │   ├── stats-skeleton.tsx        # NEW
│       │   ├── recommendations-skeleton.tsx  # NEW
│       │   └── activity-skeleton.tsx     # NEW
│       └── empty-states/
│           ├── empty-activity.tsx        # NEW
│           └── empty-recommendations.tsx # NEW
│
└── lib/
    ├── dashboard/
    │   ├── queries.ts                    # NEW - Database queries
    │   ├── stats.ts                      # NEW - Stats calculations
    │   ├── recommendations.ts            # NEW - Recommendation engine
    │   └── events.ts                     # NEW - Events handling
    ├── analytics/
    │   └── track-dashboard-action.ts     # NEW - Analytics tracking
    ├── streak-calculator.ts              # EXISTING - Reuse
    ├── readiness-calculator.ts           # EXISTING - Reuse
    └── achievements.ts                   # EXISTING - Reuse
```

**Total New Files:** ~30 files  
**Total Updated Files:** ~3 files

---

## 🔌 API Endpoints

### 1. GET `/api/dashboard/overview`
**Purpose:** Fetch all dashboard data in one call

**Response:**
```typescript
{
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  stats: {
    testsCompleted: number;
    overallAccuracy: number;
    weeklyTests: number;
    currentStreak: number;
    readiness: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  streakData: {
    currentStreak: number;
    activityDates: Date[];
    streakProtection: boolean;
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    action: string;
    link: string;
    priority: number;
    urgent?: boolean;
  }>;
  recentTests: Array<{
    id: string;
    name: string;
    testType: string;
    accuracy: number;
    submittedAt: Date;
    totalQuestions: number;
  }>;
  activeGoals: Array<{
    id: string;
    title: string;
    progress: number;
    target: number;
    current: number;
    deadline?: Date;
  }>;
  achievements: {
    recent: Array<Achievement>;
    next: Achievement;
    totalPoints: number;
  };
  upcomingEvents: Array<{
    type: string;
    title: string;
    date: Date;
    daysUntil: number;
  }>;
}
```

**Caching:** 5 minutes (Redis)

---

### 2. GET `/api/dashboard/stats`
**Purpose:** Quick stats only (for real-time updates)

**Response:**
```typescript
{
  testsCompleted: number;
  overallAccuracy: number;
  currentStreak: number;
  readiness: number;
}
```

**Caching:** 1 minute

---

### 3. POST `/api/dashboard/action`
**Purpose:** Track user actions for analytics

**Payload:**
```typescript
{
  action: string;        // 'recommendation_clicked' | 'quick_action_clicked'
  metadata: object;      // Additional context
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

---

## 🗃️ Database Queries

### Query 1: User Stats
```sql
SELECT 
  COUNT(*) as tests_completed,
  AVG(
    (correct_answers::float / NULLIF(
      (correct_answers + incorrect_answers + unanswered), 0
    )) * 100
  ) as overall_accuracy,
  COUNT(*) FILTER (
    WHERE submitted_at > NOW() - INTERVAL '7 days'
  ) as weekly_tests
FROM user_test_attempts
WHERE user_id = $1 
  AND status = 'submitted';
```

### Query 2: Recent Tests
```sql
SELECT 
  uta.id,
  t.name,
  t.test_type,
  (uta.correct_answers::float / NULLIF(t.total_questions, 0)) * 100 as accuracy,
  uta.submitted_at,
  t.total_questions
FROM user_test_attempts uta
JOIN tests t ON uta.test_id = t.id
WHERE uta.user_id = $1 
  AND uta.status = 'submitted'
ORDER BY uta.submitted_at DESC
LIMIT 5;
```

### Query 3: Activity Dates (for Streak)
```sql
SELECT DISTINCT DATE(submitted_at) as activity_date
FROM user_test_attempts
WHERE user_id = $1 
  AND status = 'submitted'
ORDER BY activity_date DESC;
```

### Query 4: Weak Topics
```sql
SELECT 
  s.id,
  s.name,
  AVG(
    (uta.correct_answers::float / NULLIF(
      (uta.correct_answers + uta.incorrect_answers + uta.unanswered), 0
    )) * 100
  ) as accuracy
FROM user_test_attempts uta
JOIN tests t ON uta.test_id = t.id
JOIN sections s ON t.section_id = s.id
WHERE uta.user_id = $1 
  AND uta.status = 'submitted'
GROUP BY s.id, s.name
HAVING AVG(
  (uta.correct_answers::float / NULLIF(
    (uta.correct_answers + uta.incorrect_answers + uta.unanswered), 0
  )) * 100
) < 50
ORDER BY accuracy ASC
LIMIT 5;
```

### Query 5: Active Goals
```sql
SELECT 
  id,
  goal_type,
  target_value,
  current_value,
  deadline,
  status
FROM user_goals
WHERE user_id = $1 
  AND status = 'active'
ORDER BY deadline ASC
LIMIT 2;
```

### Query 6: Recent Achievements
```sql
SELECT 
  a.id,
  a.name,
  a.description,
  a.icon,
  a.points,
  ua.unlocked_at
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
WHERE ua.user_id = $1 
  AND ua.is_unlocked = true
ORDER BY ua.unlocked_at DESC
LIMIT 3;
```

---

## 🎨 Component Specifications

### Welcome Header
```tsx
interface WelcomeHeaderProps {
  userName: string;
  currentStreak: number;
  lastActivity: Date | null;
  streakProtection: boolean;
}

export function WelcomeHeader({
  userName,
  currentStreak,
  lastActivity,
  streakProtection
}: WelcomeHeaderProps) {
  const greeting = getTimeBasedGreeting(); // "Good morning" etc.
  const message = getStreakMessage(currentStreak, streakProtection);
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">
        {greeting}, {userName}!
      </h1>
      <p className="text-muted-foreground mt-1">
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </p>
      {message && (
        <p className="text-sm mt-2 flex items-center gap-2">
          🔥 {message}
        </p>
      )}
    </div>
  );
}
```

### Quick Stats Grid
```tsx
interface QuickStatsGridProps {
  stats: {
    testsCompleted: number;
    weeklyTests: number;
    overallAccuracy: number;
    accuracyTrend: number; // +ve or -ve percentage
    currentStreak: number;
    readiness: number;
  };
}

export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon="📝"
        label="Tests Completed"
        value={stats.testsCompleted}
        subtext={`+${stats.weeklyTests} this week`}
      />
      <StatCard
        icon="✓"
        label="Overall Accuracy"
        value={`${stats.overallAccuracy.toFixed(1)}%`}
        subtext={getTrendText(stats.accuracyTrend)}
        trend={stats.accuracyTrend > 0 ? 'up' : 'down'}
      />
      <StatCard
        icon="🔥"
        label="Current Streak"
        value={`${stats.currentStreak} days`}
        subtext={stats.currentStreak > 0 ? 'Active' : 'Practice today!'}
      />
      <StatCard
        icon="🎯"
        label="Exam Readiness"
        value={`${stats.readiness}%`}
        subtext={getReadinessStatus(stats.readiness)}
        color={getReadinessColor(stats.readiness)}
      />
    </div>
  );
}
```

### Recommendations Panel
```tsx
interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationsPanel({ 
  recommendations 
}: RecommendationsPanelProps) {
  if (recommendations.length === 0) {
    return <EmptyRecommendations />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💡 Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <RecommendationCard
            key={rec.type}
            index={index + 1}
            recommendation={rec}
          />
        ))}
      </CardContent>
    </Card>
  );
}
```

---

## ✅ Testing Strategy

### Unit Tests
```typescript
// src/lib/dashboard/__tests__/recommendations.test.ts
describe('getRecommendations', () => {
  it('shows first-test for new users', () => {
    const userData = { testsCompleted: 0 };
    const recs = getRecommendations(userData);
    expect(recs[0].type).toBe('first-test');
  });
  
  it('shows weak-topic when accuracy < 50%', () => {
    const userData = { 
      testsCompleted: 5,
      weakTopics: [{ name: 'Math', accuracy: 30 }]
    };
    const recs = getRecommendations(userData);
    expect(recs.some(r => r.type === 'weak-topic')).toBe(true);
  });
  
  it('limits to top 3 recommendations', () => {
    const userData = { /* many conditions met */ };
    const recs = getRecommendations(userData);
    expect(recs.length).toBeLessThanOrEqual(3);
  });
});
```

### Integration Tests
```typescript
// src/app/api/dashboard/__tests__/overview.test.ts
describe('GET /api/dashboard/overview', () => {
  it('returns all required data', async () => {
    const response = await GET(mockRequest);
    const data = await response.json();
    
    expect(data).toHaveProperty('user');
    expect(data).toHaveProperty('stats');
    expect(data).toHaveProperty('recommendations');
    expect(data).toHaveProperty('recentTests');
  });
  
  it('handles new user correctly', async () => {
    const response = await GET(newUserRequest);
    const data = await response.json();
    
    expect(data.stats.testsCompleted).toBe(0);
    expect(data.recentTests).toHaveLength(0);
    expect(data.recommendations[0].type).toBe('first-test');
  });
});
```

### E2E Tests (Playwright)
```typescript
// e2e/dashboard.spec.ts
test('dashboard loads for active user', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Welcome header
  await expect(page.locator('h1')).toContainText('Good');
  
  // Stats cards
  await expect(page.locator('[data-testid="stat-card"]')).toHaveCount(4);
  
  // Recommendations
  await expect(page.locator('[data-testid="recommendation"]')).toBeVisible();
  
  // Recent activity
  await expect(page.locator('[data-testid="recent-test"]')).toBeVisible();
});

test('recommendation click navigates correctly', async ({ page }) => {
  await page.goto('/dashboard');
  
  await page.click('[data-testid="recommendation-action"]');
  
  await expect(page).toHaveURL(/\/dashboard\/(tests|practice|progress)/);
});
```

---

## 📊 Success Metrics

### Performance Metrics
- **API Response Time:** < 500ms (P95)
- **Page Load Time:** < 2 seconds (P95)
- **Time to Interactive:** < 3 seconds
- **Lighthouse Score:** > 90

### Engagement Metrics
- **Daily Active Users:** % visiting dashboard daily
- **Recommendation Click Rate:** % clicking recommendations
- **Quick Action Usage:** Most used quick actions
- **Time on Dashboard:** Average session duration
- **Return Rate:** % returning within 24 hours

### Quality Metrics
- **Error Rate:** < 1% of requests
- **User Satisfaction:** > 4.5/5 rating
- **Bug Count:** < 5 critical bugs post-launch
- **Accessibility Score:** WCAG AA compliant

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance targets met
- [ ] Security review completed
- [ ] Accessibility audit passed
- [ ] Code review approved
- [ ] Documentation updated

### Deployment
- [ ] Build production bundle
- [ ] Run database migrations (if any)
- [ ] Deploy to staging
- [ ] Smoke test staging
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Verify analytics tracking

### Post-Deployment
- [ ] Monitor performance metrics
- [ ] Check error rates
- [ ] Gather user feedback
- [ ] Track engagement metrics
- [ ] Address critical bugs immediately
- [ ] Plan iteration based on data

---

## 🔄 Future Enhancements (Post-Launch)

### Version 2.0 (Month 2)
1. **AI Chat Assistant**
   - Embedded chat widget
   - Answer questions about progress
   - Personalized study advice

2. **Personalized Learning Path**
   - Day-by-day study plan
   - Adaptive to user performance
   - Goal-oriented roadmap

3. **Social Features**
   - Friend activity feed
   - Leaderboards
   - Group challenges

4. **Dashboard Customization**
   - Drag-and-drop widgets
   - Show/hide sections
   - User preferences

### Version 3.0 (Month 3+)
1. **Mobile App**
   - Native iOS/Android
   - Push notifications
   - Offline mode

2. **Advanced Analytics**
   - Predictive scoring
   - AI-powered insights
   - Performance forecasting

3. **Integration with Calendar**
   - Sync study schedule
   - Automatic reminders
   - Time blocking

4. **Team/Class Features**
   - For educators
   - Student progress tracking
   - Batch analytics

---

## 📚 Resources & Dependencies

### Required Libraries
```json
{
  "dependencies": {
    "date-fns": "^3.0.0",          // Date formatting
    "recharts": "^2.10.0",          // Charts (if needed)
    "redis": "^4.6.0",              // Caching
    "@tanstack/react-query": "^5.0.0",  // Client caching (optional)
    "zod": "^3.22.0"                // Validation
  }
}
```

### Existing Components (Reuse)
- `src/components/ui/*` - shadcn components
- `src/lib/streak-calculator.ts` - Streak calculation
- `src/lib/readiness-calculator.ts` - Readiness scoring
- `src/lib/achievements.ts` - Achievement system
- `src/components/progress/*` - Progress components (if applicable)

### Documentation References
- [dashboard-requirements.md](./dashboard-requirements.md)
- [Progress Dashboard](./progress/progress-requirements.md)
- [Analytics Dashboard](./analytics/analytics-requirements.md)
- [Practice Mode](./practice/practice-requirements.md)

---

## 🤝 Team & Responsibilities

### Backend Developer
- Database queries optimization
- API endpoint implementation
- Caching strategy
- Performance tuning

### Frontend Developer
- Component implementation
- Responsive design
- Loading/error states
- Integration with API

### Product Manager
- Requirements validation
- User testing
- Feedback collection
- Metrics tracking

### Designer
- UI/UX review
- Component styling
- Responsive design review
- Accessibility audit

---

## 📞 Support & Contact

**Questions?** Contact the development team  
**Issues?** Create a GitHub issue  
**Feedback?** Use the feedback form

---

**Document Version:** 1.0  
**Last Updated:** November 24, 2025  
**Status:** Ready for Implementation  
**Estimated Effort:** 3 weeks (15 working days)  
**Team Size:** 2-3 developers + 1 PM + 1 Designer

---

## ✅ Sign-Off

This implementation plan has been reviewed and approved by:

- [ ] Product Manager
- [ ] Lead Developer
- [ ] UX Designer
- [ ] Engineering Manager

**Ready to Start:** ✅  
**Start Date:** [To be scheduled]  
**Target Completion:** [Start Date + 3 weeks]

---

**End of Implementation Plan**
