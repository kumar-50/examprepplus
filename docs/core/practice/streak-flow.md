# Practice Streak System - Technical Flow Documentation

## Overview
The Practice Streak System tracks consecutive days of practice activity, maintaining user motivation through gamification. It uses a GitHub-style activity calendar and celebrates milestones.

---

## Database Schema

### Table: `practice_streaks`
```sql
CREATE TABLE practice_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_practice_days INT DEFAULT 0,
  last_practice_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Fields:**
- `current_streak`: Consecutive days with practice (breaks at midnight if no practice yesterday/today)
- `longest_streak`: Personal best streak record (never decreases)
- `total_practice_days`: Lifetime count of unique days practiced
- `last_practice_date`: Most recent practice date (used for streak validation)

### Table: `practice_calendar`
```sql
CREATE TABLE practice_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  questions_attempted INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  total_time_seconds INT DEFAULT 0,
  sessions_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, practice_date)
);
```

**Fields:**
- `practice_date`: Date of practice activity (used for heatmap)
- `questions_attempted`: Total questions for the day
- `questions_correct`: Correct answers for the day
- `total_time_seconds`: Total practice time in seconds
- `sessions_count`: Number of separate practice sessions

---

## Technical Flow

### 1. Practice Completion Trigger
```typescript
// src/app/api/practice/complete/route.ts
export async function POST(req: Request) {
  // 1. Complete practice session
  // 2. Calculate accuracy
  // 3. Update weak topics
  // 4. Schedule spaced repetition
  // 5. 🔥 Update streak data
  await updatePracticeStreak(userId, accuracy, timeSpent, questionsCount);
}
```

### 2. Streak Update Logic
```typescript
// src/lib/practice-streak.ts
export async function updatePracticeStreak(
  userId: string,
  accuracy: number,
  timeSpentSeconds: number,
  questionsCount: number
) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Step 1: Get or create streak record
  const streak = await getOrCreateStreak(userId);
  
  // Step 2: Check if already practiced today
  const todayEntry = await getCalendarEntry(userId, today);
  const isFirstSessionToday = !todayEntry;
  
  // Step 3: Update calendar data (upsert)
  await updateCalendarData(userId, today, {
    questionsAttempted: questionsCount,
    questionsCorrect: Math.round(questionsCount * accuracy / 100),
    timeSpentSeconds,
    isFirstSession: isFirstSessionToday
  });
  
  // Step 4: Update streak only on first session of the day
  if (isFirstSessionToday) {
    const updatedStreak = calculateStreak(streak, today);
    await saveStreak(userId, updatedStreak);
  }
}
```

### 3. Streak Calculation Algorithm
```typescript
function calculateStreak(currentStreak: Streak, todayDate: string): Streak {
  const today = new Date(todayDate);
  const lastPractice = currentStreak.lastPracticeDate 
    ? new Date(currentStreak.lastPracticeDate) 
    : null;
  
  // First time practicing
  if (!lastPractice) {
    return {
      currentStreak: 1,
      longestStreak: 1,
      totalPracticeDays: 1,
      lastPracticeDate: todayDate
    };
  }
  
  // Already practiced today (shouldn't happen, but safety check)
  if (isSameDay(lastPractice, today)) {
    return currentStreak; // No changes
  }
  
  // Practiced yesterday - extend streak
  if (isYesterday(lastPractice, today)) {
    const newCurrent = currentStreak.currentStreak + 1;
    return {
      currentStreak: newCurrent,
      longestStreak: Math.max(newCurrent, currentStreak.longestStreak),
      totalPracticeDays: currentStreak.totalPracticeDays + 1,
      lastPracticeDate: todayDate
    };
  }
  
  // Gap detected - streak broken
  return {
    currentStreak: 1, // Start fresh
    longestStreak: currentStreak.longestStreak, // Keep record
    totalPracticeDays: currentStreak.totalPracticeDays + 1,
    lastPracticeDate: todayDate
  };
}
```

### 4. Date Utilities
```typescript
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

function isYesterday(lastDate: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(lastDate, yesterday);
}

