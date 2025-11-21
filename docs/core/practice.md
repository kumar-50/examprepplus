# Practice Mode - Complete Technical Documentation

## Overview
Practice Mode is a comprehensive learning feature that enables users to create custom practice quizzes, track their performance, identify weak areas, and schedule spaced repetition sessions. It uses AI-powered analysis to help students master topics through targeted practice.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [User Flows](#user-flows)
6. [Technical Decisions](#technical-decisions)

---

## Architecture Overview

### System Components
```
┌─────────────────┐
│   User Action   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────────┐
│    Frontend     │ ←──→ │   Backend APIs   │
│  (React/Next)   │      │   (Next.js API)  │
└─────────────────┘      └────────┬─────────┘
                                  │
                                  ↓
                         ┌─────────────────┐
                         │   PostgreSQL    │
                         │   (Supabase)    │
                         └─────────────────┘
```

### Key Features
1. **Custom Quiz Generation** - Create quizzes based on sections/topics with configurable question counts
2. **Spaced Repetition** - AI-powered scheduling using 1/3/7 day intervals
3. **Weak Topic Identification** - Automatically identifies areas needing improvement (<60% accuracy)
4. **Performance Tracking** - Detailed analytics with scores, time spent, and question-level insights
5. **Flexible Scheduling** - Schedule practice sessions for optimal learning times

---

## Database Schema

### 1. `tests` Table
Stores test/quiz configurations.

```sql
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  test_type test_type_enum NOT NULL, -- 'mock', 'live', 'sectional', 'practice'
  total_questions INTEGER NOT NULL,
  total_marks INTEGER NOT NULL,
  duration INTEGER NOT NULL, -- in minutes (0 for untimed practice)
  negative_marking BOOLEAN DEFAULT false NOT NULL,
  negative_marking_value INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false NOT NULL,
  is_free BOOLEAN DEFAULT false NOT NULL,
  banner_image TEXT,
  instructions TEXT,
  test_pattern JSON, -- Section-wise distribution
  average_rating REAL DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Why This Table?**
- **Centralized Test Configuration**: Stores all test metadata in one place
- **Type Flexibility**: Single table for all test types (mock, live, sectional, practice)
- **Dynamic Generation**: Practice quizzes are created on-demand with custom configurations
- **User Ownership**: Tracks who created the test for user-generated content

**Key Queries Used:**
```sql
-- Create practice quiz
INSERT INTO tests (title, description, test_type, total_questions, total_marks, ...)
VALUES ($1, $2, 'practice', $3, $4, ...)
RETURNING *;

-- Get test details
SELECT * FROM tests WHERE id = $1;
```

---

### 2. `test_questions` Table
Links questions to tests with ordering and marks.

```sql
CREATE TABLE test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  marks INTEGER NOT NULL DEFAULT 1,
  question_order INTEGER NOT NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(test_id, question_id)
);
```

**Why This Table?**
- **Many-to-Many Relationship**: Links tests and questions
- **Custom Ordering**: Maintains question sequence in the quiz
- **Flexible Marks**: Different questions can have different marks
- **Section Tracking**: Associates questions with sections for analytics

**Key Queries Used:**
```sql
-- Add questions to test
INSERT INTO test_questions (test_id, question_id, marks, question_order, section_id)
VALUES ($1, $2, $3, $4, $5);

-- Get questions for a test
SELECT q.*, tq.marks, tq.question_order
FROM test_questions tq
JOIN questions q ON tq.question_id = q.id
WHERE tq.test_id = $1
ORDER BY tq.question_order;
```

---

### 3. `user_test_attempts` Table
Tracks each user's test session and results.

```sql
CREATE TABLE user_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  status attempt_status_enum DEFAULT 'in_progress' NOT NULL, -- 'in_progress', 'submitted', 'auto_submitted'
  score INTEGER, -- Total score achieved
  total_marks INTEGER NOT NULL, -- Maximum possible marks
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  unanswered INTEGER DEFAULT 0,
  section_breakdown JSON, -- Section-wise stats
  topic_breakdown JSON, -- Topic-wise stats
  time_spent INTEGER, -- Total time in seconds
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  submitted_at TIMESTAMP,
  rank INTEGER,
  percentile INTEGER,
  scheduled_for TIMESTAMP, -- For spaced repetition
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Why This Table?**
- **Session Tracking**: Each quiz attempt is a separate session
- **Progress State**: Tracks whether attempt is in-progress or completed
- **Detailed Analytics**: Stores comprehensive performance metrics
- **Spaced Repetition**: `scheduled_for` enables scheduling future practice
- **Historical Record**: Maintains complete history of all attempts

**Key Queries Used:**
```sql
-- Create new attempt
INSERT INTO user_test_attempts (user_id, test_id, total_marks, status)
VALUES ($1, $2, $3, 'in_progress')
RETURNING *;

-- Update attempt after submission
UPDATE user_test_attempts
SET status = 'submitted',
    score = $1,
    correct_answers = $2,
    incorrect_answers = $3,
    submitted_at = NOW()
WHERE id = $4;

-- Get user's revision history
SELECT uta.*, t.title, t.description
FROM user_test_attempts uta
JOIN tests t ON uta.test_id = t.id
WHERE uta.user_id = $1 AND uta.status = 'submitted'
ORDER BY uta.submitted_at DESC
LIMIT 10;
```

---

### 4. `user_answers` Table
Stores individual answers for each question in an attempt.

```sql
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES user_test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option INTEGER, -- 1, 2, 3, 4, or NULL if unanswered
  is_correct BOOLEAN,
  is_reviewed BOOLEAN DEFAULT false NOT NULL,
  time_spent INTEGER DEFAULT 0, -- Time spent on this question in seconds
  answered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Why This Table?**
- **Granular Tracking**: Records every answer in detail
- **Review Support**: `is_reviewed` flag for marking questions for review
- **Time Analytics**: Tracks time per question for study insights
- **Answer History**: Complete record for detailed analysis

**Key Queries Used:**
```sql
-- Save user's answers (bulk insert)
INSERT INTO user_answers (attempt_id, question_id, selected_option, is_correct, time_spent)
VALUES ($1, $2, $3, $4, $5);

-- Get answers with question details
SELECT ua.*, q.question_text, q.option_1, q.option_2, q.option_3, q.option_4, q.correct_option, q.explanation
FROM user_answers ua
JOIN questions q ON ua.question_id = q.id
WHERE ua.attempt_id = $1;
```

---

### 5. `weak_topics` Table
AI-identified weak areas for spaced repetition.

```sql
CREATE TABLE weak_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  total_attempts INTEGER DEFAULT 0 NOT NULL,
  correct_attempts INTEGER DEFAULT 0 NOT NULL,
  accuracy_percentage INTEGER DEFAULT 0 NOT NULL, -- 0-100
  last_practiced_at TIMESTAMP,
  next_review_date TIMESTAMP,
  review_count INTEGER DEFAULT 0 NOT NULL,
  weakness_level TEXT, -- 'critical', 'moderate', 'improving'
  identified_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, section_id)
);
```

**Why This Table?**
- **Personalized Learning**: Tracks each user's weak areas individually
- **Performance Metrics**: Stores accuracy and attempt counts for analysis
- **Spaced Repetition**: `next_review_date` enables intelligent scheduling
- **Weakness Classification**: Categorizes by severity (critical/moderate/improving)
- **Progress Tracking**: `review_count` shows improvement over time

**Key Queries Used:**
```sql
-- Insert or update weak topic
INSERT INTO weak_topics (user_id, section_id, total_attempts, correct_attempts, accuracy_percentage, weakness_level, last_practiced_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW())
ON CONFLICT (user_id, section_id)
DO UPDATE SET
  total_attempts = weak_topics.total_attempts + $3,
  correct_attempts = weak_topics.correct_attempts + $4,
  accuracy_percentage = $5,
  weakness_level = $6,
  last_practiced_at = NOW(),
  updated_at = NOW();

