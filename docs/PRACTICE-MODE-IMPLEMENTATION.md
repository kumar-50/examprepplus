# Practice Mode - Implementation Guide

## Overview
Practice Mode is a feature that allows users to practice questions with immediate feedback, track weak topics, and utilize AI-powered spaced repetition for optimal learning.

## Features Implemented

### 1. Practice Dashboard (`/dashboard/practice`)
The main dashboard consists of four key sections:

#### a. Weak Topics Section
- **Empty State**: When no weak topics are identified, displays a call-to-action to take mock tests
- **Weak Topics List**: Shows AI-identified weak areas with:
  - Topic name and weakness level (critical, moderate, improving)
  - Accuracy percentage and progress bar
  - Number of correct/total attempts
  - Days until next review
  - Quick "Revise Now" button
  - Link to generate custom quiz

#### b. Spaced Repetition Queue
- **Empty State**: Prompts users to schedule practice sessions
- **Upcoming Practice List**: Shows scheduled sessions with:
  - Number of topics to practice
  - Difficulty level badge
  - Scheduled time (with "overdue" indicator)
  - Question count
  - "Start Now" or "Begin" button

#### c. Revision History
- **Data Table**: Shows recent practice sessions with:
  - Topic name
  - Completion date (relative time)
  - Score percentage with color coding (green ≥75%, orange ≥50%, red <50%)
  - Difficulty level
  - Review button for each session
- **Pagination**: Displays 10 items by default
- **Empty State**: Encourages users to start practicing

#### d. Revision Calendar
- **Calendar View**: Visual representation of scheduled and completed sessions
  - Orange dots for scheduled sessions
  - Green dots for completed sessions
- **Legend**: Explains the dot indicators
- **Generate Quiz Button**: Opens a slide-out sheet with quiz generation form

### 2. Generate Quiz Modal/Sheet
A comprehensive form with:

#### Topic Selection
- "All Topics" checkbox for selecting everything
- Topics grouped by section
- Individual topic checkboxes
- Scrollable list with custom styling

#### Quiz Length Options
- 10 Questions
- 20 Questions (default)
- 30 Questions
- Custom radio button styling with hover states

#### Difficulty Selection
- Easy
- Medium
- Hard
- Mixed (default)
- Visual selection with color-coded borders

#### Submit Button
- Orange primary button
- Loading state with spinner
- Disabled when no topics selected

### 3. Practice Test Engine (`/dashboard/practice/session/[sessionId]`)
A unique test-taking interface different from mock tests:

#### Features
- **Header Bar**:
  - Session title and practice mode indicator
  - Progress tracker (answered/total)
  - Correct answer count
  - Progress bar

- **Question Display**:
  - Question number and topic badges
  - Difficulty level indicator
  - Hindi/English toggle (if available)
  - Clean, readable question text

- **Options**:
  - Radio button selection
  - Visual feedback after submission:
    - Green border for correct answer
    - Red border for incorrect answer
    - Check/X icons for clarity

- **Immediate Feedback**:
  - Success/error alert after submission
  - Shows whether answer is correct/incorrect
  - Displays explanation automatically

- **Explanation Panel**:
  - Orange-themed panel with lightbulb icon
  - Detailed explanation text
  - Supports Hindi explanations

- **Navigation**:
  - Previous/Next buttons
  - Submit Answer button (before answering)
  - Next Question button (after answering)
  - Finish Practice button (on last question)

- **Question Palette** (Desktop sidebar):
  - Grid view of all questions
  - Color-coded status:
    - Green: Correct
    - Red: Incorrect
    - Gray: Not answered
  - Click to jump to any question
  - Current question highlighted with orange ring

### 4. API Routes

#### `/api/topics` (GET)
- Fetches all available topics
- Returns topics with section information
- Used in quiz generation form

#### `/api/practice/generate` (POST)
- Creates a new practice session
- Accepts: userId, topicIds, questionCount, difficulty
- Returns: sessionId
- Validates user authentication

#### `/api/practice/answer` (POST)
- Saves individual question answers
- Accepts: sessionId, userId, questionId, selectedOption, isCorrect, timeSpent
- Updates session progress
- Tracks correctness and time spent

#### `/api/practice/complete` (POST)
- Marks session as completed
- Accepts: sessionId, userId
- Sets completion timestamp
- Redirects to review page

## Database Schema

### Tables Created
1. **practice_sessions**: Tracks practice quiz sessions
2. **practice_answers**: Stores individual question attempts
3. **weak_topics**: AI-identified weak areas for users
4. **revision_schedule**: Spaced repetition schedule

### Key Fields
- Session tracking: title, topic_ids, difficulty, question counts
- Answer tracking: selected_option, is_correct, time_spent, viewed_explanation
- Weak topic analysis: accuracy_percentage, weakness_level, next_review_date
- Scheduling: scheduled_date, is_completed, session_id

## Design System

