# Main Dashboard - Requirements & Specifications

## Overview
The Main Dashboard is the primary landing page after login, serving as the central hub that provides quick access to all features, displays key metrics at a glance, and guides users to their next action.

**Route:** `/dashboard`

---

## ⚠️ CURRENT STATUS: BASIC IMPLEMENTATION

A simple card-based navigation dashboard exists, but lacks personalization, real-time data, and contextual recommendations.

---

## 🎯 PURPOSE & USER INTENT

**User Question:** "What should I do next? How am I doing overall?"

**Goals:**
- Provide immediate overview of user's current status
- Quick access to all major features
- Show most relevant information first
- Guide users to their next action
- Display motivational elements (streaks, achievements)
- Personalized experience based on user activity

**Key Difference from Other Dashboards:**
- **Main Dashboard** = Overview + Navigation + Quick Actions
- **Progress Dashboard** = Goal tracking + Readiness assessment
- **Analytics Dashboard** = Deep insights + Trends
- **Practice Dashboard** = Active learning + Weak topics

---

## ✅ CURRENTLY IMPLEMENTED

### 1. Basic Navigation Cards
**Status:** ✅ Exists (Basic)

**What's There:**
- Card-based navigation to main sections:
  - My Tests
  - Progress
  - Analytics
  - Practice Mode
  - Subscription
- Static descriptions
- Icon indicators

**What's Missing:**
- No real data displayed
- No personalization
- No quick actions
- No contextual information
- No activity indicators

**Files:**
- `/src/app/dashboard/page.tsx` - Main dashboard component

---

## 📊 REQUIRED FEATURES

### 1. Welcome Header with User Context
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
- Personalized greeting: "Good morning, [Name]!"
- Time-based greeting (Morning/Afternoon/Evening)
- Current date
- Quick motivation: Last activity, streak status, or encouragement
- User avatar/initials

**Example:**
```
┌─────────────────────────────────────────────────────┐
│  👤 Good morning, Muthu!                           │
│  Sunday, November 24, 2025                         │
│  🔥 You're on a 3-day streak! Keep it going!      │
└─────────────────────────────────────────────────────┘
```

**Data Required:**
- User profile (name, avatar)
- Current time
- Streak data from progress system
- Last activity timestamp

---

### 2. Quick Stats Overview
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
Four key metrics in compact cards:

1. **Tests Completed**
   - Icon: 📝
   - Number: Total submitted tests
   - Trend: This week vs last week

2. **Overall Accuracy**
   - Icon: ✓
   - Percentage: Average across all tests
   - Trend: Improving/Stable/Declining

3. **Current Streak**
   - Icon: 🔥
   - Days: Consecutive practice days
   - Status: "Keep going!" or "Practice today!"

4. **Exam Readiness**
   - Icon: 🎯
   - Percentage: Overall readiness score
   - Status: Ready/Almost/Getting There/Not Ready

**Layout:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 📝 Tests    │ ✓ Accuracy  │ 🔥 Streak   │ 🎯 Readiness│
│ 9           │ 9.3%        │ 3 days      │ 31%         │
│ +2 this wk  │ ⬇️ -5%      │ Active      │ Not Ready   │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Data Source:**
```typescript
// From user_test_attempts
- testsCompleted: COUNT(*)
- overallAccuracy: AVG(accuracy)
- weeklyTests: COUNT(*) WHERE submitted_at > now() - interval '7 days'

// From streak calculator
- currentStreak: calculateStreak(activityDates)

// From readiness calculator
- readiness: calculateReadiness(userStats)
```

---

### 3. Action Recommendations (Smart Suggestions)
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
Contextual suggestions based on user state and activity patterns.

**Recommendation Logic:**