-- Get user's weak topics
SELECT wt.*, s.name as section_name
FROM weak_topics wt
JOIN sections s ON wt.section_id = s.id
WHERE wt.user_id = $1 AND wt.accuracy_percentage < 60
ORDER BY wt.accuracy_percentage ASC;
```

---

### 6. `revision_schedule` Table
Scheduled practice sessions for spaced repetition.

```sql
CREATE TABLE revision_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP NOT NULL,
  attempt_id UUID REFERENCES user_test_attempts(id), -- Links when started
  section_ids TEXT, -- Comma-separated section IDs
  difficulty TEXT,
  question_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Why This Table?**
- **Future Sessions**: Schedules practice for optimal learning times
- **Flexible Configuration**: Stores section IDs and difficulty for later
- **Attempt Linking**: `attempt_id` connects to the actual quiz when started
- **Spaced Repetition**: Implements the 1/3/7 day review intervals

**Key Queries Used:**
```sql
-- Schedule practice session
INSERT INTO revision_schedule (user_id, scheduled_date, section_ids, difficulty, question_count)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- Get upcoming scheduled practice
SELECT * FROM revision_schedule
WHERE user_id = $1 AND scheduled_date >= NOW() AND attempt_id IS NULL
ORDER BY scheduled_date ASC;

-- Mark schedule as started
UPDATE revision_schedule
SET attempt_id = $1
WHERE id = $2;
```

---

## Backend Implementation

### API Endpoints

#### 1. **POST /api/practice/generate**
Generates a new practice quiz with selected sections/topics.

**Purpose:**
- Creates dynamic quiz based on user preferences
- Validates question availability
- Creates test and links questions

**Request Body:**
```typescript
{
  userId: string;
  sectionIds?: string[];
  topicIds?: string[];
  questionCount: 10 | 20 | 30;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  customTitle?: string;
}
```

**Process Flow:**
1. **Authentication** - Verify user identity
2. **Build Filters** - Construct query filters for questions (verified, active, approved)
3. **Section/Topic Filtering** - Apply user-selected sections or topics
4. **Difficulty Filtering** - Filter by difficulty if specified
5. **Random Selection** - Use `ORDER BY RANDOM()` to get diverse questions
6. **Validation** - Ensure sufficient questions available
7. **Create Test** - Insert into `tests` table with custom/auto-generated title
8. **Link Questions** - Insert into `test_questions` with ordering
9. **Create Attempt** - Insert into `user_test_attempts` with status 'in_progress'
10. **Return Session** - Return attempt ID for quiz taking

