# Progress Dashboard - Requirements & Specifications

## Overview
Progress Dashboard focuses on personal growth tracking, exam readiness assessment, goal management, and achievement celebration.

**Route:** `/dashboard/progress` or `/dashboard`

---

## ⚠️ CURRENT STATUS: PARTIALLY IMPLEMENTED

Basic dashboard exists, but most progress features are missing.

---

## 🎯 PURPOSE & USER INTENT

**User Question:** "Am I ready for my exam? How close am I to my goals?"

**Goals:**
- Track progress toward exam readiness
- Monitor personal study goals
- Celebrate achievements and milestones
- Maintain motivation through streaks and badges
- See improvement over time
- Get readiness assessment

**Key Difference from Analytics:**
- **Analytics** = Past performance analysis
- **Progress** = Future-oriented goal tracking

---

## ✅ PARTIALLY IMPLEMENTED

### 1. Basic Dashboard
**Status:** ⚠️ Exists but limited

**What's There:**
- Route: `/dashboard` or `/dashboard/tests`
- Basic test list
- Recent test attempts

**What's Missing:**
- No progress visualization
- No goal tracking
- No readiness score
- No achievement system

**Files:**
- `/src/app/dashboard/page.tsx` - Needs enhancement

---

## ❌ NOT IMPLEMENTED

All features below need to be built from scratch.

---

## 📊 REQUIRED FEATURES

### 1. Exam Readiness Score
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
- **Overall Readiness:** Percentage (0-100%)
- **Visual Indicator:** Circular progress or gauge
- **Status:** Not Ready / Getting There / Almost Ready / Ready
- **Breakdown by Section:** Individual readiness per section
- **Time to Exam:** Countdown if exam date set

**Calculation Logic:**
```typescript
function calculateReadiness(userData) {
  // Factors:
  // 1. Overall accuracy (40% weight)
  // 2. Section coverage (30% weight) - practiced all sections?
  // 3. Recent performance (20% weight) - improving?
  // 4. Volume (10% weight) - enough practice?
  
  const accuracyScore = overallAccuracy * 0.4;
  const coverageScore = (sectionsPracticed / totalSections) * 30;
  const trendScore = improvementTrend * 0.2;
  const volumeScore = Math.min(testsCompleted / 50, 1) * 10;
  
  return accuracyScore + coverageScore + trendScore + volumeScore;
}
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│  Exam Readiness                     │
│                                     │
│         ┌──────────┐                │
│         │   78%    │  Getting There │
│         │  ●●●●●○  │                │
│         └──────────┘                │
│                                     │
│  📅 Exam in 15 days                │
│                                     │
│  Section Readiness:                 │
│  ████████░░ Math (80%)             │
│  ██████░░░░ English (60%)          │
│  ████████░░ Science (80%)          │
│  ████░░░░░░ History (40%)          │
└─────────────────────────────────────┘
```

**Data Source:**
```sql
-- Overall stats
SELECT 
  AVG((correct_answers::float / tests.total_questions) * 100) as avg_accuracy,
  COUNT(DISTINCT tests.section_id) as sections_practiced,
  COUNT(*) as total_tests
FROM user_test_attempts
JOIN tests ON user_test_attempts.test_id = tests.id
WHERE user_id = ? AND status = 'submitted'

-- Per section
SELECT 
  s.name,
  AVG((ua.is_correct::int) * 100) as accuracy,
  COUNT(DISTINCT DATE(ua.created_at)) as days_practiced
FROM user_answers ua
JOIN questions q ON ua.question_id = q.id
JOIN sections s ON q.section_id = s.id
WHERE ua.user_id = ?
GROUP BY s.id, s.name
```

---

### 2. Goal Tracking System
**Priority:** HIGH ⭐⭐⭐

**Goal Types:**

#### Daily Goals:
- Questions per day target
- Time spent target
- Practice sessions target
- Specific section practice

#### Weekly Goals:
- Tests completed
- New topics covered
- Accuracy improvement
- All sections covered

#### Custom Goals:
- User-defined targets
- Deadline-based goals
- Section-specific goals

