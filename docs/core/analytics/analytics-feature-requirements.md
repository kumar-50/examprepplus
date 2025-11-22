# Analytics Dashboard - Complete Feature Requirements

**Feature Name:** Analytics Dashboard  
**Route:** `/dashboard/analytics`  
**Status:** ❌ Not Implemented (New Feature)  
**Priority:** HIGH  
**Estimated Effort:** 10-14 days

---

## 📋 OVERVIEW

Analytics Dashboard provides comprehensive insights into user performance, learning patterns, and progress trends across all test types (practice, mock, live, sectional).

**User Goal:** "How am I performing? What are my trends? Where should I focus?"

**Key Difference from Progress:**
- **Analytics** = Past performance analysis & insights (backward-looking)
- **Progress** = Future goals & readiness tracking (forward-looking)

---

## 🎯 BUSINESS OBJECTIVES

1. **User Engagement:** Keep users motivated through visible progress
2. **Data-Driven Learning:** Help users make informed study decisions
3. **Retention:** Encourage continued platform usage through insights
4. **Competitive Edge:** Differentiate from basic test platforms

---

## 👥 USER PERSONAS

### 1. Rajesh - Serious Aspirant
- **Goal:** Clear RRB NTPC in 3 months
- **Needs:** Detailed performance breakdown, weak area identification
- **Pain Points:** Doesn't know which sections need more work
- **Use Case:** Checks analytics weekly to adjust study plan

### 2. Priya - Casual Learner
- **Goal:** Improve general knowledge
- **Needs:** Simple overview, motivational insights
- **Pain Points:** Loses motivation without visible progress
- **Use Case:** Checks analytics after each test for quick feedback

### 3. Amit - Data Enthusiast
- **Goal:** Track every metric, optimize performance
- **Needs:** Deep analytics, time analysis, comparative stats
- **Pain Points:** Wants more detailed breakdowns
- **Use Case:** Daily analytics check, exports data for personal tracking

---

## ✅ CORE FEATURES (MVP - Phase 1)

### 1. Overview Statistics Cards
**Priority:** HIGH ⭐⭐⭐  
**Effort:** 4-6 hours  
**Status:** ❌ Not Built

**Description:**
Display key performance metrics in card format at the top of analytics dashboard.

**Metrics to Show:**
1. **Total Tests Taken**
   - Count of all completed test attempts
   - All test types included
   
2. **Total Questions Attempted**
   - Sum across all attempts
   - Shows engagement level
   
3. **Overall Accuracy**
   - Average accuracy across all attempts
   - Color-coded: Red (<60%), Orange (60-79%), Green (80%+)
   
4. **Total Time Spent**
   - Sum of time across all attempts
   - Format: "12h 30m" or "45m"
   
5. **Current Streak**
   - From existing streak system
   - Days of consecutive practice
   
6. **Tests This Week**
   - Count of tests in last 7 days
   - Activity indicator

