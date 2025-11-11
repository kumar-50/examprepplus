# Task 11: Test Attempt Engine - Implementation Plan

## Overview
Build a comprehensive test-taking system for users with protected routes, test library, test attempt engine with timer/navigation, and detailed review pages.

---

## Phase 1: Route Structure & Protection ✅

### 1.1 Route Structure
```
/tests                              → Test Library (List View)
/tests/[testId]                     → Test Detail Page
/tests/[testId]/attempt             → Active Test Taking (creates new attempt)
/tests/[testId]/attempt/[attemptId] → Resume/View existing attempt
/tests/[testId]/attempt/[attemptId]/review → Review submitted test
```

### 1.2 Middleware Protection
- Extend `src/middleware.ts` to protect `/tests/*` routes
- Require authenticated user with role='user' or role='admin'
- Redirect unauthenticated users to `/login?redirect=/tests`
- Check subscription status for premium tests

### 1.3 Layout Component
Create `src/app/tests/layout.tsx`:
- Sidebar navigation (Home, Tests, Revision, Leaderboard, Profile)
- User avatar with notifications badge
- Active route highlighting
- Responsive sidebar collapse on mobile

---

## Phase 2: Test Library Page (/tests)

### 2.1 UI Components Needed
Based on the screenshot:
```
TestLibraryPage
├── SearchBar (with icon)
├── FilterBar
│   ├── ExamTypeFilter (dropdown)
│   ├── DifficultyFilter (dropdown)
│   ├── DurationFilter (dropdown)
│   ├── LanguageFilter (dropdown)
│   └── FreeOnlyToggle (checkbox)
├── ViewToggle (Grid/List icons)
└── TestGrid
    └── TestCard[] (each showing):
        ├── Duration badge
        ├── Question count badge
        ├── Language badge
        ├── Difficulty badge
        ├── Title
        ├── Attempt count
        └── Start Test / Unlock button
```

### 2.2 Server Actions Required
```typescript
// src/lib/actions/tests.ts
export async function getTests(filters: TestFilters): Promise<Test[]>
export async function getTestsByExamType(examType: string): Promise<Test[]>
export async function getUserTestAttempts(userId: string): Promise<TestAttempt[]>
```

### 2.3 Database Queries
- Fetch published tests (`is_published = true`)
- Filter by exam type, difficulty, duration range, language
- Check user's subscription for premium tests
- Get attempt count per test for current user
- Sort by: popularity, difficulty, latest, etc.

---

## Phase 3: Test Detail Page (/tests/[testId])

### 3.1 UI Sections (Based on Screenshot)
```
TestDetailPage
├── BackButton → Navigate to /tests
├── BannerImage (placeholder or test-specific image)
├── TestHeader
│   ├── Title
│   ├── Metadata Row (Duration | Questions | Language | Difficulty)
│   └── Attempt count
├── Description (rich text)
├── ActionPanel (Right sidebar)
│   ├── "Take the Test" header
│   ├── Ready prompt
│   ├── StartTestButton (yellow CTA) / UnlockButton
│   ├── DownloadButton
│   ├── ShareButton
│   ├── OverallRating (stars + count)
│   └── Based on X ratings
├── TabPanel
│   ├── Syllabus Tab → Sections with topics (collapsible)
│   ├── AttemptHistoryTab → Previous attempts table
│   └── ReviewsTab → User reviews and ratings
```

### 3.2 Server Actions
```typescript
export async function getTestById(testId: string): Promise<Test | null>
export async function getTestSyllabus(testId: string): Promise<Section[]>
export async function getUserAttemptHistory(userId: string, testId: string): Promise<TestAttempt[]>
export async function checkTestAccess(userId: string, testId: string): Promise<{ hasAccess: boolean, reason?: string }>
```

### 3.3 Logic
- Check if test is free or user has subscription
- Show "Unlock" button with lock icon for premium tests
- Display previous attempts with scores and dates
- Show syllabus breakdown by sections
- "Start Test" creates new attempt and redirects to `/tests/[testId]/attempt`

---

## Phase 4: Test Attempt Engine (/tests/[testId]/attempt)