**UI Components:**
```
┌─────────────────────────────────────┐
│  Today's Goals                      │
│                                     │
│  ✅ 20/20 Questions (Done!)        │
│  🔄 2/3 Practice Sessions (67%)    │
│  ⏱️ 45/60 Minutes (75%)            │
│  ❌ Weak Topic Review (0/1)        │
│                                     │
│  [View All Goals]                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Weekly Goals                       │
│                                     │
│  Target Accuracy: 75%               │
│  Current: 78% ✅                    │
│                                     │
│  Tests This Week: 10                │
│  █████████░ 9/10 (90%)             │
│                                     │
│  All Sections Covered:              │
│  ████░░ 4/6 sections               │
└─────────────────────────────────────┘
```

**Database Schema:**
```sql
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50), -- 'daily', 'weekly', 'custom'
  goal_category VARCHAR(50), -- 'questions', 'accuracy', 'time', 'tests'
  target_value DECIMAL,
  current_value DECIMAL DEFAULT 0,
  period_start DATE,
  period_end DATE,
  section_id UUID REFERENCES sections(id), -- NULL for overall goals
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_goals_user ON user_goals(user_id, status);
```

**API Endpoints:**
```
POST /api/goals - Create goal
GET /api/goals?userId=xxx&status=active - Get goals
PUT /api/goals/:id - Update goal
DELETE /api/goals/:id - Delete goal
GET /api/goals/progress - Calculate current progress
```

---

### 3. Study Streak Tracking
**Priority:** HIGH ⭐⭐⭐

**What to Show:**
- **Current Streak:** Consecutive days with activity
- **Longest Streak:** Personal best
- **Streak Calendar:** Visual representation
- **Streak Protection:** 1-day grace period (optional)
- **Milestones:** 7-day, 30-day, 100-day badges

**UI Layout:**
```
┌─────────────────────────────────────┐
│  Study Streak                       │
│                                     │
│      🔥 7 Days Streak               │
│         Keep it going!              │
│                                     │
│  Longest Streak: 15 days            │
│  Total Active Days: 42              │
│                                     │
│  Su Mo Tu We Th Fr Sa               │
│  ✓  ✓  ✓  ✓  ✓  ✓  ✓               │
│  ✓  ✓  ○  ○  ○  ○  ○               │
│                                     │
│  Next Milestone: 30 days (23 left)  │
└─────────────────────────────────────┘
```

**Streak Logic:**
```typescript
function calculateStreak(activityDates: Date[]): number {
  const today = startOfDay(new Date());
  let streak = 0;
  let currentDate = today;
  
  const sortedDates = activityDates
    .map(d => startOfDay(d))
    .sort((a, b) => b.getTime() - a.getTime());
  
  for (const date of sortedDates) {
    if (isSameDay(date, currentDate)) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else if (differenceInDays(currentDate, date) > 1) {
      break; // Streak broken
    }
  }
  
  return streak;
}
```

**Database:**
```sql
-- Use existing data
SELECT DISTINCT DATE(created_at) as activity_date
FROM user_test_attempts
WHERE user_id = ? AND status = 'submitted'
ORDER BY activity_date DESC
LIMIT 365
```

---

### 4. Achievement System
**Priority:** MEDIUM ⭐⭐

**Achievement Categories:**

#### Milestone Achievements:
- 🎯 First Test Completed
- 📝 10 Tests Completed
- 📚 50 Tests Completed
- 💯 100 Tests Completed
- ❓ 100 Questions Answered
- ❓ 500 Questions Answered
- ❓ 1,000 Questions Answered

#### Performance Achievements:
- ⭐ First Perfect Score (100%)
- 🏆 90%+ Accuracy on Test
- 💪 Improved Section by 20%
- 🎓 All Sections Above 75%

#### Streak Achievements:
- 🔥 7-Day Streak
- 🔥 30-Day Streak
- 🔥 100-Day Streak
- 📅 30 Consecutive Days

#### Coverage Achievements:
- 🗂️ All Sections Attempted
- 🌟 All Topics Covered
- 📖 Practiced Every Day This Week

#### Speed Achievements:
- ⚡ Speed Demon (Fast completion)
- 🎯 Accuracy + Speed Master

**UI Layout:**
```
┌─────────────────────────────────────┐
│  Achievements                       │
│                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐    │
│  │ 🎯    │ │ 📝    │ │ 💯    │    │
│  │First  │ │ 10    │ │Perfect│    │
│  │Test   │ │Tests  │ │Score  │    │
│  └───────┘ └───────┘ └───────┘    │
│                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐    │
│  │ 🔥    │ │ 🏆    │ │ 📚    │    │
│  │7-Day  │ │90%+   │ │ 50    │    │
│  │Streak │ │Score  │ │Tests  │    │
│  └───────┘ └───────┘ └───────┘    │
│                                     │
│  Locked:                            │
│  🔒 30-Day Streak (15 days left)   │
│  🔒 1000 Questions (500 to go)     │
│                                     │
│  [View All Achievements (12/25)]   │
└─────────────────────────────────────┘
```