### Color Palette
- **Orange** (#fca311): Primary action color
  - Buttons, progress indicators, highlights
- **Prussian Blue** (#14213d): Secondary color
  - Borders, backgrounds, text
- **Green**: Success states
  - Correct answers, completed sessions
- **Red**: Error states
  - Incorrect answers, critical weaknesses

### Component Styling
- Rounded corners (lg, md)
- Subtle borders with opacity
- Hover states with color transitions
- Card-based layout with consistent spacing
- Badge components for status indicators

## User Flow

### 1. First-Time User
1. Lands on practice dashboard
2. Sees empty states for all sections
3. Clicks "Take Mock Test" to identify weak topics
4. After mock test, weak topics are identified
5. Can generate custom quiz or start scheduled practice

### 2. Generating a Quiz
1. Clicks "Generate Quiz" button
2. Sheet opens from right side
3. Selects topics (or all topics)
4. Chooses quiz length (10/20/30)
5. Selects difficulty level
6. Submits form
7. Redirected to practice session

### 3. Taking Practice Quiz
1. Views question with options
2. Selects an answer
3. Clicks "Submit Answer"
4. Sees immediate feedback (correct/incorrect)
5. Reads explanation
6. Clicks "Next Question"
7. Repeats until all questions answered
8. Clicks "Finish Practice"
9. Redirected to review page

### 4. Tracking Progress
1. Views revision history table
2. Checks calendar for scheduled sessions
3. Sees weak topics improving over time
4. Follows spaced repetition schedule

## Future Enhancements

### AI Integration (Phase 2)
- Automatic weak topic identification from test results
- Smart scheduling based on forgetting curve
- Difficulty adjustment based on performance
- Topic recommendation engine

### Analytics (Phase 2)
- Time spent analysis per topic
- Accuracy trends over time
- Comparison with other users
- Personalized insights

### Social Features (Phase 3)
- Share practice sessions
- Compete with friends
- Leaderboards
- Study groups

## Installation & Setup

### 1. Database Migration
```bash
# Run the migration
psql -U your_user -d your_database -f migrations/add-practice-mode-tables.sql
```

### 2. Generate Drizzle Schema
```bash
npm run db:generate
npm run db:migrate
```

### 3. Verify Routes
- Navigate to `/dashboard/practice`
- Check all sections render correctly
- Test quiz generation flow

### 4. Test Practice Flow
1. Generate a quiz
2. Answer questions
3. Check feedback display
4. Complete session
5. Verify data in database

## Technical Notes

### Performance Considerations
- Use pagination for large datasets
- Implement lazy loading for question palette
- Cache topic data on client side
- Optimize database queries with indexes

### Accessibility
- Keyboard navigation support
- Screen reader friendly labels
- High contrast mode compatibility
- Focus indicators on interactive elements

### Mobile Responsiveness
- Question palette hidden on mobile
- Stacked layout for smaller screens
- Touch-friendly button sizes
- Responsive grid layouts

### Error Handling
- API error messages with toast notifications
- Graceful fallbacks for missing data
- Loading states for async operations
- Validation before form submission

## Dependencies
- Next.js 14+ (App Router)
- React 18+
- Drizzle ORM
- Tanstack Table (for data tables)
- Radix UI components
- date-fns (for date formatting)
- Sonner (for toast notifications)

## Files Created

### Components
- `/src/components/practice/weak-topics-section.tsx`
- `/src/components/practice/spaced-repetition-queue.tsx`
- `/src/components/practice/revision-history.tsx`
- `/src/components/practice/revision-calendar.tsx`
- `/src/components/practice/generate-quiz-form.tsx`
- `/src/components/practice/practice-attempt-engine.tsx`

### Pages
- `/src/app/dashboard/practice/page.tsx`
- `/src/app/dashboard/practice/session/[sessionId]/page.tsx`

### API Routes
- `/src/app/api/topics/route.ts`
- `/src/app/api/practice/generate/route.ts`
- `/src/app/api/practice/answer/route.ts`
- `/src/app/api/practice/complete/route.ts`

### Database
- `/src/db/schema/practice-sessions.ts`
- `/migrations/add-practice-mode-tables.sql`

## Support & Troubleshooting

### Common Issues

1. **Topics not loading in quiz form**
   - Check `/api/topics` endpoint
   - Verify topics table has data
   - Check network tab for errors

2. **Questions not appearing in practice session**
   - Ensure questions exist for selected topics
   - Check topicIds array in session
   - Verify question count matches availability

3. **Progress not updating**
   - Check API routes are accessible
   - Verify authentication middleware
   - Check database write permissions

4. **Calendar dots not showing**
   - Ensure revision_schedule table has data
   - Check date formatting
   - Verify scheduledDates prop is passed correctly

## Conclusion
Practice Mode is now fully implemented with all core features. Users can generate custom quizzes, practice with immediate feedback, track their weak topics, and follow a spaced repetition schedule for optimal learning outcomes.
