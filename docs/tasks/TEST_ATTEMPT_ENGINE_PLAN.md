# Test Attempt Engine - Implementation Plan

## Overview
Build a comprehensive test-taking system with fullscreen mode, pre-test instructions, tabbed/single layouts, timer, navigation palette, and submission flow.

---

## Architecture

### Page Flow
```
Test Detail Page (Click "Start Test")
    ↓
Test Instructions Screen (/tests/[testId]/attempt/instructions)
    ↓ (Click "I'm Ready, Start Test")
Enter Fullscreen Mode
    ↓
Test Attempt Screen (/tests/[testId]/attempt)
    ↓ (Click "Submit Test")
Submit Confirmation Dialog
    ↓ (Confirm Submit)
Exit Fullscreen → Calculate Score
    ↓
Review Page (/tests/[testId]/attempt/[attemptId]/review)
```

---

## Phase 1: Test Instructions/Preview Screen

### Route
`/dashboard/tests/[testId]/attempt/instructions`

### UI Components (Based on Screenshot 1)
```
InstructionsScreen
├── Header: Test Title
├── Subtitle: "Read the following instructions carefully"
├── InstructionCards (2x2 Grid)
│   ├── Total Duration & Questions (60 min, 100 questions)
│   ├── Marking Scheme (+2 correct, -0.5 incorrect)
│   ├── No Return (Cannot go back after submit)
│   ├── Timer (Starts when test begins)
│   └── Do Not Close (Window close = end attempt)
├── Language Selector Dropdown
├── Live Proctoring Toggle (Premium feature)
└── "I'm Ready, Start Test" Button (Yellow/Primary)
```

### Data Needed
- Test details (title, duration, totalQuestions, negativeMarking)
- Instructions text from test.instructions field
- Language options (if bilingual test)

### Actions
- On "Start Test" click:
  1. Create attempt record (if not exists)
  2. Enter fullscreen mode
  3. Redirect to `/dashboard/tests/[testId]/attempt?attemptId=xxx`

---

## Phase 2: Fullscreen Mode Integration

### Fullscreen API Implementation
```typescript
// Enter fullscreen
const enterFullscreen = () => {
  document.documentElement.requestFullscreen();
};

// Exit fullscreen (only on submit)
const exitFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
};

// Prevent accidental exit
useEffect(() => {
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && testStatus === 'in_progress') {
      // User tried to exit - show warning and re-enter
      alert('Please do not exit fullscreen during the test!');
      enterFullscreen();
    }
  };
  
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
}, [testStatus]);
```

### Keyboard Blocking
- Prevent F11, Alt+F4, Ctrl+W during test
- Allow only after submission

---

## Phase 3: Test Attempt Layout - Single Section

### Layout Structure (Screenshot 2)
```
<div className="flex h-screen">
  {/* Left Side - Question Area (60-65%) */}
  <div className="flex-[3]">
    <Header>
      <Logo />
      <Timer /> {/* 00:04:59 */}
      <SubmitButton />
    </Header>
    
    <QuestionArea>
      <QuestionNumber>Question 1 of 40</QuestionNumber>
      <LanguageToggle>English | हिंदी</LanguageToggle>
      <QuestionText />
      <OptionsGrid>
        <Option label="A" />
        <Option label="B" selected />
        <Option label="C" />
        <Option label="D" />
      </OptionsGrid>
      <ActionButtons>
        <ClearResponse />
        <MarkForReview />
        <PrevButton />
        <SaveAndNext />
      </ActionButtons>
    </QuestionArea>
  </div>

  {/* Right Side - Navigation Palette (35-40%) */}
  <div className="flex-[2] bg-gray-800">
    <QuestionPalette>
      <Legend />
      <QuestionGrid />
    </QuestionPalette>
  </div>
</div>
```

### For Practice/Sectional Tests
- Single continuous question flow
- No section tabs
- Palette shows all questions in sequence

---

## Phase 4: Test Attempt Layout - Multi Section (Tabs)

### Layout Structure
```
<div className="flex h-screen">
  {/* Left Side */}
  <div className="flex-[3]">
    <Header>
      <Logo />
      <SectionTabs>
        <Tab active>General Science ✓</Tab>
        <Tab>Mathematics</Tab>
        <Tab>Reasoning</Tab>
        <Tab>English</Tab>
      </SectionTabs>
      <Timer />
      <SubmitButton />
    </Header>
    
    {/* Same QuestionArea as single section */}
  </div>

  {/* Right Side - Palette filtered by section */}
  <div className="flex-[2]">
    <QuestionPalette section="current">
      <Legend />
      <QuestionGrid /> {/* Shows only current section questions */}
    </QuestionPalette>
  </div>
</div>
```

### For Mock/Live Tests
- Section tabs at top
- Each tab shows questions for that section
- Palette filtered by active section
- Track progress per section

---

## Phase 5: Timer Component