```typescript
function getRecommendations(userData) {
  const recommendations = [];
  
  // No tests taken yet
  if (userData.testsCompleted === 0) {
    recommendations.push({
      type: 'first-test',
      title: 'Take Your First Test',
      description: 'Start your preparation journey',
      action: 'Browse Tests',
      link: '/dashboard/tests',
      priority: 1
    });
  }
  
  // Weak topics identified
  if (userData.weakTopics.length > 0) {
    recommendations.push({
      type: 'weak-topic',
      title: 'Practice Weak Topics',
      description: `You have ${userData.weakTopics.length} areas that need attention`,
      action: 'Start Practice',
      link: '/dashboard/practice',
      priority: 2
    });
  }
  
  // Low readiness
  if (userData.readiness < 60) {
    recommendations.push({
      type: 'improve-readiness',
      title: 'Boost Your Readiness',
      description: 'Practice more to improve your exam readiness',
      action: 'View Recommendations',
      link: '/dashboard/progress',
      priority: 3
    });
  }
  
  // Uncovered sections
  const uncoveredSections = userData.totalSections - userData.sectionsPracticed;
  if (uncoveredSections > 0) {
    recommendations.push({
      type: 'coverage',
      title: 'Explore New Sections',
      description: `${uncoveredSections} sections not practiced yet`,
      action: 'Browse Sections',
      link: '/dashboard/tests',
      priority: 4
    });
  }
  
  // Streak at risk
  if (userData.daysSinceLastActivity === 1) {
    recommendations.push({
      type: 'streak-risk',
      title: 'Maintain Your Streak',
      description: 'Practice today to keep your streak alive!',
      action: 'Quick Practice',
      link: '/dashboard/practice',
      priority: 1,
      urgent: true
    });
  }
  
  // Goal almost complete
  const almostCompleteGoals = userData.goals.filter(g => g.progress >= 80 && g.progress < 100);
  if (almostCompleteGoals.length > 0) {
    recommendations.push({
      type: 'goal-near-complete',
      title: 'Complete Your Goal',
      description: `You're ${100 - almostCompleteGoals[0].progress}% away from completing a goal`,
      action: 'View Goals',
      link: '/dashboard/progress',
      priority: 2
    });
  }
  
  // Recent achievement unlockable
  const nearAchievements = userData.achievements
    .filter(a => !a.isUnlocked && a.progress.percentage >= 80);
  if (nearAchievements.length > 0) {
    recommendations.push({
      type: 'achievement-near',
      title: 'Unlock Achievement',
      description: `${nearAchievements[0].name} is ${nearAchievements[0].progress.percentage}% complete`,
      action: 'View Achievements',
      link: '/dashboard/progress',
      priority: 3
    });
  }
  
  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 3);
}
```

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│  💡 Recommended for You                             │
├─────────────────────────────────────────────────────┤
│  1. 🔴 Practice Weak Topics                         │
│     You have 3 areas that need attention            │
│     [Start Practice →]                              │
├─────────────────────────────────────────────────────┤
│  2. 🎯 Boost Your Readiness                         │
│     Practice more to improve exam readiness (31%)   │
│     [View Recommendations →]                        │
├─────────────────────────────────────────────────────┤
│  3. 📚 Explore New Sections                         │
│     3 sections not practiced yet                    │
│     [Browse Sections →]                             │
└─────────────────────────────────────────────────────┘
```

---

### 4. Recent Activity Feed
**Priority:** MEDIUM ⭐⭐

**What to Show:**
- Last 5 test attempts with:
  - Test name
  - Test type (Practice/Mock/Live/Sectional)
  - Score
  - Date/Time (relative: "2 hours ago")
  - Status indicator (color-coded by accuracy)
- Link to review each test

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  📋 Recent Activity                                 │
├─────────────────────────────────────────────────────┤
│  📝 RRB NTPC Mock Test 1                           │
│     40% • 2 hours ago • [Review →]                  │
├─────────────────────────────────────────────────────┤
│  📝 General Awareness Practice                      │
│     36% • Yesterday • [Review →]                    │
├─────────────────────────────────────────────────────┤
│  📝 Reasoning Practice                              │
│     24% • 2 days ago • [Review →]                   │
├─────────────────────────────────────────────────────┤
│  [View All Tests →]                                 │
└─────────────────────────────────────────────────────┘
```

**Data Query:**
```sql
SELECT 
  uta.id,
  t.name as test_name,
  t.test_type,
  (uta.correct_answers::float / NULLIF(t.total_questions, 0)) * 100 as accuracy,
  uta.submitted_at,
  uta.status
FROM user_test_attempts uta
JOIN tests t ON uta.test_id = t.id
WHERE uta.user_id = ? 
  AND uta.status = 'submitted'