### 4.1 UI Components Architecture
```
TestAttemptPage
├── TestHeader
│   ├── TestTitle
│   ├── Timer (countdown)
│   ├── ProfileSection (user avatar, name)
│   └── SubmitButton
├── QuestionDisplay
│   ├── QuestionNumber (e.g., "Question 15 of 100")
│   ├── QuestionText (with image support)
│   ├── OptionsGrid
│   │   └── Option[] (radio buttons with A, B, C, D labels)
│   ├── ActionButtons
│   │   ├── MarkForReviewCheckbox
│   │   ├── ClearResponseButton
│   │   └── SaveAndNextButton
├── NavigationPalette (right panel)
│   ├── SectionTabs (if multi-section test)
│   ├── QuestionGrid
│   │   └── QuestionButton[] with states:
│   │       - Not Visited (gray outline)
│   │       - Not Answered (red)
│   │       - Answered (green)
│   │       - Marked for Review (purple)
│   │       - Answered + Marked (purple filled)
│   │       - Current (blue highlight)
│   └── Legend explaining colors
└── BottomNavigation
    ├── BackButton
    └── NextButton
```

### 4.2 State Management Strategy

**Option A: Context API (Simpler)**
```typescript
// src/contexts/TestAttemptContext.tsx
interface TestAttemptState {
  attemptId: string;
  testId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Map<string, number>; // questionId -> selectedOption
  flaggedQuestions: Set<string>; // questionIds
  timeRemaining: number; // seconds
  startedAt: Date;
}
```

**Option B: Redux Toolkit (Recommended for complex state)**
```typescript
// src/store/slices/testAttemptSlice.ts
```

### 4.3 Key Features

**Timer Component**
- Countdown from test duration (e.g., 60 minutes)
- Visual warning at 5 minutes (yellow)
- Visual warning at 1 minute (red + flashing)
- Auto-submit when timer reaches 0
- Sync time to backend every 30 seconds

**Question Navigation**
- Click any question in palette to jump
- Previous/Next buttons
- Section-wise grouping (if applicable)
- Visual states updated in real-time

**Answer Selection**
- Single-choice radio buttons
- Auto-save on selection (optimistic updates)
- Debounced API calls to save answers
- Show loading state during save

**Mark for Review**
- Toggle flag on current question
- Updates palette state immediately
- Persisted to backend

### 4.4 Server Actions
```typescript
export async function createTestAttempt(testId: string): Promise<TestAttempt>
export async function getTestQuestions(testId: string): Promise<Question[]>
export async function saveAnswer(attemptId: string, questionId: string, selectedOption: number, timeSpent: number): Promise<void>
export async function toggleReviewFlag(attemptId: string, questionId: string, isReviewed: boolean): Promise<void>
export async function submitAttempt(attemptId: string): Promise<{ score: number, attemptId: string }>
export async function getAttemptProgress(attemptId: string): Promise<AttemptProgress>
```

### 4.5 Data Flow
1. **Start Test** → Create attempt record → Load questions
2. **Display Question** → Show question #1 by default
3. **User Selects Answer** → Update local state → Debounced save to DB
4. **User Navigates** → Update currentIndex → Scroll to question
5. **User Flags Question** → Update flag state → Save to DB
6. **Timer Expires** → Auto-submit → Calculate score → Redirect to review
7. **User Clicks Submit** → Show confirmation → Calculate score → Redirect to review

---

## Phase 5: Test Submission & Scoring

### 5.1 Submission Flow
```typescript
async function handleSubmit() {
  // 1. Show confirmation dialog
  const confirmed = await showConfirmDialog({
    title: "Submit Test?",
    message: "You have answered X of Y questions. Do you want to submit?",
    showStats: {
      answered: count,
      unanswered: count,
      flagged: count
    }
  });
  
  // 2. If confirmed, submit
  if (confirmed) {
    const result = await submitAttempt(attemptId);
    
    // 3. Calculate score on backend
    // 4. Update attempt record
    // 5. Redirect to review page
    router.push(`/tests/${testId}/attempt/${attemptId}/review`);
  }
}
```