**UI Design:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 🎯 Tests     │ ❓ Questions │ ✓ Accuracy   │ ⏱️ Time      │
│ 45           │ 1,250        │ 78%          │ 12h 30m      │
│ +3 this week │ +50 today    │ +2% ↗️       │ +45m today   │
└──────────────┴──────────────┴──────────────┴──────────────┘
┌──────────────┬──────────────┐
│ 🔥 Streak    │ 📈 This Week │
│ 7 days       │ 12 tests     │
└──────────────┴──────────────┘
```

**Data Source:**
```sql
-- Query: Get overview stats
SELECT 
  COUNT(*) as total_tests,
  SUM(tests.total_questions) as total_questions,
  AVG((correct_answers::float / NULLIF(tests.total_questions, 0)) * 100) as avg_accuracy,
  SUM(EXTRACT(EPOCH FROM (submitted_at - started_at))/3600) as total_hours
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = $1 AND status = 'submitted'
```

**Acceptance Criteria:**
- [ ] All 6 cards display correct data
- [ ] Numbers update in real-time after new test
- [ ] Cards responsive on mobile (stack vertically)
- [ ] Loading skeleton while fetching
- [ ] Error handling for missing data
- [ ] Color coding matches design system

---

### 2. Accuracy Over Time Chart
**Priority:** HIGH ⭐⭐⭐  
**Effort:** 8-10 hours  
**Status:** ❌ Not Built

**Description:**
Line chart showing accuracy trend over time, helping users visualize improvement or decline.

**Features:**
1. **Time Range Selector:**
   - Last 7 days
   - Last 30 days
   - Last 90 days
   - All time
   - Custom date range

2. **Data Points:**
   - Each test attempt as a point
   - Date on X-axis
   - Accuracy (0-100%) on Y-axis

3. **Trend Line:**
   - Moving average (7-day or 14-day)
   - Shows overall trend direction
   - Smooths out daily variations

4. **Interactive Tooltips:**
   - Date
   - Accuracy percentage
   - Test name
   - Number of questions
   - Test type

5. **Visual Indicators:**
   - Color gradient (red → yellow → green)
   - Benchmark line at 60% (passing score)
   - Best score marker

**UI Design:**
```
┌─────────────────────────────────────────────────────┐
│ Accuracy Over Time              [7d][30d][90d][All]│
│                                                     │
│ 100% ┐                                             │
│      │                    ●                         │
│  80% ┤         ●     ●        ●    ●               │
│      │    ●        ●              ●    ●           │
│  60% ┼────────────────────────────────────────     │
│      │ ●                                            │
│  40% ┤                                              │
│      │                                              │
│   0% └────────────────────────────────────────     │
│      Oct 1   Oct 8   Oct 15   Oct 22   Oct 29     │
└─────────────────────────────────────────────────────┘
```

**Chart Library:** 
- Use `recharts` (already in many Next.js projects)
- Lightweight, React-friendly
- Good documentation

**Data Source:**
```sql
-- Query: Get accuracy trend
SELECT 
  DATE(submitted_at) as date,
  tests.name,
  tests.test_type,
  (correct_answers::float / NULLIF(tests.total_questions, 0) * 100) as accuracy,
  tests.total_questions
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = $1 
  AND status = 'submitted'
  AND submitted_at >= NOW() - INTERVAL '30 days'
ORDER BY submitted_at ASC
```

**Acceptance Criteria:**
- [ ] Chart renders correctly with real data
- [ ] Time range filters work (7d/30d/90d/all)
- [ ] Tooltips show on hover
- [ ] Responsive design (mobile-friendly)
- [ ] Empty state when no data
- [ ] Loading state while fetching
- [ ] Smooth animations

---

### 3. Section-Wise Performance Analysis
**Priority:** HIGH ⭐⭐⭐  
**Effort:** 8-10 hours  
**Status:** ❌ Not Built

**Description:**
Compare performance across all sections to identify strengths and weaknesses.

**Visualization Options:**
1. **Horizontal Bar Chart** (Recommended)
   - Easy to read section names
   - Clear percentage comparison
   
2. **Radar Chart** (Alternative)
   - Shows overall balance
   - Good for visual learners

**Features:**
1. **Section Metrics:**
   - Accuracy percentage
   - Questions attempted
   - Correct vs incorrect
   - Average time per question

2. **Color Coding:**
   - Red: <50% (Needs urgent work)
   - Orange: 50-69% (Needs improvement)
   - Yellow: 70-79% (Good)
   - Green: 80%+ (Excellent)

3. **Sort Options:**
   - By accuracy (ascending/descending)
   - By attempts (most/least practiced)
   - Alphabetical

4. **Interactions:**
   - Click section → Drill down to topic level
   - Hover → Show detailed stats
   - Filter by test type

**UI Design (Bar Chart):**
```
┌─────────────────────────────────────────────────────┐
│ Section Performance         [Sort: Accuracy ▼]     │
│                                                     │
│ Mathematics      ████████████████░░░░ 80%          │
│ General Knowl... ██████████████░░░░░░ 70%          │
│ Reasoning        █████████████░░░░░░░ 65%          │
│ English          ███████░░░░░░░░░░░░░ 35%          │
│ Current Affairs  ░░░░░░░░░░░░░░░░░░░░  0%          │
│                                                     │
│ Questions: 150    Correct: 105    Accuracy: 70%    │
└─────────────────────────────────────────────────────┘
```

**Data Source:**
```sql
-- Query: Section performance
SELECT 
  s.id,
  s.name as section_name,
  COUNT(DISTINCT ua.id) as questions_attempted,
  SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_count,
  (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::float / COUNT(*) * 100) as accuracy,
  AVG(EXTRACT(EPOCH FROM (ua.answered_at - ua.created_at))) as avg_time_seconds