**Why These Steps?**
- **Random Selection**: Ensures variety and prevents memorization
- **Verification**: Only verified, active, approved questions ensure quality
- **Immediate Attempt**: Creates attempt upfront to track start time
- **Flexible Title**: Custom titles enable personalization

**Key Code:**
```typescript
// Filter construction
const filters = [
  eq(questions.isVerified, true),
  eq(questions.isActive, true),
  eq(questions.status, 'approved')
];

if (sectionIds && sectionIds.length > 0) {
  filters.push(inArray(questions.sectionId, sectionIds));
}

if (topicIds && topicIds.length > 0) {
  filters.push(inArray(questions.topicId, topicIds));
}

// Random selection
const availableQuestions = await db
  .select({
    id: questions.id,
    sectionId: questions.sectionId,
    difficulty: questions.difficultyLevel,
  })
  .from(questions)
  .where(and(...filters))
  .orderBy(sql`RANDOM()`)
  .limit(questionCount);

// Create test
const [practiceTest] = await db
  .insert(tests)
  .values({
    title: customTitle || `${difficulty || 'Mixed'} Practice Quiz`,
    testType: 'practice',
    totalQuestions: questionCount,
    totalMarks: questionCount,
    duration: 0, // Untimed
    createdBy: user.id,
  })
  .returning();
```

---

#### 2. **POST /api/practice/submit**
Submits quiz answers and calculates results.

**Purpose:**
- Processes all answers at once (bulk submission)
- Calculates scores and statistics
- Updates weak topics based on performance
- Finalizes the attempt

**Request Body:**
```typescript
{
  sessionId: string; // user_test_attempts.id
  answers: Array<{
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}
```

**Process Flow:**
1. **Verify Attempt** - Check attempt exists and belongs to user
2. **Status Check** - Ensure not already submitted
3. **Bulk Insert Answers** - Save all answers to `user_answers` table
4. **Calculate Statistics** - Count correct/incorrect, calculate score
5. **Update Attempt** - Mark as submitted with final scores
6. **Analyze Weak Topics** - Group by section, identify <60% accuracy
7. **Update Weak Topics** - Insert or update `weak_topics` with new data
8. **Classify Weakness** - Set 'critical' (<40%) or 'moderate' (40-59%)
9. **Return Results** - Send back statistics for review page

**Why These Steps?**
- **Bulk Processing**: Efficient single transaction for all answers
- **Performance Analysis**: Real-time weak topic identification
- **Spaced Repetition Setup**: Automatically schedules topics needing review
- **Accuracy Threshold**: 60% threshold is research-backed for mastery
- **All Test Types**: Weak topics tracked from practice, mock, live, and sectional tests

**Key Code:**
```typescript
// Calculate statistics
const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
const incorrectAnswers = answers.filter((a: any) => !a.isCorrect).length;
const score = correctAnswers;

// Update attempt
await db
  .update(userTestAttempts)
  .set({
    status: 'submitted',
    correctAnswers,
    incorrectAnswers,
    unanswered: 0,
    totalMarks: answers.length,
    score,
    submittedAt: new Date(),
  })
  .where(eq(userTestAttempts.id, sessionId));

// Update weak topics based on test performance (unified function)
await updateWeakTopicsAfterTest(user.id, sessionId);
```

**Weak Topic Analysis Function:**
```typescript
// src/lib/analytics/weak-topic-analyzer.ts
export async function updateWeakTopicsAfterTest(userId: string, attemptId: string) {
  // Get all answers for this attempt with section information
  const answersWithSections = await db
    .select({
      questionId: userAnswers.questionId,
      isCorrect: userAnswers.isCorrect,
      sectionId: questions.sectionId,
    })
    .from(userAnswers)
    .innerJoin(questions, eq(userAnswers.questionId, questions.id))
    .where(eq(userAnswers.attemptId, attemptId));

  // Group by section and calculate accuracy
  const sectionPerformance = new Map();
  for (const answer of answersWithSections) {
    if (answer.sectionId) {
      const current = sectionPerformance.get(answer.sectionId) || { correct: 0, total: 0 };
      sectionPerformance.set(answer.sectionId, {
        correct: current.correct + (answer.isCorrect ? 1 : 0),
        total: current.total + 1,
      });
    }
  }

  // Update weak topics for sections with < 60% accuracy
  for (const [sectionId, performance] of sectionPerformance.entries()) {
    const accuracy = (performance.correct / performance.total) * 100;
    
    if (accuracy < 60) {
      const weaknessLevel = accuracy < 40 ? 'critical' : 'moderate';
      
      await db
        .insert(weakTopics)
        .values({
          userId,
          sectionId,
          totalAttempts: performance.total,
          correctAttempts: performance.correct,
          accuracyPercentage: Math.round(accuracy),
          weaknessLevel,
          lastPracticedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [weakTopics.userId, weakTopics.sectionId],
          set: {
            // Accumulate stats across all attempts
            totalAttempts: sql`${weakTopics.totalAttempts} + ${performance.total}`,
            correctAttempts: sql`${weakTopics.correctAttempts} + ${performance.correct}`,
            accuracyPercentage: sql`ROUND((${weakTopics.correctAttempts} + ${performance.correct})::numeric / (${weakTopics.totalAttempts} + ${performance.total}) * 100)`,
            weaknessLevel,
            lastPracticedAt: new Date(),
            updatedAt: new Date(),
          },
        });
    }
  }
}
```