function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
```

---

## Data Retrieval

### Get Streak Data
```typescript
// src/lib/practice-streak.ts
export async function getStreakData(userId: string) {
  const streak = await db.query.practiceStreaks.findFirst({
    where: eq(practiceStreaks.userId, userId)
  });
  
  return streak || {
    currentStreak: 0,
    longestStreak: 0,
    totalPracticeDays: 0,
    lastPracticeDate: null
  };
}
```

### Get Calendar Data (Last 90 Days)
```typescript
export async function getCalendarData(userId: string) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const entries = await db.query.practiceCalendar.findMany({
    where: and(
      eq(practiceCalendar.userId, userId),
      gte(practiceCalendar.practiceDate, ninetyDaysAgo.toISOString().split('T')[0])
    ),
    orderBy: [desc(practiceCalendar.practiceDate)]
  });
  
  return entries.map(entry => ({
    date: entry.practiceDate,
    questionsAttempted: entry.questionsAttempted,
    questionsCorrect: entry.questionsCorrect,
    accuracy: entry.questionsAttempted > 0 
      ? Math.round((entry.questionsCorrect / entry.questionsAttempted) * 100)
      : 0,
    timeSpent: entry.totalTimeSeconds,
    sessions: entry.sessionsCount
  }));
}
```

---

## UI Components

### 1. Streak Card Component
**File**: `src/components/practice/streak-card.tsx`

**Features:**
- Animated fire icon (🔥)
- Current streak display with celebration at 7+ and 30+ days
- Status badge (Active/Inactive)
- Longest streak and total days stats
- Motivational messages

**Props:**
```typescript
interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalPracticeDays: number;
  lastPracticeDate: string | null;
}
```

**Celebration Logic:**
```typescript
const getMessage = (streak: number) => {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start! Keep it going!";
  if (streak < 7) return "You're building momentum!";
  if (streak < 30) return "Amazing! You're on fire!";
  return "Legendary streak! 🎉";
};
```

### 2. Practice Calendar Component
**File**: `src/components/practice/practice-calendar.tsx`

**Features:**
- GitHub-style heatmap (7 columns × weeks)
- Color intensity based on question count:
  - Gray (50): No practice
  - Light green (100): 1-15 questions
  - Medium green (300): 16-30 questions
  - Dark green (500): 31+ questions
- Hover tooltips showing daily stats
- Month navigation
- Monthly summary stats

**Props:**
```typescript
interface PracticeCalendarProps {
  calendarData: CalendarEntry[];
  selectedMonth?: Date;
}

interface CalendarEntry {
  date: string; // YYYY-MM-DD
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
  timeSpent: number; // seconds
  sessions: number;
}
```

**Color Calculation:**
```typescript
const getIntensityColor = (questions: number) => {
  if (questions === 0) return "bg-gray-50 border-gray-200";
  if (questions <= 15) return "bg-green-100 border-green-200";
  if (questions <= 30) return "bg-green-300 border-green-400";
  return "bg-green-500 border-green-600";
};
```

### 3. Practice Tabs Integration
**File**: `src/components/practice/practice-tabs.tsx`

```typescript
<Tabs defaultValue="practice">
  <TabsList>
    <TabsTrigger value="practice">Practice</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
    <TabsTrigger value="streak">Streak</TabsTrigger> {/* NEW */}
  </TabsList>
  
  <TabsContent value="streak">
    <StreakCard {...streakData} />
    <PracticeCalendar calendarData={calendarData} />
  </TabsContent>
</Tabs>
```

---

## Example User Journey

### Day 1 (Monday)
```
User completes 20 questions with 85% accuracy
↓
updatePracticeStreak() called
↓
Creates new streak record:
  - currentStreak: 1
  - longestStreak: 1
  - totalPracticeDays: 1
  - lastPracticeDate: 2025-11-18
↓
Creates calendar entry:
  - questionsAttempted: 20
  - questionsCorrect: 17
  - sessions: 1
```

### Day 2 (Tuesday)
```
User completes 15 questions (morning) + 10 questions (evening)
↓
First session triggers streak update:
  - currentStreak: 2 (yesterday was 1)
  - longestStreak: 2
  - totalPracticeDays: 2
↓
Second session updates calendar only:
  - questionsAttempted: 25 (15 + 10)
  - sessions: 2
```

### Day 4 (Thursday) - Missed Wednesday
```
User completes 30 questions
↓
Gap detected (last practice was Tuesday)
↓
Streak broken:
  - currentStreak: 1 (restart)
  - longestStreak: 2 (preserved)
  - totalPracticeDays: 3
```

---

## Performance Optimizations

### 1. Upsert Pattern
```typescript
// Single query instead of SELECT + INSERT/UPDATE
await db
  .insert(practiceCalendar)
  .values(newEntry)
  .onConflictDoUpdate({
    target: [practiceCalendar.userId, practiceCalendar.practiceDate],
    set: {
      questionsAttempted: sql`${practiceCalendar.questionsAttempted} + ${questionsCount}`,
      questionsCorrect: sql`${practiceCalendar.questionsCorrect} + ${correctCount}`,
      totalTimeSeconds: sql`${practiceCalendar.totalTimeSeconds} + ${timeSpent}`,
      sessionsCount: sql`${practiceCalendar.sessionsCount} + 1`,
      updatedAt: new Date()
    }
  });
