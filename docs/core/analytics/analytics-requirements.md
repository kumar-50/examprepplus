# Analytics Dashboard - Requirements & Specifications

## Overview
Analytics Dashboard provides deep insights into learning patterns, performance trends, and comprehensive test analysis across all test types.

**Route:** `/dashboard/analytics`

---

## ❌ CURRENT STATUS: NOT IMPLEMENTED

This is a **new feature** to be built from scratch.

---

## 🎯 PURPOSE & USER INTENT

**User Question:** "How am I performing? What are my trends and patterns?"

**Goals:**
- Understand overall performance across all tests
- Identify patterns and trends over time
- Compare performance across sections/topics/test types
- Discover learning insights (best time, consistency, etc.)
- Make data-driven study decisions

---

## 📊 REQUIRED FEATURES

### 1. Overview Statistics Cards
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
- **Total Tests Taken** - Count of all test attempts
- **Total Questions Attempted** - Sum across all tests
- **Overall Accuracy** - Average across all attempts
- **Total Time Spent** - Cumulative study time
- **Current Streak** - Consecutive days with activity
- **Tests This Week** - Activity indicator

**Layout:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 🎯 Tests     │ ❓ Questions │ ✓ Accuracy   │ ⏱️ Time Spent│
│ 45           │ 1,250        │ 78%          │ 12h 30m      │
└──────────────┴──────────────┴──────────────┴──────────────┘
┌──────────────┬──────────────┐
│ 🔥 Streak    │ 📈 This Week │
│ 7 days       │ 12 tests     │
└──────────────┴──────────────┘
```

**Data Source:**
```sql
SELECT 
  COUNT(*) as total_tests,
  SUM(tests.total_questions) as total_questions,
  AVG((correct_answers::float / NULLIF(tests.total_questions, 0)) * 100) as avg_accuracy,
  SUM(EXTRACT(EPOCH FROM (submitted_at - started_at))/3600) as total_hours
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = ? AND status = 'submitted'
```

---

### 2. Accuracy Over Time Graph
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
- Line chart showing accuracy trend
- Configurable time range: 7d / 30d / 90d / All time
- Data points for each test
- Moving average line (smoothed trend)
- Color-coded by test type (optional)

**Chart Type:** Line Chart (using recharts)

**Features:**
- Tooltip showing exact date, score, test name
- Zoom/pan for long timelines
- Toggle between test types
- Export as image

**Data:**
```sql
SELECT 
  DATE(submitted_at) as date,
  AVG((correct_answers::float / NULLIF(tests.total_questions, 0)) * 100) as accuracy,
  COUNT(*) as test_count,
  test_type
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = ? AND status = 'submitted'
  AND submitted_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(submitted_at), test_type
ORDER BY date
```

---

### 3. Section-Wise Performance Analysis
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
- Horizontal bar chart comparing all sections
- Accuracy percentage per section
- Color gradient (red → yellow → green)
- Sort options: alphabetical, accuracy, attempts
- Click to drill down

**Chart Type:** Horizontal Bar Chart or Radar Chart

**Additional Metrics:**
- Questions attempted per section
- Time spent per section
- Average difficulty attempted

**Data:**
```sql
SELECT 
  s.name as section_name,
  COUNT(DISTINCT ua.id) as questions_attempted,
  SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct_count,
  (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::float / COUNT(*) * 100) as accuracy