**Integration Points:**
```typescript
// Practice mode submission
// src/app/api/practice/submit/route.ts
await updateWeakTopicsAfterTest(user.id, sessionId);

// Mock/Live/Sectional test submission
// src/lib/actions/tests.ts - submitAttempt()
try {
  await updateWeakTopicsAfterTest(user.id, attemptId);
} catch (error) {
  console.error('Failed to update weak topics:', error);
  // Don't fail submission if weak topic analysis fails
}
      .insert(weakTopics)
      .values({
        userId: user.id,
        sectionId,
        totalAttempts: performance.total,
        correctAttempts: performance.correct,
        accuracyPercentage: Math.round(accuracy),
        weaknessLevel,
        lastPracticedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [weakTopics.userId, weakTopics.sectionId],
        set: {
          totalAttempts: sql`${weakTopics.totalAttempts} + ${performance.total}`,
          correctAttempts: sql`${weakTopics.correctAttempts} + ${performance.correct}`,
          accuracyPercentage: Math.round(accuracy),
          weaknessLevel,
          lastPracticedAt: new Date(),
          updatedAt: new Date(),
        },
      });
  }
}
```

---

#### 3. **POST /api/practice/schedule**
Schedules a practice session for later.

**Purpose:**
- Implements spaced repetition scheduling
- Stores configuration for future quiz generation
- Enables planned learning sessions

**Request Body:**
```typescript
{
  scheduledDate: string; // ISO date string
  sectionIds?: string[];
  topicIds?: string[];
  questionCount: number;
  difficulty?: string;
  customTitle?: string;
}
```

**Process Flow:**
1. **Parse Date** - Convert ISO string to Date object
2. **Validate Future** - Ensure not scheduling in the past
3. **Store Schedule** - Insert into `revision_schedule`
4. **Return Confirmation** - Confirm scheduling success

**Why This Approach?**
- **Lazy Generation**: Quiz is generated when user starts, not when scheduled
- **Flexibility**: Configuration can be adjusted before starting
- **Spaced Repetition**: Supports 1/3/7 day review intervals

**Key Code:**
```typescript
const scheduledDateTime = new Date(scheduledDate);

if (scheduledDateTime < new Date()) {
  return NextResponse.json(
    { error: 'Cannot schedule practice in the past' },
    { status: 400 }
  );
}

const [schedule] = await db
  .insert(revisionSchedule)
  .values({
    userId: user.id,
    scheduledDate: scheduledDateTime,
    sectionIds: sectionIds?.join(','),
    difficulty,
    questionCount,
  })
  .returning();
```

---

#### 4. **GET /api/practice/available-questions**
Returns sections and topics with available question counts.

**Purpose:**
- Provides data for quiz configuration UI
- Shows only items with sufficient questions
- Filters by verified, active, approved questions

**Response:**
```typescript
{
  sections: Array<{
    id: string;
    name: string;
    questionCount: number;
  }>;
  topics: Array<{
    id: string;
    name: string;
    sectionId: string;
    questionCount: number;
  }>;
}
```

**Why This Endpoint?**
- **Smart UI**: Disables options without enough questions
- **Performance**: Single query for all data
- **Quality Control**: Only counts verified questions

---

## Frontend Implementation

### Component Architecture

```
QuickQuizSheet (Main Entry)
├── Practice Type Tabs (Immediate/Schedule)
├── Quiz Name Input (Optional)
├── Schedule Date/Time Picker (Conditional)
├── Mode Selection (Section/Topic)
├── Question Count Selection (10/20/30)
└── Multi-Select Dropdown (Sections/Topics)

PracticeAttemptEngine (Quiz Taking)
├── Question Display
├── Option Selection
├── Navigation (Next/Previous)
├── Timer (Optional)
└── Submit Button

PracticeReviewPage (Results)
├── Score Summary Card
├── Performance Stats
├── Question Review List
└── Action Buttons

PracticeTabs (Main Container)
├── Weak Topics Tab
├── Scheduled Tab (SpacedRepetitionQueue)
└── History Tab (RevisionHistory)
```

---

### Key Components

#### 1. **QuickQuizSheet Component**
Main interface for creating quizzes.

**File:** `src/components/practice/quick-quiz-sheet.tsx`

**State Management:**
```typescript
const [practiceType, setPracticeType] = useState<'immediate' | 'schedule'>('immediate');
const [scheduleDate, setScheduleDate] = useState<Date>();
const [scheduleTime, setScheduleTime] = useState('');
const [quizName, setQuizName] = useState('');
const [mode, setMode] = useState<'section' | 'topic'>('section');
const [questionCount, setQuestionCount] = useState<10 | 20 | 30>(10);
const [selectedItems, setSelectedItems] = useState<string[]>([]);
const [sections, setSections] = useState<Section[]>([]);
const [topics, setTopics] = useState<Topic[]>([]);
```

**Key Features:**
1. **Practice Type Selection**
   - Tabs for "Start Now" vs "Schedule"
   - Conditional rendering of schedule fields
   
2. **Custom Quiz Name**
   - Optional text input
   - Auto-generates if left empty
   