ORDER BY uta.submitted_at DESC
LIMIT 5
```

---

### 5. Quick Actions Panel
**Priority:** MEDIUM ⭐⭐

**What to Show:**
Primary action buttons for common tasks:

1. **Start Quick Practice**
   - Opens quick quiz sheet
   - Most frequently used action
   - Icon: 🎯

2. **Continue Last Test**
   - Resume if there's an in-progress test
   - Icon: ▶️
   - Only shown if applicable

3. **Take Mock Test**
   - Direct to full mock tests
   - Icon: 📝

4. **Review Mistakes**
   - Opens weak topics/recent incorrect answers
   - Icon: 🔍

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  ⚡ Quick Actions                                   │
├─────────────────────────────────────────────────────┤
│  [🎯 Start Quick Practice]  [📝 Take Mock Test]    │
│  [🔍 Review Mistakes]       [📊 View Progress]     │
└─────────────────────────────────────────────────────┘
```

---

### 6. Streak & Goal Widget
**Priority:** MEDIUM ⭐⭐

**What to Show:**
- Current streak with calendar heatmap (last 7 days)
- Active goals progress (top 2 goals)
- Next milestone indicator

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  🔥 3-Day Streak                                    │
│  Mon Tue Wed Thu Fri Sat Sun                        │
│  ○   ●   ●   ●   ○   ○   ○                         │
├─────────────────────────────────────────────────────┤
│  📌 Active Goals                                    │
│  Complete 10 tests: ████████░░ 90%                 │
│  Daily practice: ██████░░░░ 60%                    │
│  [View All Goals →]                                 │
└─────────────────────────────────────────────────────┘
```

---

### 7. Upcoming Events/Reminders
**Priority:** LOW ⭐

**What to Show:**
- Scheduled practice sessions
- Exam date countdown (if set)
- Goal deadlines
- Scheduled reminders

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  📅 Upcoming                                        │
├─────────────────────────────────────────────────────┤
│  🎯 Exam Date: RRB NTPC 2025                       │
│     In 45 days (Jan 8, 2026)                        │
├─────────────────────────────────────────────────────┤
│  📝 Scheduled Practice: Mathematics                 │
│     Today at 6:00 PM                                │
├─────────────────────────────────────────────────────┤
│  🎯 Goal Deadline: Complete 50 tests               │
│     In 12 days                                      │
└─────────────────────────────────────────────────────┘
```

---

### 8. Achievement Highlights
**Priority:** LOW ⭐

**What to Show:**
- Recently unlocked achievements (last 3)
- Next achievement to unlock (closest one)
- Total points earned

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  🏆 Recent Achievements                             │
├─────────────────────────────────────────────────────┤
│  ✅ First Steps • 10 pts                           │
│     Completed your first test                       │
├─────────────────────────────────────────────────────┤
│  🔒 Getting Started • 90% complete                  │
│     Complete 10 tests (9/10)                        │
│     [Complete Now →]                                │
├─────────────────────────────────────────────────────┤
│  Total Points: 10 • [View All →]                   │
└─────────────────────────────────────────────────────┘
```

---

## 📱 RESPONSIVE LAYOUT

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────────┐
│  [Welcome Header]                                           │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│ Quick Stats │ Quick Stats │ Quick Stats │ Quick Stats     │
├─────────────┴─────────────┴─────────────┴─────────────────┤
│  [Action Recommendations - 3 cards in row]                 │
├───────────────────────────────┬─────────────────────────────┤
│  Recent Activity              │  Streak & Goals Widget      │
│  [5 recent tests]             │  [Heatmap + 2 goals]        │
│                               │                             │
├───────────────────────────────┼─────────────────────────────┤
│  Quick Actions Panel          │  Achievement Highlights     │
│  [4 action buttons]           │  [Recent + Next]            │
└───────────────────────────────┴─────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌───────────────────────────────────┐
│  [Welcome Header]                 │
├─────────────┬─────────────────────┤
│ Quick Stats │ Quick Stats         │
├─────────────┴─────────────────────┤
│ Quick Stats │ Quick Stats         │
├───────────────────────────────────┤
│  [Action Recommendations]         │
│  [Stacked vertically]             │
├───────────────────────────────────┤
│  Recent Activity                  │
│  [3 recent tests]                 │
├───────────────────────────────────┤
│  Streak & Goals                   │
│  [Combined widget]                │
└───────────────────────────────────┘
```