FROM user_answers ua
JOIN questions q ON ua.question_id = q.id
JOIN sections s ON q.section_id = s.id
WHERE ua.user_id = ?
GROUP BY s.id, s.name
ORDER BY accuracy ASC
```

---

### 4. Test Type Comparison
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
- Compare performance across test types:
  - Practice Tests
  - Mock Tests
  - Live Tests
  - Sectional Tests
- Metrics per type:
  - Average score
  - Tests taken
  - Total questions
  - Pass rate (if applicable)

**Chart Type:** Grouped Bar Chart

**Data:**
```sql
SELECT 
  test_type,
  COUNT(*) as test_count,
  AVG((correct_answers::float / NULLIF(tests.total_questions, 0)) * 100) as avg_accuracy,
  SUM(tests.total_questions) as total_questions
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = ? AND status = 'submitted'
GROUP BY test_type
```

---

### 5. Activity Heatmap
**Priority:** MEDIUM ⭐⭐

**What to Show:**
- GitHub-style contribution calendar
- Shows practice frequency over past year
- Color intensity = activity level:
  - No activity: gray
  - Low: light green
  - Medium: green
  - High: dark green
- Hover shows: date, tests taken, questions answered

**Chart Type:** Calendar Heatmap

**Data:**
```sql
SELECT 
  DATE(submitted_at) as date,
  COUNT(*) as activity_count
FROM user_test_attempts
WHERE user_id = ? 
  AND status = 'submitted'
  AND submitted_at >= NOW() - INTERVAL '1 year'
GROUP BY DATE(submitted_at)
```

---

### 6. Difficulty Analysis
**Priority:** MEDIUM ⭐⭐

**What to Show:**
- Performance breakdown by difficulty level
- Easy / Medium / Hard
- Donut chart showing distribution
- Success rate per difficulty
- Recommendation: "Focus on Medium difficulty"

**Chart Type:** Donut/Pie Chart

**Data:**
```sql
SELECT 
  q.difficulty,
  COUNT(*) as attempted,
  SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END) as correct,
  (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::float / COUNT(*) * 100) as accuracy
FROM user_answers ua
JOIN questions q ON ua.question_id = q.id
WHERE ua.user_id = ?
GROUP BY q.difficulty
```

---

### 7. Time Analysis
**Priority:** MEDIUM ⭐⭐

**What to Show:**
- **Peak Performance Hours:** Heatmap by hour of day
- **Best Day of Week:** Bar chart showing performance by day
- **Average Session Length:** Gauge or number
- **Time Efficiency:** Accuracy vs time spent scatter plot

**Charts:**
- Heatmap (24 hours × 7 days)
- Bar chart (7 days)
- Time series

**Insights:**
- "You perform best between 9-11 AM"
- "Tuesday is your most productive day"
- "Your average session is 25 minutes"

**Data:**
```sql
-- By hour
SELECT 
  EXTRACT(HOUR FROM started_at) as hour,
  AVG((correct_answers::float / NULLIF(tests.total_questions, 0)) * 100) as avg_accuracy,
  COUNT(*) as test_count
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = ? AND status = 'submitted'
GROUP BY hour
ORDER BY hour

-- By day of week
SELECT 
  EXTRACT(DOW FROM started_at) as day_of_week,
  AVG((correct_answers::float / NULLIF(tests.total_questions, 0)) * 100) as avg_accuracy
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = ? AND status = 'submitted'
GROUP BY day_of_week
```

---

### 8. Learning Insights Panel
**Priority:** MEDIUM ⭐⭐

**What to Show:**
- AI-generated insights from data:
  - "Your accuracy has improved 15% this month"
  - "You struggle with Hard questions in Section X"
  - "You're most consistent on weekdays"
  - "Consider practicing more on weekends"

**Features:**
- Icon-based insight cards
- Actionable recommendations
- Update weekly

---

### 9. Topic Mastery Matrix
**Priority:** LOW ⭐

**What to Show:**
- Grid view of all topics
- Visual indicators:
  - ✅ Mastered (>80%)
  - 🔄 In Progress (50-80%)
  - ❌ Needs Work (<50%)
  - ⚪ Not Attempted
- Click to see topic details

**Chart Type:** Grid/Matrix

**Data:**
```sql
SELECT 
  t.name as topic_name,
  COUNT(*) as attempted,
  (SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::float / COUNT(*) * 100) as accuracy