FROM user_answers ua
JOIN questions q ON ua.question_id = q.id
JOIN sections s ON q.section_id = s.id
WHERE ua.user_id = $1
GROUP BY s.id, s.name
ORDER BY accuracy DESC
```

**Acceptance Criteria:**
- [ ] All sections displayed with accurate data
- [ ] Color coding works correctly
- [ ] Sort functionality works
- [ ] Click to drill down implemented
- [ ] Responsive design
- [ ] Empty state for no data
- [ ] Shows "Not Attempted" for unused sections

---

### 4. Test Type Comparison
**Priority:** HIGH ⭐⭐⭐  
**Effort:** 6-8 hours  
**Status:** ❌ Not Built

**Description:**
Compare performance across different test types (Practice, Mock, Live, Sectional).

**Chart Type:** Grouped Bar Chart

**Metrics per Test Type:**
1. Average Accuracy
2. Tests Taken
3. Total Questions
4. Pass Rate (if applicable)

**Features:**
- Side-by-side comparison
- Color-coded by test type
- Click to filter analytics by test type
- Show trends (improving/declining)

**UI Design:**
```
┌─────────────────────────────────────────────────────┐
│ Performance by Test Type                            │
│                                                     │
│     Practice    Mock      Live     Sectional       │
│     ┌──┐       ┌──┐      ┌──┐       ┌──┐          │
│ 100%│██│       │  │      │  │       │  │          │
│  80%│██│       │██│      │  │       │██│          │
│  60%│██│       │██│      │██│       │██│          │
│  40%│██│       │██│      │██│       │██│          │
│     └──┘       └──┘      └──┘       └──┘          │
│     75%        68%       82%        71%            │
│    (12 tests) (5 tests) (8 tests)  (15 tests)     │
└─────────────────────────────────────────────────────┘
```

**Data Source:**
```sql
-- Query: Test type comparison
SELECT 
  test_type,
  COUNT(*) as test_count,
  AVG((correct_answers::float / NULLIF(tests.total_questions, 0)) * 100) as avg_accuracy,
  SUM(tests.total_questions) as total_questions,
  SUM(CASE WHEN (correct_answers::float / NULLIF(tests.total_questions, 0) * 100) >= 60 THEN 1 ELSE 0 END) as passed_count
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = $1 AND status = 'submitted'
GROUP BY test_type
ORDER BY test_type
```

**Acceptance Criteria:**
- [ ] All test types displayed
- [ ] Accurate calculations per type
- [ ] Grouped bars render correctly
- [ ] Shows "Not Attempted" for unused types
- [ ] Responsive design
- [ ] Hover shows detailed stats

---

## 🚀 ADVANCED FEATURES (Phase 2)

### 5. Activity Heatmap
**Priority:** MEDIUM ⭐⭐  
**Effort:** 10-12 hours  
**Status:** ❌ Not Built

**Description:**
GitHub-style contribution calendar showing practice frequency over the past year.

**Features:**
1. **Visual Grid:**
   - 7 rows (days of week)
   - 52 columns (weeks)
   - Color intensity based on activity

2. **Color Scale:**
   - Gray: No activity
   - Light green: 1-2 tests
   - Medium green: 3-5 tests
   - Dark green: 6+ tests

3. **Interactions:**
   - Hover → Show date, tests taken, questions answered
   - Click → Filter analytics by that day
   - Zoom to month view

4. **Stats:**
   - Total active days
   - Longest streak
   - Most productive month

**UI Design:**
```
┌─────────────────────────────────────────────────────┐
│ Activity Over Last Year                    [2024]  │
│                                                     │
│ Mon ░█░░░█████░░░░████░░█████░░░░░█░░░░░░█░░      │
│ Tue ░░░░█░░░░█░░███░░█████░░░████░░░░█████░░      │
│ Wed ████░░█░░░███░░█░░░░░█████░░░████░░░░███      │
│ Thu ░░░█████░░░░████░░░█░░░░░███░░░░█████░░░      │
│ Fri ░░░░░░░████░░░░████████░░░░███████░░░░███     │
│ Sat █████░░░░░█████░░░░░░█████░░░░░░░█████░░░     │
│ Sun ░░░████░░░░░████░░░█░░░████░░░█░░░░████░░     │
│     Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep   │
│                                                     │
│ 156 days active this year  🔥 Longest streak: 15d  │
└─────────────────────────────────────────────────────┘
```

**Library:** Custom component or use `react-calendar-heatmap`

**Data Source:**
```sql
-- Query: Activity heatmap data
SELECT 
  DATE(submitted_at) as date,
  COUNT(*) as test_count,
  SUM(tests.total_questions) as questions_count
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = $1 
  AND status = 'submitted'
  AND submitted_at >= NOW() - INTERVAL '1 year'