### Mobile (< 768px)
```
┌───────────────────────┐
│  [Welcome Header]     │
│  [Compact]            │
├───────────────────────┤
│  Quick Stats Grid     │
│  [2x2 layout]         │
├───────────────────────┤
│  [Top Recommendation] │
│  [Most important 1]   │
├───────────────────────┤
│  Quick Actions        │
│  [2 primary buttons]  │
├───────────────────────┤
│  Recent Activity      │
│  [Latest 3 tests]     │
├───────────────────────┤
│  Streak Indicator     │
│  [Compact heatmap]    │
└───────────────────────┘
```

---

## 🔄 DATA FLOW

```typescript
// Server Component: /src/app/dashboard/page.tsx

async function getDashboardData(userId: string) {
  // 1. User profile
  const user = await getUser(userId);
  
  // 2. Quick stats
  const stats = await db.query(`
    SELECT 
      COUNT(*) as tests_completed,
      AVG(accuracy) as overall_accuracy,
      COUNT(*) FILTER (WHERE submitted_at > now() - interval '7 days') as weekly_tests
    FROM user_test_attempts
    WHERE user_id = ? AND status = 'submitted'
  `);
  
  // 3. Streak data
  const activityDates = await getActivityDates(userId);
  const streakData = calculateStreak(activityDates);
  
  // 4. Readiness score
  const userStats = await getUserStats(userId);
  const readinessData = calculateReadiness(userStats);
  
  // 5. Recent activity
  const recentTests = await getRecentTests(userId, 5);
  
  // 6. Active goals
  const activeGoals = await getActiveGoals(userId);
  
  // 7. Recent achievements
  const recentAchievements = await getRecentAchievements(userId, 3);
  const nextAchievement = await getNextAchievement(userId);
  
  // 8. Weak topics
  const weakTopics = await getWeakTopics(userId);
  
  // 9. Scheduled practices
  const upcomingPractices = await getScheduledPractices(userId);
  
  // 10. Generate recommendations
  const recommendations = getRecommendations({
    stats,
    streakData,
    readinessData,
    weakTopics,
    activeGoals,
    recentAchievements
  });
  
  return {
    user,
    stats,
    streakData,
    readinessData,
    recentTests,
    activeGoals,
    recentAchievements,
    nextAchievement,
    recommendations,
    upcomingPractices
  };
}
```

---

## 🎨 UI COMPONENTS NEEDED

### New Components to Create:
1. `<WelcomeHeader />` - Personalized greeting
2. `<QuickStatsGrid />` - 4 stat cards
3. `<RecommendationsPanel />` - Smart suggestions
4. `<RecentActivityFeed />` - Recent tests list
5. `<QuickActionsPanel />` - Action buttons
6. `<StreakGoalsWidget />` - Combined streak + goals
7. `<UpcomingEventsCard />` - Scheduled items
8. `<AchievementHighlights />` - Recent achievements

### Existing Components to Reuse:
- `<Card>`, `<CardHeader>`, `<CardContent>` - From shadcn
- `<Button>` - For actions
- `<Badge>` - For status indicators
- Streak calendar components - From progress dashboard
- Achievement cards - From progress dashboard

---

## 🔌 API ENDPOINTS NEEDED