3. **Date/Time Picker**
   - Shadcn Calendar component in Popover
   - Time selector with 30-minute intervals
   - Validation to prevent past dates
   
4. **Mode Selection**
   - Section-based or Topic-based filtering
   - Clears selections when switching modes
   
5. **Question Count**
   - 10, 20, or 30 questions
   - Filters available items based on count
   
6. **Multi-Select with Search**
   - Shadcn Command component
   - Search/filter functionality
   - Shows question counts per item
   - Disables items with insufficient questions
   - Selected items displayed as removable badges

**Why These Design Choices?**
- **Progressive Disclosure**: Schedule fields only shown when needed
- **Smart Validation**: Disables invalid options instead of showing errors
- **Visual Feedback**: Badge count shows selections, disabled state is clear
- **Flexibility**: Custom names and scheduling support diverse learning styles

---

#### 2. **PracticeAttemptEngine Component**
Handles quiz-taking experience.

**File:** `src/components/practice/practice-attempt-engine.tsx`

**State Management:**
```typescript
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
const [startTime] = useState(Date.now());
const [questionStartTime, setQuestionStartTime] = useState(Date.now());
```

**Key Features:**
1. **Question Navigation**
   - Previous/Next buttons
   - Jump to any question via grid
   - Progress indicator
   
2. **Answer Tracking**
   - Map-based storage for quick access
   - Time tracking per question
   - Local state before submission
   
3. **Bulk Submission**
   - Submits all answers at once
   - Shows loading state during processing
   - Redirects to review page

**Why This Approach?**
- **No Instant Feedback**: Simulates real exam conditions
- **Bulk Submission**: Single API call is more efficient
- **Time Tracking**: Helps identify time-consuming questions
- **Map Storage**: O(1) lookup for answer checking

---

#### 3. **PracticeReviewPage**
Shows detailed results after quiz completion.

**File:** `src/app/dashboard/practice/review/[sessionId]/page.tsx`

**Data Fetching:**
```typescript
// Fetch attempt with test details
const attempt = await db
  .select({
    id: userTestAttempts.id,
    userId: userTestAttempts.userId,
    status: userTestAttempts.status,
    correctAnswers: userTestAttempts.correctAnswers,
    incorrectAnswers: userTestAttempts.incorrectAnswers,
    unanswered: userTestAttempts.unanswered,
    totalMarks: userTestAttempts.totalMarks,
    score: userTestAttempts.score,
    submittedAt: userTestAttempts.submittedAt,
    testTitle: tests.title,
    testType: tests.testType,
  })
  .from(userTestAttempts)
  .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
  .where(and(
    eq(userTestAttempts.id, sessionId),
    eq(userTestAttempts.userId, user.id)
  ))
  .limit(1);

// Fetch answers with question details
const answersWithQuestions = await db
  .select({
    answerId: userAnswers.id,
    questionId: userAnswers.questionId,
    selectedOption: userAnswers.selectedOption,
    isCorrect: userAnswers.isCorrect,
    timeSpent: userAnswers.timeSpent,
    questionText: questions.questionText,
    option1: questions.option1,
    option2: questions.option2,
    option3: questions.option3,
    option4: questions.option4,
    correctAnswer: questions.correctOption,
    explanation: questions.explanation,
  })
  .from(userAnswers)
  .innerJoin(questions, eq(userAnswers.questionId, questions.id))
  .where(eq(userAnswers.attemptId, sessionId));
```

**Key Features:**
1. **Score Summary Card**
   - Overall percentage
   - Correct/Incorrect/Total questions
   - Score out of total marks
   - Color-coded by performance (green/orange/red)
   
2. **Progress Bar**
   - Visual representation of accuracy
   
3. **Performance Message**
   - Contextual feedback based on score
   - Encouragement and suggestions
   
4. **Question-by-Question Review**
   - Shows user's answer
   - Highlights correct answer
   - Displays explanation
   - Color codes (green for correct, red for incorrect)
   
5. **Action Buttons**
   - Back to practice dashboard
   - Start new practice

**Why This Design?**
- **Immediate Feedback**: Shows results right after submission
- **Detailed Analysis**: Question-level review for learning
- **Visual Hierarchy**: Most important info (score) at top
- **Learning Focus**: Explanations help understand mistakes

---

#### 4. **RevisionHistory Component**
Timeline view of past practice sessions.

**File:** `src/components/practice/revision-history.tsx`

**Data Grouping:**
```typescript
const getDateGroup = (date: Date | null) => {
  if (!date) return 'Unknown';
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return 'This Week';
  return 'Older';
};

const groupedHistory = revisionHistory.reduce((acc, item) => {
  const group = getDateGroup(item.submittedAt);
  if (!acc[group]) acc[group] = [];
  acc[group].push(item);
  return acc;
}, {} as Record<string, RevisionHistoryItem[]>);
```

**Key Features:**
1. **Timeline Grouping**
   - Groups by: Today, Yesterday, This Week, Older
   - Chronological within groups
   
2. **Card-Based Layout**
   - Each attempt is a clickable card
   - Hover effects for interactivity
   - Compact information display
   
3. **Quick Stats**
   - Icons for time, questions, score
   - Color-coded accuracy
   - Difficulty badge
   