```

### 2. Indexes
```sql
CREATE INDEX idx_calendar_user_date ON practice_calendar(user_id, practice_date DESC);
CREATE INDEX idx_streaks_user ON practice_streaks(user_id);
```

### 3. Query Limits
- Calendar data: Last 90 days only
- Heatmap rendering: Client-side chunking by week
- Tooltip data: Lazy loaded on hover

---

## Edge Cases Handled

### 1. Timezone Handling
```typescript
// Always use UTC dates to avoid timezone issues
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
```

### 2. Multiple Sessions Same Day
- First session: Updates streak + calendar
- Subsequent sessions: Updates calendar only (accumulates stats)

### 3. Midnight Boundary
- Streak checked based on calendar date, not timestamp
- Practice at 11:59 PM counts for that day
- Practice at 12:01 AM counts for next day

### 4. Concurrent Requests
- Database UNIQUE constraint prevents duplicate entries
- Upsert operations are atomic

### 5. Data Migration
- Default values ensure backward compatibility
- Null `lastPracticeDate` handled as first-time user

---

## API Endpoints

### Get Streak Data
```typescript
// GET /api/practice/streak
export async function GET(req: Request) {
  const { userId } = await auth();
  const streakData = await getStreakData(userId);
  const calendarData = await getCalendarData(userId);
  
  return Response.json({
    streak: streakData,
    calendar: calendarData
  });
}
```

**Response:**
```json
{
  "streak": {
    "currentStreak": 5,
    "longestStreak": 12,
    "totalPracticeDays": 45,
    "lastPracticeDate": "2025-11-22"
  },
  "calendar": [
    {
      "date": "2025-11-22",
      "questionsAttempted": 25,
      "questionsCorrect": 21,
      "accuracy": 84,
      "timeSpent": 1200,
      "sessions": 2
    }
  ]
}
```

---

## Testing Scenarios

### Unit Tests
1. **Streak Calculation**
   - First time user → streak = 1
   - Consecutive days → increment
   - Skipped day → reset to 1
   - Same day twice → no change

2. **Date Utilities**
   - `isSameDay()` across midnight
   - `isYesterday()` with DST
   - `getDaysDifference()` accuracy

### Integration Tests
1. Complete practice → verify streak update
2. Multiple sessions same day → verify accumulation
3. Break streak → verify longest preserved
4. Calendar data retrieval → verify 90-day limit

### E2E Tests
1. New user first practice
2. 7-day streak achievement
3. 30-day milestone celebration
4. Streak break and recovery
5. Calendar heatmap rendering

---

## Monitoring & Analytics

### Key Metrics
- Average current streak across users
- Distribution of longest streaks
- Streak break rate (% of users breaking 7+ day streaks)
- Calendar engagement (days with >1 session)
- Time-to-first-streak (days from signup)

### Database Queries
```sql
-- Average current streak
SELECT AVG(current_streak) FROM practice_streaks;

-- Users with 7+ day streaks
SELECT COUNT(*) FROM practice_streaks WHERE current_streak >= 7;

-- Most active day
SELECT practice_date, SUM(questions_attempted) as total
FROM practice_calendar
GROUP BY practice_date
ORDER BY total DESC
LIMIT 1;
```

---

## Future Enhancements

1. **Streak Freeze** - Allow 1 skip per week without breaking
2. **Social Sharing** - Share milestone achievements
3. **Leaderboards** - Weekly/monthly streak rankings
4. **Push Notifications** - Remind users to maintain streak
5. **Streak Challenges** - Team-based streak competitions
6. **Historical Stats** - Year-over-year comparison
7. **Streak Insurance** - Premium feature to protect streaks

---

## Migration Files

### Development
- `migrations/add-practice-streaks.sql` - Creates tables with RLS

### Production
- Included in `production-migration-complete.sql`
- Part of comprehensive deployment process

---

## Related Documentation
- [Practice Mode Implementation](../PRACTICE-MODE-IMPLEMENTATION.md)
- [Practice Mode Quickstart](../PRACTICE-MODE-QUICKSTART.md)
- [Spaced Repetition Flow](./spaced-repetition-flow.md)
- [Weak Topic Analysis](../WEAK-TOPIC-ANALYSIS.md)

---

**Last Updated**: November 22, 2025  
**Status**: ✅ Implemented and Deployed  
**Feature Progress**: 8/15 (53%)