### Features
- Countdown from test duration (e.g., 60:00)
- Display format: MM:SS (00:04:59)
- Red color for timer
- Visual warnings:
  - Yellow at 5 minutes
  - Red + pulsing at 1 minute
- Auto-submit at 00:00
- Sync remaining time to backend every 30 seconds

### Implementation
```typescript
const useTestTimer = (duration: number) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Sync to backend every 30s
  useEffect(() => {
    const syncInterval = setInterval(() => {
      syncTimeToBackend(timeRemaining);
    }, 30000);
    
    return () => clearInterval(syncInterval);
  }, [timeRemaining]);
  
  return { timeRemaining, formatTime: formatMMSS(timeRemaining) };
};
```

---

## Phase 6: Question Navigation Palette

### Color Legend (Bottom)
- 🟢 **Answered** - User selected an option
- 🔴 **Not Answered** - Visited but no answer
- 🟣 **Marked for Review** - Flagged for later review
- ⚪ **Not Visited** - Not opened yet
- 🔵 **Current** - Active question (blue border)

### Question Grid
```typescript
<div className="grid grid-cols-5 gap-2 p-4">
  {questions.map((q, idx) => (
    <button
      key={q.id}
      onClick={() => navigateToQuestion(idx)}
      className={getQuestionButtonClass(q)}
    >
      {idx + 1}
    </button>
  ))}
</div>

const getQuestionButtonClass = (question) => {
  if (question.id === currentQuestionId) return 'border-blue-500';
  if (answers.has(question.id) && flagged.has(question.id)) return 'bg-purple-500';
  if (answers.has(question.id)) return 'bg-green-500';
  if (visited.has(question.id)) return 'bg-red-500';
  return 'bg-gray-500';
};
```

---

## Phase 7: Question Display & Answer Selection

### Question Component
```typescript
<div className="p-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl">Question {currentIndex + 1} of {totalQuestions}</h2>
    <div className="flex gap-2">
      <button className="btn-primary">English</button>
      <button className="btn-outline">हिंदी</button>
    </div>
  </div>
  
  <div className="mb-6">
    <p className="text-lg">{question.questionText}</p>
    {question.imageUrl && <img src={question.imageUrl} />}
  </div>
  
  <div className="space-y-3">
    {[1, 2, 3, 4].map(optionNum => (
      <button
        key={optionNum}
        onClick={() => selectOption(optionNum)}
        className={`option-button ${selectedOption === optionNum ? 'selected' : ''}`}
      >
        <span className="option-label">{String.fromCharCode(64 + optionNum)}</span>
        <span>{question[`option${optionNum}`]}</span>
      </button>
    ))}
  </div>
</div>
```