### 1. GET `/api/dashboard/overview`
Returns all dashboard data in one call.

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
    currentStreak: number;
    readiness: number;
    weeklyTests: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  recommendations: Recommendation[];
  recentActivity: RecentTest[];
  activeGoals: Goal[];
  achievements: {
    recent: Achievement[];
    next: Achievement;
    totalPoints: number;
  };
  upcoming: UpcomingEvent[];
}
```

### 2. GET `/api/dashboard/stats`
Quick stats only (for polling/updates).

### 3. POST `/api/dashboard/action`
Track dashboard action clicks (analytics).

---

## 📊 ANALYTICS & TRACKING

### Events to Track:
- `dashboard_viewed` - User lands on dashboard
- `quick_action_clicked` - Any quick action button
- `recommendation_clicked` - User follows a recommendation
- `recent_test_reviewed` - Opens test from activity feed
- `goal_clicked` - Opens goal details
- `achievement_viewed` - Opens achievement modal

**Purpose:** Understand which dashboard features are most used and optimize accordingly.

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1 (MVP) - Week 1
1. ✅ Quick Stats Overview (4 cards)
2. ✅ Action Recommendations (top 3)
3. ✅ Recent Activity Feed (last 5 tests)
4. ✅ Welcome Header

### Phase 2 - Week 2
5. ✅ Quick Actions Panel
6. ✅ Streak & Goals Widget
7. ✅ Responsive layout

### Phase 3 (Enhancement) - Week 3
8. ✅ Achievement Highlights
9. ✅ Upcoming Events
10. ✅ Advanced recommendations logic

---

## 🧪 TESTING REQUIREMENTS

### Test Scenarios:
1. **New User (No Data)**
   - Should see welcome message
   - Show "Take First Test" recommendation
   - Empty state for activity feed
   - All stats show 0

2. **Active User**
   - Shows personalized stats
   - Relevant recommendations
   - Recent activity populated
   - Streak and goals visible

3. **Inactive User (Last activity > 7 days)**
   - Shows "Come back" message
   - Recommendation to practice
   - Shows last activity date

4. **High Performer**
   - Shows encouraging stats
   - Recommends new challenges
   - Achievement highlights

5. **Low Performer**
   - Shows improvement recommendations
   - Highlights weak topics
   - Encourages consistent practice

---

## 📈 SUCCESS METRICS

- **Engagement:** % of users who click recommendations
- **Time to Action:** Average time to take first action
- **Feature Usage:** Which quick actions are most used
- **Return Rate:** Users returning to dashboard daily
- **Conversion:** Recommendations → Actual practice sessions

---

## 🚀 FUTURE ENHANCEMENTS

### Version 2.0:
- **AI Chat Assistant:** "Ask me anything about your progress"
- **Personalized Learning Path:** Day-by-day study plan
- **Social Features:** Friend activity, leaderboards
- **Gamification:** Daily challenges, bonus points
- **Notifications Center:** In-app notifications
- **Dashboard Customization:** User can reorder widgets
- **Dark Mode Support:** Theme toggle
- **Export Reports:** Download progress PDF

### Version 3.0:
- **Voice Commands:** "Start a quick practice"
- **Mobile App:** Native dashboard experience
- **Offline Mode:** View stats offline
- **Advanced Analytics:** Predictive scoring, AI insights
- **Integration with Calendar:** Sync study schedule
- **Team/Class Features:** For educators

---

## 📚 RELATED DOCUMENTATION

- [Progress Dashboard Requirements](./progress/progress-requirements.md)
- [Analytics Dashboard Requirements](./analytics/analytics-requirements.md)
- [Practice Mode Requirements](./practice/practice-requirements.md)
- [Streak Calculator Implementation](../../lib/streak-calculator.ts)
- [Readiness Calculator Implementation](../../lib/readiness-calculator.ts)
- [Achievement System Implementation](../../lib/achievements.ts)

---

## 🏗️ ARCHITECTURE DECISIONS

### Why Server Components?
- Dashboard needs fresh data on every load
- No client-side state management complexity
- Better SEO and initial load performance

### Why Single Page vs Multiple Sections?
- Single scrollable page for overview
- Link to dedicated dashboards for deep dives
- Mobile-friendly (less navigation)

### Why Recommendations over Notifications?
- Less intrusive
- Contextual to current state
- User chooses what to act on
- Better UX than pop-ups

---

## ✅ DEFINITION OF DONE

Feature is complete when:
- [ ] All Phase 1 components implemented
- [ ] Responsive on mobile/tablet/desktop
- [ ] Data loads in < 2 seconds
- [ ] Recommendations algorithm working
- [ ] Empty states handled
- [ ] Loading states implemented
- [ ] Error handling in place
- [ ] Tested with different user states
- [ ] Analytics tracking added
- [ ] Documentation updated
- [ ] Code reviewed and merged

---

**Last Updated:** November 24, 2025
**Status:** Requirements Defined - Ready for Implementation
**Owner:** Development Team
**Stakeholders:** Product, UX, Engineering