**Database Schema:**
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- emoji or icon name
  category VARCHAR(50),
  requirement_type VARCHAR(50), -- 'tests_count', 'accuracy', 'streak', etc.
  requirement_value INT,
  points INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements ON user_achievements(user_id);
```

---

### 5. Progress Timeline
**Priority:** MEDIUM ⭐⭐

**What to Show:**
- Visual timeline of learning journey
- Key milestones marked
- Improvement indicators
- Important events (first test, best score, etc.)

**UI Layout:**
```
┌─────────────────────────────────────┐
│  Your Progress Timeline             │
│                                     │
│  Nov 2024                           │
│  ━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│      First test completed           │
│      Score: 65%                     │
│                                     │
│  Oct 2024                           │
│  ━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━  │
│            Best score: 92%          │
│            Practice test            │
│                                     │
│  Sep 2024                           │
│  ━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━  │
│                Account created      │
└─────────────────────────────────────┘
```

---

### 6. Improvement Metrics
**Priority:** MEDIUM ⭐⭐

**What to Show:**
- **This Month vs Last Month:**
  - Accuracy change (+5%)
  - Tests completed (+8)
  - Sections improved (3)
- **Most Improved Section:**
  - Show top 3
  - Percentage gain
- **Consistency Score:**
  - Based on regularity
  - Study pattern analysis

**UI Layout:**
```
┌─────────────────────────────────────┐
│  This Month's Improvements          │
│                                     │
│  Accuracy: 78% (+5% ↗️)            │
│  Tests: 12 (+4 ↗️)                 │
│  Streak: 15 days (+10 ↗️)          │
│                                     │
│  Most Improved Sections:            │
│  1. 📈 Math: 65% → 82% (+17%)      │
│  2. 📈 Science: 70% → 83% (+13%)   │
│  3. 📈 English: 80% → 88% (+8%)    │
│                                     │
│  Consistency: ████████░░ 8.5/10    │
└─────────────────────────────────────┘
```

---

### 7. Section Coverage Map
**Priority:** LOW ⭐

**What to Show:**
- Visual grid of all sections
- Coverage status per section:
  - ✅ Mastered (>80%)
  - 🟢 Proficient (60-80%)
  - 🟡 Developing (40-60%)
  - 🔴 Needs Work (<40%)
  - ⚪ Not Attempted
- Click for detailed section view

**UI Layout:**
```
┌─────────────────────────────────────┐
│  Section Coverage                   │
│                                     │
│  ✅ Math (85%)                      │
│  🟢 English (72%)                   │
│  ✅ Science (88%)                   │
│  🟡 History (55%)                   │
│  🔴 Geography (35%)                 │
│  ⚪ Economics (Not attempted)       │
│                                     │
│  Overall Coverage: 5/6 sections     │
└─────────────────────────────────────┘
```

---

### 8. Motivational Dashboard
**Priority:** LOW ⭐

**What to Show:**
- Daily motivation quote
- Encouraging messages based on progress
- Next milestone preview
- Comparison with past self

**Examples:**
- "You're 15% better than last month! 🎉"
- "Only 3 more tests to hit your weekly goal!"
- "Your streak is at an all-time high! 🔥"
- "You've mastered 4 out of 6 sections! 💪"

---

### 9. Study Plan Suggestions
**Priority:** LOW ⭐

**What to Show:**
- AI-generated study recommendations
- "Focus on X this week"
- Personalized schedule
- Exam preparation countdown plan

**Example:**
```
┌─────────────────────────────────────┐
│  Recommended Study Plan             │
│                                     │
│  This Week (15 days until exam):    │
│  • Monday: Practice History         │
│  • Tuesday: Mock Test               │
│  • Wednesday: Review weak topics    │
│  • Thursday: Science practice       │
│  • Friday: Full mock test           │
│  • Weekend: Review and rest         │
│                                     │
│  Priority Areas:                    │
│  1. History (needs improvement)     │
│  2. Geography (low coverage)        │
│  3. Review all topics once          │
└─────────────────────────────────────┘
```

---

## 🎨 UI/UX DESIGN

### Layout Structure:
```
┌─────────────────────────────────────────────────────┐
│ Progress Dashboard                          [⚙️ Goals]│
├─────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────┐│
│ │ Exam Readiness  │ │  Study Streak               ││
│ │     78%         │ │    🔥 7 Days                ││
│ │  Getting There  │ │  Longest: 15 days           ││
│ └─────────────────┘ └─────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│ Today's Goals                                        │
│ ✅ 20/20 Questions  🔄 2/3 Sessions  ⏱️ 45/60 min  │
├─────────────────────────────────────────────────────┤
│ Achievements                                  [View All]│
│ 🎯 🔥 💯 🏆 📚 ⭐                                    │
├─────────────────────────────────────────────────────┤
│ This Month's Improvements                            │
│ Accuracy: +5% ↗️  Tests: +4 ↗️  Streak: +10 ↗️      │
├─────────────────────────────────────────────────────┤
│ Section Coverage                              [Details]│
│ ✅✅🟢🟡🔴⚪                                          │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### Files to Create:
```
/src/app/dashboard/progress/
  └── page.tsx                    ✨ Main progress page

/src/components/progress/
  ├── exam-readiness-card.tsx     ✨ Readiness score
  ├── goals-dashboard.tsx         ✨ Goal tracking
  ├── streak-calendar.tsx         ✨ Streak display
  ├── achievements-grid.tsx       ✨ Achievement cards
  ├── progress-timeline.tsx       ✨ Timeline view
  ├── improvement-metrics.tsx     ✨ Month comparison
  ├── section-coverage-map.tsx    ✨ Section grid
  └── motivational-panel.tsx      ✨ Encouragement

/src/lib/
  ├── goals.ts                    ✨ Goal logic
  ├── achievements.ts             ✨ Achievement logic
  └── streak-calculator.ts        ✨ Streak calculation

/src/app/api/
  ├── goals/route.ts              ✨ Goal CRUD
  ├── achievements/route.ts       ✨ Achievements
  └── progress/readiness/route.ts ✨ Readiness calc
```