FROM user_answers ua
JOIN questions q ON ua.question_id = q.id
JOIN topics t ON q.topic_id = t.id
WHERE ua.user_id = ?
GROUP BY t.id, t.name
```

---

### 10. Test History Timeline
**Priority:** LOW ⭐

**What to Show:**
- Chronological list of all tests
- Quick stats per test
- Filter by:
  - Test type
  - Date range
  - Section
  - Score range
- Export to CSV/PDF

**Features:**
- Pagination
- Search
- Sort by date/score

---

### 11. Comparative Analysis
**Priority:** LOW ⭐

**What to Show:**
- Your rank vs other users (optional)
- Percentile ranking per section
- Anonymous leaderboard
- "Better than X% of users"

**Privacy Note:** 
- All comparisons anonymous
- Opt-in feature
- No personal data shared

---

### 12. Monthly/Weekly Reports
**Priority:** LOW ⭐

**What to Show:**
- Summarized performance for period
- Questions attempted
- Best/worst sections
- Improvement metrics
- Downloadable PDF

---

## 🎨 UI/UX DESIGN

### Layout Structure:
```
┌─────────────────────────────────────────────────────┐
│ Analytics Dashboard                          [Filter]│
├─────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │ Tests  │ │Questions│ │Accuracy│ │  Time  │       │
│ └────────┘ └────────┘ └────────┘ └────────┘       │
├─────────────────────────────────────────────────────┤
│ Accuracy Over Time                    [7d|30d|90d]  │
│ ┌─────────────────────────────────────────────────┐ │
│ │         Line Chart                              │ │
│ └─────────────────────────────────────────────────┘ │
├──────────────────────┬──────────────────────────────┤
│ Section Performance  │ Test Type Comparison         │
│ ┌──────────────────┐ │ ┌──────────────────────────┐│
│ │  Radar/Bar Chart │ │ │   Grouped Bar Chart      ││
│ └──────────────────┘ │ └──────────────────────────┘│
├──────────────────────┴──────────────────────────────┤
│ Activity Heatmap                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │     Jan  Feb  Mar  Apr  May  Jun ...           │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Learning Insights                                    │
│ ┌──────────────────┐ ┌──────────────────┐          │
│ │ 💡 Insight 1     │ │ 💡 Insight 2     │          │
│ └──────────────────┘ └──────────────────┘          │
└─────────────────────────────────────────────────────┘
```

### Color Scheme:
- **Success/High:** Green (#22c55e)
- **Warning/Medium:** Orange (#f97316)
- **Danger/Low:** Red (#ef4444)
- **Neutral:** Blue (#3b82f6)
- **Background:** Consistent with app theme

---

## 🔧 TECHNICAL IMPLEMENTATION

### Backend:
```typescript
// /src/app/dashboard/analytics/page.tsx
export default async function AnalyticsPage() {
  const user = await requireAuth();
  
  // Parallel data fetching
  const [
    overviewStats,
    accuracyTrend,
    sectionPerformance,
    testTypeComparison,
    activityData,
    difficultyAnalysis,
    timeAnalysis
  ] = await Promise.all([
    getOverviewStats(user.id),
    getAccuracyTrend(user.id, '30d'),
    getSectionPerformance(user.id),
    getTestTypeComparison(user.id),
    getActivityData(user.id),
    getDifficultyAnalysis(user.id),
    getTimeAnalysis(user.id)
  ]);
  
  return <AnalyticsDashboard data={...} />;
}
```

### Components Needed:
```
/src/components/analytics/
  ├── analytics-overview-cards.tsx     ✨ Stats cards
  ├── accuracy-trend-chart.tsx         ✨ Line chart
  ├── section-performance-chart.tsx    ✨ Radar/Bar chart
  ├── test-type-comparison-chart.tsx   ✨ Grouped bars
  ├── activity-heatmap.tsx             ✨ Calendar heatmap
  ├── difficulty-donut-chart.tsx       ✨ Donut chart
  ├── time-analysis-charts.tsx         ✨ Multiple charts
  ├── learning-insights-panel.tsx      ✨ Insight cards
  └── analytics-filters.tsx            ✨ Date/type filters