GROUP BY DATE(submitted_at)
ORDER BY date
```

**Acceptance Criteria:**
- [ ] Displays full year of data
- [ ] Color intensity accurate
- [ ] Hover tooltips work
- [ ] Empty days shown in gray
- [ ] Stats calculated correctly
- [ ] Responsive (scrollable on mobile)

---

### 6. Difficulty Analysis
**Priority:** MEDIUM ⭐⭐  
**Effort:** 6-8 hours  
**Status:** ❌ Not Built

**Description:**
Analyze performance by question difficulty level (Easy/Medium/Hard).

**Chart Type:** Donut Chart or Stacked Bar Chart

**Metrics:**
1. Accuracy per difficulty
2. Questions attempted per difficulty
3. Distribution of attempts
4. Recommendation engine

**Features:**
- Visual breakdown
- Success rate per difficulty
- Recommendations: "Focus on Medium difficulty"
- Trend over time

**UI Design:**
```
┌─────────────────────────────────────────────────────┐
│ Performance by Difficulty                           │
│                                                     │
│         Easy: 92%  (250 questions)                  │
│              ████████████████████░                  │
│                                                     │
│       Medium: 68%  (180 questions)                  │
│              █████████████░░░░░░░                   │
│                                                     │
│         Hard: 45%  (80 questions)                   │
│              ████████░░░░░░░░░░░░                   │
│                                                     │
│ 💡 Recommendation: Practice more Medium difficulty  │
│    questions to build confidence before Hard.       │
└─────────────────────────────────────────────────────┘
```

**Data Source:**
```sql
-- Query: Difficulty breakdown
SELECT 
  q.difficulty,
  COUNT(*) as attempted,
  SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct,
  (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::float / COUNT(*) * 100) as accuracy
FROM user_answers ua
JOIN questions q ON ua.question_id = q.id
WHERE ua.user_id = $1
GROUP BY q.difficulty
ORDER BY 
  CASE q.difficulty 
    WHEN 'easy' THEN 1 
    WHEN 'medium' THEN 2 
    WHEN 'hard' THEN 3 
  END