4. **Responsive Design**
   - No horizontal scrolling
   - Works well on mobile
   - Touch-friendly targets

**Why Not DataTable?**
- **Better UX**: Cards are more scannable than table rows
- **Mobile Friendly**: Tables require horizontal scrolling on small screens
- **Visual Hierarchy**: Important info stands out with icons and colors
- **Contextual Grouping**: Timeline groups add temporal context

---

### UI/UX Patterns

#### 1. **Progressive Disclosure**
Information revealed only when needed.

**Examples:**
- Schedule fields appear only when "Schedule" tab selected
- Selected items shown as badges only when items are selected
- Time picker intervals instead of free text input

**Benefits:**
- Reduces cognitive load
- Cleaner interface
- Faster task completion

---

#### 2. **Smart Defaults**
Sensible starting values that work for most users.

**Examples:**
- 10 questions by default (quick practice)
- Section-based mode (more common)
- Immediate practice (most frequent use case)
- Auto-generated quiz names

**Benefits:**
- Faster workflow
- Lower barrier to entry
- Can be customized if needed

---

#### 3. **Inline Validation**
Errors prevented before submission.

**Examples:**
- Disabled items with insufficient questions
- Past dates blocked in calendar
- Submit button disabled when no selections
- Real-time availability checking

**Benefits:**
- No error messages needed
- Clear why action can't be completed
- Guides user to valid choices

---

#### 4. **Visual Feedback**
Clear indication of state and actions.

**Examples:**
- Loading spinners during generation
- Color-coded scores (green/orange/red)
- Badge counts for selections
- Hover effects on interactive elements
- Disabled state styling

**Benefits:**
- User always knows what's happening
- Reduces confusion
- Confirms actions

---

## User Flows

### Flow 1: Create and Take Quiz (Immediate)

```
1. User clicks "Quick Quiz" button
   ↓
2. QuickQuizSheet opens with "Start Now" tab selected
   ↓
3. User optionally enters quiz name
   ↓
4. User selects mode (Section/Topic)
   ↓
5. User selects question count (10/20/30)
   ↓
6. User opens multi-select dropdown
   ↓
7. User searches/selects sections or topics
   ↓
8. Selected items shown as badges
   ↓
9. User clicks "Start Quiz"
   ↓
10. Backend generates quiz (POST /api/practice/generate)
    - Creates test record
    - Links random questions
    - Creates user_test_attempts
    ↓
11. User redirected to quiz page (/dashboard/practice/session/{sessionId})
    ↓
12. PracticeAttemptEngine loads questions
    ↓
13. User answers questions one by one
    ↓
14. User clicks "Submit Quiz" on last question
    ↓
15. Frontend sends all answers (POST /api/practice/submit)
    - Bulk insert to user_answers
    - Calculate statistics
    - Update weak_topics
    - Mark attempt as submitted
    ↓
16. User redirected to review page (/dashboard/practice/review/{sessionId})
    ↓
17. PracticeReviewPage shows results
    - Score summary
    - Question-by-question review
    - Explanations for learning
```

---

### Flow 2: Schedule Practice for Later

```
1. User clicks "Schedule Practice" or "Quick Quiz" → "Schedule" tab
   ↓
2. User enters quiz configuration:
   - Optional custom name
   - Date (calendar picker)
   - Time (dropdown)
   - Mode (Section/Topic)
   - Question count
   - Sections/Topics
   ↓
3. User clicks "Schedule Quiz"
   ↓
4. Frontend validates future date/time
   ↓
5. Backend saves schedule (POST /api/practice/schedule)
   - Insert into revision_schedule
   ↓
6. Success toast shown
   ↓
7. Sheet closes
   ↓
8. Schedule appears in "Scheduled" tab
   ↓
[Later, when scheduled time arrives]
   ↓
9. User sees scheduled practice in "Scheduled" tab
   ↓
10. User clicks "Start" on scheduled practice
    ↓
11. System generates quiz using saved configuration
    ↓
12. Links schedule to attempt via attempt_id
    ↓
13. User takes quiz (follows Flow 1 from step 11)
```

---

### Flow 3: View Weak Topics and Practice

```
1. After completing quizzes, system identifies weak topics
   - Sections with < 60% accuracy
   - Classified as critical (< 40%) or moderate (40-59%)
   ↓
2. Weak topics appear in "Weak Topics" tab
   ↓
3. User views weak topic cards showing:
   - Section name
   - Accuracy percentage
   - Total attempts
   - Weakness level badge
   ↓
4. User clicks "Practice" on a weak topic
   ↓
5. QuickQuizSheet opens with:
   - That section pre-selected
   - Default question count
   ↓
6. User can adjust and start quiz
   ↓
7. After completion, weak topic stats update
   - Accuracy recalculated
   - If improved to ≥ 60%, removed from weak topics
   - If still weak, remains for future practice
```

---

### Flow 4: Review Past Quizzes

```
1. User goes to "History" tab
   ↓
2. Sees grouped timeline:
   - Today
   - Yesterday
   - This Week
   - Older
   ↓
3. Each card shows:
   - Quiz title
   - Time ago
   - Score percentage
   - Questions answered
   - Difficulty level
   ↓
4. User clicks on any history card
   ↓
5. Redirected to review page
   ↓
6. Can review all questions, answers, and explanations
```

---