### 5.2 Score Calculation Logic (Backend)
```typescript
export async function calculateScore(attemptId: string) {
  // 1. Fetch all user answers for this attempt
  // 2. Fetch correct answers for each question
  // 3. Calculate:
  //    - Correct answers count
  //    - Incorrect answers count  
  //    - Unanswered count
  //    - Score (considering negative marking if applicable)
  //    - Section-wise breakdown
  //    - Topic-wise breakdown
  // 4. Update userTestAttempts record:
  //    - status = 'submitted' or 'auto_submitted'
  //    - score, correctAnswers, incorrectAnswers, unanswered
  //    - sectionBreakdown, topicBreakdown
  //    - submittedAt = now()
  //    - timeSpent = duration - timeRemaining
  // 5. Update userAnswers with isCorrect flag
}
```

---

## Phase 6: Test Review Page (/tests/[testId]/attempt/[attemptId]/review)

### 6.1 UI Structure
```
TestReviewPage
├── ScoreSummary
│   ├── TotalScore (large display)
│   ├── Percentage
│   ├── Accuracy
│   ├── TimeSpent
│   └── AttemptDate
├── StatisticsPanel
│   ├── Correct (green badge)
│   ├── Incorrect (red badge)
│   ├── Unanswered (gray badge)
│   └── MarksDistribution chart
├── SectionBreakdown (if multi-section)
│   └── SectionCard[] showing section-wise stats
├── QuestionReviewList
│   └── QuestionReviewCard[]
│       ├── QuestionNumber
│       ├── QuestionText
│       ├── YourAnswer (highlighted)
│       ├── CorrectAnswer (highlighted green)
│       ├── Explanation (expandable)
│       ├── TimeSpent on this question
│       └── CorrectnessIndicator (✓ or ✗)
└── ActionButtons
    ├── RetakeTestButton
    ├── ViewAnalyticsButton
    └── BackToTestsButton
```

### 6.2 Server Actions
```typescript
export async function getAttemptReview(attemptId: string): Promise<AttemptReview>
export async function getAttemptAnswers(attemptId: string): Promise<UserAnswerWithQuestion[]>
```

### 6.3 Data Structure
```typescript
interface AttemptReview {
  attempt: TestAttempt;
  test: Test;
  answers: UserAnswerWithQuestion[];
  statistics: {
    correct: number;
    incorrect: number;
    unanswered: number;
    accuracy: number;
    sectionBreakdown: SectionStats[];
    topicBreakdown: TopicStats[];
  };
}
```

---

## Phase 7: State Persistence & Recovery

### 7.1 localStorage Sync (Optional)
- Save attempt state to localStorage every time answer changes
- On page refresh/tab close, recover state from localStorage
- Validate against backend on mount
- Clear localStorage after successful submission

### 7.2 Tab Close Warning
```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (attemptStatus === 'in_progress') {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [attemptStatus]);
```

---

## Phase 8: Subscription Gating

### 8.1 Premium Test Access Check
```typescript
export async function checkTestAccess(userId: string, testId: string) {
  const test = await getTestById(testId);
  
  if (test.isFree) {
    return { hasAccess: true };
  }
  
  const subscription = await getUserActiveSubscription(userId);
  
  if (!subscription) {
    return { hasAccess: false, reason: 'No active subscription' };
  }
  
  return { hasAccess: true };
}
```

### 8.2 UI Behavior
- Show lock icon on premium test cards in test library
- Show "Unlock" button on test detail page
- Clicking "Unlock" → Redirect to `/pricing` or `/subscribe`
- After successful payment → Redirect back to test detail page

---

## Phase 9: Attempt History

### 9.1 Display on Test Detail Page
- Table/List of previous attempts
- Columns: Attempt #, Date, Score, Percentage, Time Spent, Status
- Click attempt → View review page
- Sort by date (latest first)

### 9.2 User Dashboard Integration
- Show recent test attempts on dashboard
- Quick access to continue in-progress attempts
- Analytics overview (avg score, improvement trend)

---

## Component Reusability