---

## 📊 DATA REQUIREMENTS

### Existing Data:
- ✅ `user_test_attempts`
- ✅ `user_answers`
- ✅ `tests`
- ✅ `sections`

### New Tables Needed:
```sql
-- Goals
user_goals (id, user_id, goal_type, target_value, ...)

-- Achievements
achievements (id, name, requirement_type, ...)
user_achievements (user_id, achievement_id, unlocked_at)

-- Optional: Exam dates
user_exams (id, user_id, exam_date, exam_name, target_score)
```

---

## 🎯 IMPLEMENTATION PHASES

### Phase 1: Core Progress Features
**Time:** 2-3 days
1. Exam readiness calculator
2. Basic streak tracking
3. Goal creation and tracking
4. Section coverage view

### Phase 2: Gamification
**Time:** 2-3 days
5. Achievement system
6. Badge unlocking
7. Progress timeline
8. Improvement metrics

### Phase 3: Polish
**Time:** 1-2 days
9. Motivational content
10. Study recommendations
11. Mobile optimization
12. Integration with practice/analytics

**Total:** 5-8 days

---

## 🚀 PRIORITY RECOMMENDATIONS

### Must Have:
1. Exam readiness score
2. Goal tracking (daily/weekly)
3. Study streak

### Should Have:
4. Achievement system
5. Section coverage
6. Improvement metrics

### Nice to Have:
7. Progress timeline
8. Motivational panel
9. Study plan suggestions

---

## 📝 ACCEPTANCE CRITERIA

**Progress dashboard is complete when:**
- ✅ User can see exam readiness percentage
- ✅ User can set and track goals
- ✅ User can view study streak
- ✅ User can unlock achievements
- ✅ User can see improvement over time
- ✅ Section coverage is visible
- ✅ Mobile responsive
- ✅ Motivating and encouraging UX

---

## 🔗 INTEGRATION POINTS

**Links from Progress to:**
- Practice Mode - "Practice weak sections"
- Analytics - "View detailed stats"
- Goals Setup - "Edit goals"

**Links to Progress from:**
- Main Dashboard - Default landing page
- After test completion - "Check your progress"
- Practice Mode - "View progress"

---

## 🎓 FUTURE ENHANCEMENTS

- Peer comparison (optional)
- Study buddy system
- Share progress on social media
- Personalized study plans
- AI coaching and tips
- Virtual study rooms
- Progress challenges