### Styling for Selected Option
- Blue background (#3b82f6)
- Radio button filled
- Hover effects on unselected options

---

## Phase 8: Action Buttons

### Bottom Action Bar
```typescript
<div className="flex justify-between p-4 border-t">
  <button onClick={clearResponse} className="btn-outline">
    Clear Response
  </button>
  
  <button onClick={markForReview} className="btn-outline">
    Mark for Review & Next
  </button>
  
  <div className="flex gap-2">
    <button onClick={goToPrevious} className="btn-secondary">
      &lt; Prev
    </button>
    <button onClick={saveAndNext} className="btn-primary">
      Save &amp; Next &gt;
    </button>
  </div>
</div>
```

### Button Actions
- **Clear Response**: Remove selected answer, keep question visited
- **Mark for Review**: Flag question, auto-save answer, go to next
- **Save & Next**: Save answer, move to next question
- **Prev**: Go to previous question (with confirmation if answer changed)

---

## Phase 9: State Management

### State Structure
```typescript
interface TestAttemptState {
  attemptId: string;
  testId: string;
  questions: Question[];
  currentQuestionIndex: number;
  
  // Maps and Sets
  answers: Map<string, number>; // questionId -> selectedOption (1-4)
  flagged: Set<string>; // questionIds marked for review
  visited: Set<string>; // questionIds that user has viewed
  timeSpent: Map<string, number>; // questionId -> seconds spent
  
  // Timer
  timeRemaining: number; // seconds
  startTime: Date;
  
  // Section tracking (for mock/live)
  currentSection: string | null;
  sectionProgress: Map<string, SectionProgress>;
}
```

### Auto-Save Logic
```typescript
const debouncedSave = useMemo(
  () => debounce(async (questionId: string, answer: number) => {
    await saveAnswer(attemptId, questionId, answer, timeSpentOnQuestion);
  }, 1000),
  [attemptId]
);

const handleAnswerSelect = (option: number) => {
  setAnswers(prev => new Map(prev).set(currentQuestion.id, option));
  debouncedSave(currentQuestion.id, option);
};
```

---

## Phase 10: Submit Confirmation Dialog

### Dialog UI
```typescript
<Dialog open={showSubmitDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Submit Test?</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      <p>You are about to submit your test. Please review your attempt:</p>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-3xl font-bold text-green-600">{answeredCount}</div>
          <div className="text-sm">Answered</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-red-600">{unansweredCount}</div>
          <div className="text-sm">Not Answered</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-purple-600">{flaggedCount}</div>
          <div className="text-sm">Marked for Review</div>
        </div>
      </div>
      
      <p className="text-sm text-yellow-600">
        ⚠️ You cannot change your answers after submission.
      </p>
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
        Cancel
      </Button>
      <Button onClick={handleFinalSubmit}>
        Submit Test
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Phase 11: Test Submission Flow

### Submission Steps
```typescript
const handleFinalSubmit = async () => {
  try {
    // 1. Exit fullscreen
    await exitFullscreen();
    
    // 2. Submit to backend
    const result = await submitAttempt(attemptId);
    
    // 3. Show success message
    toast.success('Test submitted successfully!');
    
    // 4. Redirect to review page
    router.push(`/dashboard/tests/${testId}/attempt/${attemptId}/review`);
    
  } catch (error) {
    toast.error('Failed to submit test. Please try again.');
  }
};
```

---

## Phase 12: Language Toggle

### Implementation
```typescript
const [language, setLanguage] = useState<'english' | 'hindi'>('english');

// In question display
<div className="question-text">
  {language === 'english' 
    ? question.questionText 
    : question.questionTextHindi}
</div>

<div className="options">
  {[1, 2, 3, 4].map(num => (
    <div key={num}>
      {language === 'english'
        ? question[`option${num}`]
        : question[`option${num}Hindi`]}
    </div>
  ))}
</div>
```

---

## Database Schema Additions

### Questions Table - Add Hindi Fields (Optional)
```sql
ALTER TABLE questions 
ADD COLUMN question_text_hindi TEXT,
ADD COLUMN option_1_hindi TEXT,
ADD COLUMN option_2_hindi TEXT,
ADD COLUMN option_3_hindi TEXT,
ADD COLUMN option_4_hindi TEXT,
ADD COLUMN explanation_hindi TEXT;
```

### Tests Table - Add Language Support
```sql
ALTER TABLE tests
ADD COLUMN supports_bilingual BOOLEAN DEFAULT false;
```

---

## Component File Structure

```
src/
├── app/
│   └── dashboard/
│       └── tests/
│           └── [testId]/
│               └── attempt/
│                   ├── instructions/
│                   │   └── page.tsx          # Test instructions screen
│                   └── page.tsx              # Test attempt engine
│
├── components/
│   └── tests/
│       ├── attempt/
│       │   ├── test-instructions.tsx        # Instructions/preview
│       │   ├── test-header.tsx              # Logo, timer, submit
│       │   ├── section-tabs.tsx             # For mock/live tests
│       │   ├── question-display.tsx         # Question + options
│       │   ├── question-palette.tsx         # Navigation sidebar
│       │   ├── action-buttons.tsx           # Clear, mark, nav buttons
│       │   ├── timer.tsx                    # Countdown timer
│       │   ├── language-toggle.tsx          # English/Hindi switch
│       │   └── submit-dialog.tsx            # Confirmation popup
│       │
│       └── test-attempt-engine.tsx          # Main layout wrapper
│
├── hooks/
│   ├── use-test-timer.ts                    # Timer logic
│   ├── use-fullscreen.ts                    # Fullscreen API
│   └── use-test-attempt-state.ts            # State management
│
└── lib/
    └── actions/
        └── tests.ts                         # Server actions (existing)
```

---

## Development Phases

### Sprint 1 (Days 1-2): Foundation
- [x] Test instructions/preview screen
- [x] Fullscreen mode integration
- [x] Basic layout structure (side-by-side)

### Sprint 2 (Days 3-4): Core Features
- [x] Question display with options
- [x] Answer selection and state management
- [x] Navigation palette with color coding
- [x] Timer component

### Sprint 3 (Days 5-6): Advanced Features
- [x] Section tabs for mock/live tests
- [x] Action buttons (clear, mark, nav)
- [x] Auto-save answers to backend
- [x] Language toggle

### Sprint 4 (Days 7-8): Submission & Polish
- [x] Submit confirmation dialog
- [x] Test submission flow
- [x] Fullscreen exit prevention
- [x] Error handling and edge cases

---

## Key Technical Decisions

1. **State Management**: React Context + useReducer (simpler than Redux for this scope)
2. **Auto-Save**: Debounced (1 second) to reduce DB calls
3. **Timer Sync**: Every 30 seconds to backend
4. **Fullscreen**: Browser Fullscreen API (not true kiosk mode)
5. **Layout**: CSS Flexbox for side-by-side (responsive)
6. **Section Tabs**: Conditional rendering based on test type

---

## Ready to Start Building?

Shall we begin with **Phase 1: Test Instructions Screen**?