```

**Acceptance Criteria:**
- [ ] All difficulty levels shown
- [ ] Percentages calculated correctly
- [ ] Chart renders properly
- [ ] Recommendations generated
- [ ] Empty state handled

---

### 7. Time Analysis
**Priority:** MEDIUM ⭐⭐  
**Effort:** 12-14 hours  
**Status:** ❌ Not Built

**Description:**
Analyze when user performs best (time of day, day of week).

**Sub-Features:**

#### A. Peak Performance Hours
- Heatmap: 24 hours × 7 days
- Shows accuracy by hour
- Identifies best study times

#### B. Best Day of Week
- Bar chart: Monday - Sunday
- Average accuracy per day
- Tests taken per day

#### C. Session Length Analysis
- Distribution of session lengths
- Optimal session length
- Fatigue analysis (accuracy drops over time?)

**UI Design:**
```
┌─────────────────────────────────────────────────────┐
│ When Do You Perform Best?                           │
│                                                     │
│ Peak Hours Heatmap                                  │
│      0  2  4  6  8 10 12 14 16 18 20 22            │
│ Mon  ░  ░  ░  ░  █  █  █  ░  █  ░  ░  ░            │
│ Tue  ░  ░  ░  ░  ░  █  █  █  ░  ░  ░  ░            │
│ Wed  ░  ░  ░  ░  █  █  ░  ░  █  █  ░  ░            │
│ Thu  ░  ░  ░  ░  ░  █  █  █  █  ░  ░  ░            │
│ Fri  ░  ░  ░  ░  █  █  ░  ░  ░  ░  █  █            │
│ Sat  ░  ░  ░  ░  ░  ░  █  █  █  █  █  ░            │
│ Sun  ░  ░  ░  ░  ░  █  █  █  █  █  ░  ░            │
│                                                     │
│ 💡 You perform best between 9-11 AM on weekdays    │
│ 📊 Tuesday is your most productive day (82% avg)   │
└─────────────────────────────────────────────────────┘
```

**Data Sources:**
```sql
-- Query: Performance by hour
SELECT 
  EXTRACT(HOUR FROM started_at) as hour,
  EXTRACT(DOW FROM started_at) as day_of_week,
  AVG((correct_answers::float / NULLIF(tests.total_questions, 0)) * 100) as avg_accuracy,
  COUNT(*) as test_count
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = $1 AND status = 'submitted'
GROUP BY hour, day_of_week
```

**Acceptance Criteria:**
- [ ] Heatmap displays correctly
- [ ] Best time insights generated
- [ ] Day of week chart accurate
- [ ] Recommendations actionable

---

### 8. Learning Insights Panel
**Priority:** MEDIUM ⭐⭐  
**Effort:** 8-10 hours  
**Status:** ❌ Not Built

**Description:**
AI-generated insights and recommendations based on user data.

**Insight Categories:**

1. **Improvement Insights:**
   - "Your accuracy improved 15% this month! 🎉"
   - "You're doing better in Mock tests than Practice"

2. **Warning Insights:**
   - "Your accuracy has dropped 10% in the last week ⚠️"
   - "You haven't practiced in 3 days"

3. **Pattern Insights:**
   - "You perform best on Tuesday mornings"
   - "You're more consistent on weekdays"

4. **Recommendation Insights:**
   - "Practice more Medium difficulty questions"
   - "Focus on English section (35% accuracy)"
   - "Try shorter study sessions (you do better)"

**UI Design:**
```
┌─────────────────────────────────────────────────────┐
│ Your Learning Insights                              │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ 🎉 Great Progress!                              ││
│ │ Your accuracy improved 15% this month           ││
│ │ Keep up the excellent work!                     ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ 💡 Recommendation                               ││
│ │ Focus on English section (35% accuracy)         ││
│ │ [Practice Now]                                  ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ 📊 Performance Pattern                          ││
│ │ You perform best between 9-11 AM on weekdays    ││
│ │ Schedule important practice during these hours  ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Logic:**
```typescript
function generateInsights(userData: AnalyticsData): Insight[] {
  const insights = [];
  
  // Improvement detection
  if (userData.monthlyImprovement > 10) {
    insights.push({
      type: 'success',
      icon: '🎉',
      title: 'Great Progress!',
      message: `Your accuracy improved ${userData.monthlyImprovement}% this month`,
    });
  }
  
  // Weak section detection
  const weakSections = userData.sections.filter(s => s.accuracy < 50);
  if (weakSections.length > 0) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Needs Attention',
      message: `${weakSections[0].name} needs more practice (${weakSections[0].accuracy}%)`,
      action: 'Practice Now',
      actionUrl: `/practice?section=${weakSections[0].id}`
    });
  }
  
  // Pattern detection
  if (userData.bestTimeOfDay) {
    insights.push({
      type: 'info',
      icon: '📊',
      title: 'Performance Pattern',
      message: `You perform best ${userData.bestTimeOfDay}`,
    });
  }
  
  return insights;
}
```

**Acceptance Criteria:**
- [ ] At least 3-5 insight types implemented
- [ ] Insights update based on real data
- [ ] Action buttons work (navigate to practice)
- [ ] Dismissible insights
- [ ] Refresh weekly

---

## 💡 NICE-TO-HAVE FEATURES (Phase 3)

### 9. Topic Mastery Matrix
**Priority:** LOW ⭐  
**Effort:** 8-10 hours

Grid view of all topics with mastery status (Mastered/In Progress/Needs Work/Not Attempted).

---

### 10. Test History Timeline
**Priority:** LOW ⭐  
**Effort:** 6-8 hours

Chronological list of all tests with filters and search.

---

### 11. Comparative Analysis (Optional)
**Priority:** LOW ⭐  
**Effort:** 12-14 hours

Anonymous comparison with other users, percentile rankings.

---

### 12. Export Functionality
**Priority:** LOW ⭐  
**Effort:** 4-6 hours

Export analytics as PDF or CSV.

---