```

### Libraries:
- **Charts:** `recharts` (already lightweight, React-friendly)
- **Date:** `date-fns` (already in use)
- **Utilities:** Existing shadcn/ui components

### API Endpoints:
```
GET /api/analytics/overview?userId=xxx
GET /api/analytics/accuracy-trend?userId=xxx&range=30d
GET /api/analytics/section-performance?userId=xxx
GET /api/analytics/test-comparison?userId=xxx
GET /api/analytics/activity?userId=xxx&range=1y
GET /api/analytics/difficulty?userId=xxx
GET /api/analytics/time-analysis?userId=xxx
```

---

## 📊 DATA REQUIREMENTS

### Existing Data (Available):
- ✅ `user_test_attempts` - All test attempts
- ✅ `user_answers` - Individual answers
- ✅ `tests` - Test metadata
- ✅ `questions` - Question details
- ✅ `sections` - Section info
- ✅ `topics` - Topic info

### Computed Data (Need to calculate):
- ❌ Daily/weekly aggregates
- ❌ Moving averages
- ❌ Percentile rankings
- ❌ Streak calculations
- ❌ Best performance times

### Potential New Tables:
```sql
-- Optional: For performance optimization
CREATE TABLE user_analytics_daily (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  tests_taken INT,
  questions_attempted INT,
  correct_answers INT,
  accuracy_percentage DECIMAL,
  time_spent_seconds INT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_analytics_user_date ON user_analytics_daily(user_id, date);
```

---

## 🎯 IMPLEMENTATION PHASES

### Phase 1: Core Analytics (MVP)
**Estimated Time:** 2-3 days

1. Create analytics page route
2. Build overview stats cards
3. Implement accuracy trend chart
4. Add section performance chart
5. Basic styling and responsiveness

### Phase 2: Advanced Charts
**Estimated Time:** 2-3 days

6. Test type comparison
7. Activity heatmap
8. Difficulty analysis
9. Time analysis charts

### Phase 3: Insights & Optimization
**Estimated Time:** 1-2 days

10. Learning insights panel
11. Filters and date range selection
12. Performance optimization
13. Loading states and error handling

### Phase 4: Polish
**Estimated Time:** 1 day

14. Export functionality
15. Mobile responsiveness
16. Accessibility
17. Documentation

**Total Estimated Time:** 6-9 days

---

## 🚀 PRIORITY RECOMMENDATIONS

### Must Have (Phase 1):
1. Overview stats cards
2. Accuracy over time chart
3. Section performance chart
4. Basic filters

### Should Have (Phase 2):
5. Test type comparison
6. Activity heatmap
7. Difficulty analysis

### Nice to Have (Phase 3+):
8. Time analysis
9. Learning insights
10. Topic mastery matrix
11. Comparative analysis
12. Export functionality

---

## 📝 ACCEPTANCE CRITERIA

**Analytics dashboard is complete when:**
- ✅ User can view overview stats at a glance
- ✅ User can see accuracy trends over time
- ✅ User can compare section performance
- ✅ User can filter data by date range
- ✅ All charts load within 2 seconds
- ✅ Mobile responsive
- ✅ Handles empty data gracefully
- ✅ Error handling in place
- ✅ Loading states implemented

---

## 🔗 INTEGRATION POINTS

**Links from Analytics to:**
- Practice Mode - "Practice weak sections"
- Progress - "View goals"
- Test History - "View test details"

**Links to Analytics from:**
- Main Dashboard - "View Analytics"
- Practice Mode - "See detailed stats"
- After test completion - "View performance"

---

## 📦 DELIVERABLES

1. ✨ Analytics page component
2. ✨ 7+ chart components
3. ✨ API endpoints for data
4. ✨ Database queries/helpers
5. ✨ Responsive design
6. ✨ Documentation
7. ✨ Tests (optional)

---

## 🎓 FUTURE ENHANCEMENTS

- AI-powered predictions ("You'll score 85% on next test")
- Compare with past self (month-over-month)
- Custom analytics dashboards
- Data export (CSV/PDF)
- Scheduled reports via email
- Advanced filtering and segmentation