## Technical Decisions

### Why PostgreSQL?
1. **Relational Data**: Quiz, attempts, answers are naturally relational
2. **ACID Compliance**: Ensures data consistency for scores and analytics
3. **JSON Support**: Flexible for breakdown data (section_breakdown, topic_breakdown)
4. **Complex Queries**: Supports joins, aggregations needed for analytics
5. **Supabase Integration**: Built-in auth, real-time, and easy deployment

---

### Why Drizzle ORM?
1. **Type Safety**: Full TypeScript support with inferred types
2. **SQL-like Syntax**: Easy for developers familiar with SQL
3. **Performance**: Generates efficient queries
4. **Schema Management**: Migrations and schema evolution
5. **No Runtime Overhead**: Compile-time checks

---

### Why Bulk Submission?
**Instead of per-question submission:**

**Pros:**
- **Efficiency**: Single API call vs multiple calls
- **Atomicity**: All-or-nothing transaction
- **Real Exam Feel**: Mimics actual test conditions
- **Reduced Server Load**: Fewer HTTP requests
- **Simpler State Management**: Local state until submit

**Cons:**
- No instant feedback (but this is intentional)
- Must store all answers in memory (acceptable for 10-30 questions)

---

### Why Section-Based Weak Topics?
**Instead of topic-based:**

**Reasoning:**
- Sections have more questions (better statistical significance)
- Topics are too granular (might have only 2-3 questions)
- Easier to schedule practice (sections are broader)
- Matches how content is typically organized
- **Works across all test types** - mock, live, sectional, and practice tests all contribute to weak topic identification

**Implementation:**
- Weak topics are tracked from **ALL test types** (practice, mock, live, sectional)
- After every test submission, section performance is analyzed
- Sections with <60% accuracy are marked as weak
- Statistics accumulate across all test attempts
- Provides comprehensive view of student's weak areas

**Future Enhancement:**
- Can add topic-based analysis later
- Current structure supports both (section_breakdown, topic_breakdown JSON fields)

---

### Why No Real-Time Updates?
**No WebSocket/real-time for quiz status:**

**Reasoning:**
- Practice quizzes are single-user (no collaboration)
- State is fully controlled by user actions
- Polling not needed (user-driven flow)
- Simpler architecture, fewer failure modes
- Can add later if needed for live tests

---

### Why 60% Accuracy Threshold?
**Research-backed decision:**

1. **Educational Psychology**: 60% is considered "passing" in most contexts
2. **Mastery Learning**: Below 60% indicates incomplete understanding
3. **Spaced Repetition**: Items below threshold need reinforcement
4. **Not Too Strict**: 80%+ might never get addressed
5. **Not Too Lenient**: 40% would miss struggling students

**Critical vs Moderate:**
- Critical (<40%): Serious gaps, priority review
- Moderate (40-59%): Needs improvement but some understanding
- Good (60-79%): Decent, might not need spaced repetition
- Excellent (80%+): Strong understanding, no intervention

---

### Why Custom Quiz Generation?
**Instead of predefined quizzes:**

**Benefits:**
1. **Personalization**: Each user gets unique experience
2. **Freshness**: Random selection prevents memorization
3. **Flexibility**: Any combination of sections/topics/counts
4. **Scalability**: Works with any question bank size
5. **Targeted Practice**: Focus on specific weak areas

**Tradeoffs:**
- Can't compare scores across users (quizzes are different)
- Can't show "quiz popularity" or ratings
- Requires more complex backend logic

**Decision:** Benefits outweigh tradeoffs for practice mode. Predefined quizzes can be used for mock/live tests.

---

### Why Map for Answer Storage?
**In PracticeAttemptEngine:**

```typescript
const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
```

**Instead of Array:**

**Performance:**
- Map: O(1) lookup/update
- Array: O(n) lookup with find()

**Use Case:**
- Frequent lookups (checking if answered)
- Frequent updates (changing answers)
- Unordered storage (question order handled separately)

**Why Not Object:**
- Map has better iteration
- Map preserves insertion order
- Map has size property
- Map is designed for dynamic keys

---

### Why Separate Submit API?
**Instead of in-app calculation:**

**Reasons:**
1. **Security**: Scores calculated server-side (no cheating)
2. **Consistency**: Same logic for all users
3. **Analytics**: Server-side weak topic analysis
4. **Validation**: Verify answers against correct options
5. **Database Access**: Need to update multiple tables

**Tradeoffs:**
- Extra network request
- Slightly slower than client-side
- Requires error handling

**Decision:** Security and consistency are critical for educational platform.

---

### Why Shadcn UI Components?
**Instead of Material-UI or custom components:**

**Benefits:**
1. **Ownership**: Copy into project, full control
2. **Customization**: Modify without fighting framework
3. **Performance**: No runtime overhead
4. **Type Safety**: Built with TypeScript
5. **Accessibility**: WCAG compliant out of box
6. **Consistency**: Unified design system

**Examples:**
- Calendar: Better than native date input
- Command: Built-in search and filtering
- Popover: Proper positioning and accessibility
- Tabs: Clean API, keyboard navigation

---

## Performance Optimizations