## 🗄️ DATABASE SCHEMA

### Existing Tables (No Changes Needed)
- ✅ `user_test_attempts` - All test attempts
- ✅ `user_answers` - Individual question answers
- ✅ `tests` - Test metadata
- ✅ `questions` - Question details
- ✅ `sections` - Section information
- ✅ `topics` - Topic information

### Optional: Performance Cache Table

```sql
-- Optional: For performance optimization
CREATE TABLE user_analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tests_taken INTEGER DEFAULT 0,
  questions_attempted INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2),
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_analytics_cache_user_date ON user_analytics_cache(user_id, date);
```

**Purpose:** Cache daily aggregates for faster queries on large datasets.

**Trade-off:** 
- ✅ Faster queries
- ❌ Need to update cache after each test
- ❌ More storage space

**Recommendation:** Start without cache, add only if performance issues arise.

---

## 🎨 UI/UX DESIGN GUIDELINES

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ Analytics Dashboard                    [Date Range] │
├─────────────────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│ │Card│ │Card│ │Card│ │Card│ │Card│ │Card│  Stats │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘        │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐│
│ │ Accuracy Over Time Chart                        ││
│ │                                                 ││
│ └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────┬──────────────────────────┐│
│ │ Section Performance  │ Test Type Comparison     ││
│ │                      │                          ││
│ └──────────────────────┴──────────────────────────┘│
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐│
│ │ Activity Heatmap                                ││
│ └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐│
│ │ Learning Insights Panel                         ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Color Palette
- **Primary:** Blue (#3b82f6) - Main actions
- **Success:** Green (#22c55e) - Good performance (>80%)
- **Warning:** Orange (#f97316) - Needs improvement (60-79%)
- **Danger:** Red (#ef4444) - Poor performance (<60%)
- **Neutral:** Gray (#6b7280) - Inactive/no data

### Responsive Design
- **Desktop (1024px+):** Full layout, side-by-side charts
- **Tablet (768-1023px):** Stacked charts, 2-column cards
- **Mobile (<768px):** Single column, simplified charts

---

## 🔧 TECHNICAL IMPLEMENTATION

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Drizzle ORM
- **Charts:** Recharts (lightweight, React-friendly)
- **UI Components:** shadcn/ui (existing)
- **Date Handling:** date-fns (existing)
- **Styling:** Tailwind CSS (existing)

### File Structure
```
/src/app/dashboard/analytics/
  └── page.tsx                    # Main analytics page

/src/components/analytics/
  ├── overview-cards.tsx          # Stats cards
  ├── accuracy-chart.tsx          # Line chart
  ├── section-performance.tsx     # Bar/Radar chart
  ├── test-type-comparison.tsx    # Grouped bars
  ├── activity-heatmap.tsx        # Calendar heatmap
  ├── difficulty-chart.tsx        # Donut chart
  ├── time-analysis.tsx           # Heatmap + bars
  ├── insights-panel.tsx          # AI insights
  └── date-range-picker.tsx       # Filter component

/src/lib/analytics/
  ├── queries.ts                  # Database queries
  ├── calculations.ts             # Analytics calculations
  └── insights-generator.ts       # AI insights logic

/src/app/api/analytics/
  ├── overview/route.ts           # GET overview stats
  ├── accuracy-trend/route.ts     # GET accuracy data
  ├── section-performance/route.ts
  ├── test-comparison/route.ts
  ├── activity/route.ts
  └── insights/route.ts
```

### Performance Considerations
1. **Data Pagination:** Load limited date ranges initially
2. **Lazy Loading:** Load charts on scroll (Intersection Observer)
3. **Caching:** Use React Query or SWR for client-side caching
4. **Debouncing:** Debounce filter changes (300ms)
5. **Loading States:** Skeleton loaders for better UX
6. **Error Boundaries:** Graceful error handling

---

## 📊 METRICS & KPIs

### Success Metrics
1. **Adoption Rate:** % of users visiting analytics page
2. **Engagement:** Average time spent on analytics
3. **Retention:** Users returning to analytics weekly
4. **Action Rate:** % clicking insights → practice

### Performance Metrics
1. **Page Load Time:** <2 seconds
2. **Chart Render Time:** <500ms
3. **API Response Time:** <1 second

---

## ✅ ACCEPTANCE CRITERIA

Analytics Dashboard is complete when:

- [ ] All 8 core features implemented and tested
- [ ] Mobile responsive design works perfectly
- [ ] Loading states for all components
- [ ] Error handling for missing/invalid data
- [ ] Empty states for new users
- [ ] Data accuracy verified (manual calculation matches)
- [ ] Performance benchmarks met (<2s page load)
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Documentation complete

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Core MVP (Week 1-2)
**Goal:** Basic working analytics dashboard

**Features:**
1. Overview Stats Cards (Day 1)
2. Accuracy Over Time Chart (Day 2-3)
3. Section Performance Chart (Day 4-5)
4. Test Type Comparison (Day 6)

**Deliverables:**
- Analytics page route
- 4 core components
- API endpoints
- Basic styling

**Estimated Time:** 6-8 days

---

### Phase 2: Advanced Features (Week 3)
**Goal:** Add depth and insights

**Features:**
5. Activity Heatmap (Day 1-2)
6. Difficulty Analysis (Day 3)
7. Time Analysis (Day 4-5)
8. Learning Insights (Day 6)

**Deliverables:**
- 4 additional components
- Insights engine
- Advanced queries

**Estimated Time:** 6 days

---

### Phase 3: Polish & Optimization (Week 4)
**Goal:** Production-ready quality

**Tasks:**
- Mobile optimization
- Performance tuning
- Error handling
- Loading states
- Empty states
- Testing
- Documentation

**Estimated Time:** 4-5 days

---

## 📝 TESTING CHECKLIST

### Functional Testing
- [ ] All charts display correct data
- [ ] Filters work (date range, test type)
- [ ] Tooltips show on hover
- [ ] Navigation works (drill-down, links)
- [ ] Empty states display properly
- [ ] Error states handled gracefully

### Data Accuracy
- [ ] Manual calculation matches system calculation
- [ ] Edge cases handled (0 tests, 100% accuracy)
- [ ] Date ranges filter correctly
- [ ] All test types included

### Performance Testing
- [ ] Page loads in <2 seconds
- [ ] Charts render in <500ms
- [ ] No memory leaks
- [ ] Smooth scrolling and animations

### Responsive Testing
- [ ] Desktop (1920×1080, 1366×768)
- [ ] Tablet (iPad, Surface)
- [ ] Mobile (iPhone, Android)
- [ ] Portrait and landscape modes

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 🔗 INTEGRATION POINTS

### Links FROM Analytics TO:
- Practice Mode: "Practice weak sections"
- Test Dashboard: "Take a test"
- Section Details: Click on section → Drill down

### Links TO Analytics FROM:
- Main Dashboard: "View Analytics" card
- Test Results: "See detailed analytics" button
- Practice Mode: "View your stats"
- Navigation Menu: Analytics link

---

## 🎓 FUTURE ENHANCEMENTS (Beyond MVP)

1. **AI Predictions:** "You'll likely score 85% on next test"
2. **Peer Comparison:** Anonymous benchmarking
3. **Custom Dashboards:** User-configurable widgets
4. **Data Export:** CSV, PDF, Excel
5. **Email Reports:** Weekly/monthly summaries
6. **Goal Integration:** Link with progress goals
7. **Voice Insights:** "Tell me how I'm doing"
8. **Mobile App:** Native analytics experience

---

## 📞 SUPPORT & DOCUMENTATION

### For Developers
- API documentation in `/docs/api/analytics.md`
- Component storybook
- Database schema documentation

### For Users
- Help tooltip on each chart
- "How to read this" explainers
- Video tutorial (future)

---

## 🎯 PRIORITY SUMMARY

**MUST HAVE (Phase 1):**
1. ✅ Overview Stats Cards
2. ✅ Accuracy Over Time
3. ✅ Section Performance
4. ✅ Test Type Comparison

**SHOULD HAVE (Phase 2):**
5. ✅ Activity Heatmap
6. ✅ Difficulty Analysis
7. ✅ Time Analysis
8. ✅ Learning Insights

**NICE TO HAVE (Phase 3):**
9. Topic Mastery Matrix
10. Test History Timeline
11. Comparative Analysis
12. Export Functionality

---

**Total Estimated Effort:** 10-14 days  
**Target Launch:** 3-4 weeks  
**Team Size:** 1-2 developers

---

*Last Updated: November 22, 2025*