### Shared Components to Build
1. `TestCard` - Used in test library grid
2. `Timer` - Countdown timer with warnings
3. `QuestionDisplay` - Renders question with options
4. `NavigationPalette` - Question grid with states
5. `ScoreCard` - Shows score summary
6. `ConfirmDialog` - Generic confirmation modal
7. `SubscriptionGate` - Lock/unlock UI wrapper

---

## Database Schema Validation

### Tables Used (Already Exist)
✅ `tests` - Test configuration  
✅ `test_questions` - Junction table linking tests to questions  
✅ `questions` - Question bank  
✅ `user_test_attempts` - Attempt records  
✅ `user_answers` - Individual answers per attempt  
✅ `subscriptions` - User subscription status  
✅ `sections` - Test sections  
✅ `topics` - Question topics  

### RLS Policies Needed
```sql
-- user_test_attempts: Users can only view/create their own attempts
CREATE POLICY "Users can view own attempts" ON user_test_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attempts" ON user_test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_answers: Users can only view/create answers for their attempts
CREATE POLICY "Users can view own answers" ON user_answers
  FOR SELECT USING (
    attempt_id IN (
      SELECT id FROM user_test_attempts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own answers" ON user_answers
  FOR INSERT WITH CHECK (
    attempt_id IN (
      SELECT id FROM user_test_attempts WHERE user_id = auth.uid()
    )
  );

-- tests: All authenticated users can view published tests
CREATE POLICY "Users can view published tests" ON tests
  FOR SELECT USING (is_published = true);
```

---

## Technical Stack Summary

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Library**: Radix UI (already installed), Tailwind CSS
- **State Management**: Context API or Redux Toolkit (TBD)
- **Database**: PostgreSQL (Supabase) via Drizzle ORM
- **Auth**: Supabase Auth with middleware protection
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

---

## Development Phases Breakdown

### Sprint 1 (Days 1-2): Foundation
- [ ] Create route structure (/tests, /tests/[testId], etc.)
- [ ] Set up middleware protection
- [ ] Build tests layout with sidebar
- [ ] Create test library page with filters
- [ ] Implement getTests server action

### Sprint 2 (Days 3-4): Test Detail & Start
- [ ] Build test detail page UI
- [ ] Implement syllabus accordion
- [ ] Add attempt history table
- [ ] Create "Start Test" flow → createAttempt action
- [ ] Build subscription gating logic

### Sprint 3 (Days 5-7): Attempt Engine Core
- [ ] Create test attempt page layout
- [ ] Build question display component
- [ ] Implement answer selection and save
- [ ] Create navigation palette with states
- [ ] Add timer component
- [ ] Implement mark for review

### Sprint 4 (Days 8-9): Submission & Review
- [ ] Build submit confirmation dialog
- [ ] Implement score calculation backend
- [ ] Create review page with statistics
- [ ] Add question-by-question review list
- [ ] Display explanations

### Sprint 5 (Day 10): Polish & Testing
- [ ] Add loading states and error handling
- [ ] Implement tab close warning
- [ ] Add localStorage persistence (optional)
- [ ] Test timer auto-submit
- [ ] Test negative marking calculation
- [ ] Mobile responsiveness
- [ ] End-to-end testing

---

## Next Steps

**Waiting for remaining screens from user:**
- Test attempt in-progress screen (detailed view)
- Review page detailed view
- Mobile responsive views
- Any additional edge cases

**Once confirmed, we'll start with Sprint 1.**

---

## Questions for Clarification

1. **State Management**: Context API or Redux? (Context is simpler for this scope)
2. **Timer sync**: How often to sync remaining time to backend? (Suggest: every 30s)
3. **Negative Marking**: Formula? (e.g., -0.25 for each wrong answer)
4. **Section Navigation**: Should sections be tabs or accordion in attempt view?
5. **Resume Attempt**: Can users resume in-progress attempts? Or only fresh starts?
6. **Analytics**: Should we track time-per-question for analytics?
7. **Explanations**: Are they always visible in review or toggle-able?
8. **Retake**: Can users retake tests unlimited times or limit per subscription tier?