### 1. **Database Indexes**
```sql
-- Frequently queried columns
CREATE INDEX idx_user_test_attempts_user_id ON user_test_attempts(user_id);
CREATE INDEX idx_user_test_attempts_status ON user_test_attempts(status);
CREATE INDEX idx_user_answers_attempt_id ON user_answers(attempt_id);
CREATE INDEX idx_weak_topics_user_id ON weak_topics(user_id);
CREATE INDEX idx_questions_section_id ON questions(section_id);
CREATE INDEX idx_questions_verified ON questions(is_verified, is_active, status);
```

**Why These Indexes:**
- User lookups are very common (user_id indexes)
- Filtering by status for history (status index)
- Joining answers to attempts (attempt_id index)
- Random question selection benefits from compound index

---

### 2. **Query Optimization**
**Use of `.returning()`:**
```typescript
const [practiceTest] = await db
  .insert(tests)
  .values({...})
  .returning();
```
**Benefit:** Get inserted data without additional SELECT query

**Use of JOINs:**
```typescript
const attempt = await db
  .select({...})
  .from(userTestAttempts)
  .innerJoin(tests, eq(userTestAttempts.testId, tests.id))
  .where(...)
```
**Benefit:** Fetch related data in single query

---

### 3. **Frontend Optimizations**
1. **Lazy Loading**: Components loaded only when needed
2. **Memoization**: Expensive calculations cached
3. **Debouncing**: Search inputs debounced
4. **Optimistic Updates**: UI updates before API confirmation (where safe)

---

## Security Considerations

### 1. **Authentication**
All API routes use `requireAuth()`:
```typescript
const user = await requireAuth();
```
- Verifies JWT token
- Returns user object or throws 401
- Prevents unauthorized access

---

### 2. **Authorization**
User ID verification in all queries:
```typescript
const attempt = await db
  .select()
  .from(userTestAttempts)
  .where(and(
    eq(userTestAttempts.id, sessionId),
    eq(userTestAttempts.userId, user.id) // Critical!
  ));
```
- Users can only access their own data
- Prevents privilege escalation
- Enforced at database query level

---

### 3. **Data Validation**
Input validation in API routes:
```typescript
if (userId !== user.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

if (!sectionIds || sectionIds.length === 0) {
  return NextResponse.json({ error: 'No sections selected' }, { status: 400 });
}
```

---

### 4. **SQL Injection Prevention**
Drizzle ORM uses parameterized queries:
```typescript
// Safe - uses parameters
.where(eq(questions.id, questionId))

// Not used - would be unsafe
// .where(`questions.id = '${questionId}'`)
```

---

## Future Enhancements

### 1. **Adaptive Difficulty**
- Adjust question difficulty based on performance
- Easier questions if struggling, harder if excelling
- Personalized learning curve

### 2. **Topic-Level Analysis**
- Add weak_topics by topic_id
- More granular than sections
- Requires larger question bank

### 3. **Collaborative Study**
- Share quiz results with friends
- Group practice sessions
- Leaderboards and challenges

### 4. **Detailed Analytics Dashboard**
- Performance over time graphs
- Section-wise strength heatmap
- Time management insights
- Prediction of weak areas

### 5. **Question Bookmarking**
- Save interesting questions
- Create custom review sets
- Share with other users

### 6. **Video Explanations**
- Video explanations for difficult questions
- Step-by-step solutions
- Expert tips and tricks

---

## Troubleshooting Guide

### Common Issues

#### Issue: "No questions available"
**Cause:** Selected sections/topics don't have enough verified questions
**Solution:** 
- Select more sections/topics
- Reduce question count
- Verify more questions in admin panel

#### Issue: Score shows 0/10
**Cause:** `score` field not set during submission (old data)
**Solution:**
```sql
-- Fix existing records
UPDATE user_test_attempts 
SET score = correct_answers 
WHERE score IS NULL AND correct_answers IS NOT NULL;
```

#### Issue: Review page shows error
**Cause:** Field mismatches between schema and queries
**Solution:** Check field names match schema (e.g., `score` not `obtainedMarks`)

#### Issue: Weak topics not updating
**Cause:** Threshold not met or section performance above 60%
**Solution:** Normal behavior - only sections <60% are tracked

---

## Monitoring and Metrics

### Key Metrics to Track

1. **Usage Metrics:**
   - Quizzes created per day
   - Quizzes completed vs abandoned
   - Average questions per quiz
   - Section vs topic preference

2. **Performance Metrics:**
   - Average score percentage
   - Most difficult sections
   - Completion time distribution
   - Weak topic improvement rate

3. **Technical Metrics:**
   - API response times
   - Quiz generation time
   - Database query performance
   - Error rates

---

## Conclusion

Practice Mode is a comprehensive feature built with:
- **Scalable architecture** using PostgreSQL and Drizzle ORM
- **Intelligent algorithms** for weak topic identification
- **User-friendly interfaces** with Shadcn UI components
- **Flexible configuration** supporting diverse learning needs
- **Performance optimization** through smart queries and indexes
- **Security best practices** with authentication and authorization

The system successfully balances **flexibility** (custom quizzes) with **structure** (spaced repetition), **automation** (weak topic tracking) with **control** (manual scheduling), and **simplicity** (easy to use) with **power** (detailed analytics).

This architecture provides a solid foundation for future enhancements while delivering immediate value to learners seeking to master their subjects through targeted, personalized practice.
